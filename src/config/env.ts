import { cleanEnv, port, str } from "envalid";
import "dotenv/config";

const env = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ["development", "production"] }),
  PORT: port(),
  DB_URL: str(),
  DB_PASSWORD: str(),
  JWT_SECRET: str(),
  JWT_EXPIRES_IN: str(),
});

export default env;
