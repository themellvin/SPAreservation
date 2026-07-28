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

const deleteEventTypes = async (username) => {
  const resolvedKey = resolveApiKey(username);
  console.log(`Fetching events for ${username} to delete...`);
  try {
    const res = await axios.get(`${CAL_API_URL}/event-types?username=${username}`, {
      headers: {
        'Authorization': `Bearer ${resolvedKey}`,
        'cal-api-version': '2024-06-14'
      }
    });
    const events = res.data.data;
    console.log(`Found ${events.length} events for ${username}. Deleting...`);
    for (const ev of events) {
      try {
        await axios.delete(`${CAL_API_URL}/event-types/${ev.id}`, {
          headers: {
            'Authorization': `Bearer ${resolvedKey}`,
            'cal-api-version': '2024-06-14'
          }
        });
        console.log(`Deleted ${ev.title} (${ev.id}) for ${username}`);
      } catch (err) {
        console.error(`Failed to delete ${ev.id}:`, err.response?.data?.message || err.message);
      }
    }
  } catch (err) {
    console.error(`Failed to fetch for ${username}:`, err.response?.data?.message || err.message);
  }
};

const createEventType = async (username, title, durations, description) => {
  const resolvedKey = resolveApiKey(username);
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  
  const payload = {
    title: title,
    slug: slug,
    lengthInMinutes: durations[0],
    description: description || '',
    metadata: {}
  };

  if (durations.length > 1) {
    payload.lengthInMinutesOptions = durations;
    payload.metadata.multipleDuration = durations;
  }

  try {
    const response = await axios.post(`${CAL_API_URL}/event-types`, payload, {
      headers: {
        'Authorization': `Bearer ${resolvedKey}`,
        'cal-api-version': '2024-06-14'
      }
    });
    console.log(`Success: Created "${title}" for ${username}`);
  } catch (err) {
    console.error(`Failed to create "${title}" for ${username}:`, err.response?.data?.message || err.message);
  }
};

const commonTreatments = [
  { title: "Classic mountain massage", durations: [20, 50, 80], description: "" },
  { title: "Classic Facial", durations: [20, 50, 80], description: "" },
  { title: "Body scrub and massage: Hanakasumi", durations: [50], description: "signature Double exfoliation + relaxing full-body massage with foot attention; leaves skin silky smooth and body balanced;" },
  { title: "Classic mountain massage (tension relief)", durations: [50, 80], description: "Medium pressure, relaxing full-body massage for muscle tension relief;" },
  { title: "Mountain stone massage", durations: [80], description: "Soothing, deeply relaxing massage with warm lava stones;" },
  { title: "Body Scrub and massage: Mountain serenity", durations: [20], description: "Body scrub + soothing lava stone massage to restore body/mind balance;" },
  { title: "Massage Back and neck", durations: [20, 50], description: "Neck/back tension and stiffness relief. 50 min includes: Back, neck and back of legs Medium pressure massage focusing on back of the body." },
  { title: "Body scrub, wrapping and stone massage: Norefjell dream", durations: [80], description: "Invigorating scrub + hydrating Aloe Vera wrap + face/scalp massage + lava stone massage on back;" },
  { title: "Scrub and mountain massage 50", durations: [50], description: "Dead skin removal + glow restoration + muscle-soothing back massage; medium pressure;" },
  { title: "Scrub and mountain massage 80", durations: [80], description: "80 min include: Dead skin removal + glow restoration + relaxing full-body massage; medium pressure;" },
  { title: "Soft mountain feet", durations: [20], description: "Foot scrub + nourishing wrap + foot massage + scalp/hand/arm massage; after hike or slopes;" },
  { title: "Mountain aroma massage", durations: [20, 50], description: "Gentle, relaxing back-of-body massage with aromatic oils;" },
  { title: "Lymphatic stimulating massage", durations: [80], description: "Reduces swelling, supports detoxification, strengthens immune system; gentle, professionally tailored;" },
  { title: "Classic facial Deep cleanse + exfoliation", durations: [50, 80], description: "Classic facial Deep cleanse + exfoliation + skin-type mask + face/décolleté/scalp massage;" },
  { title: "Facial Mountain queen", durations: [80], description: "Glowing, event-ready skin; deep cleanse + specialized exfoliation + Doctor Babor Collagen Complex + intensive hydration + scalp massage;" },
  { title: "Facial Norefjell glow", durations: [50], description: "Innovative fruit acid facial with visible results + comfort/relaxation focus" },
  { title: "Kobido facial massage", durations: [80], description: "Natural collagen promotion + improved muscle tone + enhanced elasticity + facial definition; boosts circulation, releases tension." },
  { title: "Mom to be (tension areas)", durations: [80], description: "Pregnant women (not 1st trimester); tension-area massage focusing on feet, neck, shoulders;" },
  { title: "Mom to be (scrub + massage)", durations: [80], description: "Pregnant women (not 1st trimester); full-body scrub + customized massage on feet, neck, shoulders;" }
];

const annaExtras = [
  { title: "Eyelash tinting", durations: [20], description: "Eyelash tinting" },
  { title: "Eyebrow tinting and shaping", durations: [50], description: "Eyebrow tinting + shaping." },
  { title: "Eyelash and eyebrow tinting", durations: [50], description: "Both eyelash + eyebrow tinting + eyebrow shaping;" }
];

const run = async () => {
  const users = ['admin', 'anna', 'ingrid']; // Skip Erik
  
  for (const user of users) {
    console.log(`\n--- Processing ${user} ---`);
    await deleteEventTypes(user);
    
    for (const t of commonTreatments) {
      await createEventType(user, t.title, t.durations, t.description);
    }
    if (user === 'anna') {
      for (const t of annaExtras) {
        await createEventType(user, t.title, t.durations, t.description);
      }
    }
  }
};

run();
