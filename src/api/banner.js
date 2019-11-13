import axios from '@/axios/config';

export default {
    // 获取banner
    getBanners (params) {
        return axios.get('/banners/getBannerListByTypes/type/' + params.type + '/forType/' + params.forType);
    },
    // 提交banner
    addBanner (params) {
        return axios.post('/banners', params);
    },
    // 编辑banner
    editBanner (params) {
        return axios.put('/banners', params);
    },
    // 上架
    upBanner (params) {
        return axios.put('/banners/up', params);
    },
    // 下架
    downBanner (params) {
        return axios.put('/banners/down', params);
    },
    // 删除banner
    deleteBanner (params) {
        return axios.delete('/banners/' + params.id);
    },
    // 移动端新增
    // 获取交互方式
    getOperateWay () {
        return axios.get('/banners/selectInteractWay');
    },
    // 获取市场信息
    getMarketInfos () {
        return axios.get('/banners/selectMarketType');
    },
    // 获取法币交易币种
    getTradeCurrency () {
        return axios.get('/banners/selectLegalTenderCurrency');
    },
    // 获取法币交易类型
    getTradeTypes () {
        return axios.get('/banners/selectLegalTenderType');
    },
    // 获取下拉活动列表
    getSelectActivity (params) {
        return axios.post('/activity/getByName', params);
    },
    // 添加和修改banner页面配置
    AddOrUpdateNetpage (params) {
        return axios.post('/banners/netpage/saveOrupdate', params);
    },
    // 获取banner对应活动配置
    getBannertoActivity (params) {
        return axios.get('/banners/netpage/getByBannerId?bannerId=' + params);
    },
    // 查询所有的交易对
    searchMarketType () {
        return axios.get('/config/markets/getAllRunningMarkets');
    }
};
