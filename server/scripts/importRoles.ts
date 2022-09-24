import { Client } from 'pg';
import { Db } from 'typeorm';
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
const roles = JSON.stringify([
  {
    id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
    roleName: 'Super Admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    roleName: 'User',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    roleName: 'Manager',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ee4a2021-0772-4d0a-8090-a9587aad2dda',
    roleName: 'Merchant',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '06a33bd1-b6cd-4398-80c2-5819dc6259da',
    roleName: 'Merchant Staff',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]);

(async () => {
  try {
    const query = `INSERT INTO roles(id, "roleName", "createdAt", "updatedAt") (SELECT (data->>'id')::uuid, (data->>'roleName')::roles_rolename_enum, (data->>'createdAt')::timestamptz, (data->>'updatedAt')::timestamptz FROM (SELECT json_array_elements($1::json) AS data) tmp )`;

    await client.connect();
    console.log(`Connected to ${databaseName} database.`);
    console.log(
      'Adding Super Admin, User, Manager, Merchant and Merchant Staff roles to database...',
    );
    await client.query('DELETE FROM roles;');
    await client.query(query, [roles]);
    console.log('Roles added successfully.');
  } catch (error) {
    console.log('Could not execute script. Error: ', error);
  } finally {
    await client.end();
    console.log('Connection closed.');
    process.exit(0);
  }
})();
