import axios from 'axios'

const API=axios.create({
    // baseURL:'http://localhost:3000/api'
    baseURL:'https://ems-server-t5xr.onrender.com/api'

})


// const API = axios.create({
//   baseURL: 'https://employee-ms-backend-six.vercel.app/api'
// })
export default API;