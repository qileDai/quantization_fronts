import axios from '@/axios/config';
import qs from 'qs'

export default {


    //获取用户所有账户信息
    getTomcatList(params) {
        return axios.get('/deal/accountlist/', { params });
    },
    //显示用户资产信息
   assetInformation(params) {
        return axios({
            headers: { 'Content-Type': 'application/json;charset=UTF-8' },
            // headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            // transformRequest: [function (data) {      //在请求之前对data传参进行格式转换
            //     data = qs.stringify(data)
            //     return data
            // }],
            url: '/deal/showcollectasset/',
            method: 'post',
            data: params,
        })
    },
    //显示用户单个账户资产信息
    userAssetInformation(params) {
        return axios({
            // headers: { 'Content-Type': 'application/json;charset=UTF-8' },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            transformRequest: [function (data) {      //在请求之前对data传参进行格式转换
                data = qs.stringify(data)
                return data
            }],
            url: '/deal/showassert/',
            method: 'post',
            data: params,
        })
    },
    //获取添加用户时候的所有平台
    getUserPlatform(params) {
        return axios.get('/deal/addaccount/', { params });
    },
    //添加账户
    addAddaccount(params) {
        return axios({
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            transformRequest: [function (data) {      //在请求之前对data传参进行格式转换
                data = qs.stringify(data)
                return data
            }],
            url: '/deal/addaccount/',
            method: 'post',
            data: params,
        })

    },
    //获取用户的所有币种
    AllCurrencies() {
        return axios.get('/deal/getcurrencies/');
    },
    //账户增资
    increaseCurrency(params) {
        return axios({
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            transformRequest: [function (data) {      //在请求之前对data传参进行格式转换
                data = qs.stringify(data)
                return data
            }],
            url: '/deal/chargeaccount/',
            method: 'post',
            data: params,
        })
    },
    //账户提币
    mentionMoney(params) {
        return axios({
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            transformRequest: [function (data) {      //在请求之前对data传参进行格式转换
                data = qs.stringify(data)
                return data
            }],
            url: '/deal/withdraw/',
            method: 'post',
            data: params,
        })
    },
    //币种配置新增
    newCurrency(params) {
        return axios({
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            transformRequest: [function (data) {      //在请求之前对data传参进行格式转换
                data = qs.stringify(data)
                return data
            }],
            url: '/deal/configcurrency/',
            method: 'post',
            data: params,
        })
    },
    currencyDetermine(params) {
        return axios({
            // traditional:true,
            // headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            headers: { 'Content-Type': 'application/json;charset=UTF-8' },
            // transformRequest: [function (data) {      //在请求之前对data传参进行格式转换
            //     data = qs.stringify(data)
            //     return data
            // }],
            url: '/deal/selectcurrency/',
            method: 'post',
            data: params,
        })
    },
    removeuser(params) {
        return axios({
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            transformRequest: [function (data) {      //在请求之前对data传参进行格式转换
                data = qs.stringify(data)
                return data
            }],
            url: '/deal/deleteaccount/',
            method: 'post',
            data: params,
        })

    },
    editorUser(params) {
        return axios({
            // headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            headers: { 'Content-Type': 'application/json;charset=UTF-8' },
            // transformRequest: [function (data) {      //在请求之前对data传参进行格式转换
            //     data = qs.stringify(data)
            //     return data
            // }],
            url: '/deal/editaccount/',
            method: 'post',
            data: params,
        })
    }

}







