import axios from '@/axios/config';

export default {
    // 发放列表
    getIssueList (params) {
        // return axios.get('/et/getETDigMineListByTime/' + params.timestamp);
        return axios.get('/et/getETDigMineListPageByTime/' + params.timestamp + '/pageNum/' + params.pageNum + '/pageSize/' + params.pageSize);
    },
    // 发放et
    doIssueEt (params) {
        return axios.get('/et/dellUserDig/' + params.timestamp);
    },
    // et发放统计
    // getEtStatistic (params) {
    //     return axios.get('/et/getDigPayRecordListByTime/' + params.timestamp);
    // },
    // 分红待发放列表
    getEtBonus (params) {
        // return axios.get('/etIncome/getEtIncomeSumModelListByTime/' + params.times);
        return axios.get('/etIncome/getEtIncomeSumModelListPageByTime/' + params.times + '/pageNum/' + params.pageNum + '/pageSize/' + params.pageSize);
    },
    // 已发放分红记录
    getEtBonusRecords (params) {
        // return axios.get('/etIncome/getIncomeLogListByTime/' + params.times);
        return axios.get('/etIncome/getIncomeLogListPageByTime/' + params.times + '/pageNum/' + params.pageNum + '/pageSize/' + params.pageSize);
    },
    // 分红币种统计
    getEtBonusCoins (params) {
        return axios.post('/etIncome/queryIncome', params);
    },
    // 发放分红
    doEtBonus (params) {
        return axios.get('/etIncome/dellEtIncomeSum/' + params.times);
    },
    // 发放分红
    getEtDigStatistic (params) {
        // return axios.get('/dig/getDigByTime/' + params.timestamp);
        return axios.get('/dig/getDigByTime/' + params.timestamp + '/pageNum/' + params.pageNum + '/pageSize/' + params.pageSize);
    },
    // 时间点发放状态
    getEtIssueStatusByHour (params) {
        return axios.get('/et/getDigDellStatusByTime/' + params.timestamp);
    },
    // 导出分红统计
    downloadStatistics (data) {
        return axios({
            headers: {'filename': 'utf-8'},
            method: 'get',
            url: '/etIncome/getEtIncomeYest',
            data: data,
            responseType: 'arraybuffer'
        });
    }
}
