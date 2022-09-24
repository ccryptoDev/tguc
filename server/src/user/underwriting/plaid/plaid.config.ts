const ddKeyword = [
  'transfer,deposit',
  'payroll,direct deposit',
  'payroll',
  'direct deposit',
  'direct dep',
  'dir dep',
];

const plaid = {
  plaidProductionUrl: 'https://sandbox.plaid.com',
  plaidEnvType: 'sandbox',
  plaidClientId: '61b7d6f795e828001ade68bb',
  plaidSecretKey: '58284bc92a41f2ecabedb91d89773b',
  plaidClientName: 'TGUC',
  plaidVersion: '2020-09-14',
  transactionPeriodDays: 30,
};

if (
  process.env.NODE_ENV == 'production' ||
  process.env.NODE_ENV == 'prod' ||
  process.env.NODE_ENV == 'live'
) {
  plaid.plaidProductionUrl = 'https://production.plaid.com';
  plaid.plaidEnvType = 'production';
  plaid.plaidClientId = '';
  plaid.plaidSecretKey = '';
  plaid.plaidVersion = '2020-09-14';
  (plaid.plaidClientName = 'TGUC'), (plaid.transactionPeriodDays = 30);
}

export default () => ({ ...plaid });
