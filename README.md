# AIMI

AIMI is an AI-powered web application that allows you to build, preview, and interact with web applications through a conversational interface. Describe what you want to create, and AIMI's AI agent will generate the code and deploy it to a live, interactive sandbox environment.

## Key Features

-   **Conversational App Generation**: Build web applications by simply describing your requirements in a chat.
-   **Live Interactive Previews**: Instantly view and interact with your generated application within a secure E2B code interpreter sandbox.
-   **Integrated Development View**: A split-screen interface featuring the AI chat, a file explorer for the generated code, and the live application preview.
-   **User & Project Management**: Secure user authentication via Clerk, with support for managing multiple projects.
-   **Usage-Based Credits**: A built-in credit system with free and pro tiers to manage generation costs.
-   **Pre-configured Tech Stack**: The agent works within a sandboxed Next.js environment with shadcn/ui and Tailwind CSS pre-installed.

## How It Works

1.  **User Prompt**: A user signs in, creates a project, and describes the application or component they want to build.
2.  **tRPC Request**: The prompt is sent to the backend via a tRPC mutation.
3.  **Inngest Job**: An Inngest function is triggered to handle the asynchronous code generation task.
4.  **AI Agent & Sandbox**: An AI agent, powered by the Inngest Agent Kit and OpenAI, receives the prompt. It operates within an E2B Code Interpreter sandbox to perform tasks like:
    -   Installing npm packages.
    -   Creating and updating Next.js, React, and TypeScript files.
    -   Writing code that uses the pre-installed shadcn/ui components and Tailwind CSS.
5.  **Live Preview**: Once generation is complete, the sandbox provides a live URL for the running Next.js application.
6.  **UI Update**: The frontend receives the sandbox URL and generated file structure. The user can then see a live preview of the app, browse the generated code, and continue the conversation with the AI agent.

## Tech Stack

-   **Framework**: [Next.js](https://nextjs.org/) (App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **UI**: [React](https://react.dev/), [shadcn/ui](https://ui.shadcn.com/), [Tailwind CSS](https://tailwindcss.com/)
-   **API**: [tRPC](https://trpc.io/)
-   **Database**: [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/)
-   **Background Jobs & AI Agents**: [Inngest](https://www.inngest.com/)
-   **Code Sandboxing**: [E2B Code Interpreter](https://e2b.dev/)
-   **Authentication**: [Clerk](https://clerk.com/)
-   **State Management**: [TanStack Query](https://tanstack.com/query/latest)

## Project Structure

The repository is organized into modules to separate concerns and features.

```
├── prisma/               # Prisma schema, migrations, and database client
├── public/               # Static assets
├── sandbox-templates/    # E2B sandbox Dockerfile and configuration
├── src/
│   ├── app/              # Next.js App Router pages and layouts
│   ├── components/       # Reusable UI components (including shadcn/ui)
│   ├── inngest/          # Inngest client, functions, and agent logic
│   ├── lib/              # Core utilities, database client, and usage logic
│   ├── modules/          # Feature-based modules (home, projects, messages)
│   └── trpc/             # tRPC server and client configuration
└── ...
```

## Getting Started

To run this project locally, you will need to set up the required services and environment variables.

### Prerequisites

-   Node.js
-   npm, pnpm, or yarn
-   A PostgreSQL database
-   API keys for Clerk, Inngest, E2B, and OpenAI.

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/ABHINAV2400/AIMI.git
    cd AIMI
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up environment variables:**

    Create a `.env.local` file in the root of the project and add the following variables.

    ```env
    # Prisma / PostgreSQL Database
    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"

    # Clerk Authentication
    # Get these from your Clerk dashboard
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
    CLERK_SECRET_KEY=

    # Inngest
    # Get these from your Inngest dashboard
    INNGEST_EVENT_KEY=
    INNGEST_SIGNING_KEY=

    # E2B Sandbox
    # Get this from your E2B dashboard
    E2B_API_KEY=

    # OpenAI
    # Your OpenAI API key
    OPENAI_API_KEY=
    ```

4.  **Run database migrations:**

    This command will sync your Prisma schema with your PostgreSQL database.

    ```bash
    npx prisma migrate dev
    ```

5.  **Run the development server:**

    ```bash
    npm run dev
    ```

The application will be available at `http://localhost:3000`.

## API Documentation

### tRPC Endpoints

The application uses tRPC for type-safe API routes:

- **Projects Router** (`/api/trpc/projects.*`):
  - `create`: Create a new project
  - `list`: Get user's projects
  - `delete`: Delete a project

- **Messages Router** (`/api/trpc/messages.*`):
  - `create`: Send a message to AI agent
  - `list`: Get project messages
  - `delete`: Delete a message

- **Usage Router** (`/api/trpc/usage.*`):
  - `get`: Get user's current usage/credits
  - `update`: Update usage after generation

### Inngest Functions

Background jobs handled by Inngest:

- **Code Generation**: Processes user prompts and generates code
- **Sandbox Management**: Creates and manages E2B sandboxes
- **Usage Tracking**: Updates user credits and usage limits

## Contributing

1. **Fork the repository**
2. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** following the development guidelines
4. **Test your changes** thoroughly
5. **Submit a pull request** with a clear description

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [E2B](https://e2b.dev/) for providing secure code execution sandboxes
- [Inngest](https://www.inngest.com/) for reliable background job processing
- [Clerk](https://clerk.com/) for seamless authentication
- [shadcn/ui](https://ui.shadcn.com/) for beautiful, accessible components
- [Vercel](https://vercel.com/) for excellent Next.js hosting


**Built with ❤️ using Next.js, TypeScript, and modern web technologies.**
