import axios from '@/axios/config';
import qs from 'qs'

export default {
  // 获取交易手续费表格数据
  getServiceChargeList (params) {
    return axios.post('/transFeeRatio/getTransFeeRatio', qs.stringify(params))
  },
  // 删除表格数据（参数需要JSON格式）
  delServiceCharge (params) {
    return axios.post('/transFeeRatio/deleteTransFeeRatio', params)
  },
  // 新增交易手续费
  addServiceCharge (params) {
    return axios({
        headers: {'Content-Type': 'multipart/form-data'},
        url: '/transFeeRatio/insertTransFeeRatio',
        method: 'post',
        params: params
    })
  },
  // 查询所有的交易对
  searchMarketType () {
    return axios.get('/transFeeRatio/selectMarketType')
  },
  // 编辑更新
  updateServiceCharge (args) {
    return axios.post('transFeeRatio/updateTransFeeRatio', args)
  },
  // vip等级
  getVipRate () {
    return axios.get('transFeeRatio/selectVipRate')
  }
}