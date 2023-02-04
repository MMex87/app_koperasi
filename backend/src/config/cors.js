const dotenv = require('dotenv')


// Dotenv load
dotenv.config()


// CORS Configuration

const corsOption = (req, res, next) => {
    res.header("Access-Control-Allow-Origin", process.env.ALLOW_ORIGIN);
    res.header("Access-Control-Allow-Headers", process.env.ALLOW_HEADER);
    res.header("Access-Control-Allow-Methods", process.env.ALLOW_METHOD);
    res.type("application/json");

    next();
}

module.exports = corsOption