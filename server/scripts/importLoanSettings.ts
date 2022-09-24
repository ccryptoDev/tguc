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

const loanSetting = JSON.stringify([
  {
    id: uuidv4(),
    lateFee: 10,
    nsfFee: 25,
    lateFeeGracePeriod: 15,
    delinquencyPeriod: 90,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]);

(async () => {
  try {
    const query = `INSERT INTO loan_settings(id, "lateFee", "nsfFee", "lateFeeGracePeriod", "delinquencyPeriod", "createdAt", "updatedAt") (SELECT (data->>'id')::uuid, (data->>'lateFee')::double precision, (data->>'nsfFee')::double precision, (data->>'lateFeeGracePeriod')::int, (data->>'delinquencyPeriod')::int, (data->>'createdAt')::timestamptz, (data->>'updatedAt')::timestamptz FROM (SELECT json_array_elements($1::json) AS data) tmp )`;

    await client.connect();
    console.log(`Connected to ${databaseName} database.`);
    console.log('Adding loan settings to loan_settings collection.');

    await client.query(query, [loanSetting]);
    console.log('Loan settings saved successfully.');
  } catch (error) {
    console.log('Could not execute script. Error: ', error);
  } finally {
    await client.end();
    console.log('Connection closed.');
    process.exit(0);
  }
})();
