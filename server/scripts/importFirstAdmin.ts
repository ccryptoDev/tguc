import { Client } from 'pg';
import { v4 as uuidv4 } from 'uuid';

import appConfig from '../src/app.config';

const { databaseUsername, databasePassword, databasePort, databaseName } =
  appConfig();
const client = new Client({
  host: 'localhost',
  port: databasePort,
  user: databaseUsername,
  password: databasePassword,
  database: databaseName,
});
const admin = JSON.stringify([
  {
    id: uuidv4(),
    userName: 'dev-admin',
    email: 'dev+admin@trustalchemy.com',
    password: '$2b$10$xeky3yXQRyN1V8KaTbWHeupi/u2PN.b38Z4EnOv5u5m1B5IvxS.AK', // #Password1
    phoneNumber: '1234567890',
    roleId: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d', // Super Admin
    practiceManagementId: '01d4f47b-ea93-48e9-a306-50dd9bac14f8',
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    userName: 'dev-contractor',
    email: 'dev+contractor@trustalchemy.com',
    password: '$2b$10$xeky3yXQRyN1V8KaTbWHeupi/u2PN.b38Z4EnOv5u5m1B5IvxS.AK', // #Password1
    phoneNumber: '1234567890',
    roleId: 'ee4a2021-0772-4d0a-8090-a9587aad2dda', // Contractor
    practiceManagementId: '01d4f47b-ea93-48e9-a306-50dd9bac14f8',
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    userName: 'dev-agent',
    email: 'dev+agent@trustalchemy.com',
    password: '$2b$10$xeky3yXQRyN1V8KaTbWHeupi/u2PN.b38Z4EnOv5u5m1B5IvxS.AK', // #Password1
    phoneNumber: '1234567890',
    roleId: '06a33bd1-b6cd-4398-80c2-5819dc6259da', // Agents
    practiceManagementId: '01d4f47b-ea93-48e9-a306-50dd9bac14f8',
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]);

(async () => {
  try {
    const query = `INSERT INTO admin_user(id, "userName", email, password, "phoneNumber", "roleId", "practiceManagementId", "isDeleted", "createdAt", "updatedAt") (SELECT (data->>'id')::uuid, (data->>'userName')::text, (data->>'email')::text, (data->>'password')::text, (data->>'phoneNumber')::text, (data->>'roleId')::uuid, (data->>'practiceManagementId')::uuid, (data->>'isDeleted')::boolean, (data->>'createdAt')::timestamptz, (data->>'updatedAt')::timestamptz FROM (SELECT json_array_elements($1::json) AS data) tmp )`;

    await client.connect();
    console.log(`Connected to ${databaseName} database.`);

    console.log('Adding first admin to admin collection.');
    await client.query('DELETE FROM admin_user;');
    await client.query(query, [admin]);

    console.log('Admin saved');
  } catch (error) {
    console.log('Could not execute script. Error: ', error);
  } finally {
    await client.end();
    console.log('Connection closed.');
    process.exit(0);
  }
})();
