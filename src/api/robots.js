import axios from '@/axios/config';
import qs from 'qs'

export default {
    //创建机器人
    createRobot(params) {
        return axios({
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            transformRequest: [function (data) {      //在请求之前对data传参进行格式转换
                data = qs.stringify(data)
                return data
            }],
            method: 'post',
            url: '/deal/createrobot/',
            data: params
        });
    },
    //获取用户机器人数据
    AllCurrencies(params) {
        return axios({
            headers: { 'Content-Type': 'application/json;charset=UTF-8' },
            // headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            // transformRequest: [function (data) {      //在请求之前对data传参进行格式转换
            //     data = qs.stringify(data)
            //     return params
            // }],
            url: '/deal/robotList/',
            method: 'post',
            data: params,
        });
    },
    //获取机器人数据
    // AllCurrencies(params) {
    // return axios.get('/deal/robotList', {params});
    // },
    //获取机器人配置信息
    robotConfiguration(params) {
        return axios({
            headers: { 'Content-Type': 'application/json;charset=UTF-8' },
            // headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            // transformRequest: [function (data) {      //在请求之前对data传参进行格式转换
            //     data = qs.stringify(data)
            //     return data
            // }],
            url: '/deal/showconfiginfo/',
            method: 'post',
            data: params,
        });
    },
    getmarketList(){
        return axios.get('/deal/getcurrencies/')
    },
    getaccountinfo(params){
        return axios({
            // headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            // transformRequest: [function (data) {      //在请求之前对data传参进行格式转换
            //     data = qs.stringify(data)
            //     return data
            // }],
            url: '/deal/getaccountinfo/',
            method: 'post',
            data: params,
        });

    },
    //获取预警账户
    // warningAccount(params){
    //     return axios({
    //         headers: { 'Content-Type': 'application/json;charset=UTF-8' },
    //         // headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    //         // transformRequest: [function (data) {      //在请求之前对data传参进行格式转换
    //         //     data = qs.stringify(data)
    //         //     return data
    //         // }],
    //         url: '/deal/warning_users/',
    //         method: 'post',
    //         data: params,
    //     });

    // },
    warningAccount(params){
        return axios.get('/deal/warning_users/', {params});
        },
    //创建机器人
    createrRobotsConnection(params){
        return axios({
            headers: { 'Content-Type': 'application/json;charset=UTF-8' },
            // headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            // transformRequest: [function (data) {      //在请求之前对data传参进行格式转换
            //     data = qs.stringify(data)
            //     return data
            // }],
            url: '/deal/createrobot/',
            method: 'post',
            data: params,
        });
    },
    //更改机器人配置 
    modifyRobotConfiguration(params){
        return axios({
            headers: { 'Content-Type': 'application/json;charset=UTF-8' },
            // headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            // transformRequest: [function (data) {      //在请求之前对data传参进行格式转换
            //     data = qs.stringify(data)
            //     return data
            // }],
            url: '/deal/showconfig/',
            method: 'post',
            data: params,
        });

    },
    //机器人运行
    runRobot(params){
        return axios({
            headers: { 'Content-Type': 'application/json;charset=UTF-8' },
            // headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            // transformRequest: [function (data) {      //在请求之前对data传参进行格式转换
            //     data = qs.stringify(data)
            //     return data
            // }],
            url: '/deal/startrobot/',
            method: 'post',
            data: params,
        });

    },
    //保护 解除机器人
    protectiveRobot(params){
        return axios({
            headers: { 'Content-Type': 'application/json;charset=UTF-8' },
            // headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            // transformRequest: [function (data) {      //在请求之前对data传参进行格式转换
            //     data = qs.stringify(data)
            //     return data
            // }],
            url: '/deal/robot_protection/',
            method: 'post',
            data: params,
        });
    },
    //筛选机器人信息
    screeningRobot(params){
        return axios({
            headers: { 'Content-Type': 'application/json;charset=UTF-8' },
            // headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            // transformRequest: [function (data) {      //在请求之前对data传参进行格式转换
            //     data = qs.stringify(data)
            //     return data
            // }],
            url: 'deal/searchrobot/',
            method: 'post',
            data: params,
        });
        

    },
    //机器人详情 
    robotDetails(params){
        return axios({
            headers: { 'Content-Type': 'application/json;charset=UTF-8' },
            // headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            // transformRequest: [function (data) {      //在请求之前对data传参进行格式转换
            //     data = qs.stringify(data)
            //     return data
            // }],
            url: '/deal/showtradedetail/',
            method: 'post',
            data: params,
        });  
    },
    //写入数据库
    renderData(){
        return axios({
            headers: { 'Content-Type': 'application/json;charset=UTF-8' },
            // headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            // transformRequest: [function (data) {      //在请求之前对data传参进行格式转换
            //     data = qs.stringify(data)
            //     return data
            // }],
            url: '/deal/robot_yield/',
            method: 'post',
            data: '',
        });  
    },
    getUserList(){
        return axios.get('deal/selectaccount/');
        },

}
