const serverless = require('serverless-http');
const express = require('express');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, ScanCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const app = express();
const REGION = 'us-east-2';
const TABLE = 'bmo-demo-api-clients';
const BUCKET = 'api-demo-nsato-clients';

// DynamoDB setup
const dynamoClient = new DynamoDBClient({ region: REGION });
const dynamo = DynamoDBDocumentClient.from(dynamoClient);

// S3 setup
const s3 = new S3Client({ region: REGION });

app.use(express.json());

// GET all clients
app.get('/clients', async (req, res) => {
  const result = await dynamo.send(new ScanCommand({ TableName: TABLE }));
  res.json(result.Items);
});

// GET one client
app.get('/clients/:id', async (req, res) => {
  const result = await dynamo.send(new GetCommand({
    TableName: TABLE,
    Key: { id: req.params.id }
  }));
  // If no item found, return 404 which is more appropriate than 200 with null
  if (!result.Item) return res.status(404).json({ message: 'Client not found' });
  res.json(result.Item);
});

// POST new client
app.post('/clients', async (req, res) => {
  // In a real app, you'd want to validate the input here.
  // for example, you could check that 'name' and 'department' are provided and are strings.
  // e.g.:
  // if (typeof req.body.name !== 'string' || typeof req.body.department !== 'string') {
  //   return res.status(400).json({ message: 'Invalid input' });
  // }
  // Generate a unique ID for the new client (using timestamp for simplicity)
  const { name, department } = req.body;
  const newClient = { id: Date.now().toString(), name, department };

  // Save to DynamoDB - wait Dynamo actually completes before proceeding to S3
  await dynamo.send(new PutCommand({
    TableName: TABLE,
    Item: newClient
  }));

  // Save to S3 - wait S3 actually completes before sending response
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: `clients/${newClient.id}.json`,
    Body: JSON.stringify(newClient),
    ContentType: 'application/json'
  }));

  // Return the new client with 201 Created status
  res.status(201).json(newClient);
});

// DELETE a client
app.delete('/clients/:id', async (req, res) => {
  await dynamo.send(new DeleteCommand({
    TableName: TABLE,
    Key: { id: req.params.id }
  }));
  res.json({ message: 'Client deleted' });
});

module.exports.handler = serverless(app);