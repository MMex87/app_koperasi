import moment from 'moment'

export const generateFaktur = (val) => {
  let result = ''
  let tahun = moment().format('YY')
  let bulan = moment().format('MM')
  let tanggal = moment().format('DD')
  let jam = moment().format('HH')
  let menit = moment().format('mm')
  let detik = moment().format('ss')

  result = val + tahun + bulan + tanggal + jam + menit + detik


  return result
}


// generate Faktur dengan random

// export const generateFaktur = () => {
//   let result = ''
//   const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
//   const charactersLength = characters.length;

//   for (let i = 0; i < 15; i++) {
//     // mengambil karakter acak dari array
//     result += characters.charAt(Math.floor(Math.random() * charactersLength));
//   }

//   return result
// }