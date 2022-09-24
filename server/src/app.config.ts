const NODE_ENV = process.env.NODE_ENV;
const databaseName = 'tguc_financial';
let baseUrl = 'http://localhost:5000';
let serverPort = 5000;
let databasePassword = 'password1234';
let dbHost = 'localhost';

if (process.env.NODE_ENV === 'test') {
  baseUrl = 'https://tguc.alchemylms.com';
  serverPort = 13000;
  databasePassword = '@lchemy@123$';
  dbHost = '44.227.154.31';
}

export default () => ({
  NODE_ENV: NODE_ENV || 'development',
  dbHost,
  serverPort,
  baseUrl,
  databaseUsername: 'postgres',
  databasePassword,
  databasePort: 5432,
  synchronizeDatabase: true,
  databaseName,
});
