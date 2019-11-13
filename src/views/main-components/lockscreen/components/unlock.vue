<style lang="less">
    @import '../styles/unlock.less';
</style>

<template>
    <transition name="show-unlock">
        <div class="unlock-body-con" v-if="showUnlock" @keydown.enter="validator">
            <div @click="handleClickAvator" class="unlock-avator-con" :style="{marginLeft: avatorLeft}">
                <img class="unlock-avator-img" :src="avatorPath">
                <div  class="unlock-avator-cover">
                    <span><Icon type="unlocked" :size="30"></Icon></span>
                    <p>解锁</p>
                </div>
            </div>
            <div class="unlock-avator-under-back" :style="{marginLeft: avatorLeft}"></div>
            <div class="unlock-input-con">
                <div class="unlock-input-overflow-con">
                    <div class="unlock-overflow-body" :style="{right: inputLeft}">
                        <div class="flex-line">
                            <label>Google:</label>
                            <Input type="text" v-model="googleCode" placeholder="谷歌验证码( 选填,开通谷歌验证为必填项 )" class="lg-ipt"></Input>
                        </div>
                        <div class="flex-line">
                            <label>登录密码:</label>
                            <div>
                                     <input ref="inputEle" v-model="password" class="unlock-input" type="password" placeholder="密码同登录密码" />
                                     <button ref="unlockBtn" @mousedown="unlockMousedown" @mouseup="unlockMouseup" @click="validator" class="unlock-btn"><Icon color="white" type="key"></Icon></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="unlock-locking-tip-con">已锁定</div>
        </div>
    </transition>
</template>
<style lang="less" scoped>
.unlock-body-con .unlock-input-con {
    right: -50px;
    height: 90px;
}
</style>


<script>
import Cookies from 'js-cookie';
import api from '@/api/login';

export default {
    name: 'Unlock',
    data () {
        return {
            avatorLeft: '0px',
            inputLeft: '400px',
            password: '',
            googleCode: '',
            check: null
        };
    },
    props: {
        showUnlock: {
            type: Boolean,
            default: false
        }
    },
    computed: {
        avatorPath () {
            return localStorage.avatorImgPath;
        }
    },
    methods: {
        validator () {
            let params = {
                username: Cookies.get('user'),
                password: this.password,
                googleCode: this.googleCode
            };
            api.submitLogin(params).then((res) => {
                if (res.data.code == '200') {
                    // 更新token
                    Cookies.set('sessionid', res.data.sessionid);
                    this.handleUnlock();
                }
            });
        },
        handleClickAvator () {
            this.avatorLeft = '-180px';
            this.inputLeft = '0px';
            this.$refs.inputEle.focus();
        },
        handleUnlock () {
            this.avatorLeft = '0px';
            this.inputLeft = '400px';
            this.password = '';
            Cookies.set('locking', '0');
            this.$emit('on-unlock');
        },
        unlockMousedown () {
            this.$refs.unlockBtn.className = 'unlock-btn click-unlock-btn';
        },
        unlockMouseup () {
            this.$refs.unlockBtn.className = 'unlock-btn';
        }
    }
};
</script>
