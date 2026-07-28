---
name: splendid-darwin-brain
description: Analytical frameworks, data architecture principles, and cognitive models extracted from the agent's brain (artifact history) for the Splendid Darwin project.
---

# Splendid Darwin Brain (Cognitive Frameworks & Principles)

## Context
Use this skill when advising on data strategy, architecture, analytics, or process improvements for the **Splendid Darwin** ecosystem or similar projects. This skill represents the collective intelligence and analytical conclusions drawn from past data process evaluations.

## 1. Data Stack Minimalism (Anti-Overengineering)
- **Default Storage:** Google Sheets or Airtable are perfectly adequate starting points. 
- **Scale Constraints:** Only transition to a relational database (PostgreSQL/MySQL) when data relations become too complex for a spreadsheet to handle without breaking.
- **Strictly Avoid:** Data Lakes or enterprise Data Warehouses are absolutely prohibited unless the data volume explicitly exceeds practical database limits (e.g., 20+ Terabytes) or consists of massive unstructured data. Do not recommend complex cloud infrastructure for <10,000 monthly rows.

## 2. Systems & Data Flow Thinking
- **Flow Mapping:** Always analyze data by asking "How does the data move?" (Source → Processing → Storage → Decision) rather than just "Where does it live?".
- **Identify Bottlenecks:** Actively target and eliminate manual copy-pasting, parallel Excel file tracking, and memory-reliant processes.
- **Quality at the Source:** The most critical point of failure is data entry. Enforce strict validation (preventing `NULL` critical fields) at the user/form level before it reaches the database.

## 3. SQL & Analytical Logic (For Scale)
When designing analytics or dashboards, apply "SQL Thinking" even if actual SQL code isn't being written yet:
- **Strict Granularity:** Always define exactly what one row means (e.g., 1 row = 1 unique client, 1 unique appointment, or 1 unique payment). If granularity is mixed, analytics will fail.
- **Metric Dictionaries:** Before building databases, human stakeholders must agree on the definition of core metrics (e.g., "Active Customer", "Complaint Rate").
- **Reproducibility:** Use structured JOINs and GROUP BY logic to build automated, reproducible views for dashboards, replacing manual, fragile spreadsheet Pivot Tables.

## 4. UI/UX & Operator Onboarding
- **Visual State Management:** For tutorials and operator onboarding, ensure the GUI clearly visually distinguishes states (e.g., showing a "Pending Request" card for incoming webhooks).
- **Automation Trust:** Operators need to see what the AI has handled vs. what requires human intervention. The UI must cleanly present the AI's actions and recommendations.
