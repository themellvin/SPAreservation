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

const fixClassicFacials = async (username) => {
  const resolvedKey = resolveApiKey(username);
  console.log(`\nFetching events for ${username}...`);
  try {
    const res = await axios.get(`${CAL_API_URL}/event-types?username=${username}`, {
      headers: { 'Authorization': `Bearer ${resolvedKey}`, 'cal-api-version': '2024-06-14' }
    });
    const events = res.data.data;
    
    for (const ev of events) {
      if (ev.title.toLowerCase() === 'classic facial') {
        // Delete the one with no description
        console.log(`Deleting bad "Classic Facial" for ${username}...`);
        try {
          await axios.delete(`${CAL_API_URL}/event-types/${ev.id}`, {
            headers: { 'Authorization': `Bearer ${resolvedKey}`, 'cal-api-version': '2024-06-14' }
          });
        } catch(e) { console.error('Failed to delete:', e.message); }
      }
      else if (ev.title.toLowerCase().includes('classic facial deep cleanse')) {
        // Rename this one and update durations to 20, 50, 80
        console.log(`Renaming "${ev.title}" to "Classic facial" for ${username}...`);
        const payload = {
          title: "Classic facial",
          lengthInMinutesOptions: [20, 50, 80],
          metadata: { multipleDuration: [20, 50, 80] }
        };
        try {
          await axios.patch(`${CAL_API_URL}/event-types/${ev.id}`, payload, {
            headers: { 'Authorization': `Bearer ${resolvedKey}`, 'cal-api-version': '2024-06-14' }
          });
        } catch(e) { console.error('Failed to patch:', e.response?.data?.message || e.message); }
      }
    }
  } catch (err) {
    console.error(`Failed to fetch for ${username}:`, err.message);
  }
};

const run = async () => {
  const users = ['admin', 'anna', 'erik', 'ingrid'];
  for (const user of users) {
    await fixClassicFacials(user);
  }
};

run();
