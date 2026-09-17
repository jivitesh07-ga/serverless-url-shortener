import {
  APIGatewayProxyEventV2,
  APIGatewayProxyResult,
} from "aws-lambda";

import {
  GetCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

import { dynamoDb, TABLE_NAME } from "../shared/dynamodb";

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

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResult> => {
  try {
    if (event.requestContext.http.method === "OPTIONS") {
      return preflightResponse();
    }

    const shortCode = event.pathParameters?.shortCode;

    if (!shortCode) {
      return response(400, {
        error: "Short code is required",
      });
    }

    // Find the shortened URL
    const result = await dynamoDb.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          shortCode,
        },
      })
    );

    if (!result.Item) {
      return response(404, {
        error: "Short URL not found",
      });
    }

    const item = result.Item;

    // Check whether the URL has expired
    if (item.expiresAt) {
      const expirationTime = new Date(item.expiresAt).getTime();

      if (expirationTime <= Date.now()) {
        return response(410, {
          error: "This short URL has expired",
        });
      }
    }

    // Make sure the URL is active
    if (item.status !== "active") {
      return response(410, {
        error: "This short URL is no longer active",
      });
    }

    const now = new Date().toISOString();

    // Update analytics
    await dynamoDb.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: {
          shortCode,
        },
        UpdateExpression:
          "SET clickCount = if_not_exists(clickCount, :zero) + :one, lastAccessedAt = :now",
        ExpressionAttributeValues: {
          ":zero": 0,
          ":one": 1,
          ":now": now,
        },
      })
    );

    // Redirect to the original URL
    return {
      statusCode: 302,
      headers: {
        Location: item.originalUrl,
        "Cache-Control": "no-store",
      },
      body: "",
    };
  } catch (error) {
    console.error("Redirect URL error:", error);

    return response(500, {
      error: "Internal server error",
    });
  }
};