import axios from 'axios';
import store from '@/store/index.js';
import router from '@/router/index';
import env from '../../build/env';
import iView from 'iview';
import locale from '@/locale/locale.js';
import Cookies from 'js-cookie';
import util from '@/libs/util.js';
import md5 from 'md5';  
import qs from 'qs';
import _ from 'underscore';

/* 线下 */
// const ajaxUrl = env === 'development' ? 'http://192.168.1.52:8030/' : 'http://192.168.1.52:8030/'; // 量化后台管理后端本地线
const ajaxUrl = env === 'development' ? 'http://192.168.4.40:8089/' : 'http://192.168.4.40:8089/'; // 量化后台管理
//const ajaxUrl = env === 'development' ? 'http://192.168.4.180:8085/' : 'https://backend.exx-et.com/';


// axios 配置
axios.defaults.timeout = 3600000;

axios.defaults.baseURL = ajaxUrl;

axios.defaults.withCredentials = false;

axios.interceptors.request.use(
    config => {
        if (Cookies.get('sessionid') != '') {
            config.headers.common['sessionid'] = Cookies.get('sessionid');
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// http request 拦截器
/* axios.interceptors.request.use(
    config => {
        var UserInfo = {};
        if (localStorage.AdminInfo) {
            UserInfo = JSON.parse(localStorage.AdminInfo);
        }
        var time = new Date().getTime();
        if (localStorage.exxUserId) {
            config.headers.common['Userid'] = localStorage.exxUserId;
        }
        config.headers.common['Timestamp'] = time;
        config.headers.common['Clienttype'] = '3';
        if (_.isObject(config.data)) {
            config.headers.common['Sign'] = md5(localStorage.exxUserId + time + JSON.stringify(config.data) + UserInfo.token);
        }
        else if (_.isString(config.data)) {
            if (config.data.indexOf('=') > 0) {

                config.headers.common['Sign'] = md5(localStorage.exxUserId + time + util.enryptData(qs.parse(config.data)) + UserInfo.token);
                if (config.data.indexOf('&') > 0) {
                    config.headers.common['Sign'] = md5(localStorage.exxUserId + time + util.enryptData(qs.parse(config.data)) + UserInfo.token);
                }
            } else {
                config.headers.common['Sign'] = md5(localStorage.exxUserId + time + config.data + UserInfo.token);
            }
        } else {
            if (config.method == 'get') {

                if (_.isObject(config.params)) {
                    config.headers.common['Sign'] = md5(localStorage.exxUserId + time + util.enryptData(config.params) + UserInfo.token);
                } else {
                    config.headers.common['Sign'] = md5(localStorage.exxUserId + time + util.enryptData(qs.parse(util.getUrlParams(config.url))) + UserInfo.token);
                }
            } else if (config.data == undefined) {
                config.headers.common['Sign'] = md5(localStorage.exxUserId + time + UserInfo.token);
            } else {
                config.headers.common['Sign'] = md5(localStorage.exxUserId + time + UserInfo.token);
            }
        }
        return config;
    },
    err => {
        return Promise.reject(err);
    }
); */
// http response 拦截器
axios.interceptors.response.use(
    response => {
        // store.commit("HIDELOADING")
        if (response) {
            if (_.isObject(response.data)) {
                /* if (_.isObject(response.data.resMsg)) {
                    if (response.data.resMsg.code != '1') {
                        iView.Message.error(response.data.resMsg.message);
                    }
                } */
                if (response.data.code != '200') {
                    switch (response.data.code) {
                        case 401:
                            iView.Message.error(response.data.msg);

                            // 退出登录
                            Cookies.remove('user');
                            Cookies.remove('password');
                            Cookies.remove('access');
                            Cookies.remove('sessionid');
                            Cookies.remove('userId');
                            // 恢复默认样式
                            let themeLink = document.querySelector('link[name="theme"]');
                            themeLink.setAttribute('href', '');
                            // 清空打开的页面等数据，但是保存主题数据
                            // let theme = '';
                            if (localStorage.theme) {
                                theme = localStorage.theme;
                            }
                            localStorage.clear();
                            if (theme) {
                                localStorage.theme = theme;
                            }
                            // 跳至登录
                            setTimeout(() => {
                                window.location.href = '/';
                            }, 1000);

                            break;
                        case -1:
                            // code -1 谷歌验证错误 做单独处理
                            break;
                        case undefined:
                            // 没有返回code 做单独处理
                            break;
                        default:
                            // 返回接口返回的错误信息
                            iView.Message.error({
                                content: response.data.message || 'error',
                                duration: 10,
                                closable: true
                            });
                            // iView.Message.error(response.data.msg || 'error');
                    }
                }
            }
        }
        return response;
    },
    error => {
        // store.commit("HIDELOADING")
        if (error.response) {
            switch (error.response.status) {
                case 504:
                    iView.Message.error('504 error');
                    break;
                case 500:
                    iView.Message.error('500 error');
                    break;
                case 404:
                    iView.Message.error('404 error');
                    break;
                default:
                    // 返回接口返回的错误信息
                    // iView.Message.error(error.message);
                    iView.Message.error({
                        content: error.message,
                        duration: 10,
                        closable: true
                    });
            }
        }
        return Promise.reject(error);
    }
);

export default axios;
