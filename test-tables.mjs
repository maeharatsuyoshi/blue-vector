import "dotenv/config";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.NEON_CONNECTION_STRING);

async function main() {
  const res = await sql.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
  console.log(res);
}

main();
