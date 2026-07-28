import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

const CAL_API_URL = 'https://calcom.run.place/api/v2';
const resolvedKey = process.env.CAL_API_KEY_ADMIN || process.env.CAL_API_KEY;

const payload = {
  title: "Test Multi Duration 2",
  slug: "test-multi-duration-2",
  lengthInMinutes: 20,
  description: "Test",
  lengthInMinutesOptions: [20, 50, 80]
};

async function test() {
  try {
    const response = await axios.post(`${CAL_API_URL}/event-types`, payload, {
      headers: {
        'Authorization': `Bearer ${resolvedKey}`,
        'cal-api-version': '2024-06-14'
      }
    });
    console.log("Success:", JSON.stringify(response.data.data, null, 2));
  } catch(e) {
    console.error("Error:", e.response?.data || e.message);
  }
}
test();
