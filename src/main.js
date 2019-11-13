import Vue from 'vue';
import iView from 'iview';
import {router} from './router/index';
import {appRouter} from './router/router';
import store from './store';
import App from './app.vue';
import '@/locale';
import 'iview/dist/styles/iview.css';
import VueI18n from 'vue-i18n';
import util from './libs/util';
import Cookies from "js-cookie";
import api from '@/api/systems';
import VueClipboard from 'vue-clipboard2';
import Router from 'vue-router'
const routerPush = Router.prototype.push
    Router.prototype.push = function push(location) {
    return routerPush.call(this, location).catch(error=> error)
};

// import Router from 'vue-router'
// const routerPush = Router.prototype.push
//     Router.prototype.push = function push(location) {
//     return routerPush.call(this, location).catch(error=> error)
// };

Vue.use(VueI18n);
Vue.use(iView);
Vue.use(VueClipboard);

// import Router from 'vue-router'
// const routerPush = Router.prototype.push
//     Router.prototype.push = function push(location) {
//     return routerPush.call(this, location).catch(error=> error)
// }

import JSEncrypt from 'jsencrypt';

Vue.prototype.$getRsaCode = function(str, key){ // 注册方法 
    let pubKey = key;
    let encryptStr = new JSEncrypt();
    encryptStr.setPublicKey(pubKey); // 设置 加密公钥
    let data = encryptStr.encrypt(str);  // 进行加密
    return data;
}


// 全局控制按钮权限 first一级菜单名 second二级菜单名 参数：key要判断的权限值
Vue.prototype.g_perm = (key) => {
    if (store.state.app.currentPath.length > 0) {
        const first = store.state.app.currentPath[0].title;
        const second = store.state.app.currentPath[1].title;

        const navList = store.state.app.navList;
        // console.log(navList)
        let firstList = navList.filter((item, index) => {
            return item.name === first;
        });
        let secondList = firstList[0].list.filter((item, index) => {
            return item.name === second;
        });
        // console.log(firstList)
        // console.log(secondList)
        for (let i = 0; i < secondList[0].list.length; i++) {
            if (secondList[0].list[i].perms.split(':')[1] === key) {
                return true;
            }
        }
        return false;
    }
}

Vue.prototype.$isCustomize = function() {
    // 如果是定制交易所， 返回false，（有些字段不给显示）
    return !this.$store.state.user.customizeStatus
}

new Vue({
    el: '#app',
    router: router,
    store: store,
    render: h => h(App),
    data: {
        currentPageName: ''
    },
    mounted () {
        this.currentPageName = this.$route.name;
        // 显示打开的页面的列表
        this.$store.commit('setOpenedList');
        this.$store.commit('initCachepage');

        // this.getAllUserMenus();
        // 权限菜单过滤相关
        this.$store.commit('updateMenulist');
        // iview-admin检查更新
        // util.checkUpdate(this);
    },
    created () {
        let tagsList = [];
        appRouter.map((item) => {
            if (item.children.length <= 1) {
                tagsList.push(item.children[0]);
            } else {
                tagsList.push(...item.children);
            }
        });
        this.$store.commit('setTagsList', tagsList);
    },
    methods: {
        getAllUserMenus () {
            if (window.location.href.indexOf('login') === -1 && Cookies.get('user')) {
                // console.log('main.js')
                api.getUserMenuList().then((res) => {
                    if (res.data.code == 200) {
                        this.$store.commit('updateNavList', res.data.data);
                        util.accessList(res.data.data);
                        this.$store.commit('updateMenulist');
                    } else {
                        this.$store.commit('updateNavList', []);
                        appRouter.length = 0;
                        this.$store.commit('updateMenulist');
                    }
                });
            }
        }
    }
});
