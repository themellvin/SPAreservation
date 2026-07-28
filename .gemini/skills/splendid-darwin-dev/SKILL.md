---
name: splendid-darwin-dev
description: Comprehensive technical architecture, AI restrictions, proxy security, n8n email loop, VPS deployment rules, secret management, and full n8n dashboard orchestration for the Splendid Darwin (CAL.DIY) system.
---

# Splendid Darwin Technical & AI Agent Skill

## Context
Use this skill when modifying, debugging, or deploying the **Splendid Darwin** (CAL.DIY) codebase, configuring its AI Agent (GPT-4o), adjusting the backend proxy (port 3001), wiring up n8n webhooks, managing secrets, or deploying full reservation orchestration.

## 1. MCP AI Agent Toolset & Powers (Spa Manager & Receptionist)
The AI Assistant is a fully autonomous Multi-User Spa Manager equipped with 8 core tools:
- **Core Scheduling:** `get_availability` (suggests 2-3 slots), `create_booking` (executes in parallel for multiple people), `reschedule_booking`, `cancel_booking`.
- **Treatment Management (CRUD):** `get_event_types`, `create_event_type`, `update_event_type`, `delete_event_type`.

## 2. Critical AI Restriction Rules & Prompt Directives
- **Native Tool Calling ONLY:** NEVER output ````json```` codeblocks in text responses. Arguments MUST pass via the native tool calling API.
- **Always Fetch Event Types First:** When asked about treatments, always run `get_event_types` first.
- **Proactiveness & One-Step Booking:** Don't ask to check availability—just do it. If a user confirms a time, book it immediately without re-checking.
- **Cross-Specialist Rescheduling:** You MUST `cancel_booking` on the old and `create_booking` on the new. `reschedule_booking` does not support switching specialists.
- **Error Fallback:** If `create_booking` fails, immediately call `get_availability`.

## 3. Dynamic Specialists Directory
The AI reads `server/specialists.json` on every chat request. It must refer to specialists by their full Name in conversation but use the `username` for API calls.

## 4. Backend Proxy Server Architecture (Port 3001)
The local Express.js proxy (`server/server.js`) bypasses CORS for the frontend.
- **API URL OVERRIDE:** The proxy must target `https://calcom.run.place/api/v2` (NOT the public `https://api.cal.com/v2/`).
- **Multi-User Interception:** The proxy injects unique user API keys into the authorization header based on the targeted specialist.

## 5. VPS Deployment & Production Fixes (calcom.run.place)
- **API Key Consistency:** Deployment on Contabo VPS strictly requires `API_KEY_PREFIX=cal_live_` to be identical across `.env` and `apps/api/v2/.env`. 
- **Nginx & Let's Encrypt:** Nginx acts as a reverse proxy forwarding port 80/443 to local 3000.

## 6. Secret Management (The 5 Levels)
When building AI automations and integrations, strict credential management is required to prevent leaks.
- **Level 0 (Worst):** Hardcoding passwords in source code. (Never acceptable).
- **Level 1 (Basic):** Extracting secrets into `.env` files (ignored in git).
- **Level 2 (Better):** Encrypting the config file (e.g., SOPS, git-crypt).
- **Level 3 (Standard):** Dedicated Secret Manager (AWS Secrets Manager, HashiCorp Vault). Secrets are fetched dynamically at runtime. This is the minimum acceptable standard for production web apps.
- **Level 4 (Gold Standard):** Dynamic Ephemeral/Temporary Credentials. Vault generates short-lived, time-limited credentials just-in-time and revokes them automatically.

## 7. The Full n8n + Google Sheets Orchestration Dashboard
The system acts as a unified reservation center receiving inputs from Email (IMAP), WhatsApp (Webhook), and Manual UI (AppSheet/Glide). Google Sheets is the middleware.

### Google Sheets Architecture
- **`Main_Sheet`**: Holds the full reservation data (source, client, service, start_time, cal_booking_uid, status, sync_direction).
- **`Status_Sheet`**: Holds pending rows awaiting human approval.

### The 4 Core n8n Workflows
1. **Incoming to Cal.com (to_cal):**
   - Triggers: Email Webhook / WhatsApp Webhook / Sheets manual row addition.
   - Code Node normalizes data, generates a UUID, appends to `Main_Sheet` as `pending`.
   - If auto-confirm applies $\rightarrow$ HTTP POST to `https://calcom.run.place/api/v2/bookings` $\rightarrow$ Update to `confirmed`.
   - If human approval needed $\rightarrow$ Send to `Status_Sheet`.
2. **Cal.com to Google Sheets (from_cal):**
   - Trigger: Cal.com webhook (`booking.created`, `booking.cancelled`).
   - Looks up `cal_booking_uid` in `Main_Sheet`. Updates if found, appends if new.
3. **Approval Status Sync:**
   - Trigger: `Status_Sheet` updated. 
   - If approved $\rightarrow$ POST to Cal.com API $\rightarrow$ update `Main_Sheet` to `confirmed`.
   - If rejected $\rightarrow$ DELETE booking in Cal.com $\rightarrow$ update `Main_Sheet` to `rejected`.
4. **Cron Sync (Full Reconciliation):**
   - Triggers every 15 minutes.
   - GET `/v2/bookings?status=all` from Cal.com. Compares with Google Sheets and batch-appends or updates discrepancies.
