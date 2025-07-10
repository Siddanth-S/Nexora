let IS_PROD = true;

const server = IS_PROD
  ? "https://nexora-potn.onrender.com"
  : "http://localhost:3000";

export default server;
