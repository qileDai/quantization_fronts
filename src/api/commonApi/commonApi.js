import axios from 'axios'

export default {
  // 获取所有币种
  getAllCoins () {
    return axios.get('/recharge/getCoinsName')
  },
  // 用户来源
  getForm() {
    return axios.get('/fundManagerController/getStationName')
  },
}