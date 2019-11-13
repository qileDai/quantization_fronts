import axios from '@/axios/config';

export default {
    // 获取实名认证列表
    getVerifiedList (params) {
        return axios.post('/authentication', params);
    },
    // 获取认证历史
    getVerifiedHistory (params) {
        return axios.post('/authentication/getAuthenticationLogs', params);
    },
    // 认证次数清零
    clearVerifiedTimes (params) {
        return axios.post('/authentication/updateAuthenticationTimes', params);
    },
    // 查看认证详情
    viewVerifiedDetail (params) {
        return axios.post('/authentication/getDetails', params);
    },
    // // 审核通过&不通过
    // doVerified (params) {
    //     return axios.post('/authentication/updateDatas', params);
    // },
    // 审核通过
    pass (params) {
        return axios.post('/authentication/pass', params);
    },
    // 不审核通过
    notpass (params) {
        return axios.post('/authentication/notpass', params);
    },
    // 订单管理列表
    orderManageList (params) {
        return axios.post('/order', params);
    },
    // 导出订单报表
    exportOrderList (data) {
        return axios({
            headers: {'filename': 'utf-8'},
            method: 'post',
            url: '/order/downOrderExcel',
            data: data,
            responseType: 'arraybuffer'
        });
    },
    // 申诉管理列表
    appealManageList (params) {
        return axios.post('/appeal', params);
    },
    // 申诉详情
    appealDetails (params) {
        return axios.post('/appeal/details', params);
    },
    // 仲裁
    doArbitration (params) {
        return axios.post('/appeal/update', params);
    },
    // 获取当前认证方式
    getVerifiedWays () {
        return axios.get('/userAuthentication/getAuthenticationModelList');
    },
    // 切换认证通道
    switchVerifiedWay (params) {
        return axios.post('/userAuthentication/updateAuthenticationStatus', params);
    },
    // bitmal订单列表
    bitMallOrders (params) {
        return axios.post('/bitmall/getBitMallListPage', params);
    },
    bitMallExportOrders (params) {
        return axios({
            headers: {'filename': 'utf-8'},
            method: 'post',
            url: '/bitmall/exportOrder',
            data: params,
            responseType: 'arraybuffer'
        });       
    }
}
