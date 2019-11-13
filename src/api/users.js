import axios from '@/axios/config';
import qs from 'qs'

export default {
    // 获取用户列表
    getUserList(params) {
        // return axios.post('/userManagement', params);
        return axios.post('/stationUserManager/userList', params);
    },
    // 根据用户名搜索用户
    findUserByUserName(params) {
        return axios.post('userManagement/getUserMangerSelect', params);
    },
    // 编辑用户信息 updateUserInfo (params) {     return
    // axios.post('userManagement/getUserMangerUpdate', params); }, 修改推荐人
    updateUserRecommend(params) {
        return axios.post('/stationUserManager/updateUserRecommend', params);
    },
    // 设置vip等级
    setVip(params) {
        return axios.post('/stationUserManager/updateVipRate', params)
    },
    // 禁用启用
    freezeUser(params) {
        return axios.post('/stationUserManager/updateUserFreez', params)
    },
    // 禁用c2c交易
    disableC2C(params) {
        return axios.post('/stationUserManager/c2cBlackList', params)
    },
    // c2c解冻
    Unfreeze(params) {
        return axios.post('/stationUserManager/updateLimitStatus', params)
    },

    // 超级节点api 获取节点列表
    getSuperNodeList(params) {
        return axios.post('/superNode/getSuperNodeListPage', params);
    },
    // 添加节点列表
    addSuperNode(params) {
        return axios.post('/superNode/save', params);
    },
    // 添加节点列表
    updateSuperNode(params) {
        return axios.put('/superNode/update', params);
    },
    // 删除节点
    deleteSuperNode(params) {
        return axios.delete('/superNode/delete/' + params.id);
    },
    // 查看用户资产
    checkUserAssets(params) {
        return axios.post('/stationUserManager/userFinancialList', params)
    },
    // 用户管理撤单
    recall(params) {
        return axios.post('/entrust/cancelCoinsEntrust', qs.stringify(params))
    },
    // 一键撤单
    allRecall(params) {
        return axios.post('/entrust/cancelEntrust', qs.stringify(params))
    },
    //修改用户手机号码
    changePhoneNumber(params) {
        return axios.post('/stationUserManager/updateMobile' , params)
    }
}
