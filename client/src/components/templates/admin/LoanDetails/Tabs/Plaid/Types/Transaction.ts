export type Transaction = {
  // eslint-disable-next-line camelcase
  account_id: string;
  // eslint-disable-next-line camelcase
  account_owner: string | null;
  amount: number;
  // eslint-disable-next-line camelcase
  authorized_date: string | null;
  // eslint-disable-next-line camelcase
  authorized_datetime: string | null;
  // eslint-disable-next-line camelcase
  category_id: string;
  category: string[];
  // eslint-disable-next-line camelcase
  check_number: string | null;
  date: string;
  datetime: string | null;
  // eslint-disable-next-line camelcase
  iso_currency_code: string;
  location: {
    address: string | null;
    city: string | null;
    country: string | null;
    lat: string | null;
    lon: string | null;
    // eslint-disable-next-line camelcase
    postal_code: string | null;
    region: string | null;
    // eslint-disable-next-line camelcase
    store_number: string | null;
  };
  // eslint-disable-next-line camelcase
  merchant_name: string | null;
  name: string;
  // eslint-disable-next-line camelcase
  payment_channel?: string | null;
  // eslint-disable-next-line camelcase
  payment_meta?: {
    // eslint-disable-next-line camelcase
    by_order_of: string | null;
    payee: string | null;
    payer: string | null;
    // eslint-disable-next-line camelcase
    payment_method: string | null;
    // eslint-disable-next-line camelcase
    payment_processor: string | null;
    // eslint-disable-next-line camelcase
    ppd_id: string | null;
    reason: string | null;
    // eslint-disable-next-line camelcase
    reference_number: string | null;
  };
  pending: boolean;
  // eslint-disable-next-line camelcase
  pending_transaction_id: string | null;
  // eslint-disable-next-line camelcase
  personal_finance_category: string | null;
  // eslint-disable-next-line camelcase
  transaction_code: string | null;
  // eslint-disable-next-line camelcase
  transaction_id: string;
  // eslint-disable-next-line camelcase
  transaction_type: string;
  // eslint-disable-next-line camelcase
  unofficial_currency_code: string | null;
};
