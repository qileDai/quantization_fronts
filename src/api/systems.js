import axios from '@/axios/config';
import qs from 'qs'

export default {
    // 获取菜单列表
    getMenuList () {
        return axios.get('/rbac/selectmenu');
    },
    // 添加菜单
    addMenus (params) {
        return axios.post('/sysMenu/save', params);
    },
    // 编辑菜单
    editMenus (params) {
        return axios.put('/sysMenu/edit', params);
    },
    // 删除菜单
    deleteMenus (params) {
        return axios.delete('/sysMenu/' + params.id);
    },
    // 获取用户权限内的菜单列表
    getUserMenuList () {
        return axios.get('/rbac/all_menus/');
    },
    // 获取邮箱后缀列表
    getMailsList () {
        return axios.get('/user');
    },
    // 新增邮箱后缀
    addEmails (params) {
        return axios.post('/user/getEmailModelAdd', params);
    },
    // 编辑邮箱后缀
    updateEmails (params) {
        return axios.put('/user/getEmailModelUpdate', params);
    },
    // 编辑禁用
    disabledEmail (params) {
        return axios.put('/user/emailDisable', params);
    },
    // 编辑启用
    undisableEmail (params) {
        return axios.put('/user/emailEnable', params);
    },
    // 获取验证码列表
    getVerificationList (params) {
        return axios.post('/sendCode', params);
    },

    // 获取VIP等级数据
    getVipRate () {
        return axios.get('userVipLevel/getUserVipLevel')
    },
    // 新增 VIP等级
    addVipRate (args) {
        return axios.post('userVipLevel/insertUserVipLevel', qs.stringify(args))
    },
    // 编辑 VIP等级
    updateVipRate (args) {
        return axios.post('userVipLevel/updateUserVipLevel', args)
    },
    // 删除 VIP等级
    delVipRate (args) {
        return axios.post('userVipLevel/deleteUserVipLevel', args)
    },
    // 获取通道列表
    getChannelList () {
        return axios.get('/msg/getMsgSettingsList');
    },
    // 添加通道
    addChannel (params) {
        return axios.post('/msg/saveMsgSetting', params);
    },
    // 编辑通道
    updateChannel (params) {
        return axios.put('/msg/updateMsgSetting', params);
    },
    // 切换通道
    cutChannel(params) {
        return axios.put('/msg/switchMsg', params);
    },
}
