import axios from 'axios'
import qs from 'qs'

module.exports = {
  // 保存
  saveConfig(params) {
    return axios.post('/userStationMarket/saveRecommend', qs.stringify({marketIds: params}))
  },
  // 名字logo保存
  nameLogoSave(params) {
    return axios.post('/userStationMarket/updateStationInfo', params)
  },
  // 获取交易所信息（名称、logo)
  trasactionMsg() {
    return axios.get('/userStationMarket/getUserStation')
  }
}