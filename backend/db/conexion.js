import pg from "pg";

export const pool = new pg.Pool({
  user: "postgres",
  host: "localhost",
  database: "bdadminespaciosdeportivos",
  password: "admin",
  port: 5432,
});

