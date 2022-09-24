import { Client } from 'pg';

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

const practice = JSON.stringify([
  {
    address: '400 Spectrum Center Drive',
    city: 'Irvine',
    contactName: 'Timothy Li',
    email: 'timothy.li@trustalchemy.com',
    id: '01d4f47b-ea93-48e9-a306-50dd9bac14f8',
    isDeleted: false,
    location: 'Alchemy',
    phone: '6142099894',
    practiceName: 'Alchemy',
    stateCode: 'CA',
    url: 'alchemy',
    zip: '92618',
  },
]);

(async () => {
  try {
    const query = `INSERT INTO practice_management (address, city, "contactName", email, id, "isDeleted", location, phone, "practiceName", "stateCode", url, zip) (SELECT (data->>'address')::text, (data->>'city')::text, (data->>'contactName')::text, (data->>'email')::text, (data->>'id')::uuid, (data->>'isDeleted')::boolean, (data->>'location')::text, (data->>'phone')::text, (data->>'practiceName')::text, (data->>'stateCode')::text, (data->>'url')::text, (data->>'zip')::text FROM (SELECT json_array_elements($1::json) AS data) tmp )`;

    await client.connect();
    console.log(`Connected to ${databaseName} database.`);

    console.log('Adding first practice to practice_management collection.');
    await client.query(query, [practice]);

    console.log('Practice saved');
  } catch (error) {
    console.log('Could not execute script. Error: ', error);
  } finally {
    await client.end();
    console.log('Connection closed.');
    process.exit(0);
  }
})();
