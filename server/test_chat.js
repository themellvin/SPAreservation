fetch('http://localhost:3001/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ messages: [{ role: 'user', content: 'can a guest have a massage today with melvin' }] })
}).then(res => res.json()).then(console.log).catch(console.error);
