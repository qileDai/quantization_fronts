import axios from '@/axios/config';
import qs from 'qs'

export default {
    // 获取用户列表
    getUsers (args) {
        return axios.get('/rbac/all_users/', {params: args});
//         return axios({
//             headers: {'Content-Type': 'application/x-www-form-urlencoded'},
//             transformRequest: [function(data) {      //在请求之前对data传参进行格式转换
//                 data = qs.stringify(data)
//                 return data
//             }],
//             url: '/rbac/all_users/',
//             method: 'get',
//             data:args,
//         })
    },
    // 获取角色列表
    getRoles (params) {
        // /rbac/all_roles/ 
        return axios.get('/rbac/all_roles/', {params})
    },
    // // 新增角色
    addUsers (params) {
        // return axios.post('/rbac/add_users/', params);
        return axios({
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            transformRequest: [function(data) {      //在请求之前对data传参进行格式转换
                data = qs.stringify(data)
                return data
            }],
            url: '/rbac/add_users/',
            method: 'post',
            data: params,
        })
    },
    // // 编辑角色
    editUsers (params) {
    // /rbac/edit_role/
        // return axios.post('/rbac/edit_users', params);
        return axios({
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            transformRequest: [function(data) {      //在请求之前对data传参进行格式转换
                data = qs.stringify(data)
                return data
            }],
            url: '/rbac/edit_users/',
            method: 'post',
            data: params,
        })
    },
    // // 删除用户
    deleteUsers (params) {
        return axios({
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            transformRequest: [function(data) {      //在请求之前对data传参进行格式转换
                data = qs.stringify(data)
                return data
            }],
            url: '/rbac/delete_users/',
            method: 'post',
            data: params,
        })
    },
    // 获取菜单
    getMenuList() {
        // /rbac/selectmenu
        return axios.get('/rbac/selectmenu')
    },
    // // 修改密码
    updatePwd (params) {
        // return axios.post('/sysUser/updatePassword', params);
        return axios({
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            transformRequest: [function(data) {      //在请求之前对data传参进行格式转换
                data = qs.stringify(data)
                return data
            }],
            url: '/rbac/updatepw/',
            method: 'post',
            data: params,
        })
    },
    // // 新增角色
    addRoles (params) {
        // return axios.post('/sysRole/save', params);
        return axios({
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            transformRequest: [function(data) {      //在请求之前对data传参进行格式转换
                data = qs.stringify(data)
                return data
            }],
            url: '/rbac/add_roles/',
            method: 'post',
            data: params,
        })
    },
    // // 编辑角色
    editRoles (params) {
        return axios({
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            transformRequest: [function(data) {      //在请求之前对data传参进行格式转换
                data = qs.stringify(data)
                return data
            }],
            url: '/rbac/edit_role/',
            method: 'post',
            data: params,
        })
    },
    // // 删除角色
    deleteRoles (params) {
        return axios({
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            transformRequest: [function(data) {      //在请求之前对data传参进行格式转换
                data = qs.stringify(data)
                return data
            }],
            url: '/rbac/delete_roles/',
            method: 'post',
            data: params,
        })
    },
    // // 分配权限
    distribution(params) {
        return axios.post('/rbac/allot_permission/', params)
//         return axios({
//             headers: {'Content-Type': 'application/x-www-form-urlencoded'},
//             transformRequest: [function(data) {      //在请求之前对data传参进行格式转换
//                 data = qs.stringify(data)
//                 return data
//             }],
//             url: '/rbac/allot_permission/',
//             method: 'post',
//             data: params,
//         })
    },
    // // 获取用户列表
    // getRoles () {
    //     return axios.get('/rbac/all_roles/');
    // },
    // // 新增角色
    // addRoles (params) {
    //     return axios.post('/sysRole/save', params);
    // },
    // // 编辑角色
    // editRoles (params) {
    //     return axios.post('/sysRole/update', params);
    // },
    // // 分配权限
    // distribution(params) {
    //     return axios.post('/sysRole/distribution', params)
    // },
    // getMenuList() {
    //     return axios.get('/sysRole/selectMenu')
    // },
    // // 删除角色
    // deleteRoles (params) {
    //     return axios.post('/sysRole/delete/' + params.id);
    // },
    // // 获取用户列表
    // getUsers (args) {
    //     return axios.get('/rbac/all_users/', {params: args});
    // },
    // // 新增用户
    // addUsers (params) {
    //     return axios.post('/rbac/add_users/', params);
    // },
    // // 编辑用户
    // editUsers (params) {
    //     return axios.put('/sysUser/edit', params);
    // },
    // // 删除用户
    // deleteUsers (params) {
    //     return axios.delete('/sysUser/delete/' + params.id);
    // },
    // // 修改密码
    // updatePwd (params) {
    //     return axios.post('/sysUser/updatePassword', params);
    // },
    // // 获取谷歌验证标识
    // getGoogleSecret () {
    //     return axios.get('/sysUser/getGoogleSecret');
    // },
    // // 获取所有定制交易所
    // getCustoms() {
    //     return axios.get('/sysUser/getStationList')
    // }
}
