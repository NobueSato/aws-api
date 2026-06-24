// This file contains the main logic for our API, including the Express app and AWS SDK interactions.
// serverless-http is used to wrap our Express app so it can run in AWS Lambda.
const serverless = require('serverless-http');
// We need to import the AWS SDK clients for DynamoDB and S3, as well as the Express framework.
// express is a popular web framework for Node.js that makes it easy to build APIs by providing routing(like GET, POST) and middleware capabilities.
// express.json() is a middleware that parses incoming JSON requests and makes the data available in req.body.

// The AWS SDK clients allow us to interact with DynamoDB (for our database) and S3 (for file storage).
const express = require('express');
// AWS SDK clients for DynamoDB and S3
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, ScanCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
// S3 client and command for uploading objects
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
// We import the validateClient function from a separate file, which we will use to validate client data before saving it to DynamoDB.
const { validateClient } = require('./validateClient');

// Express setup
// We create an Express app and define some constants for our AWS region, DynamoDB table name, and S3 bucket name.
const app = express();
const REGION = 'us-east-2'; // AWS region
const TABLE = 'bmo-demo-api-clients'; // DynamoDB table name
const BUCKET = 'api-demo-nsato-clients'; // S3 bucket name

// DynamoDB setup
// We create a DynamoDB client and then wrap it with DynamoDBDocumentClient, which provides a more convenient API for working with DynamoDB items as JavaScript objects.
const dynamoClient = new DynamoDBClient({ region: REGION });
const dynamo = DynamoDBDocumentClient.from(dynamoClient);

// S3 setup
// We create an S3 client that we will use to upload client data as JSON files to our S3 bucket.
const s3 = new S3Client({ region: REGION });

// Middleware to parse JSON bodies
app.use(express.json());

// GET all clients
app.get('/clients', async (req, res) => {
  const result = await dynamo.send(new ScanCommand({ TableName: TABLE }));
  res.json(result.Items);
});

// GET one client
// When we get a request for a specific client by ID, we query DynamoDB for that item. If it doesn't exist, we return a 404 Not Found status with a message. If it does exist, we return the client data as JSON.
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
// When we receive a POST request to create a new client, we first generate a unique ID (using the current timestamp for simplicity). We then save the new client data to DynamoDB and also upload it as a JSON file to S3. Finally, we return the new client data with a 201 Created status. the reason why we upload to S3 is to demonstrate how we can use multiple AWS services together in our API. DynamoDB is great for structured data and fast queries, while S3 is ideal for storing files and larger objects. By saving client data in both places, we can leverage the strengths of each service and have a backup of our data in S3.
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

// Finally, we export the Express app wrapped in serverless-http so that it can be deployed as an AWS Lambda function. This allows us to run our API without managing any servers, and it will scale automatically based on demand.
module.exports.handler = serverless(app);