import axios from 'axios'

module.exports = {
  getData(args) {
    return axios.get('/financial/bill/findByPage', {params: args})
  }
}