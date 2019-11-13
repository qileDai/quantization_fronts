<style lang="less">
    @import './login.less';
</style>

<template>
    <div class="login" @keydown.enter="handleSubmit">
        <h3 class="login-hd"><img src="../images/login_logo.png" alt=""></h3>
        <div class="login-con">
            <p class="fm-top">登录</p>
            <div class="form-con">
                <Form ref="loginForm" :model="form" :rules="rules">
                    <FormItem prop="userName">
                        <Input v-model="form.userName" placeholder="请输入用户名" class="lg-ipt" autofocus></Input>
                    </FormItem>
                    <FormItem prop="password">
                        <Input type="password" v-model="form.password" placeholder="请输入密码" class="lg-ipt"></Input>
                    </FormItem>
                    <FormItem prop="googleCode">
                        <Input type="text" v-model="form.googleCode" placeholder="谷歌验证码( 选填,开通谷歌验证为必填项 )" class="lg-ipt"></Input>
                    </FormItem>
                    <FormItem>
                        <Button @click="handleSubmit" type="primary" long class="login-btn">登录</Button>
                    </FormItem>
                </Form>
            </div>
        </div>
    </div>
</template>

<script>
import {appRouter} from '../router/router';
import util from '../libs/util';
import Cookies from 'js-cookie';
import api from '@/api/login';
import menuapi from '@/api/systems';

export default {
    data () {
        return {
            form: {
                userName: '',
                password: '',
                googleCode: ''
            },
            rules: {
                userName: [
                    { required: true, message: '账号不能为空', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '密码不能为空', trigger: 'blur' }
                ]
            }
        };
    },
    methods: {
        handleSubmit () {
            this.$refs.loginForm.validate((valid) => {
                if (valid) {
                    this.handleLogin();
                }
            });
        },
        handleLogin () {
            // let params = this.form;
            // let publicKey = ''
            // api.getPublicKey().then((res) => {
                // publicKey = res.data.data
                let params = {
                    username: this.form.userName,
                    // userName: this.$getRsaCode(this.form.userName, publicKey.value),
                    password: this.form.password,
                    // password: this.$getRsaCode(this.form.password, publicKey.value),
                    // googleCode: this.form.googleCode,
                    // code: publicKey.code
                }
                api.submitLogin(params).then((res) => {
                    if (res.data.code == '200') {
                        // this.$store.dispatch('isCustomize', res.data.isCustomize) // vuex 储存用户是否为定制交易所
                        // this.$store.dispatch('isCustomize', res.data.isCustomize) // vuex 储存用户是否为定制交易所
                        Cookies.set('isCustomize', res.data.data.isCustomize);
                        Cookies.set('user', this.form.userName);
                        Cookies.set('access', 1); // 有权限值1
                        Cookies.set('sessionid', res.data.data.sessionid);
                        Cookies.set('userId', res.data.data.userId);
                        this.getAllUserMenus();
                    }
                });
            // })
        },
        getAllUserMenus () {
            menuapi.getUserMenuList().then((res) => {
                if (res.data.code == 200) {
                    this.$store.commit('updateNavList', res.data.data.menuList);
                    util.accessList(res.data.data.menuList);
                    this.$store.commit('updateMenulist');
                } else {
                    this.$store.commit('updateNavList', []);
                    appRouter.length = 0;
                    this.$store.commit('updateMenulist');
                }
                util.goHome(this);
            });
        }
    }
};
</script>

<style>

</style>
