const dotenv = require('dotenv')

// load dotenv
dotenv.config()


const baseUrl = () => {
    let url = process.env.BASE_URL
    let base = url.replace("http://", "").replace("https://", "")
    let index = base.lastIndexOf(':')
    let port = base.substring(index).replace(":", "")

    return {
        url, port
    }
}

module.exports = {
    baseUrl
}