import {
  APIGatewayProxyEventV2,
  APIGatewayProxyResult,
} from "aws-lambda";

import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoDb, TABLE_NAME } from "../shared/dynamodb";

import { randomBytes } from "crypto";

const SHORT_URL_BASE =
  process.env.SHORT_URL_BASE || "https://example.com";

const SAFE_BROWSING_API_KEY =
  process.env.SAFE_BROWSING_API_KEY;

const ALIAS_REGEX = /^[a-zA-Z0-9_-]{3,50}$/;

function generateShortCode(length = 6): string {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  const bytes = randomBytes(length);

  let result = "";

  for (let i = 0; i < length; i++) {
    result += characters[bytes[i] % characters.length];
  }

  return result;
}

function response(
  statusCode: number,
  body: Record<string, unknown>
): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
    body: JSON.stringify(body),
  };
}

function preflightResponse(): APIGatewayProxyResult {
  return {
    statusCode: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
    body: "",
  };
}

async function checkSafeBrowsing(
  url: string
): Promise<"safe" | "threat"> {
  if (!SAFE_BROWSING_API_KEY) {
    throw new Error(
      "SAFE_BROWSING_API_KEY is not configured"
    );
  }

  const endpoint =
    `https://safebrowsing.googleapis.com/v4/threatMatches:find` +
    `?key=${encodeURIComponent(SAFE_BROWSING_API_KEY)}`;

  const requestBody = {
    client: {
      clientId: "serverless-url-shortener",
      clientVersion: "1.0.0",
    },
    threatInfo: {
      threatTypes: [
        "MALWARE",
        "SOCIAL_ENGINEERING",
        "UNWANTED_SOFTWARE",
        "POTENTIALLY_HARMFUL_APPLICATION",
      ],
      platformTypes: ["ANY_PLATFORM"],
      threatEntryTypes: ["URL"],
      threatEntries: [
        {
          url,
        },
      ],
    },
  };

  const result = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!result.ok) {
    const errorText = await result.text();

    console.error(
      "Safe Browsing API error:",
      result.status,
      errorText
    );

    throw new Error(
      `Safe Browsing API returned HTTP ${result.status}`
    );
  }

  const data = await result.json();

  if (
    data &&
    Array.isArray(data.matches) &&
    data.matches.length > 0
  ) {
    return "threat";
  }

  return "safe";
}

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResult> => {
  try {
    if (event.requestContext.http.method === "OPTIONS") {
      return preflightResponse();
    }

    if (!event.body) {
      return response(400, {
        error: "Request body is required",
      });
    }

    const body = JSON.parse(event.body);

    const {
      originalUrl,
      alias,
      expiresAt,
      ownerToken,
    } = body;

    if (
      typeof originalUrl !== "string" ||
      !originalUrl.trim()
    ) {
      return response(400, {
        error: "originalUrl is required",
      });
    }

    let parsedUrl: URL;

    try {
      parsedUrl = new URL(originalUrl);
    } catch {
      return response(400, {
        error: "Invalid URL",
      });
    }

    if (
      !["http:", "https:"].includes(parsedUrl.protocol)
    ) {
      return response(400, {
        error: "Only HTTP and HTTPS URLs are allowed",
      });
    }

    if (
      typeof ownerToken !== "string" ||
      ownerToken.length < 20
    ) {
      return response(400, {
        error: "Invalid ownerToken",
      });
    }

    if (
      alias !== undefined &&
      alias !== null &&
      alias !== ""
    ) {
      if (
        typeof alias !== "string" ||
        !ALIAS_REGEX.test(alias)
      ) {
        return response(400, {
          error:
            "Alias must be 3-50 characters and contain only letters, numbers, hyphens, or underscores",
        });
      }
    }

    let expirationDate: string | undefined;

    if (
      expiresAt !== undefined &&
      expiresAt !== null &&
      expiresAt !== ""
    ) {
      const parsedExpiration = new Date(expiresAt);

      if (Number.isNaN(parsedExpiration.getTime())) {
        return response(400, {
          error: "Invalid expiresAt date",
        });
      }

      if (parsedExpiration.getTime() <= Date.now()) {
        return response(400, {
          error: "Expiration date must be in the future",
        });
      }

      expirationDate =
        parsedExpiration.toISOString();
    }

    // --------------------------------
    // Security / Threat Intelligence
    // --------------------------------

    let threatStatus: "safe" | "threat";

    try {
      threatStatus = await checkSafeBrowsing(
        parsedUrl.toString()
      );
    } catch (error) {
      console.error(
        "Safe Browsing check failed:",
        error
      );

      return response(503, {
        error:
          "URL security check is temporarily unavailable. Please try again later.",
      });
    }

    if (threatStatus === "threat") {
      return response(400, {
        error:
          "This URL has been flagged as potentially unsafe. The short URL was not created.",
        threatStatus: "threat",
      });
    }

    const createdAt = new Date().toISOString();

    const shortCode =
      typeof alias === "string" && alias.length > 0
        ? alias
        : generateShortCode();

    const item: Record<string, unknown> = {
      shortCode,
      originalUrl: parsedUrl.toString(),
      ownerToken,
      alias:
        typeof alias === "string" && alias.length > 0
          ? alias
          : null,
      createdAt,
      clickCount: 0,
      threatStatus: "safe",
      status: "active",
    };

    if (expirationDate) {
      item.expiresAt = expirationDate;
    }

    await dynamoDb.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: item,
        ConditionExpression:
          "attribute_not_exists(shortCode)",
      })
    );

    const shortUrl =
      `${SHORT_URL_BASE}/${shortCode}`;

    return response(201, {
      shortCode,
      shortUrl,
      originalUrl: parsedUrl.toString(),
      createdAt,
      expiresAt: expirationDate ?? null,
      threatStatus: "safe",
      status: "created",
    });
  } catch (error: unknown) {
    console.error("Create URL error:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "name" in error &&
      error.name ===
        "ConditionalCheckFailedException"
    ) {
      return response(409, {
        error:
          "That short code or alias is already in use",
      });
    }

    return response(500, {
      error: "Internal server error",
    });
  }
};