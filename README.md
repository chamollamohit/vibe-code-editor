# Vibe Code Editor

**Vibe Code Editor** is a powerful, browser-based development environment built with Next.js. It leverages **WebContainers** to run Node.js directly in the browser, integrates **Google Gemini** for AI-powered coding assistance, and uses the **Monaco Editor** for a professional coding experience.

## 🚀 Features

-   **Browser-Native Node.js**: Uses [WebContainers](https://webcontainers.io/) to execute code, run servers, and manage file systems entirely within the browser.
-   **AI Coding Assistant**: Integrated chat interface powered by **Google Gemini** to help debug, explain, and write code.
-   **Professional Editor**: Fully featured code editor using **Monaco Editor** (VS Code's core), supporting syntax highlighting, themes, and IntelliSense.
-   **Multi-Template Support**: Create playgrounds for **React, Next.js, Express, Vue, Hono, and Angular**.
-   **Cloud Sync**: Save your projects, templates, and file structures to a MongoDB database via Prisma.
-   **Secure Authentication**: User management and social login support (Google/GitHub) using **NextAuth.js v5**.

## 🛠️ Tech Stack

-   **Framework**: Next.js
-   **Language**: TypeScript
-   **Database**: MongoDB (via Prisma ORM)
-   **Styling**: Tailwind CSS & Shadcn UI
-   **Editor**: Monaco Editor React
-   **Runtime**: WebContainers API
-   **AI**: Google Generative AI SDK

## 📦 Getting Started

### Prerequisites

-   Node.js
-   MongoDB Database URL
-   Google AI API Key (Gemini)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/chamollamohit/vibe-code-editor.git
    cd vibe-code-editor
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a `.env` file in the root directory and add the following:

    ```env
    # Database
    DATABASE_URL=""

    # Authentication (NextAuth)
    AUTH_SECRET=""

    # OAuth Providers
    AUTH_GITHUB_ID= ""
    AUTH_GITHUB_SECRET= ""
    AUTH_GOOGLE_ID= ""
    AUTH_GOOGLE_SECRET= ""

    # AI Service
    GOOGLE_API_KEY= ""

    ```

4.  **Run Database Migration:**

    ```bash
    npx prisma db push
    ```

5.  **Start the Development Server:**

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) to view the editor.
