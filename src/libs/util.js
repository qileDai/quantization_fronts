import axios from 'axios';
import env from '../../build/env';
import semver from 'semver';
import packjson from '../../package.json';
import {appRouter} from '../router/router';

let util = {

};
util.title = function (title) {
    title = title || 'exx 管理后台';
    window.document.title = title;
};

const ajaxUrl = env === 'development'
    ? 'http://127.0.0.1:8888'
    : env === 'production'
        ? 'https://www.url.com'
        : 'https://debug.url.com';

util.ajax = axios.create({
    baseURL: ajaxUrl,
    timeout: 30000
});

util.inOf = function (arr, targetArr) {
    let res = true;
    arr.forEach(item => {
        if (targetArr.indexOf(item) < 0) {
            res = false;
        }
    });
    return res;
};

util.oneOf = function (ele, targetArr) {
    if (targetArr.indexOf(ele) >= 0) {
        return true;
    } else {
        return false;
    }
};

util.showThisRoute = function (itAccess, currentAccess) {
    if (typeof itAccess === 'object' && Array.isArray(itAccess)) {
        return util.oneOf(currentAccess, itAccess);
    } else {
        return itAccess === currentAccess;
    }
};

util.getRouterObjByName = function (routers, name) {
    if (!name || !routers || !routers.length) {
        return null;
    }
    // debugger;
    let routerObj = null;
    for (let item of routers) {
        if (item.name === name) {
            return item;
        }
        routerObj = util.getRouterObjByName(item.children, name);
        if (routerObj) {
            return routerObj;
        }
    }
    return null;
};

util.handleTitle = function (vm, item) {
    if (typeof item.title === 'object') {
        return vm.$t(item.title.i18n);
    } else {
        return item.title;
    }
};

util.setCurrentPath = function (vm, name) {
    let title = '';
    let isOtherRouter = false;
    vm.$store.state.app.routers.forEach(item => {
        if (item.children.length === 1) {
            if (item.children[0].name === name) {
                title = util.handleTitle(vm, item);
                if (item.name === 'otherRouter') {
                    isOtherRouter = true;
                }
            }
        } else {
            item.children.forEach(child => {
                if (child.name === name) {
                    title = util.handleTitle(vm, child);
                    if (item.name === 'otherRouter') {
                        isOtherRouter = true;
                    }
                }
            });
        }
    });
    let currentPathArr = [];
    if ((name.indexOf('_index') >= 0 || isOtherRouter) && name !== 'home_index') {
        // (不在左侧菜单显示的路由写在otherRouter里)直接展示标题
        currentPathArr = [
            {
                title: title,
                path: '',
                name: name
            }
        ];
    } else {
        // 当处于home_index时和普通左侧菜单做相同处理
        let currentPathObj = vm.$store.state.app.routers.filter(item => {
            if (item.children.length <= 1) {
                return item.children[0].name === name;
            } else {
                let i = 0;
                let childArr = item.children;
                let len = childArr.length;
                while (i < len) {
                    if (childArr[i].name === name) {
                        return true;
                    }
                    i++;
                }
                return false;
            }
        })[0];
        // 没有子菜单直接展示
        /* if (currentPathObj.children.length <= 1) {
            currentPathArr = [
                {
                    title: currentPathObj.title,
                    path: '',
                    name: name
                }
            ];
        } else {
            // 有子菜单
            let childObj = currentPathObj.children.filter((child) => {
                return child.name === name;
            })[0];
            currentPathArr = [
                {
                    title: currentPathObj.title,
                    path: '',
                    name: currentPathObj.name
                },
                {
                    title: childObj.title,
                    path: currentPathObj.path + '/' + childObj.path,
                    name: name
                }
            ];
        } */
        // 不管子菜单数量，统一分两级显示
        let childObj = currentPathObj.children.filter((child) => {
            return child.name === name;
        })[0];
        currentPathArr = [
            {
                title: currentPathObj.title,
                path: '',
                name: currentPathObj.name
            },
            {
                title: childObj.title,
                path: currentPathObj.path + '/' + childObj.path,
                name: name
            }
        ];
    }
    vm.$store.commit('setCurrentPath', currentPathArr);

    return currentPathArr;
};

util.openNewPage = function (vm, name, argu, query) {
    let pageOpenedList = vm.$store.state.app.pageOpenedList;
    let openedPageLen = pageOpenedList.length;
    let i = 0;
    let tagHasOpened = false;
    while (i < openedPageLen) {
        if (name === pageOpenedList[i].name) { // 页面已经打开
            vm.$store.commit('pageOpenedList', {
                index: i,
                argu: argu,
                query: query
            });
            tagHasOpened = true;
            break;
        }
        i++;
    }
    if (!tagHasOpened) {
        let tag = vm.$store.state.app.tagsList.filter((item) => {
            if (item.children) {
                return name === item.children[0].name;
            } else {
                return name === item.name;
            }
        });
        tag = tag[0];
        if (tag) {
            tag = tag.children ? tag.children[0] : tag;
            if (argu) {
                tag.argu = argu;
            }
            if (query) {
                tag.query = query;
            }
            vm.$store.commit('increateTag', tag);
        }
    }
    vm.$store.commit('setCurrentPageName', name);
};

util.toDefaultPage = function (routers, name, route, next) {
    let len = routers.length;
    let i = 0;
    let notHandle = true;
    while (i < len) {
        if (routers[i].name === name && routers[i].children && routers[i].redirect === undefined) {
            route.replace({
                name: routers[i].children[0].name
            });
            notHandle = false;
            next();
            break;
        }
        i++;
    }
    if (notHandle) {
        next();
    }
};

util.fullscreenEvent = function (vm) {
    vm.$store.commit('initCachepage');
    // 权限菜单过滤相关
    vm.$store.commit('updateMenulist');
    // 全屏相关
};

util.checkUpdate = function (vm) {
    axios.get('https://api.github.com/repos/iview/iview-admin/releases/latest').then(res => {
        let version = res.data.tag_name;
        vm.$Notice.config({
            duration: 0
        });
        if (semver.lt(packjson.version, version)) {
            vm.$Notice.info({
                title: 'iview-admin更新啦',
                desc: '<p>iView-admin更新到了' + version + '了，去看看有哪些变化吧</p><a style="font-size:13px;" href="https://github.com/iview/iview-admin/releases" target="_blank">前往github查看</a>'
            });
        }
    });
};

// 处理路由菜单权限状态access 0无权限 1有权限(本地cookie存有access为1)
const appRouterCopy = JSON.parse(JSON.stringify(appRouter));
util.accessList = function (menus) {
    for (let i = 0; i < appRouter.length; i++) {
        for (let j = 0; j < appRouterCopy.length; j++) {
            if (appRouter[i].name === appRouterCopy[j].name) {
                appRouter[i] = JSON.parse(JSON.stringify(appRouterCopy[j]));
                break;
            }
        }
    }
    // console.log(JSON.stringify(appRouter))
    appRouter.forEach((item, index) => {
        item.access = 0;
        menus.forEach((menu, number) => {
            if (menu.name === item.title) {
                item.access = 1;
                // 子菜单
                if (item.children.length > 0) {
                    item.children.forEach((childitem, childindex) => {
                        childitem.access = 0;
                        menu.list.forEach((childmenu, childnumber) => {
                            if (childmenu.name === childitem.title) {
                                childitem.access = 1;
                            }
                        });
                    });
                }
            }
        });
        if (item.access === 0 && item.children.length > 0) {
            item.children.forEach((_item, _index) => {
                _item.access = 0;
            });
        }
    });
    // console.log(JSON.stringify(appRouter))
}
// 根据权限菜单跳转至首页
util.goHome = function (vm) {
    // console.log(JSON.stringify(appRouter))
    for (let i = 0; i < appRouter.length; i++) {
        if (appRouter[i].access === 1) {
            for (let j = 0; j < appRouter[i].children.length; j++) {
                if (appRouter[i].children[j].access === 1) {
                    vm.$router.push({
                        name: appRouter[i].children[j].name
                    });
                    break;
                }
            }
            break;
        }
    }
}

export default util;
