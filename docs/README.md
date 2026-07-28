# CAL.DIY Spa Management System 

A highly advanced, fully autonomous Spa Management and Scheduling dashboard powered by Cal.com API, Google Sheets, n8n, and an integrated MCP AI Agent acting as an intelligent Spa Receptionist and Manager.

## 🌟 Executive Summary
CAL.DIY transforms a traditional self-hosted Cal.com instance into a multi-tenant, intelligent spa management ecosystem. It provides a real-time React-based dashboard for human operators while simultaneously deploying an autonomous LLM (MCP AI) to process incoming requests, emails, and bookings entirely hands-free. 

By leveraging Google Sheets as a database and n8n as a webhook/email courier, CAL.DIY requires zero traditional backend databases—making it incredibly scalable and easy to maintain.

---

## 🛠 GUI Features & Capabilities
* **Interactive Drag-and-Drop Timetable:** Visually manage all bookings across all specialists in a unified calendar.
* **Intelligent Rescheduling:**
  * **Same Specialist:** Dragging a booking to a new time automatically triggers a standard Cal.com `/reschedule` API call.
  * **Cross-Specialist Transfer:** Dragging a booking to a different specialist automatically triggers a robust "Cancel & Re-Book" macro behind the scenes, seamlessly transferring the client without manual data entry.
* **Multi-User Full Management:** Control center to fetch global Cal.com users, promote them to "Specialists", assign working hours, mapping event types, and managing individual secure API keys.
* **Live Action Center:** A dedicated panel to review pending incoming requests (from email/web), AI-recommended actions, and a history of handled operations.
* **Google Cloud Console Integration:** Secure OAuth2 linkage to read/write persistent state via Google Sheets.

---

## 🤖 The MCP AI Assistant / Spa Receptionist
CAL.DIY features a built-in MCP (Model Context Protocol) AI Agent that operates entirely within the dashboard's ecosystem. It acts as both a **Spa Receptionist** (talking to clients) and a **Spa Manager** (executing system commands).

### How It Is Powered
* **Backend:** A Node.js/Express proxy server (`server/server.js`) that safely interfaces with the Cal.com V2 API, bypassing CORS and enforcing proper authentication headers per-specialist.
* **LLM Orchestration:** Powered by Vercel AI SDK and OpenAI (e.g., GPT-4o). The AI receives a strict System Prompt defining its persona, constraints, and JSON-based tool-calling syntax.
* **Queue System:** The GUI continuously polls the `Requests` Google Sheet. Pending rows are autonomously fed into the AI's context window for evaluation.

### Autonomous Email Processing (The Closed Loop via n8n)
The system integrates effortlessly with external communication channels using **n8n** (hosted on Openhost):
1. **Inbound:** n8n monitors a designated Gmail inbox for new booking inquiries and pushes the raw email text into the CAL.DIY Google Sheet.
2. **Evaluation:** The MCP AI reads the email text. If it contains sufficient intent (Time, Specialist, Treatment), it generates a booking payload. 
3. **Missing Info & Communication:** If the email is vague, the AI generates a conversational, receptionist-style reply (e.g., *"We'd love to book your massage! What time works best?"*). It marks the row as `needs_info`.
4. **Outbound:** A second n8n workflow detects the `needs_info` status and automatically emails the AI's generated response back to the client.

---

## 🧰 MCP AI Tools List
The AI Agent is equipped with specialized tools that allow it to read and write directly to the Cal.com database via the proxy:
1. `get_availability`: Checks open slots for a specific specialist (`username`) between a start and end date for a given `eventTypeId`.
2. `get_bookings`: Retrieves a specialist's schedule to prevent double-booking or locate an existing booking UID.
3. `get_event_types`: Looks up a specialist's configured treatments and mapping IDs.
4. `create_booking`: Secures a new appointment for a client, passing all required metadata (name, email, notes).
5. `reschedule_booking`: Modifies an existing booking's start time securely.
6. `cancel_booking`: Cancels a booking with an automated cancellation reason.

### Rules & Prompting
To make the AI work flawlessly, the System Prompt enforces strict behavioral guardrails:
* **JSON First:** The AI is instructed to output its reasoning and tool calls in a strict JSON codeblock format to prevent hallucinated arguments and ensure the proxy parses requests perfectly.
* **Persona:** "You are a professional, polite, and highly efficient Spa Receptionist."
* **Validation:** "Never attempt to book a slot without first using `get_availability` to confirm the time is open."

---

## 🛡 Custom Error Handling & Edge Cases
The system incorporates advanced heuristics and fallbacks to handle Cal.com API quirks safely:

* **The `rescheduleReason` V2 Rejection:** The Cal.com V2 API strictly rejects payloads containing a `rescheduleReason` property (400 Bad Request). The proxy automatically strips unsupported fields before transmitting payloads, ensuring standard reschedules succeed.
* **Corrupted Booking Fallback (Missing Event Type):** If the Cal.com API rejects a `/reschedule` request because the original booking lacks an `eventTypeId` (404 Missing Event Type), CAL.DIY catches the error and autonomously triggers a "Cancel & Re-Book" fallback to rescue the booking without losing data.
* **Individual API Key Persistence:** The system permanently binds API keys to stable `therapist_id` hashes rather than dynamic usernames. This prevents GUI state resets during cross-specialist synchronization and ensures the proxy always uses the correct authentication header.

---

## 📂 Expected GitHub Repository Structure

```text
splendid-darwin/
├── src/
│   ├── App.tsx                 # Core Dashboard GUI, Drag & Drop Logic, Google Sheets Sync
│   ├── index.css               # Styling and Dashboard aesthetics
│   ├── api/
│   │   └── calClient.ts        # API Key resolution & HTTP fetching layer
│   └── services/
│       ├── bookingService.ts   # CRUD operations for Bookings + Fallback heuristics
│       └── calendarService.ts  # Users, Connections, and Event Types mapping
├── server/
│   └── server.js               # Node.js Proxy Server, CORS bypass, MCP AI Orchestration
├── docs/
│   ├── README.md               # Executive Summary & Architecture (This file)
│   └── SETUP.md                # Environment variables and n8n configuration instructions
├── package.json
└── tsconfig.json
```
