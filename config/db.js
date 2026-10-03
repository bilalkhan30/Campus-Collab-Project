import pg from "pg";
import dotenv from "dotenv";

// Loading environment variables
dotenv.config();

// Extract the pool class from pg library
const {Pool} = pg;

// Initializing the connection pool so that concurrent requests does not crash the server
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// A quick eventlistener to let us know that database connected
pool.on('connect', () => {
    console.log("connected to PostgreSQL.");
});

// exporting the pool so other files like controllers can run queries
export default pool;