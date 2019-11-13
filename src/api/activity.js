import axios from '@/axios/config';

export default {
    // 获取活动列表
    getActivitiesList () {
        return axios.get('/activity');
    },
    // 筛选活动列表
    filterActivitiesList (params) {
        return axios.post('/activity/getActivitySettingByConditions', params);
    },
    // 获取赠送币种
    findFundsList () {
        return axios.get('/activity/getAllFundsType');
    },
    // 添加活动
    addActivities (params) {
        return axios.post('/activity/saveActivitySetting', params);
    },
    // 编辑更新活动
    updateActivities (params) {
        return axios.put('/activity/updateActivitySetting', params);
    },
    // 上架&下架活动
    operateActivities (params) {
        return axios.put('/activity/putaway', params);
    },
    // 以下为活动新增接口
    // 获取所有活动名称
    getActivityLabels (params) {
        return axios.get('/tradingActivities/getAllTradingName', {params});
    },
    // 获取活动统计（注册）
    getRegisterStatistics (params) {
        return axios.post('/RegisterActivities/getActivitiesByCondition', params);
    },
    // 导出Excel（注册）
    exportRegisterList (data) {
        return axios({
            headers: {'filename': 'utf-8'},
            method: 'post',
            url: '/RegisterActivities/downLoadRegisterExcel',
            data: data,
            responseType: 'arraybuffer'
        });
    },
    // 获取活动统计（充值）
    getPayinStatistics (params) {
        return axios.post('/rechargeActivity', params);
    },
    // 导出Excel（充值）
    exportPayinList (data) {
        return axios({
            headers: {'filename': 'utf-8'},
            method: 'post',
            url: '/rechargeActivity/downRechargeExcel',
            data: data,
            responseType: 'arraybuffer'
        });
    },
    // 获取活动统计（交易）
    getExchangeStatistics (params) {
        return axios.post('/tradingActivities/getActivitiesByCondition', params);
    },
    // 导出Excel（交易）
    exportExchangeList (data) {
        return axios({
            headers: {'filename': 'utf-8'},
            method: 'post',
            url: '/tradingActivities/downLoadTradingExcel',
            data: data,
            responseType: 'arraybuffer'
        });
    },
    // 获取活动统计（红包）
    getRewardStatistics (params) {
        return axios.post('/envelope/getEnvelopeList', params);
    },
    // 导出Excel（红包）
    exportRewardList (data) {
        return axios({
            headers: {'filename': 'utf-8'},
            method: 'post',
            url: '/envelope/downloadExcel',
            data: data,
            responseType: 'arraybuffer'
        });
    }
}
