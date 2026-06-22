# Bolt for Mobile Apps

This project is a Turborepo-based monorepo that contains the following main components:

- `apps/frontend`: The web interface for the project.
- `apps/primary-backend`: Handles webhooks (e.g., Clerk) and project creation/fetching.
- `apps/worker`: Communicates with Google's Gemini API and manages the underlying code generation and docker execution.
- `apps/code-server`: The Docker setup for running the code environment.
- `packages`: Contains shared utilities, database schema/clients, etc.

## Prerequisites

Ensure you have the following installed on your machine:

- **Node.js**: >=18
- **Bun**: This project uses `bun` as its package manager.
- **Docker**: Required for running the code-server container used by the worker.
- **Ngrok**: Required for exposing the local backend to receive Clerk webhooks.
- **PostgreSQL & Redis**: You can run these locally or use cloud providers (like Neon, Supabase, Upstash, etc.).

## Environment Variables Setup

You need to configure the following environment variables. In each of the directories below, create a `.env` file based on `.env.example` (or just create it if missing) and populate them.

### `apps/frontend/.env`

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Get this from your Clerk Dashboard under API Keys.
- `CLERK_SECRET_KEY`: Get this from your Clerk Dashboard under API Keys.

### `apps/primary-backend/.env`

- `JWT_PUBLIC_KEY`: Your Clerk JWT Public Key. Go to **Clerk Dashboard -> API Keys -> Advanced -> JWT Public Key**. Make sure to include the `-----BEGIN PUBLIC KEY-----` and `-----END PUBLIC KEY-----` wrapper.
- `CLERK_WEBHOOK_SECRET`: Your Clerk Webhook Secret. Go to **Clerk Dashboard -> Webhooks -> Add Endpoint -> Copy Signing Secret**.

### `apps/worker/.env`

- `GEMINI_API_KEY`: Get this from Google AI Studio / Google Cloud console.

### `packages/db/.env`

- `DATABASE_URL`: Your PostgreSQL connection string.

### `packages/redis/.env`

- `REDIS_URL`: Your Redis connection string. (Default: `redis://localhost:6379`)

## Running the Project Locally

### 1. Install Dependencies

Run the following command at the root of the project to install all dependencies using Bun:

```bash
bun install
```

### 2. Database Setup

Ensure your PostgreSQL instance is running. Then navigate to the db package to push the schema and generate the Prisma client:

```bash
cd packages/db
bunx prisma db push
bunx prisma generate
cd ../..
```

### 3. Docker Setup (Code-server)

The worker requires a running Docker container named `code-server-update` to execute code.

1. Navigate to the code-server directory:

   ```bash
   cd apps/code-server
   ```

2. Build the Docker image:

   ```bash
   docker build -t coder-custom .
   ```

3. Run the Docker container:

   ```bash
   docker run -d --name code-server-update -p 8080:8080 -v /tmp/bolty-worker:/tmp/bolty-worker coder-custom
   ```

   _(Note: The volume mount `/tmp/bolty-worker` is required as the worker writes to it)._

### 4. Setting up Ngrok for Clerk Webhooks

The `primary-backend` listens on port `9090` and handles the `/api/clerk/webhook` route to create users in the database when they sign up. To receive webhooks locally, you must expose this port:

```bash
ngrok http 9090
```

Then, copy the ngrok forwarding URL (e.g., `https://<your-ngrok-id>.ngrok.app`) and add it as an endpoint in your Clerk Dashboard:

- **Endpoint URL**: `https://<your-ngrok-id>.ngrok.app/api/clerk/webhook`
- **Subscribed Events**: Make sure to subscribe to the `user.created` event!

### 5. Start the Application

You can run all the applications simultaneously using Turborepo from the root directory:

```bash
bun run dev
```

This command will concurrently start:

- `frontend` (Next.js app, usually on port 3000)
- `primary-backend` (Express server on port 9090)
- `worker` (Express server on port 9091)

You can now visit the frontend in your browser and test the application!
