import {
  APIGatewayProxyEventV2,
  APIGatewayProxyResult,
} from "aws-lambda";

import {
  QueryCommand,
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
    const method = event.requestContext.http.method;

    if (method === "OPTIONS") {
      return preflightResponse();
    }

    // -----------------------------
    // GET /api/urls
    // -----------------------------
    if (method === "GET") {
      const ownerToken =
        event.queryStringParameters?.ownerToken;

      if (
        typeof ownerToken !== "string" ||
        ownerToken.length < 20
      ) {
        return response(400, {
          error: "Invalid ownerToken",
        });
      }

      const result = await dynamoDb.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          IndexName: "OwnerTokenIndex",
          KeyConditionExpression:
            "ownerToken = :ownerToken",
          ExpressionAttributeValues: {
            ":ownerToken": ownerToken,
          },
          ScanIndexForward: false,
        })
      );

      const urls = (result.Items ?? []).map((item) => ({
        shortCode: item.shortCode,
        shortUrl: `${
          process.env.SHORT_URL_BASE ||
          "https://example.com"
        }/${item.shortCode}`,
        originalUrl: item.originalUrl,
        alias: item.alias ?? null,
        createdAt: item.createdAt,
        expiresAt: item.expiresAt ?? null,
        clickCount: item.clickCount ?? 0,
        lastAccessedAt: item.lastAccessedAt ?? null,
        threatStatus: item.threatStatus ?? "unknown",
        status: item.status ?? "active",
      }));

      return response(200, {
        urls,
      });
    }

    // -----------------------------
    // DELETE /api/urls/{shortCode}
    // -----------------------------
    if (method === "DELETE") {
      const shortCode =
        event.pathParameters?.shortCode;

      const ownerToken =
        event.queryStringParameters?.ownerToken;

      if (!shortCode) {
        return response(400, {
          error: "Short code is required",
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

      await dynamoDb.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: {
            shortCode,
          },
          UpdateExpression:
            "SET #status = :deleted",
          ConditionExpression:
            "attribute_exists(shortCode) AND ownerToken = :ownerToken",
          ExpressionAttributeNames: {
            "#status": "status",
          },
          ExpressionAttributeValues: {
            ":deleted": "deleted",
            ":ownerToken": ownerToken,
          },
        })
      );

      return response(200, {
        message: "Short URL deleted successfully",
        shortCode,
      });
    }

    return response(405, {
      error: "Method not allowed",
    });
  } catch (error: unknown) {
    console.error("Manage URLs error:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "name" in error &&
      error.name === "ConditionalCheckFailedException"
    ) {
      return response(404, {
        error: "Short URL not found or not owned by this user",
      });
    }

    return response(500, {
      error: "Internal server error",
    });
  }
};