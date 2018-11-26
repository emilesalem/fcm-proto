import axios from 'axios'

function register(token) {
    return axios({
        method: 'post',
        url: 'http://localhost:54321/register',
        data: {
          token
        }
      })
}

export default {
  register
}