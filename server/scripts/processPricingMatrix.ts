import { Client } from 'pg';

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

const gradeWeightAmounts = {
  'A+': {
    downPayment: 0,
    weightAmts: {
      0: 7000,
      1: 6000,
      2: 6000,
      3: 5000,
      4: 4000,
      5: 2000,
    },
  },
  A: {
    downPayment: 0,
    weightAmts: {
      0: 7000,
      1: 6000,
      2: 6000,
      3: 5000,
      4: 4000,
      5: 2000,
    },
  },
  B: {
    downPayment: 0,
    weightAmts: {
      0: 7000,
      1: 6000,
      2: 5000,
      3: 4000,
      4: 3500,
      5: 2000,
    },
  },
  C: {
    downPayment: 0,
    weightAmts: {
      0: 6000,
      1: 5500,
      2: 4500,
      3: 4000,
      4: 3000,
      5: 2000,
    },
  },
  D: {
    downPayment: 0,
    weightAmts: {
      0: 5000,
      1: 4500,
      2: 4000,
      3: 3500,
      4: 3000,
      5: 2000,
    },
  },
  E: {
    downPayment: 0,
    weightAmts: {
      0: 3500,
      1: 3500,
      2: 3000,
      3: 3000,
      4: 2500,
      5: 2000,
    },
  },
  F: {
    downPayment: 0,
    weightAmts: {
      0: 3500,
      1: 3000,
      2: 3000,
      3: 2500,
      4: 2500,
      5: 2000,
    },
  },
  G: {
    downPayment: 0,
    weightAmts: {
      0: 3000,
      1: 3000,
      2: 2500,
      3: 2500,
      4: 2000,
      5: 2000,
    },
  },
  H: {
    downPayment: 300,
    weightAmts: {
      0: 2000,
      1: 2000,
      2: 2000,
      3: 2000,
      4: 2000,
      5: 2000,
    },
  },
  I: {
    downPayment: 300,
    weightAmts: {
      0: 2000,
      1: 2000,
      2: 2000,
      3: 2000,
      4: 2000,
      5: 2000,
    },
  },
};
const ficoDTIs = {
  '-999_579': {
    '0_10': 'I',
    '10_20': 'I',
    '20_30': 'I',
    '30_40': 'I',
    '40_50': 'I',
    '50_60': 'I',
    '60_100': 'I',
  },
  '580_599': {
    '0_10': 'H',
    '10_20': 'H',
    '20_30': 'H',
    '30_40': 'H',
    '40_50': 'I',
    '50_60': 'I',
    '60_100': 'I',
  },
  '600_619': {
    '0_10': 'H',
    '10_20': 'H',
    '20_30': 'H',
    '30_40': 'H',
    '40_50': 'H',
    '50_60': 'I',
    '60_100': 'I',
  },
  '620_639': {
    '0_10': 'F',
    '10_20': 'G',
    '20_30': 'G',
    '30_40': 'G',
    '40_50': 'H',
    '50_60': 'I',
    '60_100': 'I',
  },
  '640_659': {
    '0_10': 'F',
    '10_20': 'F',
    '20_30': 'G',
    '30_40': 'G',
    '40_50': 'G',
    '50_60': 'H',
    '60_100': 'I',
  },
  '660_669': {
    '0_10': 'E',
    '10_20': 'F',
    '20_30': 'F',
    '30_40': 'G',
    '40_50': 'G',
    '50_60': 'H',
    '60_100': 'I',
  },
  '670_679': {
    '0_10': 'E',
    '10_20': 'E',
    '20_30': 'F',
    '30_40': 'F',
    '40_50': 'G',
    '50_60': 'G',
    '60_100': 'I',
  },
  '680_689': {
    '0_10': 'D',
    '10_20': 'E',
    '20_30': 'E',
    '30_40': 'F',
    '40_50': 'F',
    '50_60': 'G',
    '60_100': 'I',
  },
  '690_699': {
    '0_10': 'D',
    '10_20': 'D',
    '20_30': 'E',
    '30_40': 'E',
    '40_50': 'F',
    '50_60': 'F',
    '60_100': 'I',
  },
  '700_709': {
    '0_10': 'C',
    '10_20': 'D',
    '20_30': 'D',
    '30_40': 'E',
    '40_50': 'D',
    '50_60': 'F',
    '60_100': 'I',
  },
  '710_719': {
    '0_10': 'C',
    '10_20': 'C',
    '20_30': 'D',
    '30_40': 'D',
    '40_50': 'E',
    '50_60': 'E',
    '60_100': 'I',
  },
  '720_729': {
    '0_10': 'B',
    '10_20': 'C',
    '20_30': 'C',
    '30_40': 'D',
    '40_50': 'D',
    '50_60': 'E',
    '60_100': 'I',
  },
  '730_739': {
    '0_10': 'B',
    '10_20': 'B',
    '20_30': 'C',
    '30_40': 'C',
    '40_50': 'D',
    '50_60': 'D',
    '60_100': 'I',
  },
  '740_759': {
    '0_10': 'B',
    '10_20': 'B',
    '20_30': 'B',
    '30_40': 'C',
    '40_50': 'C',
    '50_60': 'D',
    '60_100': 'I',
  },
  '760_779': {
    '0_10': 'A',
    '10_20': 'A',
    '20_30': 'B',
    '30_40': 'B',
    '40_50': 'B',
    '50_60': 'C',
    '60_100': 'I',
  },
  '780_814': {
    '0_10': 'A',
    '10_20': 'A',
    '20_30': 'A',
    '30_40': 'A',
    '40_50': 'A',
    '50_60': 'B',
    '60_100': 'I',
  },
  '815_850': {
    '0_10': 'A',
    '10_20': 'A',
    '20_30': 'A',
    '30_40': 'A',
    '40_50': 'A',
    '50_60': 'A',
    '60_100': 'I',
  },
};
const stateInterests = {
  NM: 24.99,
  NC: 24.99,
  UT: 24.99,
  WI: 24.99,
  AR: 24.99,
};
const termGradeWeightAvls = {
  3: {
    'A+': 0,
    A: 9.99,
    B: 5,
    C: 5,
    D: 5,
    E: 5,
  },
  6: {
    'A+': 0,
    A: 5,
    B: 5,
    C: 5,
    D: 5,
    E: 5,
  },
  12: {
    'A+': 0,
    A: 5,
    B: 5,
    C: 5,
    D: 5,
    E: 5,
  },
  18: {
    'A+': 0,
    A: 5,
    B: 5,
    C: 5,
    D: 5,
    E: 5,
  },
  24: {
    'A+': 0,
    A: 5,
    B: 5,
    C: 5,
    D: 5,
    E: 5,
  },
  36: {
    'A+': 4,
    A: 4,
    B: 4,
    C: 3,
    D: 3,
    E: 2,
  },
  48: {
    'A+': 5,
    A: 3,
    B: 3,
    C: 3,
    D: 3,
    E: 1,
  },
  60: {
    'A+': 5,
    A: 3,
    B: 3,
    C: 3,
    D: 3,
    E: 1,
  },
  72: {
    'A+': 5,
    A: 3,
    B: 3,
    C: 3,
    D: 3,
    E: 1,
  },
  84: {
    'A+': 5,
    A: 3,
    B: 3,
    C: 3,
    D: 3,
    E: 1,
  },
  96: {
    'A+': 5,
    A: 3,
    B: 3,
    C: 3,
    D: 3,
    E: 1,
  },
  108: {
    'A+': 5,
    A: 3,
    B: 3,
    C: 3,
    D: 3,
    E: 1,
  },
  120: {
    'A+': 5,
    A: 3,
    B: 3,
    C: 3,
    D: 3,
    E: 1,
  },
  132: {
    'A+': 5,
    A: 3,
    B: 3,
    C: 3,
    D: 3,
    E: 1,
  },
  144: {
    'A+': 5,
    A: 3,
    B: 3,
    C: 3,
    D: 3,
    E: 1,
  },
  156: {
    'A+': 5,
    A: 3,
    B: 3,
    C: 3,
    D: 3,
    E: 1,
  },
  168: {
    'A+': 5,
    A: 3,
    B: 3,
    C: 3,
    D: 3,
    E: 1,
  },
  180: {
    'A+': 5,
    A: 3,
    B: 3,
    C: 3,
    D: 3,
    E: 1,
  },
};

function generatePricingMatrixData() {
  const rates = [];
  const minLoanAmount = 500;
  Object.keys(stateInterests).forEach((state) => {
    const stateRate = stateInterests[state];
    Object.keys(termGradeWeightAvls).forEach((term) => {
      Object.keys(ficoDTIs).forEach((ficoRange) => {
        const ficoArr = ficoRange.split('_');
        const ficoMin = ficoArr[0];
        const ficoMax = ficoArr[1];
        Object.keys(ficoDTIs[ficoRange]).forEach((dtiRange) => {
          const dtiArr = dtiRange.split('_');
          const dtiMin = dtiArr[0];
          const dtiMax = dtiArr[1];
          const grade = ficoDTIs[ficoRange][dtiRange];
          const termGradeWeightAvl = termGradeWeightAvls[term][grade];
          const gradeWeightAmt = gradeWeightAmounts[grade];
          Object.keys(gradeWeightAmt.weightAmts).forEach((weight) => {
            const maxLoanAmount = gradeWeightAmt.weightAmts[weight];
            if (termGradeWeightAvl) {
              rates.push({
                state,
                term: parseInt(term),
                promoTerm: parseInt(term) / 2,
                ficoMin: parseInt(ficoMin),
                ficoMax: parseInt(ficoMax),
                dtiMin: parseInt(dtiMin),
                dtiMax: parseInt(dtiMax),
                grade,
                minLoanAmount,
                maxLoanAmount,
                adjWeightMax: parseInt(weight),
                downPayment: gradeWeightAmt.downPayment,
                interestRate: stateRate,
                promoInterestRate: 0,
              });
            }
          });
        });
      });
    });
  });
  return rates;
}

async function getStateList(client: Client) {
  let stateList = await client.query(
    `SELECT * FROM state WHERE "stateCode" in ('NM', 'NC', 'UT', 'WI', 'AR')`,
  );

  stateList = stateList.rows.reduce((acc, state) => {
    acc[state.stateCode] = state.id.toString();
    return acc;
  }, {});
  return stateList;
}

async function populateDb() {
  try {
    const query = `INSERT INTO loan_interest_rate("adjWeightMax", "downPayment", "dtiMax", "dtiMin", "ficoMax", "ficoMin", grade, "interestRate", "maxLoanAmount", "minLoanAmount", "promoInterestRate", "promoTerm", "stateCode", term, "createdAt", "updatedAt") (SELECT (data->>'adjWeightMax')::double precision, (data->>'downPayment')::double precision, (data->>'dtiMax')::double precision, (data->>'dtiMin')::double precision, (data->>'ficoMax')::double precision, (data->>'ficoMin')::double precision, (data->>'grade')::text, (data->>'interestRate')::double precision, (data->>'maxLoanAmount')::double precision, (data->>'minLoanAmount')::double precision, (data->>'promoInterestRate')::double precision, (data->>'promoTerm')::int, (data->>'stateCode')::text, (data->>'term')::int, (data->>'createdAt')::timestamptz, (data->>'updatedAt')::timestamptz FROM (SELECT json_array_elements($1::json) AS data) tmp )`;
    await client.connect();
    console.log(`Connected to ${databaseName} database.`);

    const stateList = await getStateList(client);

    let data = generatePricingMatrixData();
    data = data.map((record) => {
      record.stateCode = record.state;
      record.state = stateList[record.stateCode];
      record.createdAt = new Date().toISOString();
      record.updatedAt = new Date().toISOString();

      return record;
    });

    /** delete old loan interest rates **/
    // console.log('deleting old loan_interest_rate');
    // const deleteResult = await db.collection('loan_interest_rate').deleteMany({});
    // console.log('loan_interest_rate delete results:', {
    //   result: deleteResult.result,
    // });

    await client.query('TRUNCATE TABLE loan_interest_rate');

    /** create new loan interest rates **/
    console.log('inserting new loan_interest_rate records');
    await client.query(query, [JSON.stringify(data)]);

    console.log('Records inserted');
    console.log('closing db connection');
  } catch (error) {
    console.log('Could not execute script. Error: ', error);
  } finally {
    await client.end();
    console.log('Connection closed.');
    process.exit(0);
  }
}

// generatePricingMatrixData();
// generateCsv();
populateDb();
