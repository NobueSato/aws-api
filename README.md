# BMO API Demo

A production-grade serverless REST API built with Node.js and Express,
deployed on AWS using Lambda, API Gateway, DynamoDB, S3, and Cognito.

## Architecture

Client (Postman) → API Gateway (Cognito JWT auth) → Lambda (Node.js) → DynamoDB + S3

## AWS Services

- **Lambda** — serverless Node.js runtime
- **API Gateway** — HTTP routing, rate limiting, JWT auth
- **DynamoDB** — persistent NoSQL storage for client data
- **S3** — JSON file backup on every POST
- **Cognito** — JWT-based authentication
- **IAM** — least-privilege execution roles

## Endpoints

| Method | Endpoint     | Description                          |
| ------ | ------------ | ------------------------------------ |
| GET    | /clients     | Get all clients from DynamoDB        |
| GET    | /clients/:id | Get one client by ID                 |
| POST   | /clients     | Create client, save to DynamoDB + S3 |
| DELETE | /clients/:id | Delete client from DynamoDB          |

## Live API

https://a1f7gobfl2.execute-api.us-east-2.amazonaws.com

## Run Locally

npm install
node index.js
