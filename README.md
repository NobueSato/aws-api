# API Demo

A RESTful API built with Node.js and Express, deployed on AWS using Lambda, API Gateway, S3, and Cognito.

## Architecture

Client (Postman) → API Gateway → Lambda (Node.js) → S3/DynamoDB
Auth: Cognito User Pool + JWT authorizer
IAM: Least-privilege execution role

## Live API

https://a1f7gobfl2.execute-api.us-east-2.amazonaws.com

## Endpoints

| Method | Endpoint     | Description     |
| ------ | ------------ | --------------- |
| GET    | /clients     | Get all clients |
| GET    | /clients/:id | Get one client  |
| POST   | /clients     | Create a client |
| DELETE | /clients/:id | Delete a client |

## Tech Stack

- Node.js + Express
- AWS Lambda
- AWS API Gateway
- AWS S3
- AWS Cognito
- IAM Roles

## Run Locally

npm install
node index.js
