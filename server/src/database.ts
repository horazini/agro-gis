import { Pool } from "pg";

import dbconnect from "./config";

const pool = new Pool({  
  user: dbconnect.user,
  password: dbconnect.password,
  host: dbconnect.host,
  port: dbconnect.port,
  database: dbconnect.database,
});

export default pool