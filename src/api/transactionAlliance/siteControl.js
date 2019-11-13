// 站点管理接口
import axios from 'axios'
import qs from 'qs'

module.exports = {
  // 查询
  find (args) {
    return axios.post('/station/findByPage', args)
  },
  // 启用、禁用
  ableOrDisable (args) {
    return axios.post('/station/dnableOrDisable', qs.stringify(args))
  },
  // 释放
  release (args) {
    return axios.post('/station/release', qs.stringify(args))
  },
  // 修改
  update (args) {
    return axios.post('/station/update', qs.stringify(args))
  },
  // 添加定制交易所保存
  customSave(args) {
    return axios.post('/station/addCustomize', qs.stringify(args))
  },
  // 定制交易所编辑
  customEditSave(args) {
    return axios.post('/station/updateCustomize', qs.stringify(args))
  }
}