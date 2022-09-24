const sendGrid = {
  sendGridAPIKey: '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',
  sendGridFromName: 'TGUC Financial',
  sendGridFromEmail: 'contact@alchemylms.com'
};

if (
  process.env.NODE_ENV == 'production' ||
  process.env.NODE_ENV == 'prod' ||
  process.env.NODE_ENV == 'live'
) {
  sendGrid.sendGridAPIKey = '';
  sendGrid.sendGridFromName = '';
  sendGrid.sendGridFromEmail = '';
}

export default () => ({ ...sendGrid });