// API demo project

const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory "database" for now
let clients = [
  { id: '1', name: 'Personal Banking', department: 'Retail' },
  { id: '2', name: 'Wealth Management', department: 'Investments' },
];

// GET all clients
app.get('/clients', (req, res) => {
  res.json(clients);
});

// GET one client
app.get('/clients/:id', (req, res) => {
  const client = clients.find(c => c.id === req.params.id);
  if (!client) return res.status(404).json({ message: 'Client not found' });
  res.json(client);
});

// POST new client
app.post('/clients', (req, res) => {
  const { name, department } = req.body;
  const newClient = { id: Date.now().toString(), name, department };
  clients.push(newClient);
  res.status(201).json(newClient);
});

// DELETE a client
app.delete('/clients/:id', (req, res) => {
  const index = clients.findIndex(c => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Client not found' });
  clients.splice(index, 1);
  res.json({ message: 'Client deleted' });
});

app.listen(PORT, () => {
  console.log(`BMO API running on http://localhost:${PORT}`);
});