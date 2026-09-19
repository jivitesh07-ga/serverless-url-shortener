# Serverless URL Shortener 

A production-oriented serverless URL shortening platform built with React, TypeScript, AWS Lambda, API Gateway, DynamoDB, S3, and Google Safe Browsing API.

The application allows users to create, manage, and analyze shortened URLs without requiring user accounts or passwords. It also supports custom aliases, URL expiration, click analytics, browser-based ownership, and security checks against known malicious URLs.

✨ Features

🔗 URL Shortening

Convert long URLs into short URLs
Automatically generate secure random short codes
Support custom aliases
Prevent duplicate short codes and aliases

⏳ URL Expiration

Users can choose:

1 day
1 week
Never
Custom expiration date

Expired URLs are rejected by the backend with an HTTP 410 Gone response.

📊 Analytics

Each shortened URL tracks:

Total click count
Creation timestamp
Last accessed timestamp
Current URL status
Expiration date

🛡️ URL Security

Before a URL is shortened, the backend checks it using the Google Safe Browsing API.

The application can identify known threat matches such as:

Malware
Social engineering
Unwanted software
Potentially harmful applications

If a submitted URL is flagged, the short URL is not created.

The security check does not guarantee that a URL is completely safe. It indicates whether the configured threat-intelligence service detected a known match.

🗑️ URL Management

Users can:

View their shortened URLs
Copy short URLs
Open short URLs
Delete URLs
View analytics
👤 No Login Required

The V1 application does not require:

Signup
Login
Passwords
Cognito

Instead, the browser receives a random ownerToken that is stored in localStorage.

This token associates URLs with the browser that created them.

Because this is not full authentication, clearing browser storage or changing devices/browsers can result in losing access to previously created URLs.

🎨 Modern React UI

The frontend includes:

Aurora-inspired pink/black design
Glassmorphism
Responsive layout
Loading states
Toast notifications
Security warnings
Delete confirmation
Copy interactions
Responsive URL management
Accessibility considerations
Reduced-motion support

# 🏗️ Architecture
INTERNET
                       │
                       ▼
               ┌────────────────┐
               │   CloudFront   │
               │ CDN + HTTPS    │
               └───────┬────────┘
                       │
                       ▼
               ┌────────────────┐
               │      S3        │
               │ React Frontend │
               └────────────────┘

              Browser API Requests
                       │
                       ▼
               ┌────────────────┐
               │  API Gateway   │
               │    HTTP API    │
               └───────┬────────┘
                       │
         ┌─────────────┼─────────────┐
         │             │             │
         ▼             ▼             ▼
   ┌──────────┐  ┌──────────┐  ┌──────────┐
   │  Create  │  │ Redirect │  │  Manage  │
   │  Lambda  │  │  Lambda  │  │  Lambda  │
   └────┬─────┘  └────┬─────┘  └────┬─────┘
        │             │             │
        └─────────────┼─────────────┘
                      │
                      ▼
             ┌─────────────────┐
             │    DynamoDB     │
             │ URL + Analytics │
             └────────┬────────┘
                      │
                      │ URL security check
                      ▼
             ┌─────────────────┐
             │ Google Safe     │
             │ Browsing API    │
             └─────────────────┘

                  Monitoring
                      │
                      ▼
                  CloudWatch

                  # 💻 Tech Stack
Frontend
•React
•TypeScript
•Vite
•js
•CSS
•html
Backend
•AWS Lambda
•Node.js
•TypeScript
•AWS SDK for JavaScript
Cloud
•Amazon API Gateway
•Amazon DynamoDB
•Amazon S3
•Amazon CloudFront
•AWS IAM
•AWS CloudWatch
Security
•Google Safe Browsing API
•IAM least-privilege architecture
•HTTPS through planned CloudFront deployment
Development
•Git
•GitHub
•Visual Studio Code
•GitHub Copilot / AI-assisted development

# 📁 Project Structure
serverless-url-shortener/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── dist/
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── backend/
│   ├── src/
│   │   ├── createUrl/
│   │   │   └── handler.ts
│   │   │
│   │   ├── redirectUrl/
│   │   │   └── handler.ts
│   │   │
│   │   ├── manageUrls/
│   │   │   └── handler.ts
│   │   │
│   │   └── shared/
│   │       └── dynamodb.ts
│   │
│   ├── package.json
│   └── tsconfig.json
│
├── infrastructure/
│
├── docs/
│   ├── architecture.md
│   ├── database.md
│   ├── api.md
│   └── security.md
│
├── .env.example
├── .gitignore
└── README.md
