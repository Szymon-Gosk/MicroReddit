const { Pool } = require('pg');

const connectionString = `postgresql://postgres:tajne@localhost:5433/reddit_db`;

const pool = new Pool({
    connectionString: connectionString,
});

module.exports = { pool };