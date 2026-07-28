import { tool } from 'ai';
import { z } from 'zod';

const myTool = tool({
  description: 'desc',
  parameters: z.object({ a: z.string() }),
  runTool: async () => {}
});

console.log("myTool has runTool:", !!myTool.runTool);
