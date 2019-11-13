import Cookies from 'js-cookie';
import api from '@/api/login'

const user = {
    state: {
        customizeStatus: 0, // 是否为定制交易所 state
    },
    mutations: {
        logout (state, vm) {
            api.loginOut().then((res) => {
                if (res.data.code == '200') {
                    Cookies.remove('user');
                    Cookies.remove('password');
                    Cookies.remove('access');
                    Cookies.remove('sessionid');
                    Cookies.remove('userId');
                    Cookies.remove('isCustomize')
                    state.customizeStatus = 0
                    // 恢复默认样式
                    let themeLink = document.querySelector('link[name="theme"]');
                    themeLink.setAttribute('href', '');
                    // 清空打开的页面等数据，但是保存主题数据
                    let theme = '';
                    if (localStorage.theme) {
                        theme = localStorage.theme;
                    }
                    localStorage.clear();
                    if (theme) {
                        localStorage.theme = theme;
                    }
                    vm.$store.commit('clearOpenedSubmenu');
                    // 清除所有标签
                    vm.$store.commit('clearAllTags');
                    vm.$router.push({
                        name: 'login'
                    });
                }
            });
        },
        // 是否为定制交易所
        isCustomize(state, data) {
            state.customizeStatus = data
        }
    },
    actions: {
        // 是否为定制交易所 action
        isCustomize({commit}, data) {
            commit('isCustomize', data)
        }
    }
};

export default user;
