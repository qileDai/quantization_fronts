import axios from '@/axios/config';

export default {
    // 获取指定用户的资金信息
    getFundsInfoByUser (params) {
        return axios.get('/fund/getPayUserByUserName/' + params.userName);
    },
    // 获取资金转账记录
    getFundsRecords (params) {
        return axios({
            headers: {'Content-Type': 'multipart/form-data'},
            method: 'post',
            url: '/fund/getTransferRecord',
            params: params
        });
    },
    // 资金转账
    fundTransfer (params) {
        return axios({
            headers: {'Content-Type': 'multipart/form-data'},
            method: 'post',
            url: '/fund/transfer/transfer',
            params: params
        });
    },
    // 获取上传的文件列表
    getFundsFiles (params) {
        return axios({
            headers: {'Content-Type': 'multipart/form-data'},
            method: 'post',
            url: '/fund/getFundTransferUpload',
            params: params
        });
    },
    // 添加上传文件
    transferFileUpload (params) {
        return axios({
            headers: {'Content-Type': 'multipart/form-data'},
            method: 'post',
            url: '/fund/transfer/upload',
            params: params
        });
    },
    // 获取已上传文件的内容
    getFilesTransferRecord (params) {
        return axios({
            headers: {'Content-Type': 'multipart/form-data'},
            method: 'post',
            url: '/fund/getFundTransferInfo',
            params: params
        });
    },
    // 批量转账
    transferBatch (params) {
        return axios({
            headers: {'Content-Type': 'multipart/form-data'},
            method: 'post',
            url: '/fund/transfer/batch',
            params: params
        });
    },
    // 提币记录
    extractRecord (args) {
        return axios.get('stationCoin/getStationDownLoad', {params: args})
    },
    // 提币地址
    extractAddress (args) {
        return axios.get('recharge/getReceiveaddr', {params: args})
    },
    // 提币导出表格
    extractExportExcel (args) {
        return axios({
            headers: {'filename': 'utf-8'},
            method: 'POST',
            // url: '/recharge/getDownLoadExcel',
            url: '/stationCoin/getStationDownLoadE',
            data: args,
            responseType: 'arraybuffer'
        });
    },
    // 提币记录：确认操作
    extractConfirm(args) {
        return axios.get('recharge/confirmDownLoad', {params: args})
        
    },
    // 提币记录：取消操作
    extractCancel(args) {
        return axios.get('recharge/cancelDownLoad', {params: args})
    },

    // 充币地址
    topUpAddress (args) {
        return axios.get('recharge/getRechageKey', {params: args})
    },
    // 充币记录
    topUpRecord (args) {
        return axios.get('stationCoin/getStationRechage', {params: args})
    },
    // 充币记录：导出表格
    topUpExportExcel (args) {
        return axios({
            headers: {'filename': 'utf-8'},
            method: 'POST',
            // url: '/recharge/getRechageE',
            url: '/stationCoin/getStationRechageE',
            data: args,
            responseType: 'arraybuffer'
        });
    },
    // 充币记录：同步确认次数
    confirmSync (args) {
        return axios.get('recharge/updateKeyConfirms', {params: args})
    },
    // 充币记录：手动确认
    handConfirm (args) {
        return axios.get('recharge/handConfirm', {params: args})
    },
    // 充币地址：标记
    mark (args) {
        return axios.get('recharge/updateRechageKey', {params: args})
    }

}
