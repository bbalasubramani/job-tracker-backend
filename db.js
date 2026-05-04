const pg = require('pg')
const {Pool} = pg
require('dotenv').config()
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
})
module.exports = pool