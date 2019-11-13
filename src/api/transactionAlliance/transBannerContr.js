// 这是交易所联盟模块的 banner 管理页面 api 接口

import axios from '@/axios/config'
import qs from 'qs'

module.exports = {
  // 获取交易所联盟 banner 管理数据
  getTransBanner (args) {
    return axios.get('stationbanner/findByPage', {params: args})
  },
  // 编辑
  updateTransBanner (args) {
    return axios.post('stationbanner/update', qs.stringify(args))
  },
  // 删除
  deleteTransBanner (args) {
    return axios.post('stationbanner/delete', qs.stringify(args))
  },
  // 增加广告位
  addBanner(args) {
    return axios.post('stationbanner/save', args)
  },
  // 上下架
  upOrDownTransBanner (args) {
    return axios.post('stationbanner/upOrDown', qs.stringify(args))
  },
}