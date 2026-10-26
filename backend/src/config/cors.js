const dotenv = require('dotenv')


// Dotenv load
dotenv.config()


// CORS Configuration

const corsOption = (req, res, next) => {
    res.header("Access-Control-Allow-Origin", process.env.ALLOW_ORIGIN);
    // Header PIN admin & nama operator selalu diizinkan (dipakai aksi sensitif tanpa login)
    res.header("Access-Control-Allow-Headers", [process.env.ALLOW_HEADER, "X-Admin-Pin, X-Admin-Operator"].filter(Boolean).join(", "));
    res.header("Access-Control-Allow-Methods", process.env.ALLOW_METHOD);
    res.type("application/json");

    next();
}

module.exports = corsOption