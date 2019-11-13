import axios from '@/axios/config';
import qs from 'qs'

export default {
    // 登录
    submitLogin (params) {
        // return axios.post('/logins/sys/login', params);
        return axios({
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            transformRequest: [function(data) {      //在请求之前对data传参进行格式转换
                data = qs.stringify(data)
                return data
            }],
            // url: '/login/',
            url: '/login/',
            method: 'post',
            data: params,
        })
    },
    // 退出登录
    loginOut () {
        // return axios.get('/logins/logout');
        return axios.get('/rbac/logout/');
    },
    // 获取公钥
    getPublicKey () {
        return axios.get('/rsa/getPublicKey')
    }
}
