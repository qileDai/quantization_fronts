import Vue from 'vue';
import iView from 'iview';
import Util from '../libs/util';
import VueRouter from 'vue-router';
import Cookies from 'js-cookie';
import {routers, otherRouter, appRouter} from './router';
import env from '../../build/env';
import menuApi from '@/api/systems';
import store from '../store';

Vue.use(VueRouter);

// 路由配置
const RouterConfig = {
    mode: env === 'development' ? 'hash' : 'history',
    routes: routers
};

export const router = new VueRouter(RouterConfig);

router.beforeEach((to, from, next) => {
    iView.LoadingBar.start();
    Util.title(to.meta.title);
    // if (!Cookies.get('isCustomize') && to.name !== 'login') {
    //     next({
    //         name: 'login'
    //     });
    //     // store.dispatch('isCustomize', 1)
    // } else {
    //     // store.commit('logout');
    //     // next({
    //     //     name: 'login'
    //     // });
    // }
    if (Cookies.get('locking') === '1' && to.name !== 'locking') { // 判断当前是否是锁定状态
        next({
            replace: true,
            name: 'locking'
        });
    } else if (Cookies.get('locking') === '0' && to.name === 'locking') {
        next(false);
    } else {
        if (!Cookies.get('user') && to.name !== 'login' ) { // 判断是否已经登录且前往的页面不是登录页 跳转到登录页
            Cookies.remove('sessionid')
            Cookies.remove('userId')
            Cookies.remove('isCustomize')
            next({
                name: 'login'
            });
        } else if (!Cookies.get('isCustomize') && to.name !== 'login') {
            Cookies.remove('user')
            Cookies.remove('sessionid')
            Cookies.remove('userId')
            // if(to.name === 'login') {
            //     next()
            //     return
            // }
            next({
                name: 'login'
            });
        } else if ( Cookies.get('user') && to.name === 'login') { // 判断是否已经登录且前往的是登录页 跳转到主页
            Util.title();

            // console.log('index.js1')
            menuApi.getUserMenuList().then((res) => {
                if (res.data.code == 200) {
                    store.commit('updateNavList', res.data.data.menuList);
                    Util.accessList(res.data.data.menuList);
                } else {
                    store.commit('updateNavList', []);
                    appRouter.length = 0;
                }
                // console.log(JSON.stringify(appRouter))
                for (let i = 0; i < appRouter.length; i++) {
                    if (appRouter[i].access === 1) {
                        for (let j = 0; j < appRouter[i].children.length; j++) {
                            if (appRouter[i].children[j].access === 1) {
                                console.log(appRouter[i].children[j].name)
                                next({
                                    name: appRouter[i].children[j].name
                                });
                                break;
                            }
                        }
                        break;
                    }
                }
            });
            // next({
            //     name: 'home_index'
            // });
        } else {
            if(Cookies.get('isCustomize') && Cookies.get('isCustomize') === '0') {
                store.dispatch('isCustomize', 0)
            } else {
                store.dispatch('isCustomize', 1)
            }
            if (window.location.href.indexOf('login') === -1 && Cookies.get('user')) {
                // console.log('index.js2')
                menuApi.getUserMenuList().then((res) => {
                    if (res.data.code == 200) {
                        store.commit('updateNavList', res.data.data.menuList);
                        Util.accessList(res.data.data.menuList);
                    } else {
                        store.commit('updateNavList', []);
                        appRouter.length = 0;
                    }

                    const curRouterObj = Util.getRouterObjByName([otherRouter, ...appRouter], to.name);
                    // console.log(JSON.stringify(curRouterObj))
                    if (curRouterObj && curRouterObj.access !== undefined) { // 需要判断权限的路由
                        if (curRouterObj.access === parseInt(Cookies.get('access'))) {
                            Util.toDefaultPage([otherRouter, ...appRouter], to.name, router, next); // 如果在地址栏输入的是一级菜单则默认打开其第一个二级菜单的页面
                        } else {
                            next({
                                replace: true,
                                name: 'error-403'
                            });
                        }
                    } else { // 没有配置权限的路由, 直接通过
                        Util.toDefaultPage([...routers], to.name, router, next);
                    }
                });
            } else {
                // 直接通过
                Util.toDefaultPage([...routers], to.name, router, next);
            }
        }
    }
});

router.afterEach((to) => {
    Util.openNewPage(router.app, to.name, to.params, to.query);
    iView.LoadingBar.finish();
    window.scrollTo(0, 0);
});
