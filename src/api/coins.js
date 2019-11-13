import axios from '@/axios/config';

export default {
    // 查询项目列表
    getCoinsList (params) {
        return axios({
            method: 'get',
            url: '/coinsInfos/selectByCondition',
            params: params
        });
    },
    // 添加项目信息
    addCoinProject (params) {
        return axios.post('/coinsInfos', params);
    },
    // 编辑币种信息
    updateCoinInfo (params) {
        return axios.put('/coinsInfos', params);
    },
    // 获取币种配置信息
    getCoinOptions (params) {
        return axios.get('/coins/' + params.fundsType);
    },
    // 获取币种配置信息
    addCoinOptions (params) {
        return axios.post('/coins', params);
    },
    // 获取币种配置信息
    updateCoinOptions (params) {
        return axios.put('/coins', params);
    },
    // 生成测试地址
    generateAddr (params) {
        return axios.get('/coins/getCoinsAddress/userName/' + params.userName + '/coinsName/' + params.coinsName);
    },
    // 查询保证金记录
    getCoinsBillList (params) {
        return axios({
            method: 'get',
            url: '/coinsBill/getByCId',
            params: params
        });
    },
    // 返还保证金
    returnBailsBill (params) {
        return axios({
            headers: {'Content-Type': 'multipart/form-data'},
            method: 'post',
            url: '/coinsBill/deductUserET',
            params: params
        });
    },
    //获取对应市场
    getmarketList() {
        return axios.get('/config/markets/getTradeArea');
    }
}
