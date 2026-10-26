import axios from 'axios'

// Build produksi disajikan oleh backend, jadi API ada di alamat yang sama dengan halaman (localhost/IP mana pun).
// Saat development (npm start, port 3000) alamat API diambil dari .env.development.
axios.defaults.baseURL = process.env.REACT_APP_API_URL || window.location.origin

export default axios
