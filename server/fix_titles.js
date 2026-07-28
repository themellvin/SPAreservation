import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

const CAL_API_URL = 'https://calcom.run.place/api/v2';

const resolveApiKey = (username) => {
  const u = username ? String(username).toLowerCase() : null;
  if (u === 'anna' && process.env.CAL_API_KEY_ANNA) return process.env.CAL_API_KEY_ANNA;
  if (u === 'ingrid' && process.env.CAL_API_KEY_INGRID) return process.env.CAL_API_KEY_INGRID;
  if (u === 'erik' && process.env.CAL_API_KEY_ERIK) return process.env.CAL_API_KEY_ERIK;
  return process.env.CAL_API_KEY_ADMIN || process.env.CAL_API_KEY;
};

const fixTitles = async (username) => {
  const resolvedKey = resolveApiKey(username);
  console.log(`\nFetching events for ${username}...`);
  try {
    const res = await axios.get(`${CAL_API_URL}/event-types?username=${username}`, {
      headers: {
        'Authorization': `Bearer ${resolvedKey}`,
        'cal-api-version': '2024-06-14'
      }
    });
    const events = res.data.data;
    
    for (const ev of events) {
      if (/\s+\d+$/.test(ev.title)) {
        const newTitle = ev.title.replace(/\s+\d+$/, '');
        console.log(`Updating "${ev.title}" to "${newTitle}"`);
        try {
          await axios.patch(`${CAL_API_URL}/event-types/${ev.id}`, { title: newTitle }, {
            headers: {
              'Authorization': `Bearer ${resolvedKey}`,
              'cal-api-version': '2024-06-14'
            }
          });
        } catch (err) {
          console.error(`Failed to update ${ev.id}:`, err.response?.data?.message || err.message);
        }
      }
    }
  } catch (err) {
    console.error(`Failed to fetch for ${username}:`, err.response?.data?.message || err.message);
  }
};

const run = async () => {
  const users = ['admin', 'anna', 'erik', 'ingrid'];
  for (const user of users) {
    await fixTitles(user);
  }
};

run();
