# Athlete Advertising Marketplace (Lean v1)

The **Athlete Advertising Marketplace** is a lean v1 web platform where athletes (starting with events like Hyrox) create public profiles listing body parts available as advertising space, brands browse a public listing and submit "contact interest" inquiries, and administrators can monitor signups and inbound contact requests. Note that in this lean v1 version, payments, matching engines, proof uploads, ratings, and booking workflows are explicitly out of scope.

---

## Project Structure

This repository is organized as a monorepo containing two separate applications:

```text
ATSYS/
├── backend/                  # Node.js + Express + TypeScript API server
│   ├── scripts/
│   │   └── test-db.ts        # Database connectivity test script
│   ├── src/
│   │   ├── db.ts             # PostgreSQL connection pool configuration
│   │   └── index.ts          # Express server entry point ("Hello World" / health)
│   ├── .env.example          # Sample environment variables for backend
│   ├── .gitignore            # Backend-specific gitignore
│   ├── package.json          # Backend dependencies & scripts
│   └── tsconfig.json         # TypeScript configuration for backend
├── frontend/                 # Next.js (App Router) + TypeScript web application
│   ├── src/
│   │   └── app/
│   │       ├── globals.css   # Global styling
│   │       ├── layout.tsx    # Root Next.js layout
│   │       └── page.tsx      # Minimal default landing page ("Hello World")
│   ├── .env.example          # Sample environment variables for frontend
│   ├── .gitignore            # Frontend-specific gitignore
│   ├── next.config.mjs       # Next.js configuration
│   ├── package.json          # Frontend dependencies & scripts
│   └── tsconfig.json         # TypeScript configuration for frontend
├── .gitignore                # Root gitignore
├── package.json              # Monorepo root helper scripts
└── README.md                 # Project documentation
```

---

## Getting Started

### Prerequisites
- **Node.js**: v18+ (tested on Node v20/v22/v25)
- **npm**: v9+
- **PostgreSQL**: v14+ instance (local or hosted like Neon / Supabase / Railway)

---

### 1. Backend Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Update `DATABASE_URL` with your valid PostgreSQL connection string.

4. Test PostgreSQL connection:
   ```bash
   npm run db:test
   ```

5. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend API will be available at `http://localhost:4000`.

---

### 2. Frontend Setup

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your `.env.local` file from `.env.example`:
   ```bash
   cp .env.example .env.local
   ```

4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   The frontend application will be available at `http://localhost:3000`.

---

### Running from Root

You can also run commands directly from the root workspace using npm scripts:
- Run backend dev: `npm run dev:backend`
- Run frontend dev: `npm run dev:frontend`
- Test DB connection: `npm run db:test`
