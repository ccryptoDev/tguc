let baseUrl = "http://localhost:5000";
const environment = process.env.NODE_ENV;

if (environment && environment !== "development") {
  baseUrl = "https://tguc.alchemylms.com";
}

const url = baseUrl;
export default url;
