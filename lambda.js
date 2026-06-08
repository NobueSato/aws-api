// API demo project - Lambda version

const serverless = require('serverless-http');
const express = require('express');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const app = express();
const s3 = new S3Client({ region: 'us-east-2' });
const BUCKET = 'api-demo-nsato-clients';

app.use(express.json());

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

// POST new client - now saves to S3!
app.post('/clients', async (req, res) => {
  const { name, department } = req.body;
  const newClient = { id: Date.now().toString(), name, department };
  clients.push(newClient);

  // Save to S3
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: `clients/${newClient.id}.json`,
    Body: JSON.stringify(newClient),
    ContentType: 'application/json'
  }));

  res.status(201).json(newClient);
});

// DELETE a client
app.delete('/clients/:id', (req, res) => {
  const index = clients.findIndex(c => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Client not found' });
  clients.splice(index, 1);
  res.json({ message: 'Client deleted' });
});

module.exports.handler = serverless(app);