const fastify = require('fastify')({ logger: false });
const PORT = process.env.PORT || 3000;

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
fastify.get('/health', async (request, reply) => {
  return { 
    status: 'ok', 
    service: 'fastify',
    timestamp: new Date().toISOString()
  };
});

// Endpoints Users
fastify.get('/users', async (request, reply) => {
  return { 
    success: true, 
    count: users.length, 
    data: users 
  };
});

fastify.get('/users/:id', async (request, reply) => {
  const user = users.find(u => u.id === parseInt(request.params.id));
  if (!user) {
    reply.code(404);
    return { success: false, error: 'User not found' };
  }
  return { success: true, data: user };
});

fastify.post('/users', async (request, reply) => {
  const { name, email } = request.body;
  if (!name || !email) {
    reply.code(400);
    return { success: false, error: 'Name and email required' };
  }
  const newUser = {
    id: users.length + 1,
    name,
    email
  };
  users.push(newUser);
  reply.code(201);
  return { success: true, data: newUser };
});

// Endpoints Events
fastify.get('/events', async (request, reply) => {
  return { 
    success: true, 
    count: events.length, 
    data: events 
  };
});

fastify.get('/events/:id', async (request, reply) => {
  const event = events.find(e => e.id === parseInt(request.params.id));
  if (!event) {
    reply.code(404);
    return { success: false, error: 'Event not found' };
  }
  return { success: true, data: event };
});

fastify.post('/events', async (request, reply) => {
  const { title, date, capacity } = request.body;
  if (!title || !date || !capacity) {
    reply.code(400);
    return { success: false, error: 'Title, date and capacity required' };
  }
  const newEvent = {
    id: events.length + 1,
    title,
    date,
    capacity: parseInt(capacity),
    booked: 0
  };
  events.push(newEvent);
  reply.code(201);
  return { success: true, data: newEvent };
});

const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`Fastify server running on port ${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
