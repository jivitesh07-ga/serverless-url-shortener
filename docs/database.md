# Database Design

## Database

Amazon DynamoDB

## Table

`url-shortener-urls`

## Primary Key

Partition key:

`shortCode`

There is no sort key.

## Attributes

- `shortCode`
- `originalUrl`
- `ownerToken`
- `alias`
- `createdAt`
- `expiresAt`
- `clickCount`
- `lastAccessedAt`
- `threatStatus`
- `status`

## Global Secondary Indexes

### OwnerTokenIndex

Partition key:

`ownerToken`

Sort key:

`createdAt`

Purpose:

Retrieve all shortened URLs belonging to a browser owner token.

### AliasIndex

Partition key:

`alias`

Purpose:

Check whether a custom alias is already in use.

## Access Patterns

1. Create shortened URL
2. Get URL by short code
3. Redirect to original URL
4. List URLs for owner
5. Delete URL
6. Get URL analytics
7. Check custom alias availability

## Expiration

URLs contain an `expiresAt` timestamp.

The redirect Lambda checks expiration before redirecting.

Expired URLs return HTTP 410.

## Analytics

Click count and last access time are stored on the URL item.

The redirect Lambda increments `clickCount` and updates `lastAccessedAt`.

## Ownership

V1 does not use user accounts.

A random `ownerToken` is stored in browser localStorage and associated with shortened URLs.