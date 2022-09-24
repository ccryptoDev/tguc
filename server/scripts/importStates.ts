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
const codeState: [code: string, stateName: string][] = [
  ['KY', 'Kentucky'],
  ['FL', 'Florida'],
  ['CA', 'California'],
  ['TX', 'Texas'],
  ['AL', 'Alabama'],
  ['AK', 'Alaska'],
  ['AZ', 'Arizona'],
  ['AR', 'Arkansas'],
  ['CO', 'Colorado'],
  ['CT', 'Connecticut'],
  ['DE', 'Delaware'],
  ['DC', 'District of Columbia'],
  ['ME', 'Maine'],
  ['MT', 'Montana'],
  ['NE', 'Nebraska'],
  ['NV', 'Nevada'],
  ['NH', 'New Hampshire'],
  ['NJ', 'New Jersey'],
  ['NM', 'New Mexico'],
  ['NY', 'New York'],
  ['NC', 'North Carolina'],
  ['ND', 'North Dakota'],
  ['OH', 'Ohio'],
  ['OK', 'Oklahoma'],
  ['OR', 'Oregon'],
  ['MD', 'Maryland'],
  ['MA', 'Massachusetts'],
  ['MI', 'Michigan'],
  ['MS', 'Mississippi'],
  ['MN', 'Minnesota'],
  ['MO', 'Missouri'],
  ['PA', 'Pennsylvania'],
  ['RI', 'Rhode Island'],
  ['SC', 'South Carolina'],
  ['SD', 'South Dakota'],
  ['TN', 'Tennessee'],
  ['UT', 'Utah'],
  ['VT', 'Vermont'],
  ['VA', 'Virginia'],
  ['WA', 'Washington'],
  ['WV', 'West Virginia'],
  ['WI', 'Wisconsin'],
  ['WY', 'Wyoming'],
  ['HI', 'Hawaii'],
  ['IN', 'Indiana'],
  ['IA', 'Iowa'],
  ['KS', 'Kansas'],
  ['LA', 'Louisiana'],
  ['ID', 'Idaho'],
  ['IL', 'Illinois'],
  ['GA', 'Georgia'],
];
const states = codeState.map((cs) => {
  return {
    id: uuidv4(),
    stateCode: cs[0],
    name: cs[1],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
});

(async () => {
  try {
    const query = `INSERT INTO state(id, "stateCode", name, "createdAt", "updatedAt") (SELECT (data->>'id')::uuid, (data->>'stateCode')::text, (data->>'name')::text, (data->>'createdAt')::timestamptz, (data->>'updatedAt')::timestamptz FROM (SELECT json_array_elements($1::json) AS data) tmp )`;

    await client.connect();
    console.log(`Connected to ${databaseName} database.`);

    console.log('Adding initial states to "state" collection.');

    await client.query(query, [JSON.stringify(states)]);
    console.log('States saved');

    console.log('Connection closed.');
  } catch (error) {
    console.log('Could not execute script. Error: ', error);
  } finally {
    await client.end();
    console.log('Connection closed.');
    process.exit(0);
  }
})();
