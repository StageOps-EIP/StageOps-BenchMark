const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Données simulées en mémoire
let users = [
  { id: 1, name: 'Alice', email: 'alice@theatre.com' },
  { id: 2, name: 'Bob', email: 'bob@theatre.com' },
  { id: 3, name: 'Charlie', email: 'charlie@theatre.com' }
];

let events = [
  { id: 1, title: 'Le Cid', date: '2026-03-15', capacity: 500, booked: 342 },
  { id: 2, title: 'Hamlet', date: '2026-04-20', capacity: 800, booked: 756 },
  { id: 3, title: 'Macbeth', date: '2026-05-10', capacity: 600, booked: 423 }
];

// Endpoint de santé
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'express',
    timestamp: new Date().toISOString()
  });
});

// Endpoints Users
app.get('/users', (req, res) => {
  res.json({ 
    success: true, 
    count: users.length, 
    data: users 
  });
});

app.get('/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }
  res.json({ success: true, data: user });
});

app.post('/users', (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ success: false, error: 'Name and email required' });
  }
  const newUser = {
    id: users.length + 1,
    name,
    email
  };
  users.push(newUser);
  res.status(201).json({ success: true, data: newUser });
});

// Endpoints Events
app.get('/events', (req, res) => {
  res.json({ 
    success: true, 
    count: events.length, 
    data: events 
  });
});

app.get('/events/:id', (req, res) => {
  const event = events.find(e => e.id === parseInt(req.params.id));
  if (!event) {
    return res.status(404).json({ success: false, error: 'Event not found' });
  }
  res.json({ success: true, data: event });
});

app.post('/events', (req, res) => {
  const { title, date, capacity } = req.body;
  if (!title || !date || !capacity) {
    return res.status(400).json({ success: false, error: 'Title, date and capacity required' });
  }
  const newEvent = {
    id: events.length + 1,
    title,
    date,
    capacity: parseInt(capacity),
    booked: 0
  };
  events.push(newEvent);
  res.status(201).json({ success: true, data: newEvent });
});

app.listen(PORT, () => {
  console.log(`Express server running on port ${PORT}`);
});
