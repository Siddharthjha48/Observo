# 👁️ OBSERVO — Premium Developer Monitoring SaaS

```text
  ██████╗ ██████╗ ███████╗███████╗██████╗ ██╗   ██╗ ██████╗ 
 ██╔═══██╗██╔══██╗██╔════╝██╔════╝██╔══██╗██║   ██║██╔═══██╗
 ██║   ██║██████╔╝███████╗█████╗  ██████╔╝██║   ██║██║   ██║
 ██║   ██║██╔══██╗╚════██║██╔══╝  ██╔══██╗╚██╗ ██╔╝██║   ██║
 ╚██████╔╝██████╔╝███████║███████╗██║  ██║ ╚████╔╝ ╚██████╔╝
  ╚═════╝ ╚═════╝ ╚══════╝╚══════╝╚═╝  ╚═╝  ╚═══╝   ╚═════╝ 
```

**Observo** is a premium, open-source, neobrutalist-styled developer monitoring SaaS. It enables you to actively watch REST endpoints for uptime, track background cron heartbeats using Redis, dispatch instant incident notifications to Discord, Slack, and Email, and review weekly DevOps system audits compiled automatically by **Google Gemini AI**.

---

## ⚡ Core Features

* 🌐 **API Uptime Checking:** Query endpoints at custom intervals (1–10 minutes) with precise HTTP status verification, response time logging, and abort-signal timeouts.
* ⏳ **Cron Heartbeat Tracking:** Keep tabs on background queue workers and database backups. Simply curl a unique ping URL; if a job misses its window and grace buffer, Observo flags it and alerts you.
* 🤖 **Gemini AI Digests:** Summarize incident logs, analyze downtime root causes, and generate mitigation recommendations using generative AI.
* 🚨 **Multi-Channel Alerts:** Connect Slack, Discord, and SMTP email webhooks to notify team members the second service degradation or downtime occurs.
* 💳 **Simulated Billing Fallback:** If Stripe keys are omitted (e.g., restricted countries like India), the dashboard automatically falls back to database-simulated upgrades, unlocking unlimited PRO features instantly.
* 🛠️ **Neobrutalist Admin Bypass:** Access raw PRO-tier administrative capabilities via a custom local bypass console `/admin-login` for debugging.

---

## 🚀 Technology Stack

* **Frontend & Backend:** Next.js 16.2.6 (App Router with Turbopack & React 19)
* **Styling:** Tailwind CSS v4 (Custom Neobrutalist design tokens)
* **Database & ORM:** PostgreSQL (Supabase) + Prisma client
* **Session Cache:** Upstash Redis (REST API client)
* **Authentication:** Clerk Auth (with local developer preview bypass modes)
* **AI Engine:** Google Gemini Pro (`@google/generative-ai`)
* **Email Dispatch:** SMTP client (Nodemailer)

---

## 🛠️ Step-by-Step Installation

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/Siddharthjha48/Observo.git
cd Observo
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory and copy the contents from your configuration. Here is the list of required variables:

```env
# Database Connections (Supabase)
DATABASE_URL="postgresql://..." # Transaction pooler (Port 5432)
DIRECT_URL="postgresql://..."   # Session pooler for migrations

# Clerk Authentication (Production or Dev Keys)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."
CLERK_WEBHOOK_SECRET="whsec_..." # Optional, for user sync webhook

# Upstash Redis
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# Google Gemini AI Key
GEMINI_API_KEY="..."

# SMTP Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="465"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-gmail-app-password"
SMTP_FROM="your-email@gmail.com"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000" # Or https://observo.siddharthx.space
CRON_SECRET="your-secret-cron-token"
```

### 3. Initialize the Database Schema
Push the Prisma models directly to your PostgreSQL instance:
```bash
npx prisma db push
```

### 4. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to inspect.

---

## ☁️ Deployment on Vercel

1. Import the repository into your Vercel Dashboard.
2. Provide all environment variables from your local `.env`.
3. If using a **Vercel Hobby Account** (which limits cron frequencies), Vercel's automated `vercel.json` crons are pre-configured to run daily to avoid build-time errors.
4. To run **1-minute monitoring checks** on the Hobby tier:
   * Go to **[cron-job.org](https://cron-job.org)**.
   * Add a cron job pointing to `https://<your-subdomain>.siddharthx.space/api/cron/check-monitors` running every minute.
   * Add a request header: `Authorization: Bearer <your-cron-secret>`.

---

## 📂 Project Architecture

```text
├── prisma/               # Schema configuration and migrations
├── public/               # Static assets & favicon
└── src/
    ├── app/              # Next.js App Router folders
    │   ├── (auth)/       # Sign-in & Sign-up routes
    │   ├── (dashboard)/  # Main console panel, monitors, crons, alerts
    │   ├── admin-login/  # Admin session bypass panel
    │   └── api/          # Uptime pings, webhook receivers, cron runners
    ├── components/       # Neobrutalist UI elements (buttons, cards, badges)
    ├── lib/              # Database connection, Stripe, Redis, Alerts & AI engines
    └── proxy.ts          # Next.js 16 Edge Auth & Route protection
```

---

## 📄 License
This project is open-source and licensed under the MIT License.
