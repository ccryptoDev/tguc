const sendGrid = {
  sendGridAPIKey:
    // 'SG.bGOc59rARNOp1aXEjzja2w.gAR-NFzR0OcffP0qW7hlS-KJ7im5vzT81UwkduMD1rQM',
    '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',
  sendGridFromName: 'TGUC Financial',
  sendGridFromEmail: 'support@tgucfinancial.com',
};

if (
  process.env.NODE_ENV == 'production' ||
  process.env.NODE_ENV == 'prod' ||
  process.env.NODE_ENV == 'live'
) {
  sendGrid.sendGridAPIKey =
    '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';
  sendGrid.sendGridFromEmail = 'support@tgucfinancial.com';
}

export default () => ({ ...sendGrid });
