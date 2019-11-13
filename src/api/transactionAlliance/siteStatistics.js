import axios from 'axios'

module.exports = {
  getData(params) {
    return axios.post('/stationSiteStatistics/siteStatistics', params)
  }
}