const experian = {
  exp_url: 'https://sandbox-us-api.experian.com',
  exp_username: 'jahangir.abdullayev@trustalchemy.com',
  exp_password: 'p@ss3xperiAn',
  exp_client_id: 'A2uy8cJ95N0TFeZLUZp3F9BONsw6LNGL',
  exp_client_secret: 'sP7fXCBm2Nm1WGZL',
  // exp_subscriber_code: '2633470',
  exp_subscriber_code: '2222222',
};

if (
  process.env.NODE_ENV == 'production' ||
  process.env.NODE_ENV == 'prod' ||
  process.env.NODE_ENV == 'live'
) {
  experian.exp_url = '';
  experian.exp_username = '';
  experian.exp_password = '';
  experian.exp_client_id = '';
  experian.exp_client_secret = '';
  experian.exp_subscriber_code = '';
}

export default () => ({ ...experian });
