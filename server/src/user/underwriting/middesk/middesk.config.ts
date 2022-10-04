const middesk = {
  middeskurl: 'https://api-sandbox.middesk.com/v1',
  middeskkey: 'mk_test_cf0098bc1be6d7cddcfc293c',
};

if (
  process.env.NODE_ENV == 'production' ||
  process.env.NODE_ENV == 'prod' ||
  process.env.NODE_ENV == 'live'
) {
  middesk.middeskurl = 'https://api.middesk.com/v1';
  middesk.middeskkey = 'mk_live_dd4f3ae41557fbece909481b';
}
export default () => ({ ...middesk });
