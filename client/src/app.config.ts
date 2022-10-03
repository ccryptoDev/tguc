let baseUrl = "http://localhost:5000";
const environment = process.env.NODE_ENV;

// THIS CONDITION IS REQUIRED TO USE DATA FROM .env.development.local (can be gitignored) IF IT EXISTS, OTHERWISE WILL BE USING .env.development (cannot be gitignored)
if (
  environment &&
  environment === "development" &&
  process.env.REACT_APP_BASE_URL
) {
  baseUrl = process.env.REACT_APP_BASE_URL;
}

if (environment && environment !== "development") {
  baseUrl = "https://tguc.alchemylms.com";
}

const url = baseUrl;
export default url;
