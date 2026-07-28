---
name: data-assignment-generator
description: Generates practical data architecture and data flow assignments in Latvian, including Mermaid diagrams, AI prompts, and PDF conversion.
---

# Data Assignment Generator Skill

## Context
Use this skill when the user provides an assignment or task related to data process evaluation, data flows, storage options, SQL logic, or general data architecture.

## Workflow
1. **Language:** Write the entire document and all communication in the requested language (which may be Latvian or another specified language).
2. **Analysis & Recommendations:** 
   - Keep recommendations realistic, practical, and proportionate to the data volume. 
   - Avoid over-engineering (e.g., do not suggest Data Lakes or complex cloud platforms for small processes).
   - Focus on clear business logic and avoid unnecessary technical jargon.
3. **Structure & Formatting:**
   - Follow the user's specific step-by-step instructions for the document.
   - Write the output as a Markdown artifact in the `.gemini/antigravity/brain/` directory.
4. **Visuals & AI Prompts:**
   - ALWAYS include at least one **Mermaid diagram** (`mermaid` code block) visualizing the data flow, stack, or architecture.
   - ALWAYS include an **AI prompt** in a blockquote (e.g., `> **💡 Prompts shēmas pilnveidošanai:** "..."`) immediately following the diagram. The prompt should describe the diagram so the user can generate a better version in tools like ChatGPT, Gemini, or Perplexity.
5. **PDF Generation (CRITICAL):**
   - After creating the Markdown artifact, you MUST convert it to a PDF document.
   - Use the `run_command` tool to execute: `npx -y md-to-pdf "C:\Users\melvi\.gemini\antigravity\brain\<conversation-id>\<filename>.md"` in the background.
   - Inform the user that the Markdown file is ready for preview while the PDF is generating in the background.
