// 交易对配置接口
import axios from 'axios'
import qs from 'qs'

module.exports = {
  // 获取所有交易对
  getMarket() {
    return axios.get('/userStationMarket/choose')
  },
  // 获取已选交易对
  getSelected() {
    return axios.get('/userStationMarket/getUserMarkets')
  },
  // 保存配置
  saveConfig(params) {
    return axios.post('userStationMarket/savePair', qs.stringify({marketIds: params}))
  }
}