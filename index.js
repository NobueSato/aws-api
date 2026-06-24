// This is a simple Express API that demonstrates how to use AWS SDK v3 to interact with DynamoDB and S3. It provides endpoints to create, read, and delete client records, which are stored in DynamoDB and also saved as JSON files in S3.

// We import the necessary modules, including Express for our API framework and AWS SDK clients for DynamoDB and S3. We also use serverless-http to wrap our Express app so that it can run as an AWS Lambda function.
// why we need express: Express is a popular web framework for Node.js that makes it easy to build APIs by providing routing (like GET, POST) and middleware capabilities. express.json() is a middleware that parses incoming JSON requests and makes the data available in req.body.

// The AWS SDK clients allow us to interact with DynamoDB (for our database) and S3 (for file storage). We use DynamoDBDocumentClient for a more convenient API when working with DynamoDB items as JavaScript objects, and S3Client for uploading client data as JSON files to our S3 bucket.
const express = require('express');
// AWS SDK clients for DynamoDB and S3
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, ScanCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { validateClient } = require('./validateClient');

// We create an Express app and define some constants for our AWS region, DynamoDB table name, and S3 bucket name.
// app = express() creates an instance of an Express application, which we can use to define our API routes and middleware. 
// The constants REGION, TABLE, and BUCKET are used to specify the AWS region where our resources are located, the name of our DynamoDB table, and the name of our S3 bucket, respectively.
const app = express();
const PORT = 3000;
const REGION = 'us-east-2'; // AWS region
const TABLE = 'bmo-demo-api-clients'; // DynamoDB table name
const BUCKET = 'api-demo-nsato-clients'; // S3 bucket name

// DynamoDB setup
const dynamoClient = new DynamoDBClient({ region: REGION });
const dynamo = DynamoDBDocumentClient.from(dynamoClient);

// S3 setup
const s3 = new S3Client({ region: REGION });

// Middleware to parse JSON bodies
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
  if (!result.Item) return res.status(404).json({ message: 'Client not found' });
  res.json(result.Item);
});

// POST new client
app.post('/clients', async (req, res) => {
  const { name, department } = req.body;

  // Validate input first
  const validation = validateClient({ name, department });
  if (!validation.valid) {
    return res.status(400).json({ message: validation.error });
  }

  const newClient = { id: Date.now().toString(), name, department };

  // Save to DynamoDB
  await dynamo.send(new PutCommand({
    TableName: TABLE,
    Item: newClient
  }));

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
app.delete('/clients/:id', async (req, res) => {
  await dynamo.send(new DeleteCommand({
    TableName: TABLE,
    Key: { id: req.params.id }
  }));
  res.json({ message: 'Client deleted' });
});

app.listen(PORT, () => {
  console.log(`BMO API running on http://localhost:${PORT}`);
});