# Recon IQ - A Reconciliation Dashboard

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
```
git clone https://github.com/Abh1shekShinde/Recon_Dashboard

cd recon-dashboard

yarn install
```
Copy .env.example to .env.local and fill in your own values: (make sure not to keep spaces before or after =)
```
NEXT_PUBLIC_SUPABASE_URL=your api-key

NEXT_PUBLIC_SUPABASE_ANON_KEY=your api-key

SUPABASE_SERVICE_ROLE_KEY=your api-key

GROQ_API_KEY=your api-key
```

**Run the dev server **

```yarn dev```

Visit http://localhost:3000, sign up, and upload orders.csv / payments.csv


## Architecture
Everything lives in a single Next.js application, deployed as one unit to Vercel. There is no separate backend service.

<img width="697" height="503" alt="architecture" src="https://github.com/user-attachments/assets/57b026f6-097b-41ac-abe3-bdf94500bf4b" />

## Reconciliation Logic
1. **Normalize:** Parse both files' dates to UTC (orders.csv uses YYYY-MM-DD HH:MM:SS; payments.csv uses DD/MM/YYYY HH:MM these are different formats and are parsed accordingly, not assumed to be the same). Coerce missing numeric fields to null rather than 0, so a truly missing value isn't treated as zero everywhere.
2. **De-duplicate:** orders.csv contains one exact duplicate order row (ORD-1004). Duplicate order_id rows are collapsed to the first occurrence before matching, so a duplicate CSV row cannot manufacture a fake discrepancy.
3. **Group payments by order:** A single order can have multiple payment records (a charge and a later refund, or as found in this data —> duplicate charges), so payments are grouped by their (normalized) order_reference before evaluation.
4. **Classify, one label per case:** Checks run in a deliberate order (currency → duplicate charge → status → amount) so that one order/payment group receives exactly one classification, not several overlapping ones. A dashboard that tags the same problem three different ways is noise, not insight.



## Data Findings
Running the engine against the provided orders.csv and payments.csv returned 19 discrepancies:
- 4 missing payments : either the store thinks it sold something the bank never actually charged for, or the bank collected money for an order the store has no record of. 
- 3 orphan payments : payments referencing an order number that doesn't exist in the order system
- 2 duplicate charges : the same order billed twice
- 5 amount mismatches : what was charged doesnt match what the order says it should be
- 1 status mismatch : order marked "some status" but the bank shows "different status"
- 2 currency mismatches : order currency and payment currency doesnt match 
- 2 unsettled payments : not necessary these are errors (either unsettled or pending)

## LLM Approach
The app is built against the OpenAI SDK's interface, but calls Groq's OpenAI-compatible endpoint (https://api.groq.com/openai/v1) running **openai/gpt-oss-20b**, rather than OpenAI directly.

**Temperature: 0.2** : This task is summarization and explanation over numbers that have already been computed deterministically, it is not creative writing, and consistency matters more than variety. A low temperature keeps explanations stable and predictable across repeated runs on similar data, without the occasional repetitive/degenerate output that can appear at literal 0 on some models.

**Structured output**:  combined with the exact required shape spelled out explicitly in the system prompt, is more broadly supported across providers, at the cost of a weaker built-in guarantee. That gap is closed with a zod schema validated against every response with safeParse .

**Never load-bearing**: Both prompts explicitly tell the model it is explaining an already-classified discrepancy, not deciding whether one exists. The reconciliation engine has no dependency on the LLM in either direction.

## Scope for improvements with more time
  - Unit tests for the reconciliation engine and other functions + components.
  - CSV validation feedback before ingest.
  - FX conversion for currency mismatches, using a real exchange-rate source.
  - Audit trail: right now re-upload fully replaces prior data; keeping a versioned history of past reconciliation runs would let a user compare "did this get better or worse since last week".
  - Handling of split payments - Emi would be considered error in current system.

## Use of AI tools
This project was built with help of Claude 
  - Guidance on architecture decisions specially to make it quick given the time constraint 
  - working with new tech (supabase) was easier because of steps provided by claude, this made initial setup for the DB very fast without wasting much time in goinf thorught docs
  - really helped in the reconciliation algorithm which coulve taken most of the time to write from scratch
  - for code generation, and the LLM integration of GPT.
    
