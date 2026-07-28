import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

async function test() {
  try {
    const result = await generateText({
      model: openai('gpt-4o'),
      messages: [
        { role: 'user', content: 'can I have a massage with melvin' }
      ],
      tools: {
        get_event_types: {
          description: "Get event types",
          parameters: { type: 'object', properties: {} },
          execute: async () => ({ ok: true })
        }
      }
    });
    console.log("RESPONSE MESSAGES:", JSON.stringify(result.response.messages, null, 2));
  } catch (e) {
    console.log(e);
  }
}
test();
