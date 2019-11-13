import axios from 'axios';
import qs from 'qs';

module.exports = {
    // 获取资金管理数据
    getData (params) {
        return axios.get('/fundManagerController/getAll', {params});
    },
    // 来源
    getForm () {
        return axios.get('/fundManagerController/getStationName');
    },
    // 数据汇总
    dataCollect (params) {
        return axios.get('/fundManagerController/dataStatis', {params});
    },
    // 冻结
    freeze (params) {
        return axios.get('/fundManagerController/isToBlack', {params});
    },
    // 资产管理撤单
    recall (params) {
        return axios.post('/entrust/cancelCoinsEntrustForFund', qs.stringify(params));
    },
    // 导出订单报表
    exportAssetsList (params) {
        return axios({
            headers: { 'filename': 'utf-8' },
            method: 'post',
            url: '/fundManagerController/exportFund',
            data: params,
            responseType: 'arraybuffer'
        });
    },
    // 查询转账管理
    searchTransfer () {
        return axios.get('/user/transferManager/get');
    },
    // 保存转账管理
    saveTransfer (params) {
        return axios.post('/user/transferManager/save', params);
    },
    // 查询用户转账记录
    searchTransferRecord (params) {
        return axios.post('/user/transferRecord/getTransferRecordByUser', params);
    }
};
