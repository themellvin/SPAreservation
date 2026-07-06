# SPAreservation
SPA reservation System
# Cal.com Reservation Dashboard — n8n + Google Sheets + Cal.com API v2

> **Variants 3.1.A** — Nākamais solis: integrācija ar Cal.com API kā rezervāciju centrs.
> Autors: Melvins Bartoniks, BDA students · Asistents: Perplexity · Datums: 2026-07-06

---

## 📑 Saturs

1. [Pārskats](#1-pārskats)
2. [Arhitektūras diagramma](#2-arhitektūras-diagramma)
3. [Komponentu sadalījums](#3-komponentu-sadalījums)
4. [Google Sheets struktūra](#4-google-sheets-struktūra)
5. [Cal.com API v2 galvenie endpointi](#5-calcom-api-v2-galvenie-endpointi)
6. [n8n Workflow loģika](#6-n8n-workflow-loģika)
7. [Datu plūsma abos virzienos](#7-datu-plūsma-abos-virzienos)
8. [Drošība un API atslēgas](#8-drošība-un-api-atslēgas)
9. [Izvietošana (Deployment)](#9-izvietošana-deployment)
10. [n8n Workflow JSON izveides prompts](#10-n8n-workflow-json-izveides-prompts)
11. [Uzturēšana un paplašināšana](#11-uzturēšana-un-paplašināšana)

---

## 1. Pārskats

Šis risinājums izveido vienotu rezervāciju dashboard, kurā rezervācijas tiek uzņemtas no trim avotiem:

- **E-pasts** — IMAP/Gmail webhook, kas parsē rezervācijas pieprasījumus
- **Chat / WhatsApp** — WhatsApp Business API caur n8n webhook trigger
- **Manuālā ievade** — no Google Sheets AppSheet/Glide dashboard UI

Google Sheets darbojas kā **starpnieks (middleware)** starp Cal.com API un dashboard abos virzienos:

```
[E-pasts] ──┐
[WhatsApp] ──┼──► [n8n] ──► [Google Sheets] ◄──► [Cal.com API v2]
[Manual]   ──┘                      │
                                    ▼
                             [Dashboard UI]
```

### Galvenās priekšrocības

- Google Sheets ir **vienots datu avots** (single source of truth), kuru redz gan n8n, gan Cal.com, gan dashboard
- **Abpusēja sinhronizācija**: ja rezervācija tiek izveidota Cal.com (piem., caur Cal.com booking page), tā parādās Google Sheets un dashboard
- **Cilvēka apstiprinājums**: neskaidri gadījumi paliek Status Sheet ar `pending` statusu
- **Audit trail**: katra darbība tiek ierakstīta Google Sheets ar timestamp

---

## 2. Arhitektūras diagramma

<img width="2800" height="1800" alt="calcom_architecture" src="https://github.com/user-attachments/assets/ab536bd5-cfb1-455e-b6e4-22af9b66e609" />


Diagramma parāda pilnu datu plūsmu: rezervāciju avoti (e-pasts, WhatsApp, manuāli) → n8n orķestrācija → Google Sheets starpnieks → Cal.com API v2 → Dashboard UI.

---

## 3. Komponentu sadalījums

### 3.1. Rezervāciju avoti

| Avots | Trigger tips | n8n Node | Formāts |
|-------|-------------|----------|---------|
| E-pasts (Gmail/IMAP) | Webhook / IMAP Trigger | `n8n-nodes-base.emailReadImap` vai Gmail Trigger | Teksts → parsēts JSON |
| WhatsApp Business API | Webhook POST | `n8n-nodes-base.webhook` (POST) | JSON payload ar ziņojuma saturu |
| Manuālā ievade | Google Sheets row append | `n8n-nodes-base.googleSheetsTrigger` (row added) | Tabulas rinda ar laukiem |

### 3.2. n8n Orķestrācijas slānis

| Node | Tips | Funkcija |
|------|------|----------|
| Webhook Trigger (e-pasts) | `webhook` | Uztver ienākošos e-pastus kā webhook |
| WhatsApp Trigger | `webhook` | Uztver WhatsApp Business API ziņojumus |
| Google Sheets Trigger | `googleSheetsTrigger` | Triggers kad jauna rinda pievienota Main Sheet |
| Python Matching (Code) | `code` | Python code node: validē, normalizē, matching loģika |
| Google Sheets Append/Update | `googleSheets` | Pieraksta rezultātu Main Sheet un Status Sheet |
| Cal.com API (HTTP Request) | `httpRequest` | POST/GET/PUT uz Cal.com API v2 |

### 3.3. Google Sheets — Starpnieks

| Sheet | Loma | Trigger |
|-------|------|---------|
| `Main_Sheet` | Visas rezervācijas ar pilno datu kopu | n8n Write + n8n Read trigger |
| `Status_Sheet` | Apstiprinājuma rindas (`pending`, `approved`, `rejected`) | Dashboard lietotājs atjaunina |

### 3.4. Dashboard UI

| Rīks | Apraksts |
|------|----------|
| Google Sheets (tieši) | Vienkāršākais: formulas, filtrēšana, conditional formatting |
| AppSheet | Google Sheets → mobilā/web aplikācija ar formām un skatiem |
| Glide | Alternatīva: Google Sheets kā backend, vizuāls UI |

---

## 4. Google Sheets struktūra

### 4.1. Main_Sheet kolonnas

| Kolonna | Tips | Apraksts | Piemērs |
|---------|------|----------|---------|
| `reservation_id` | TEXT | Unikāls ID (UUID vai Cal.com booking ID) | `cal_abc123` |
| `source` | TEXT | Avots: `email`, `whatsapp`, `manual`, `cal_web` | `whatsapp` |
| `client_name` | TEXT | Klienta vārds | `Jānis Bērziņš` |
| `client_email` | TEXT | E-pasts | `janis@example.com` |
| `client_phone` | TEXT | Telefons (E.164) | `+37112345678` |
| `service_type` | TEXT | Pakalpojuma tips | `SPA Massage 60min` |
| `event_type_id` | TEXT | Cal.com event type ID | `evt_456` |
| `start_time` | DATETIME | Rezervācijas sākums (ISO 8601) | `2026-07-10T14:00:00Z` |
| `end_time` | DATETIME | Rezervācijas beigas (ISO 8601) | `2026-07-10T15:00:00Z` |
| `timezone` | TEXT | Laika josla | `Europe/Riga` |
| `status` | TEXT | `pending`, `confirmed`, `cancelled`, `completed` | `confirmed` |
| `cal_booking_uid` | TEXT | Cal.com booking UID | `booking_xyz789` |
| `notes` | TEXT | Papildu piezīmes | `Alerģija pret eļļām` |
| `created_at` | DATETIME | Kad ieraksts izveidots Google Sheets | `2026-07-06T14:24:00Z` |
| `updated_at` | DATETIME | Pēdējais atjauninājums | `2026-07-06T14:25:00Z` |
| `sync_direction` | TEXT | `to_cal` (→ Cal.com), `from_cal` (← Cal.com), `both` | `to_cal` |

### 4.2. Status_Sheet kolonnas

| Kolonna | Tips | Apraksts |
|---------|------|----------|
| `reservation_id` | TEXT | Saite uz Main_Sheet |
| `status` | TEXT | `pending`, `approved`, `rejected` |
| `reviewer` | TEXT | Kurš apstiprināja |
| `reviewed_at` | DATETIME | Kad apstiprināts |
| `reason` | TEXT | Noraidījuma vai apstiprinājuma iemesls |

---

## 5. Cal.com API v2 galvenie endpointi

### 5.1. Rezervāciju izveide

```
POST https://api.cal.com/v2/bookings
Headers:
  Authorization: Bearer <CAL_API_KEY>
  cal-api-version: 2026-05-01
  Content-Type: application/json

Body:
{
  "eventTypeId": <event_type_id>,
  "start": "2026-07-10T14:00:00.000Z",
  "attendee": {
    "name": "Jānis Bērziņš",
    "email": "janis@example.com",
    "timeZone": "Europe/Riga",
    "phoneNumber": "+37112345678"
  },
  "language": "en",
  "metadata": {
    "source": "n8n_dashboard",
    "reservation_id": "<google_sheets_id>"
  }
}
```

### 5.2. Rezervāciju saraksta iegūšana

```
GET https://api.cal.com/v2/bookings?status=upcoming
Headers:
  Authorization: Bearer <CAL_API_KEY>
  cal-api-version: 2026-05-01
```

Atbalsta `status` filtru: `upcoming`, `past`, `cancelled`, `all`. Ja filtrs nav norādīts, atgriež visus statusus. [web:3]

### 5.3. Webhook — booking.created

Cal.com atbalsta webhook notikumus, tostarp `booking.created`, `booking.cancelled`, `booking.rescheduled`. [web:16]

Webhook tiek konfigurēts Cal.com dashboard vai caur API:

```
POST https://api.cal.com/v2/webhooks
Body:
{
  "subscriberUrl": "https://<n8n-webhook-url>/webhook/cal-com-sync",
  "triggerEvent": "booking.created"
}
```

### 5.4. Authentication

Cal.com API v2 izmanto Bearer token authentication. API atslēga tiek iegūta no Cal.com Dashboard → Settings → API. [web:5]

---

## 6. n8n Workflow loģika

### 6.1. Workflow #1 — Ienākošo rezervāciju apstrāde (→ Cal.com)

```
[Trigger: Email/WhatsApp/Manual]
    ↓
[Code Node: Python — Normalize & Validate]
    - Validē obligātos laukus (name, email, start_time)
    - Normalizē telefona numuru uz E.164
    - Ģenerē reservation_id (UUID)
    ↓
[Google Sheets: Append Row → Main_Sheet]
    - Ieraksta ar status = "pending"
    ↓
[IF Node: Requires human approval?]
    ├── YES → [Google Sheets: Append → Status_Sheet] → [End: wait for approval]
    └── NO  → [Set status = "confirmed"]
                ↓
[HTTP Request: POST /v2/bookings → Cal.com API]
    ↓
[Google Sheets: Update Row → Main_Sheet]
    - Atjaunina cal_booking_uid un status = "confirmed"
    - sync_direction = "to_cal"
```

### 6.2. Workflow #2 — Cal.com → Google Sheets (sinhronizācija)

```
[Trigger: Cal.com Webhook — booking.created]
    ↓
[Code Node: Map Cal.com payload → Google Sheets columns]
    ↓
[Google Sheets: Lookup Row by cal_booking_uid]
    ├── EXISTS → [Update Row → Main_Sheet] (sync_direction = "from_cal")
    └── NOT FOUND → [Append Row → Main_Sheet] (sync_direction = "from_cal")
```

### 6.3. Workflow #3 — Status apstiprinājuma reversā sinhronizācija

```
[Trigger: Google Sheets — Status_Sheet row updated]
    ↓
[IF Node: status == "approved"?]
    ├── YES → [HTTP Request: POST /v2/bookings → Cal.com]
    │         ↓
    │         [Google Sheets: Update Main_Sheet status = "confirmed"]
    └── NO → [Google Sheets: Update Main_Sheet status = "rejected"]
              ↓
              [HTTP Request: DELETE/Cancel booking → Cal.com (ja jau eksistē)]
```

### 6.4. Workflow #4 — Periodiskā pilna sinhronizācija (Cron)

```
[Trigger: Cron — ik pēc 15 minūtēm]
    ↓
[HTTP Request: GET /v2/bookings → Cal.com API]
    ↓
[Code Node: Python — Diff Cal.com vs Google Sheets]
    - Identificē jaunas rezervācijas Cal.com (kas nav Google Sheets)
    - Identificē atceltās rezervācijas
    ↓
[Google Sheets: Batch Append/Update → Main_Sheet]
```

---

## 7. Datu plūsma abos virzienos

### 7.1. Uz Cal.com (to_cal)

```
Dashboard / Email / WhatsApp
    ↓
n8n: Normalize → Validate
    ↓
Google Sheets: Main_Sheet (append, status=pending)
    ↓
n8n: IF approval needed → Status_Sheet
    ↓ (approved)
n8n: HTTP POST /v2/bookings → Cal.com
    ↓
Google Sheets: Update (cal_booking_uid, status=confirmed)
```

### 7.2. No Cal.com (from_cal)

```
Cal.com Webhook (booking.created/cancelled/rescheduled)
    ↓
n8n: Map payload → Sheets columns
    ↓
Google Sheets: Lookup by cal_booking_uid
    ├── Found → Update row
    └── Not found → Append new row
    ↓
Dashboard UI: atspoguļojas automātiski (AppSheet/Glide refresh)
```

### 7.3. Bidirectional conflict resolution

| Scenārijs | Risinājums |
|-----------|-----------|
| Rezervācija eksistē abās pusēs ar atšķirīgiem datiem | Cal.com ir primārais avots; Google Sheets tiek atjaunināts |
| Rezervācija Google Sheets, bet ne Cal.com | n8n nosūta uz Cal.com (POST /v2/bookings) |
| Rezervācija Cal.com, bet ne Google Sheets | n8n pievieno Google Sheets (from_cal) |
| Rezervācija atcelta vienā pusē | Webhook/cron sinhronizē statusu abās pusēs |

---

## 8. Drošība un API atslēgas

### 8.1. Kal.com API atslēga

- Glabāt n8n **Credentials** sekcijā (Header Auth: `Authorization: Bearer <key>`)
- Nekad nehardkodēt workflow JSON
- Izmantot n8n **environment variables** self-hosted režīmā

### 8.2. Google Sheets autentifikācija

- OAuth2 caur n8n Google Sheets credential
- Service Account ar dalītu piekļuvi tikai nepieciešamajiem sheet

### 8.3. WhatsApp Business API

- Meta Access Token glabāt n8n Credentials
- Webhook verification token jābūt unikālam

### 8.4. Webhook drošība

- Cal.com webhook URL jābūt HTTPS
- Pievienot webhook signature verifikāciju (ja pieejama)
- n8n webhook endpoint jāaizsargā ar Basic Auth vai API key header

---

## 9. Izvietošana (Deployment)

### 9.1. n8n self-hosted (Docker)

```yaml
# docker-compose.yml
version: "3.8"
services:
  n8n:
    image: n8nio/n8n:latest
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=<strong_password>
      - GENERIC_TIMEZONE=Europe/Riga
      - CAL_API_KEY=${CAL_API_KEY}
    volumes:
      - n8n_data:/home/node/.n8n
    restart: unless-stopped

volumes:
  n8n_data:
```

### 9.2. Environment variables

```bash
# .env
CAL_API_KEY=cal_xxxxxxxxxxxxxxxx
CAL_API_VERSION=2026-05-01
CAL_API_BASE_URL=https://api.cal.com/v2
GOOGLE_SHEETS_ID=1abc...xyz
WHATSAPP_TOKEN=EAAG...
N8N_WEBHOOK_BASE_URL=https://n8n.yourdomain.com
```

### 9.3. Checklist pirms palaišanas

- [ ] Cal.com event types izveidoti (SPA pakalpojumi)
- [ ] Cal.com API atslēga iegūta un ievadīta n8n Credentials
- [ ] Google Sheets izveidots ar Main_Sheet un Status_Sheet tabulām
- [ ] Google Sheets OAuth2 savienojums n8n
- [ ] Cal.com webhook reģistrēts uz n8n webhook URL
- [ ] WhatsApp Business API webhook konfigurēts
- [ ] Testēta e-pasta parsēšana un Cal.com booking izveide
- [ ] Cron workflow aktivizēts (ik 15 min)
- [ ] Dashboard UI (AppSheet/Glide) savienots ar Google Sheets

---

## 10. n8n Workflow JSON izveides prompts

Nokopē šo promptu un ievieto to LLM (Claude, GPT-4, Perplexity), lai ģenerētu pilnu n8n workflow JSON:

---

### PROMPT: n8n Workflow JSON ģenerēšana

```
Tu esi n8n workflow eksperts. Izveido pilnīgu n8n workflow JSON failu sekojošajai
rezervāciju sistēmai. Izmanto n8n JSON formātu (version 2.0+), kas ir importējams
caur n8n > Import from File.

KONTEKSTS:
- Platforma: n8n (self-hosted Docker)
- Galvenais mērķis: rezervāciju dashboard ar Cal.com API v2 integrāciju
- Google Sheets darbojas kā starpnieks starp n8n un Cal.com API

PRASĪBAS — izveido 4 atsevišķus workflow JSON failus:

═══════════════════════════════════════════════════════════════════
WORKFLOW 1: "Incoming Reservations → Cal.com"
═══════════════════════════════════════════════════════════════════

Trigger nodes (3 paralēli ieejas punkti):
1. Webhook node (POST /webhook/email-reservation)
   - Uztver JSON: { name, email, phone, service_type, preferred_date }
2. Webhook node (POST /webhook/whatsapp-reservation)
   - Uztver WhatsApp Business API payload
   - Code node izvelk tekstu un parsē rezervācijas datus
3. Google Sheets Trigger node (row added to Main_Sheet where source=manual)
   - Trigger: row_added
   - Sheet: Main_Sheet

Pēc triggeriem visi plūst uz:

Code node (Python):
- Funkcija: normalize_reservation(input_data)
- Validācija: name (required), email (required), start_time (required)
- Telefona normalizācija uz E.164
- Ģenerē reservation_id = str(uuid4())
- Atgriež JSON ar visiem Main_Sheet laukiem

Google Sheets node (Append):
- Operation: append
- Sheet: Main_Sheet
- Mapping: visi lauki no Code node output
- status = "pending"
- sync_direction = "to_cal"

IF node:
- Condition: service_type IN ["simple", "known"] → auto-confirm
- True branch:
  - HTTP Request node:
    - Method: POST
    - URL: https://api.cal.com/v2/bookings
    - Headers:
      Authorization: Bearer {{$env.CAL_API_KEY}}
      cal-api-version: 2026-05-01
      Content-Type: application/json
    - Body (JSON):
      {
        "eventTypeId": {{$json.event_type_id}},
        "start": "{{$json.start_time}}",
        "attendee": {
          "name": "{{$json.client_name}}",
          "email": "{{$json.client_email}}",
          "timeZone": "{{$json.timezone}}",
          "phoneNumber": "{{$json.client_phone}}"
        },
        "metadata": {
          "source": "n8n",
          "reservation_id": "{{$json.reservation_id}}"
        }
      }
  - Google Sheets node (Update):
    - Operation: update
    - Sheet: Main_Sheet
    - Update columns: cal_booking_uid, status="confirmed", updated_at=now()
- False branch:
  - Google Sheets node (Append):
    - Sheet: Status_Sheet
    - status = "pending"
  - End (wait for human approval)

═══════════════════════════════════════════════════════════════════
WORKFLOW 2: "Cal.com Webhook → Google Sheets"
═══════════════════════════════════════════════════════════════════

Webhook node:
- POST /webhook/cal-com-sync
- Uztver Cal.com webhook payload (booking.created, booking.cancelled)

Code node (Python):
- Funkcija: map_calcom_to_sheets(payload)
- Izvelk: booking.uid, booking.startTime, booking.endTime,
  booking.attendees[0].name, email, phone
- Atgriež Google Sheets kolonnu formātā

Google Sheets node (Lookup):
- Operation: lookup
- Sheet: Main_Sheet
- Lookup column: cal_booking_uid
- Value: {{$json.booking_uid}}

Switch node (based on lookup result):
- Found: Google Sheets Update → Main_Sheet (sync_direction = "from_cal")
- Not found: Google Sheets Append → Main_Sheet (sync_direction = "from_cal")

═══════════════════════════════════════════════════════════════════
WORKFLOW 3: "Approval Status Sync"
═══════════════════════════════════════════════════════════════════

Google Sheets Trigger:
- Sheet: Status_Sheet
- Event: row_updated

IF node:
- Condition: status == "approved"

True branch:
- Google Sheets node (Lookup Main_Sheet by reservation_id)
- HTTP Request node:
  - Method: POST
  - URL: https://api.cal.com/v2/bookings
  - (Same body as Workflow 1)
- Google Sheets node (Update Main_Sheet: status="confirmed", cal_booking_uid)

False branch (rejected):
- Google Sheets node (Update Main_Sheet: status="rejected")
- HTTP Request node:
  - Method: DELETE (cancel booking in Cal.com if exists)
  - URL: https://api.cal.com/v2/bookings/{{$json.cal_booking_uid}}

═══════════════════════════════════════════════════════════════════
WORKFLOW 4: "Cron Sync — Full Reconciliation"
═══════════════════════════════════════════════════════════════════

Cron trigger:
- Schedule: every 15 minutes

HTTP Request node:
- Method: GET
- URL: https://api.cal.com/v2/bookings?status=all
- Headers:
  Authorization: Bearer {{$env.CAL_API_KEY}}
  cal-api-version: 2026-05-01

Google Sheets node (Read):
- Operation: read
- Sheet: Main_Sheet
- Return all rows

Code node (Python):
- Funkcija: diff_calcom_vs_sheets(calcom_bookings, sheets_rows)
- Compare by cal_booking_uid
- Output: { to_add: [...], to_update: [...], to_cancel: [...] }

Loop node (for to_add):
- Google Sheets Append → Main_Sheet

Loop node (for to_update):
- Google Sheets Update → Main_Sheet

═══════════════════════════════════════════════════════════════════

OUTPUT FORMAT:
═══════════════════════════════════════════════════════════════════

Katram workflow atgriez atsevišķu JSON objektu šādā struktūrā:

{
  "name": "Workflow Name",
  "nodes": [...],
  "connections": {...},
  "settings": {
    "executionOrder": "v1"
  },
  "active": false,
  "version": 2
}

Katram node iekļauj:
- "type" (piem., "n8n-nodes-base.webhook")
- "typeVersion" (latest stable)
- "position" ([x, y] koordinātes)
- "parameters" ar visiem nepieciešamajiem laukiem
- "credentials" ar atsaucēm uz iepriekš definētām n8n credentials
  (Google Sheets OAuth2, Cal.com Header Auth)

Pieņēmumi:
- Cal.com API base URL: https://api.cal.com/v2
- Cal.com API versijas header: 2026-05-01
- Google Sheets ID: {{$env.GOOGLE_SHEETS_ID}}
- Webhook base URL: {{$env.N8N_WEBHOOK_BASE_URL}}
- Visas API atslēgas izmanto n8n environment variables

Lūdzu izvadi kā 4 atsevišķus JSON blokus ar atbilstošiem nosaukumiem:
1. workflow1_incoming_to_cal.json
2. workflow2_calcom_to_sheets.json
3. workflow3_approval_sync.json
4. workflow4_cron_reconciliation.json
```

---

## 11. Uzturēšana un paplašināšana

### 11.1. Pievienošana

- Papildu Cal.com event types (piem., SPA pakalpojumi, restorāna rezervācijas)
- Papildu trigger avoti (piem., Telegram bot, web form)
- SMS paziņojumi klientiem (caur Twilio n8n node)
- PDF rezervācijas apstiprinājums (PDF.co vai n8n HTML → PDF)

### 11.2. Uzturēšanas lomas

| Loma | Atbildība |
|------|-----------|
| Operatīvais procesa īpašnieks | Status_Sheet apstiprinājumi, noteikumu definēšana |
| Tehniskais uzturētājs | n8n workflow, Python Code nodes, API savienojumi |
| Dashboard lietotājs | Main_Sheet ievade, rezervāciju pārvaldība |

### 11.3. Monitoring

- n8n execution history → neveiksmīgie izpildes gadījumi
- Google Sheets → conditional formatting status laukam (sarkans = pending > 24h)
- Cal.com dashboard → booking apstiprinājumu atbilstība
- Cron workflow logs → sinhronizācijas kļūdas

---

## 📄 License

Šis projekts ir daļa no BDA studiju uzdevuma. Pielāgo brīvi mācību vajadzībām.

---

> **Piezīme:** Visi Cal.com API endpointi un lauki ir balstīti uz Cal.com API v2 dokumentāciju. [web:2][web:3][web:10][web:16] Pirms produkcijas ieviešanas pārbaudiet jaunāko API versiju un izmaiņas Cal.com changelog.
