# Xeno SDE Internship Assignment - Mini CRM Platform (2025)

**Author:** [Your Name]
**Submission Date:** May 2025 *(Adjust as needed)*

---

## Table of Contents

1.  [Project Overview](#project-overview)
2.  [Live Demo & Video](#live-demo--video)
3.  [Features Implemented](#features-implemented)
    *   [Core CRM Features](#core-crm-features)
    *   [AI-Powered Features](#ai-powered-features)
    *   [Architectural Brownie Points](#architectural-brownie-points)
4.  [Tech Stack](#tech-stack)
5.  [Local Setup Instructions](#local-setup-instructions)
    *   [Prerequisites](#prerequisites)
    *   [Installation](#installation)
    *   [Environment Variables (.env.local)](#environment-variables-envlocal)
    *   [Running the Application](#running-the-application)
    *   [Testing Asynchronous Processing Locally](#testing-asynchronous-processing-locally)
6.  [Deployment](#deployment)
7.  [Project Structure](#project-structure)
8.  [How to Use Key Features](#how-to-use-key-features)
9.  [Known Limitations & Assumptions](#known-limitations--assumptions)
10. [Future Improvements](#future-improvements)

---

## 1. Project Overview

This project is a Mini Customer Relationship Management (CRM) platform built as part of the Xeno SDE Internship Assignment for 2025. The platform enables users to ingest customer and order data, define sophisticated audience segments using both manual rules and AI-powered natural language queries, create and (simulate) launch personalized marketing campaigns, and track their performance. The application incorporates several AI features to enhance user experience and provide intelligent insights, and demonstrates asynchronous data processing for improved responsiveness and scalability.

---

## 2. Live Demo & Video

*   **Live Deployed Application:** `[Link to your Vercel/Render/Railway deployment]` *(Will be updated upon deployment)*
*   **Demo Video (Max 7 mins):** `[Link to your YouTube/Loom/Drive video]` *(Will be updated upon recording)*

---

## 3. Features Implemented

### Core CRM Features

*   **User Authentication:** Secure login via Google OAuth 2.0 using Next-Auth. Only authenticated users can create audiences or view campaigns.
*   **Data Ingestion APIs (Customers & Orders):**
    *   Secure REST APIs (`POST /api/customers`, `POST /api/orders`) to ingest customer and order data.
    *   *(Documented for Postman usage for data loading).*
*   **Campaign Creation UI:**
    *   Define audience segments using a flexible rule builder (currently supports AND logic between rules).
    *   Preview audience size before saving a segment.
    *   Input campaign name and personalized message templates (e.g., using `{{name}}`).
*   **Campaign Launch & Delivery Simulation:**
    *   On saving a segment, a new campaign is initiated.
    *   Target audience is identified based on segment rules.
    *   Personalized messages are prepared for each customer in the audience.
    *   Message delivery is simulated via a dummy vendor API, which reports back success (~90%) or failure (~10%).
*   **Campaign History & Stats:**
    *   A dedicated page displays a list of past campaigns (most recent at the top).
    *   Shows delivery statistics for each campaign: Total Audience, Sent, Failed.
*   **Communication Logging:** Campaign details and individual message delivery statuses are stored in a `communication_log` collection.

### AI-Powered Features (using Google Gemini API)

1.  **Natural Language to Segment Rules:**
    *   **How it works:** Users can type a description of their target audience in plain English (e.g., "customers who spent over 5000 and were active in the last 30 days") in the campaign creation UI. Clicking "Generate Rules from Description" sends this query to Google Gemini. The AI processes the query and returns structured rules that populate the UI.
    *   **Benefit:** Simplifies segment creation for users less familiar with complex rule logic.

2.  **AI-Driven Message Suggestions:**
    *   **How it works:** In the campaign creation UI, users can provide an optional "Campaign Objective." Clicking "Get AI Suggestions" sends this context (and audience description) to Google Gemini. The AI generates 2-3 marketing message variations. Users can click a suggestion to use it.
    *   **Benefit:** Helps users craft engaging messages quickly.

3.  **AI Campaign Performance Summarization:**
    *   **How it works:** On the Campaign History page, clicking "Get AI Performance Summary" for a campaign sends its stats and details to Google Gemini. The AI generates a concise, human-readable performance summary.
    *   **Benefit:** Provides quick, digestible insights beyond raw numbers.

### Architectural Brownie Points

*   **Asynchronous Data Ingestion (Pub/Sub Pattern):**
    *   The data ingestion APIs (`/api/customers`, `/api/orders`) are designed for responsiveness.
    *   **Deployed Version (Vercel):** Uses **Upstash QStash** as a serverless message queue. The API validates data and publishes it to QStash. A separate consumer API endpoint (`/api/consumers/process-customer`), triggered by QStash, handles asynchronous database persistence.
    *   **Local Development Option:** The system can be configured (`ASYNC_PROCESSING_MODE=bullmq`) to use **BullMQ with Redis and a Node.js worker** (`npm run worker:customer`) to demonstrate the classic pub/sub worker pattern.
    *   **Benefit:** Decouples data reception from processing, improving API latency, resilience, and scalability.

---

## 4. Tech Stack

*   **Frontend:** Next.js 13+ (App Router), React 18+, Tailwind CSS
*   **Backend:** Next.js API Routes (Node.js runtime)
*   **Database:** MongoDB (Cloud: MongoDB Atlas)
*   **ODM:** Mongoose
*   **Authentication:** Next-Auth v4 (Google Provider)
*   **AI / LLM:** Google Gemini API (e.g., `gemini-1.0-pro` via `@google/generative-ai` SDK)
*   **Asynchronous Processing (Deployed):** Upstash QStash (`@upstash/qstash` SDK)
*   **Asynchronous Processing (Local Option):** BullMQ, Redis
*   **API Client (Testing/Seeding):** Postman

---

## 5. Local Setup Instructions

### Prerequisites

*   Node.js (v18.x or later recommended)
*   npm (v8.x or later) or yarn
*   MongoDB instance (a free tier on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) is recommended)
*   *(Optional, for BullMQ local dev)* Redis instance (e.g., `docker run -d -p 6379:6379 --name my-redis redis`)
*   *(Optional, for QStash local dev)* `ngrok` or similar tunneling service.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [your-github-repo-url]
    cd [your-project-directory]
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```
    *(or `yarn install`)*

### Environment Variables (`.env.local`)

Create a `.env.local` file in the root of your project and populate it with the following variables. Replace placeholders with your actual credentials.

```env
# MongoDB Configuration
MONGODB_URI="mongodb+srv://<user>:<password>@<cluster-url>/<database_name>?retryWrites=true&w=majority"```

# Google OAuth Credentials (from Google Cloud Console)
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000" # For local development
NEXTAUTH_SECRET="your_strong_random_nextauth_secret" # Generate with: openssl rand -base64 32

# Google Gemini API Key (from Google AI Studio)
GEMINI_API_KEY="your_gemini_api_key"

# Upstash QStash Credentials (from Upstash Console - for QStash mode)
QSTASH_TOKEN="ey..." # Your QStash publish token
QSTASH_CURRENT_SIGNING_KEY="sig_..."
QSTASH_NEXT_SIGNING_KEY="sig_..."
QSTASH_CUSTOMER_CONSUMER_URL="http://localhost:3000/api/consumers/process-customer" # For local QStash testing; use ngrok URL here

# Asynchronous Processing Mode Switch
# "qstash" for QStash mode (deployment or local QStash testing with ngrok)
# "bullmq" (or leave empty) for BullMQ mode (local development with Redis worker)
ASYNC_PROCESSING_MODE="bullmq"

# Redis Configuration (Only if ASYNC_PROCESSING_MODE is "bullmq")
REDIS_HOST="localhost"
REDIS_PORT="6379"
# REDIS_PASSWORD=""
```

### Running the Application

## Start the Next.js development server:

```npm run dev```

The application will be available at http://localhost:3000.

### Testing Asynchronous Processing Locally

QStash (ASYNC_PROCESSING_MODE="qstash"):

Start ```ngrok http 3000``` in a separate terminal.

Update ```QSTASH_CUSTOMER_CONSUMER_URL``` in .env.local with the public HTTPS URL from ngrok.

## Restart 
```npm run dev```.

Data posted to /api/customers will be published via QStash, which then calls your ngrok URL, forwarding to your local consumer endpoint.

### 6. Deployment

## Platform: The application is deployed on Vercel.

## Database: MongoDB Atlas (cloud-hosted).

## Asynchronous Processing: Upstash QStash (ASYNC_PROCESSING_MODE=qstash).

## Environment Variables: All variables from .env.local must be configured in Vercel project settings.

## NEXTAUTH_URL must be the Vercel production URL (e.g., https://your-app.vercel.app).

## QSTASH_CUSTOMER_CONSUMER_URL must be the Vercel production consumer URL (e.g., https://your-app.vercel.app/api/consumers/process-customer).

## Google OAuth Configuration: The Vercel production URL must be added to "Authorized JavaScript origins" and the callback URL (https://<your-app>.vercel.app/api/auth/callback/google) to "Authorized redirect URIs" in the Google Cloud Console.

### 7. Project Structure (Overview)
```
/public                 # Static assets
/src
├── app/                # Next.js App Router: Pages and API Routes
│   ├── (main)/         # Main application pages group (optional grouping)
│   │   ├── campaigns/
│   │   │   ├── create/page.js
│   │   │   └── history/page.js
│   │   └── page.js     # Homepage
│   ├── api/            # API route handlers
│   │   ├── ai/
│   │   ├── auth/
│   │   ├── consumers/
│   │   ├── dummy-vendor/
│   │   └── [customers, orders, campaigns, segments].js # API files
│   └── layout.js       # Root layout
├── components/         # React components (Navbar.jsx, LoginBtn.jsx)
├── lib/                # Utilities (mongodb.js, gemini.js, queryBuilder.js, queues/*)
├── models/             # Mongoose schemas
.env.local              # Local environment variables (GITIGNORED!)
next.config.js
package.json
README.md
```
### 8. How to Use Key Features

* Login: Access the application and sign in with Google.

* Data Ingestion (for testing):

* Use Postman (or similar API client).

* POST to /api/customers with JSON: 
```{"name": "Jane Doe", "email": "jane@example.com", "totalSpend": 200, "visitCount": 5}```

* POST to /api/orders with JSON: 
```{"customerId": "<valid_customer_id>", "amount": 75}```

## Data is queued for asynchronous processing.

# Create a Campaign:

* Navigate to "Create Campaign."

* Enter Campaign Name.

* AI Audience: Type description (e.g., "users with high spend and many visits") and click "Generate Rules."

* Manual Rules: Add/modify rules using the builder (AND logic).

* Click "Preview Audience Size."

* AI Message Suggestions: Type objective, click "Get AI Suggestions." Select or write a message. Use {{name}}.

* Click "Save & Launch Campaign."

## View Campaign History & Insights:

* Navigate to "Campaign History."

* View campaigns with status and delivery stats.

* Click "Get AI Performance Summary" for an AI-generated insight.

### 9. Known Limitations & Assumptions

* **Rule Builder OR Logic: The manual rule builder primarily supports AND logic. Complex OR logic is better handled by the "Natural Language to Rules" AI or separate campaigns.**

* **NL-to-Rules AI: Performs best with clear queries related to available fields (totalSpend, visitCount, lastActiveDate).**

* **Error Handling: Basic error handling is implemented; more granular feedback could be added.**

* **Stats Calculation: Campaign history stats are calculated on-the-fly. For very large scale, optimization (e.g., aggregation) would be needed.**

* **Dummy Vendor: Message delivery is simulated.**

* **BullMQ Worker: The BullMQ setup is for local demonstration; the deployed version uses QStash.**

### 10. Future Improvements

* Implement full OR logic and rule grouping in the manual segment builder.

* Enhance rule builder with a visual (e.g., drag-and-drop) interface.

* Add more AI features (e.g., audience lookalike, smart scheduling).

* Develop a UI for customer/order data management.

* Implement comprehensive analytics dashboards.

* Introduce A/B testing for campaigns.
