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

const agreements = JSON.stringify([
  {
    id: uuidv4(),
    documentKey: '120',
    documentName: 'E-Signature',
    documentVersion: 1,
    active: true,
    documentPath: 'document/Electronic_Records_and_Signatures',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    documentKey: '126',
    documentName: 'SMS Policy',
    documentVersion: 1,
    active: true,
    documentPath: 'document/tcpa_v1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    documentKey: '131',
    documentName: 'Retail Installment Contract',
    documentVersion: 1,
    active: true,
    documentPath: 'document/loanAgreementAndPromissoryNote_v1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    documentKey: '132',
    documentName: 'Electronic Funds Transfer Authorization',
    documentVersion: 1,
    active: true,
    documentPath: 'document/E-Consent_v1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]);

(async () => {
  try {
    const query = `INSERT INTO agreement(id, "documentKey", "documentName", "documentVersion", active, "documentPath", "createdAt", "updatedAt") (SELECT (data->>'id')::uuid, (data->>'documentKey')::text, (data->>'documentName')::text, (data->>'documentVersion')::int, (data->>'active')::boolean, (data->>'documentPath')::text, (data->>'createdAt')::timestamptz, (data->>'updatedAt')::timestamptz FROM (SELECT json_array_elements($1::json) AS data) tmp )`;

    await client.connect();
    console.log(`Connected to ${databaseName} database.`);

    console.log('Adding initial agreements to agreement collection.');

    await client.query(query, [agreements]);
    console.log('Agreements saved');

    console.log('Connection closed.');
    process.exit(0);
  } catch (error) {
    console.log('Could not execute script. Error: ', error);
    process.exit(0);
  }
})();
