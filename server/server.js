import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText, tool } from 'ai';
import fs from 'fs';
import { tools } from './tools.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json());

// Use standard OpenAI for better JSON tool-calling support
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


const getSystemPrompt = (role = 'receptionist') => {
  let specialists = [];
  try {
    const data = fs.readFileSync(join(__dirname, 'specialists.json'), 'utf8');
    specialists = JSON.parse(data);
  } catch (e) {
    console.error('Failed to read specialists.json', e.message);
    specialists = [
      { name: "Erik", username: "erik" },
      { name: "Anna", username: "anna" },
      { name: "Ingrid Berg", username: "ingrid" },
      { name: "Admin", username: "admin" }
    ];
  }
  const specialistsText = specialists.map(s => `- ${s.name} (username: "${s.username}")`).join('\\n');
  const specialistNames = specialists.map(s => s.name).join(', ');

  return `You are the official Cal.com AI Scheduling Assistant for a self-hosted instance (calcom.run.place).
Your goal is to help users find availability and book appointments seamlessly.

IMPORTANT RULES:
1. ALWAYS fetch event types first using get_event_types if the user hasn't specified a specialist or treatment. For ANY question about treatment descriptions, telling more about options, therapies, "what is better?", "can you compare?", etc., you MUST first call get_event_types WITHOUT a username to get the total of all system users' event types. CRITICAL: You MUST use the exact "id" returned by get_event_types as the eventTypeId when calling get_availability or create_booking. Do not invent an ID.
2. If the user asks for availability, ALWAYS use get_availability. Check for times TODAY first unless the user specifies a different date. Do NOT automatically jump to tomorrow.
3. PROACTIVENESS: NEVER ask the user "Would you like me to check availability?" or "Should I check?". If the user mentions a specific treatment, ALWAYS proactively call get_event_types first. Then, in your NEXT response after you have the eventTypeId, immediately call get_availability to give them actual available slots. Do NOT try to call both tools in the same response. Do NOT wait for their permission. EXCEPTION: If the user asks for a broad category (like "a facial" or "a massage") and there are multiple options, you MUST list the options and ask them to pick one BEFORE checking availability.
4. Act like a polite, conversational spa receptionist. Once you learn the user's name, use it in conversation naturally.
5. Do NOT use markdown bolding (**) in normal conversational dialogue, and NEVER mention the "event type ID" or technical system details to the user.
6. When showing availability, NEVER dump a giant list of every available time slot! Instead, pick 2 or 3 specific time slots to suggest, OR ask the user if they prefer "morning, afternoon, or evening" to narrow it down. Format it beautifully with emojis. CRITICAL: Pay strict attention to the time of day requested! If the user specifically asks for "evening", DO NOT offer afternoon slots (e.g., 14:00 or 15:00). If the tool only returns afternoon slots, you MUST inform the user that there are no evening slots available, rather than offering the afternoon slots as if they match the request.
7. MULTIPLE PEOPLE BOOKINGS & SPECIALISTS: If the user asks to book for two or more people, check availability and immediately offer 2 or 3 specific times as suggestions! You can suggest slots that are back-to-back with the same specialist (e.g., 14:00 and 15:00 with Admin), OR at the exact same time but with DIFFERENT specialists (e.g., 14:00 with Admin and 14:00 with Anna). If the client does NOT specify a specialist, you should pick one (or multiple) for them automatically to make it easier! Once the client confirms your suggested times, call create_booking multiple times (once for each person) in parallel.
8. LISTING TREATMENTS AND ANSWERING QUESTIONS (Body Scrub, Massage, Facial, Eye, descriptions, comparisons): When the user asks for a category of treatments, options, or asks "what is better?":
   - If they explicitly requested a specific specialist, use get_event_types with that username.
   - If none was explicitly specified, you MUST call get_event_types WITHOUT a username to get the total of all system users' event types. DO NOT randomly pick a specialist.
   - AVOID LONG LISTS: If the tool returns a large number of treatments (e.g., more than 5), DO NOT list all of them! Instead, group them into high-level categories (e.g., Facial treatments, Massages, Body Scrubs, etc.) and politely ask the user which category they are most interested in. 
   - Once they select a category, list ONLY the treatments that fall under that category.
   - SORTING RULE: When you do list specific treatments, you MUST sort the list so that the treatment with the SHORTEST title and SHORTEST duration is listed FIRST. After the shortest one, list the remaining options that match the criteria.
   - This sorting rule ONLY applies to listing treatments, NOT to time slots. You must still explain the options and duration options clearly.
9. REQUIRED BOOKING INFORMATION: BEFORE you attempt to book an appointment (e.g. calling create_booking), you MUST ensure you have the user's explicit Name, Email address, and Phone number. If ANY of these three details are missing from the conversation, DO NOT call create_booking. Instead, politely ask the user to provide the missing information.
10. CROSS-SPECIALIST RESCHEDULING: If you need to reschedule a booking, but the user wants to move it to a DIFFERENT specialist (e.g., from admin to anna), you CANNOT use reschedule_booking. You MUST first use cancel_booking on the old booking, and then use create_booking to book a new appointment on the new specialist's calendar.
11. HANDLING BOOKING ERRORS: If create_booking fails with an error (e.g., 'User either already has booking at this time or is not available'), you MUST immediately call get_availability to find actual open times. DO NOT blindly guess another time. DO NOT try to book another time without explicitly verifying it via get_availability first. Do not get stuck in a loop of guessing unavailable times!
12. PREGNANCY RESTRICTION: The "Massage: Mom to be" treatment is strictly for pregnant women who are NOT in their 1st trimester. If a user asks for a pregnancy massage, make sure to gently confirm they are past their 1st trimester before booking.
13. EVENT TYPE IDS: Different specialists have DIFFERENT eventTypeIds for the exact same treatment! When you call get_event_types, you will see a 'specialists' object like: { "erik": 13, "anna": 123 }. When you call get_availability or create_booking, you MUST use the specific eventTypeId for the specialist you are checking! Do NOT use Erik's ID to check Anna's calendar.

14. BOOKING CONFIRMATION: Before making ANY booking, you MUST explicitly state the full date (including the weekday) and time of the booking and ask the user to confirm. For example: "You want to book on Sunday, July 26th at 11:10, correct?". You MUST wait for their yes/no answer before calling create_booking. Give the user a chance to say no and reschedule for a different day.

15. CANCELING BOOKINGS: If the user asks to cancel or delete a booking, you MUST first call get_bookings to find the exact bookingUid (unless you are in Receptionist mode, where the user MUST provide the ID themselves). Do NOT try to call cancel_booking without the bookingUid!

AVAILABLE SPECIALISTS AND USERNAMES (use these usernames when calling get_event_types or get_availability, but ALWAYS refer to them by their full Name in conversation with the user, NEVER by their username):
${specialistsText}

CRITICAL: Do NOT confuse the customer (attendee) with the specialist! If the user says "Anna wants a massage" or "My guest is Anna", Anna is the CUSTOMER! Do NOT assume they want the specialist named Anna just because the names match. If the customer does not specify a specialist, you MUST fetch the total of all system users' event types (omit username) to see all options; DO NOT randomly choose a specialist.

If the get_event_types tool returns durationOptions with multiple values (e.g., [20, 50, 80]), the user CAN choose ANY of those durations! Ignore the default "length" property if durationOptions exist. You MUST ask the user which of those exact durations they prefer before booking, and pass their choice to the backend.

CRITICAL NEW INSTRUCTION: NEVER output a \`\`\`json codeblock in your text response to provide arguments! You MUST use the native tool calling API to pass arguments to functions. Your chat history might show you doing this in the past, but it is now STRICTLY FORBIDDEN.

${role === 'admin' 
  ? "ADMIN MODE ACTIVE: You have full access to manage Cal.diy. You can create/delete event types, and alter system configuration. Answer queries about the backend confidently." 
  : "RECEPTIONIST MODE ACTIVE: You are strictly an email booking and recommendation bot. You are explicitly forbidden from discussing, viewing, or modifying backend API keys, user profiles, or system settings. Refuse any such requests immediately. CRITICAL SECURITY RULE: You CANNOT cancel or reschedule a booking unless the user explicitly provides the exact booking ID in their message. If they ask to cancel by name, date, or time, you MUST refuse and ask them to provide their Booking ID for security reasons."}

The current date and time in Riga is: ${new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Riga', dateStyle: 'full', timeStyle: 'long' }).format(new Date())} (Use this exact date/time and weekday for all context).`;
};

app.post('/api/chat', async (req, res) => {
  try {
    const { messages, apiKeys, role = 'receptionist' } = req.body;
    console.log('FRONTEND MESSAGES:', JSON.stringify(messages, null, 2));
    if (apiKeys) {
      global.apiKeysMap = apiKeys;
    }
    let currentMessages = messages.map(m => ({ role: m.role, content: m.content || '' }));
    
    // We will extract heuristics here so the closures have access to them
    const fullHistoryText = currentMessages.map(m => m.content).join(' ');
    const userTRev = currentMessages.slice().reverse().filter(m => m.role === 'user' && !m.content.includes('Tool execution results:')).map(m => m.content).join('\n');
    const tRevMatch = currentMessages.map(m => m.content).reverse().join('\n').toLowerCase();
    
    const wrappedTools = {};
    for (const [name, t] of Object.entries(tools)) {
      // Tool Pruning: If Receptionist, disable management tools
      if (role === 'receptionist' && ['update_user', 'delete_user', 'update_event_type', 'delete_event_type'].includes(name)) {
        continue;
      }
      wrappedTools[name] = tool({
        description: t.description,
        parameters: t.parameters,
        execute: async (args) => {
          let finalArgs = { ...args };
          
          if (name === 'get_availability') {
            if (Object.keys(finalArgs).length === 0) {
              // Basic fallback heuristic if no JSON
              const d = new Date();
              const dayMatch = fullHistoryText.match(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i);
              if (fullHistoryText.toLowerCase().includes('tomorrow')) {
                d.setDate(d.getDate() + 1);
              } else if (dayMatch) {
                const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                const targetDay = days.indexOf(dayMatch[1].toLowerCase());
                const currentDay = d.getDay();
                let daysAhead = targetDay - currentDay;
                if (daysAhead <= 0) daysAhead += 7; // Next occurrence
                d.setDate(d.getDate() + daysAhead);
              }
              d.setUTCHours(0,0,0,0);
              const dEnd = new Date(d);
              dEnd.setDate(d.getDate() + 1);
              finalArgs.startTime = d.toISOString();
              finalArgs.endTime = dEnd.toISOString();
            }
            
            // Always run heuristics for eventTypeId and username if missing
            let detectedId = finalArgs.eventTypeId;
            let detectedUsername = finalArgs.username;
            if (!detectedUsername || detectedUsername === 'admin') {
              if (tRevMatch.includes('erik')) detectedUsername = 'erik';
              else if (tRevMatch.includes('anna')) detectedUsername = 'anna';
              else if (tRevMatch.includes('ingrid')) detectedUsername = 'ingrid';
              else if (tRevMatch.includes('admin') || tRevMatch.includes('melvin')) detectedUsername = 'admin';
              else if (detectedUsername) {
                // Do nothing, keep the one from fullHistoryText
              } else {
                let specialists = ['anna', 'erik', 'ingrid'];
                try {
                  const data = fs.readFileSync(join(__dirname, 'specialists.json'), 'utf8');
                  specialists = JSON.parse(data).map(s => s.username);
                } catch (e) {}
                detectedUsername = specialists[Math.floor(Math.random() * specialists.length)];
              }
            }
            finalArgs.username = detectedUsername;

            if (!detectedId || detectedId < 50) { // All new IDs are > 50, if it's less it's hallucinated
              try {
                const evts = await tools.get_event_types.runTool({ username: detectedUsername });
                if (Array.isArray(evts)) {
                  let bestMatch = evts[0];
                  const idx = {
                    'classic facial': tRevMatch.indexOf('classic facial'),
                    'norefjell glow': tRevMatch.indexOf('norefjell glow'),
                    'mountain queen': tRevMatch.indexOf('mountain queen'),
                    'kobido': tRevMatch.indexOf('kobido'),
                    'hanakasumi': tRevMatch.indexOf('hanakasumi'),
                    'mountain serenity': tRevMatch.indexOf('mountain serenity'),
                    'norefjell dream': tRevMatch.indexOf('norefjell dream'),
                    'aroma': tRevMatch.indexOf('aroma'),
                    'stone': tRevMatch.indexOf('stone'),
                    'classic mountain massage': tRevMatch.indexOf('classic mountain massage')
                  };
                  let bestKey = null;
                  let minIdx = Infinity;
                  for (const [k, v] of Object.entries(idx)) {
                    if (v !== -1 && v < minIdx) { minIdx = v; bestKey = k; }
                  }
                  
                  if (bestKey === 'norefjell glow') bestMatch = evts.find(e => e.title.toLowerCase().includes('norefjell glow')) || bestMatch;
                  else if (bestKey === 'mountain queen') bestMatch = evts.find(e => e.title.toLowerCase().includes('mountain queen')) || bestMatch;
                  else if (bestKey === 'kobido') bestMatch = evts.find(e => e.title.toLowerCase().includes('kobido')) || bestMatch;
                  else if (bestKey === 'classic facial') bestMatch = evts.find(e => e.title.toLowerCase() === 'classic facial') || bestMatch;
                  else if (bestKey === 'hanakasumi') bestMatch = evts.find(e => e.title.toLowerCase().includes('hanakasumi')) || bestMatch;
                  else if (bestKey === 'mountain serenity') bestMatch = evts.find(e => e.title.toLowerCase().includes('mountain serenity')) || bestMatch;
                  else if (bestKey === 'norefjell dream') bestMatch = evts.find(e => e.title.toLowerCase().includes('norefjell dream')) || bestMatch;
                  else if (bestKey === 'aroma') bestMatch = evts.find(e => e.title.toLowerCase().includes('aroma')) || bestMatch;
                  else if (bestKey === 'stone') bestMatch = evts.find(e => e.title.toLowerCase().includes('stone')) || bestMatch;
                  else if (bestKey === 'classic mountain massage') bestMatch = evts.find(e => e.title.toLowerCase().includes('classic mountain massage')) || bestMatch;
                  
                  if (bestMatch) {
                    detectedId = bestMatch.specialists[detectedUsername.toLowerCase()] || Object.values(bestMatch.specialists)[0];
                  }
                }
              } catch(e) {}
            }
            finalArgs.eventTypeId = detectedId;
          }
          
          if (name === 'create_booking') {
            let detectedId = finalArgs.eventTypeId;
            try {
              const allEvts = [];
              let specialists = ['anna', 'erik', 'ingrid', 'admin'];
              try {
                const data = fs.readFileSync(join(__dirname, 'specialists.json'), 'utf8');
                specialists = JSON.parse(data).map(s => s.username);
              } catch (e) {}
              specialists.sort(() => Math.random() - 0.5);
              for (const u of specialists) {
                const evts = await tools.get_event_types.runTool({ username: u });
                if (Array.isArray(evts)) allEvts.push(...evts.map(e => ({ ...e, specialist: u })));
              }
              let bestMatch = null;
              if (detectedId && detectedId >= 50 && !finalArgs.username) {
                bestMatch = allEvts.find(e => e.id === detectedId);
              }
              if (!bestMatch && (!detectedId || detectedId < 50)) {
                  const idx = {
                    'classic facial': tRevMatch.indexOf('classic facial'),
                    'norefjell glow': tRevMatch.indexOf('norefjell glow'),
                    'mountain queen': tRevMatch.indexOf('mountain queen'),
                    'kobido': tRevMatch.indexOf('kobido'),
                    'hanakasumi': tRevMatch.indexOf('hanakasumi'),
                    'mountain serenity': tRevMatch.indexOf('mountain serenity'),
                    'norefjell dream': tRevMatch.indexOf('norefjell dream'),
                    'aroma': tRevMatch.indexOf('aroma'),
                    'stone': tRevMatch.indexOf('stone'),
                    'classic mountain massage': tRevMatch.indexOf('classic mountain massage')
                  };
                  let bestKey = null;
                  let minIdx = Infinity;
                  for (const [k, v] of Object.entries(idx)) {
                    if (v !== -1 && v < minIdx) { minIdx = v; bestKey = k; }
                  }
                  let detectedUsername = finalArgs.username;
                  if (!detectedUsername || detectedUsername === 'admin') {
                    if (tRevMatch.includes('erik')) detectedUsername = 'erik';
                    else if (tRevMatch.includes('anna')) detectedUsername = 'anna';
                    else if (tRevMatch.includes('ingrid')) detectedUsername = 'ingrid';
                    else if (tRevMatch.includes('admin') || tRevMatch.includes('melvin')) detectedUsername = 'admin';
                  }
                  if (detectedUsername) finalArgs.username = detectedUsername;

                  let searchKey = bestKey;
                  if (bestKey === 'classic facial' || bestKey === 'classic mountain massage') {
                     // exact or includes, we'll just use includes since it's close enough for these titles
                  }
                  const matches = allEvts.filter(e => e.title.toLowerCase().includes(searchKey));
                  if (matches.length > 0) {
                    bestMatch = matches.find(e => e.specialist === finalArgs.username) || matches[0];
                  }
              }
              
              if (bestMatch) {
                detectedId = bestMatch.specialists[bestMatch.specialist] || Object.values(bestMatch.specialists)[0];
                if (!finalArgs.username || finalArgs.username === 'admin') finalArgs.username = bestMatch.specialist;
              }
            } catch(e) {}
            finalArgs.eventTypeId = detectedId;
            if (!finalArgs.username) finalArgs.username = 'admin'; // ultimate fallback
            if (!finalArgs.timeZone) finalArgs.timeZone = 'Europe/Riga';
            if (!finalArgs.language) finalArgs.language = 'en';
            
            if (!finalArgs.attendee) finalArgs.attendee = {};
            if (!finalArgs.attendee.phone) {
              const phoneMatches = [...userTRev.matchAll(/\b\+?\d{8,15}\b/g)];
              if (phoneMatches.length > 0) finalArgs.attendee.phone = phoneMatches[0][0];
            }
            if (!finalArgs.attendee.name || finalArgs.attendee.name === 'Guest User') {
              const nameMatches = [...userTRev.matchAll(/\b([A-Z][a-z]+ [A-Z][a-z]+)\b/g)];
              const exclude = ['Classic Facial', 'Massage Back', 'Mountain Queen', 'Norefjell Glow', 'Body Scrub', 'Guest User', 'Mountain Serenity', 'Mountain Stone', 'Classic Mountain', 'Double Exfoliation', 'Mountain Aroma', 'Doctor Babor'];
              const validNames = nameMatches.map(m => m[1]).filter(n => !exclude.includes(n));
              if (validNames.length > 0) finalArgs.attendee.name = validNames[0];
            }
            if (!finalArgs.attendee.email || finalArgs.attendee.email === 'guest@example.com') {
              const emailMatches = [...userTRev.matchAll(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g)];
              if (emailMatches.length > 0) finalArgs.attendee.email = emailMatches[0][0];
            }
            if (!finalArgs.start) {
              // Extract start time from the full conversation history (newest first)
              
              // Look for ISO date or a time like 19:00
              const isoMatch = fullHistoryText.match(/\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z\b/i);
              if (isoMatch) {
                finalArgs.start = isoMatch[0].toUpperCase();
              } else {
                const timeMatch = tRevMatch.match(/\b(\d{1,2}):(\d{2})\s*(am|pm)?\b/);
                if (timeMatch) {
                  const d = new Date();
                  let hour = parseInt(timeMatch[1]);
                  const min = parseInt(timeMatch[2]);
                  const ampm = timeMatch[3]?.toLowerCase();
                  if (ampm === 'pm' && hour < 12) hour += 12;
                  else if (ampm === 'am' && hour === 12) hour = 0;
                  
                  // Guess the day from text
                  const userMsgs = currentMessages.filter(m => m.role === 'user');
                  const lastUserMsg = userMsgs.length > 0 ? userMsgs[userMsgs.length - 1].content.toLowerCase() : '';
                  const recentContext = lastUserMsg + ' ' + (userMsgs.length > 1 ? userMsgs[userMsgs.length - 2].content.toLowerCase() : '');
                  
                  const dayMatch = recentContext.match(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i);
                  if (recentContext.includes('today')) {
                    // Do nothing to the day
                  } else if (recentContext.includes('tomorrow')) {
                    d.setDate(d.getDate() + 1);
                  } else if (dayMatch) {
                    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                    const targetDay = days.indexOf(dayMatch[1]);
                    const currentDay = d.getDay();
                    let daysAhead = targetDay - currentDay;
                    if (daysAhead < 0) daysAhead += 7; // assume this week or next
                    d.setDate(d.getDate() + daysAhead);
                  }
                  
                  d.setHours(hour, min, 0, 0);
                  // If no day was found and the time already passed today, assume tomorrow
                  if (!dayMatch && !recentContext.includes('tomorrow') && !recentContext.includes('today') && d.getTime() < Date.now()) {
                    d.setDate(d.getDate() + 1);
                  }
                  finalArgs.start = d.toISOString();
                }
              }
            } else {
              const d = new Date(finalArgs.start);
              const dayMatch = fullHistoryText.match(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i);
              if (dayMatch) {
                const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                const targetDay = days.indexOf(dayMatch[1].toLowerCase());
                const currentDay = d.getDay();
                if (currentDay !== targetDay) {
                   let daysAhead = targetDay - currentDay;
                   if (daysAhead < 0) daysAhead += 7;
                   d.setDate(d.getDate() + daysAhead);
                   finalArgs.start = d.toISOString();
                }
              }
            }
            
            if (!finalArgs.eventTypeId) {
              const tLow = userTRev.toLowerCase();
              let bestKey = null;
              if (tLow.includes('norefjell glow')) bestKey = 'norefjell glow';
              else if (tLow.includes('mountain queen')) bestKey = 'mountain queen';
              else if (tLow.includes('kobido')) bestKey = 'kobido';
              else if (tLow.includes('classic facial')) bestKey = 'classic facial';
              else if (tLow.includes('hanakasumi')) bestKey = 'hanakasumi';
              else if (tLow.includes('mountain serenity')) bestKey = 'mountain serenity';
              else if (tLow.includes('norefjell dream')) bestKey = 'norefjell dream';
              else if (tLow.includes('aroma')) bestKey = 'aroma';
              else if (tLow.includes('stone')) bestKey = 'stone';
              else if (tLow.includes('classic mountain massage')) bestKey = 'classic mountain massage';
              
              if (bestKey) {
                try {
                  const evts = await tools.get_event_types.runTool({ username: finalArgs.username });
                  if (Array.isArray(evts)) {
                    let bestMatch = evts.find(e => e.title.toLowerCase().includes(bestKey));
                    console.log('DEBUG: bestMatch found for key', bestKey, '?', !!bestMatch);
                    if (bestMatch) {
                      finalArgs.eventTypeId = bestMatch.specialists[finalArgs.username] || Object.values(bestMatch.specialists)[0];
                      console.log('DEBUG: set eventTypeId to', finalArgs.eventTypeId);
                    }
                  }
                } catch(e) {
                  console.error('DEBUG: error fetching evts for heuristic', e);
                }
              }
            }
          }
          
          if (name === 'reschedule_booking' || name === 'cancel_booking') {
            if (name === 'reschedule_booking' && !finalArgs.eventTypeId) {
                if (finalArgs.username === 'anna') finalArgs.eventTypeId = 133;
                else if (finalArgs.username === 'erik') finalArgs.eventTypeId = 74;
                else if (finalArgs.username === 'ingrid') finalArgs.eventTypeId = 155;
            }
            if (Object.keys(finalArgs).length === 0 || !finalArgs.bookingUid) {
              // Heuristic fallback if LLM drops args
              if (!finalArgs.username) finalArgs.username = 'admin';
              const uidMatch = fullHistoryText.match(/bookingUid['"]?\s*:\s*['"]([^'"]+)['"]/i);
              if (uidMatch) finalArgs.bookingUid = uidMatch[1];
            }
          }
          
          if (name === 'get_bookings') {
            if (!finalArgs.username) finalArgs.username = 'admin';
          }
          
          console.log(`Executing ${name} with args:`, finalArgs);
          return await t.runTool(finalArgs, {});
        }
      });
    }

    for (let step = 0; step < 8; step++) {
      const result = await generateText({
        model: openai('gpt-4o'),
        system: getSystemPrompt(role),
        messages: currentMessages,
        tools: wrappedTools,
        temperature: 0,
        maxRetries: 3
      });

      console.log(`[Step ${step}] Text:`, result.text);
      console.log(`[Step ${step}] Tool Calls:`, JSON.stringify(result.toolCalls, null, 2));

      if (result.toolCalls && result.toolCalls.length > 0) {
        // Execute tools
        const toolResults = await Promise.all(result.toolCalls.map(async (tc) => {
          let toolResult;
          try {
            // Because wrappedTools[tc.toolName] is a Vercel AI SDK Tool object, we can call its execute method
            // Actually, we can just call it manually:
            toolResult = await wrappedTools[tc.toolName].execute(tc.args, {});
          } catch(e) {
            toolResult = { error: e.message };
          }
          return {
            toolName: tc.toolName,
            args: tc.args,
            result: toolResult
          };
        }));

        // Push text history (BYPASS ZOD VALIDATION ENTIRELY)
        currentMessages.push({
          role: 'assistant',
          content: result.text ? result.text + `\n\nI need to use my tools to check: ${result.toolCalls.map(t => t.toolName).join(', ')}` : `I need to use my tools to check: ${result.toolCalls.map(t => t.toolName).join(', ')}`
        });

        currentMessages.push({
          role: 'user',
          content: `Tool execution results:\n${JSON.stringify(toolResults, null, 2)}`
        });

      } else {
        // No tool calls, we are done
        let cleanText = result.text || "Sorry, I couldn't generate a response.";
        cleanText = cleanText.replace(/```json[\s\S]*?```/gi, '').trim();
        cleanText = cleanText.replace(/\*\*(.*?)\*\*/g, '$1');
        cleanText = cleanText.replace(/__(.*?)__/g, '$1');
        return res.json({ text: cleanText });
      }
    }
    
    return res.json({ text: "Sorry, I needed to think too long." });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

const PORT = 3001;
// Helper to resolve API key based on username
const resolveApiKey = (req) => {
  const reqUsername = req.query.username || req.body?.username || req.query.userId || req.body?.userId;
  const username = reqUsername ? String(reqUsername).toLowerCase() : null;
  
  if (username === 'anna' && process.env.CAL_API_KEY_ANNA) return process.env.CAL_API_KEY_ANNA;
  if (username === 'ingrid' && process.env.CAL_API_KEY_INGRID) return process.env.CAL_API_KEY_INGRID;
  if (username === 'erik' && process.env.CAL_API_KEY_ERIK) return process.env.CAL_API_KEY_ERIK;
  if (username === 'admin' && process.env.CAL_API_KEY_ADMIN) return process.env.CAL_API_KEY_ADMIN;
  
  if (req.headers['x-proxy-api-key']) return req.headers['x-proxy-api-key'];
  
  return process.env.CAL_API_KEY_ADMIN || process.env.CAL_API_KEY;
};

// CORS Proxy for Bookings POST (Bypasses Browser CORS issues)
app.post(['/api/proxy/bookings', '/api/proxy/bookings/:id/:action'], async (req, res) => {
  try {
    const CAL_API_URL = req.headers['x-proxy-api-url'] || process.env.CAL_API_URL || 'https://calcom.run.place/api/v2';
    const API_KEY = resolveApiKey(req);
    console.log(`[PROXY POST] Using API KEY: ${API_KEY.substring(0, 15)}...`);
    console.log(`[PROXY POST] Body:`, JSON.stringify(req.body, null, 2));
    const axios = (await import('axios')).default;
    
    let baseApiUrl = CAL_API_URL.replace(/\/+$/, '');
    if (!baseApiUrl.includes('/api/v2') && !baseApiUrl.includes('/v2')) {
      baseApiUrl = `${baseApiUrl}/api/v2`;
    }
    const pathSuffix = req.path.replace('/api/proxy/bookings', '');
    const endpoint = baseApiUrl.endsWith('/bookings') ? `${baseApiUrl}${pathSuffix}` : `${baseApiUrl}/bookings${pathSuffix}`;

    const response = await axios.post(endpoint, req.body, {
      headers: {
        'Authorization': API_KEY.startsWith('Bearer') ? API_KEY : `Bearer ${API_KEY}`,
        'cal-api-version': '2024-08-13'
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Proxy Error:', error.response?.data ? JSON.stringify(error.response.data, null, 2) : error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { error: error.message });
  }
});

// CORS Proxy for Bookings GET
app.get('/api/proxy/bookings', async (req, res) => {
  try {
    const CAL_API_URL = req.headers['x-proxy-api-url'] || process.env.CAL_API_URL || 'https://calcom.run.place/api/v2';
    const API_KEY = resolveApiKey(req);
    const axios = (await import('axios')).default;
    
    let baseApiUrl = CAL_API_URL.replace(/\/+$/, '');
    // Ensure we strictly use V2, since V1 does not exist
    if (!baseApiUrl.includes('/api/v2') && !baseApiUrl.includes('/v2')) {
      baseApiUrl = `${baseApiUrl}/api/v2`;
    }
    const endpoint = baseApiUrl.endsWith('/bookings') ? baseApiUrl : `${baseApiUrl}/bookings`;

    const queryParams = new URLSearchParams();
    for (const [key, value] of Object.entries(req.query)) {
      if (key !== 'username' || value) { // keep username if truthy
        queryParams.append(key, value);
      }
    }
    
    const targetUrl = `${endpoint}?${queryParams.toString()}`;
    console.log(`[PROXY GET] Fetching ${targetUrl} with API key ending in ...${API_KEY.substring(API_KEY.length-6)}`);

    const response = await axios.get(targetUrl, {
      headers: {
        'Authorization': API_KEY.startsWith('Bearer') ? API_KEY : `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'cal-api-version': '2024-08-13'
      }
    });
    
    let count = 0;
    if (Array.isArray(response.data)) count = response.data.length;
    else if (response.data?.data && Array.isArray(response.data.data)) count = response.data.data.length;
    else if (response.data?.bookings && Array.isArray(response.data.bookings)) count = response.data.bookings.length;
    
    console.log(`[PROXY GET] Success for ${targetUrl} - Returned ${count} items`);
    res.json(response.data);
  } catch (error) {
    console.error('Proxy GET Error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { error: error.message });
  }
});

// CORS Proxy for Slots GET
app.get('/api/proxy/slots/available', async (req, res) => {
  try {
    const CAL_API_URL = req.headers['x-proxy-api-url'] || process.env.CAL_API_URL || 'https://calcom.run.place/api/v2';
    const API_KEY = resolveApiKey(req);
    const axios = (await import('axios')).default;
    
    let baseApiUrl = CAL_API_URL.replace(/\/+$/, '');
    if (!baseApiUrl.includes('/api/v2') && !baseApiUrl.includes('/v2')) {
      baseApiUrl = `${baseApiUrl}/api/v2`;
    }
    const endpoint = baseApiUrl.endsWith('/slots/available') ? baseApiUrl : `${baseApiUrl}/slots/available`;

    const queryParams = new URLSearchParams();
    for (const [key, value] of Object.entries(req.query)) {
      if (key !== 'username' || value) { // keep username if truthy
        queryParams.append(key, value);
      }
    }
    
    const targetUrl = `${endpoint}?${queryParams.toString()}`;
    console.log(`[PROXY GET] Fetching ${targetUrl} with API key ending in ...${API_KEY.substring(API_KEY.length-6)}`);

    const response = await axios.get(targetUrl, {
      headers: {
        'Authorization': API_KEY.startsWith('Bearer') ? API_KEY : `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'cal-api-version': '2026-05-01'
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Proxy GET Slots Error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { error: error.message });
  }
});

// CORS Proxy for Event Types GET
app.get('/api/proxy/event-types', async (req, res) => {
  try {
    const CAL_API_URL = req.headers['x-proxy-api-url'] || process.env.CAL_API_URL || 'https://calcom.run.place/api/v2';
    const API_KEY = resolveApiKey(req);
    const axios = (await import('axios')).default;
    
    let baseApiUrl = CAL_API_URL.replace(/\/+$/, '');
    if (!baseApiUrl.includes('/api/v2') && !baseApiUrl.includes('/v2')) {
      baseApiUrl = `${baseApiUrl}/api/v2`;
    }
    const endpoint = baseApiUrl.endsWith('/event-types') ? baseApiUrl : `${baseApiUrl}/event-types`;

    const queryParams = new URLSearchParams();
    for (const [key, value] of Object.entries(req.query)) {
      if (value) queryParams.append(key, value);
    }
    
    const targetUrl = `${endpoint}?${queryParams.toString()}`;
    console.log(`[PROXY GET] Fetching ${targetUrl} with API key ending in ...${API_KEY.substring(API_KEY.length-6)}`);

    const response = await axios.get(targetUrl, {
      headers: {
        'Authorization': API_KEY.startsWith('Bearer') ? API_KEY : `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'cal-api-version': '2024-06-14'
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Proxy GET Event Types Error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { error: error.message });
  }
});

// CORS Proxy for Users GET
app.get('/api/proxy/users', async (req, res) => {
  try {
    const CAL_API_URL = req.headers['x-proxy-api-url'] || process.env.CAL_API_URL || 'https://calcom.run.place/api/v2';
    const API_KEY = resolveApiKey(req);
    const axios = (await import('axios')).default;
    
    let baseApiUrl = CAL_API_URL.replace(/\/+$/, '');
    if (!baseApiUrl.includes('/api/v2') && !baseApiUrl.includes('/api/v1')) {
      baseApiUrl = `${baseApiUrl}/api/v2`;
    }
    const endpoint = baseApiUrl.endsWith('/users') ? baseApiUrl : `${baseApiUrl}/users`;
    
    console.log(`[PROXY GET] Fetching Users from ${endpoint}`);

    const response = await axios.get(endpoint, {
      headers: {
        'Authorization': API_KEY.startsWith('Bearer') ? API_KEY : `Bearer ${API_KEY}`
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Proxy GET Users Error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { error: error.message });
  }
});

// Email loop endpoints
app.post('/api/email', async (req, res) => {
  try {
    const { emailBody, senderName, senderEmail } = req.body;
    
    const emailPrompt = `You are an automated email booking processor for Cal.com. 
You are processing an email from ${senderName} (${senderEmail}).
Message: "${emailBody}"

RULES:
1. Identify the requested treatment and time.
2. Call get_event_types, then get_availability.
3. If the slot is available, you MUST call create_booking IMMEDIATELY. DO NOT ask for confirmation.
4. If you do not have a phone number, just omit it, but DO NOT stop the booking process.
5. After booking or checking availability, draft a polite email response to the user.
6. If the booking was created successfully, ask them to reply with their phone number to complete their profile.
7. If the slot is unavailable, suggest 2 or 3 alternatives.
8. NEVER output markdown codeblocks for json arguments. Use native tool calling.

The current date and time in Riga is: ${new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Riga', dateStyle: 'full', timeStyle: 'long' }).format(new Date())}
`;

    let currentMessages = [{ role: 'user', content: emailPrompt }];
    let finalResponseText = '';
    
    // Process up to 5 steps
    for (let step = 0; step < 5; step++) {
      const result = await generateText({
        model: openai('gpt-4o'),
        messages: currentMessages,
        tools: tools,
        temperature: 0,
        maxRetries: 3
      });
      
      if (result.text) {
        finalResponseText = result.text;
      }
      
      if (!result.toolCalls || result.toolCalls.length === 0) {
        break; // Done
      }
      
      const toolResults = await Promise.all(result.toolCalls.map(async (tc) => {
        let args = tc.args || tc.input || {};
        
        // For headless email bookings, fill in attendee if missing
        if (tc.toolName === 'create_booking') {
          if (!args.attendee) args.attendee = {};
          if (!args.attendee.name) args.attendee.name = senderName || 'Email Guest';
          if (!args.attendee.email) args.attendee.email = senderEmail || 'guest@example.com';
          if (!args.attendee.phone) args.attendee.phone = '+37100000000'; // Dummy phone to pass strict validation
        }
        
        let toolResult;
        try {
          if (tc.toolName === 'get_event_types') toolResult = await tools.get_event_types.runTool(args);
          else if (tc.toolName === 'get_availability') toolResult = await tools.get_availability.runTool(args);
          else if (tc.toolName === 'create_booking') toolResult = await tools.create_booking.runTool(args);
          else toolResult = { error: 'Unsupported tool in email mode' };
        } catch(e) {
          toolResult = { error: e.message };
        }
        return { toolCallId: tc.toolCallId, toolName: tc.toolName, result: toolResult };
      }));
      
      // Push assistant tool execution summary
      currentMessages.push({ 
        role: 'assistant', 
        content: result.text || '',
        toolCalls: result.toolCalls
      });
      
      // Push tool results
      currentMessages.push({ 
        role: 'tool', 
        content: toolResults.map(tr => ({
          type: 'tool-result',
          toolCallId: tr.toolCallId,
          toolName: tr.toolName,
          result: tr.result
        }))
      });
    }
    
    res.json({ replyText: finalResponseText });
  } catch (error) {
    console.error('Email API Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/email/update', async (req, res) => {
  try {
    const { emailBody, senderEmail } = req.body;
    
    const updatePrompt = `You are processing a follow-up email from ${senderEmail}.
Message: "${emailBody}"

RULES:
1. The user is replying with their phone number to complete their booking profile.
2. Extract the phone number from the message.
3. You need to call 'update_booking' to update their recent booking with this phone number.
   Wait, since you don't know the 'uid' or 'username' of the booking, you should FIRST call 'get_bookings' or we can pass it to you.
   Actually, the user has a recent booking. To keep it simple, assume the backend has already provided the uid, OR we can fetch it.
   Since you don't have a 'get_bookings' tool here, please just output the extracted phone number as a JSON string!
`;
    // Wait, the AI doesn't have get_bookings. Let me write a simpler prompt.
    const result = await generateText({
      model: openai('gpt-4o'),
      system: 'Extract the phone number from the user email. Reply ONLY with the extracted phone number formatted with a leading +. If no phone number is found, reply "NONE".',
      messages: [
        { role: 'user', content: emailBody }
      ]
    });
    
    const extractedPhone = result.text.trim();
    if (extractedPhone !== 'NONE') {
      // Find the user's booking manually using bookingService or axios
      const CAL_API_URL = process.env.CAL_API_URL || 'https://calcom.run.place/api/v2';
      const axios = (await import('axios')).default;
      
      // We will fetch all bookings from admin and try to find the email
      let matchedBooking = null;
      let hostUsername = null;
      
      for (const u of ['admin', 'anna', 'erik', 'ingrid']) {
        try {
          const r = await axios.get(`${CAL_API_URL}/bookings`, {
            headers: { 'Authorization': `Bearer ${resolveApiKey(u)}`, 'cal-api-version': '2026-05-01' }
          });
          const bookings = Array.isArray(r.data) ? r.data : (r.data.data || r.data.bookings || []);
          const b = bookings.find(x => x.attendees && x.attendees.some(a => a.email === senderEmail));
          if (b) {
            matchedBooking = b;
            hostUsername = u;
            break;
          }
        } catch(e) {}
      }
      
      if (matchedBooking) {
        // Use our update_booking tool programmatically!
        const updateRes = await tools.update_booking.runTool({
          uid: matchedBooking.uid || matchedBooking.id.toString(),
          phone: extractedPhone,
          username: hostUsername
        });
        return res.json({ success: true, phone: extractedPhone, updateResult: updateRes });
      } else {
        return res.json({ success: false, error: 'No booking found for this email' });
      }
    }
    
    res.json({ success: false, error: 'No phone number found' });
  } catch (error) {
    console.error('Email Update Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Proxy server running on port ${PORT}`);
});
