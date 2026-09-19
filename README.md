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



# ⚙️ Local Development

Prerequisites

Install:



Node.js

npm

Git

AWS account

AWS Console access

Clone the repository

git clone <YOUR-GITHUB-REPOSITORY-URL>

cd serverless-url-shortener



🎨 Frontend Setup

```bash

cd frontend

```

```bash

npm install

```

Create:



.env.local



Add:



VITE_API_BASE_URL=YOUR_API_GATEWAY_INVOKE_URL



Example:



VITE_API_BASE_URL=https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com



Never place AWS credentials or the Google Safe Browsing API key in frontend environment variables.



Start the development server:

```bash

npm run dev

```



The application should be available at:



http://localhost:5173





🏗️ Production Build



From the frontend directory:

```bash

npm run build

```



The production files are generated in:



frontend/dist/



To preview the production build locally:

```bash

npm run preview

```

⚙️ Backend Setup



Navigate to:

```bash

cd backend

```



Install dependencies:

```bash

npm install

```

Build the backend:

```bash

npm run build

```



The Lambda functions can then be bundled and deployed according to the AWS deployment configuration.



🔑 Backend Environment Variables



The Lambda functions use environment variables such as:



TABLE_NAME

SHORT_URL_BASE

SAFE_BROWSING_API_KEY



Example:



TABLE_NAME=url-shortener-urls

SHORT_URL_BASE=https://YOUR-API-ID.execute-api.us-east-1.amazonaws.com

SAFE_BROWSING_API_KEY=YOUR_SERVER_SIDE_KEY

Important



The Safe Browsing API key must remain server-side.



Do not commit real secrets to GitHub.



# 📄 Documentation



Detailed project documentation is available in:



docs/



├── architecture.md



├── database.md



├── api.md



└── security.md





The repository also contains the complete architecture documentation covering the AWS components, request flows, database model, security model, and deployment status.

this my project repo read me give this as code so that no intendation problem will come 

