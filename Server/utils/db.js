import oracledb from "oracledb";
import { config } from "dotenv";
config();


async function connectDB() {
  try {
    // console.log("DB_USER:", process.env.DB_USER);
    // console.log("DB_PASSWORD:", process.env.DB_PASSWORD ? "********" : "NOT SET");
    // console.log("DB_CONNECTION_STRING:", process.env.DB_CONNECTION_STRING);

    const connection = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectionString: process.env.DB_CONNECTION_STRING,
    });

    console.log("Connected to Oracle DB");
    const result = await connection.execute(
      "SELECT 'Connection Successful' AS status FROM dual"
    );
    console.log("DB Test Query Result:", result.rows[0][0]);

    return connection;
  } catch (err) {
    console.error("Connection failed:", err);
  }
}

export default connectDB;

