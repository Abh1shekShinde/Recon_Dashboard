# ReconIq - A Reconciliation Dashboard

A web application that ingests an order system export and a payment processor export, reconciles them, and presents the result as a dashboard — with an AI layer on top that explains individual or aggregate discrepancies in plain language.

**Live app:** https://recon-dashboard-xi.vercel.app/

**Repo:** https://github.com/Abh1shekShinde/Recon_Dashboard

**Login:** sign up with any email/password directly on the live app (_incase of issues with sign up please use Email: ab@gmail.com, Pass: 148635_).

## Local Setup
**Prerequisites :** 
  1. Node.js 18+
  2. Yarn
  3. Free Supabase account
  4. Groq (_any other LLM_) API key

**Steps:**
>git clone https://github.com/Abh1shekShinde/Recon_Dashboard

>cd recon-dashboard

>yarn install

Copy .env.example to .env.local and fill in your own values:

NEXT_PUBLIC_SUPABASE_URL=your api-key

NEXT_PUBLIC_SUPABASE_ANON_KEY= your api-key

SUPABASE_SERVICE_ROLE_KEY=your api-key

GROQ_API_KEY=your api-key

**Run the dev server **
> yarn dev

Visit http://localhost:3000, sign up, and upload orders.csv / payments.csv
