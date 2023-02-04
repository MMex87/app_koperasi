const { Sequelize } = require("sequelize")
const dotenv = require("dotenv")


// Dotenv load
dotenv.config()

/*============================
 * Configurasi Database
 *============================
 */


const db = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIAL,
        timezone: "+07:00"
    }
)

const connect = async () => {
    try {
        await db.authenticate()
        console.log("Database connect successfull..")
    } catch (error) {
        console.error(error);
    }
}

if (process.env.DB_CONN == "true") {
    connect()
}


module.exports = db