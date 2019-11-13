<style lang="less">
    @import "./main.less";
</style>
<template>
    <div class="main" :class="{'main-hide-text': shrink}">
        <div class="sidebar-menu-con" :style="{width: shrink?'60px':'200px', overflow: shrink ? 'visible' : 'auto'}">
            <scroll-bar ref="scrollBar">
                <shrinkable-menu
                    :shrink="shrink"
                    @on-change="handleSubmenuChange"
                    :theme="menuTheme"
                    :before-push="beforePush"
                    :open-names="openedSubmenuArr"
                    :menu-list="menuList">
                    <div slot="top" class="logo-con" v-if="$isCustomize()">
                        <img v-show="!shrink" class="logo" src="../images/logo.png" key="max-logo" />
                        <img v-show="shrink" class="min-logo" src="../images/logo.png" key="min-logo" />
                    </div>
                    <div slot="top" style="height:50px" v-else></div>
                </shrinkable-menu>
            </scroll-bar>
        </div>
        <div class="main-header-con" :style="{paddingLeft: shrink?'60px':'200px'}">
            <div class="main-header">
                <div class="navicon-con">
                    <Button :style="{transform: 'rotateZ(' + (this.shrink ? '-90' : '0') + 'deg)'}" type="text" @click="toggleClick">
                        <Icon type="navicon" size="32"></Icon>
                    </Button>
                </div>
                <div class="header-middle-con">
                    <div class="main-breadcrumb">
                        <breadcrumb-nav :currentPath="currentPath"></breadcrumb-nav>
                    </div>
                </div>
                <div class="header-avator-con">
                    <full-screen v-model="isFullScreen" @on-change="fullscreenChange"></full-screen>
                    <lock-screen></lock-screen>
                    <!--<message-tip v-model="mesCount"></message-tip>-->
                    <theme-switch></theme-switch>

                    <div class="user-dropdown-menu-con">
                        <Row type="flex" justify="end" align="middle" class="user-dropdown-innercon">
                            <Dropdown transfer trigger="click" @on-click="handleClickUserDropdown">
                                <a href="javascript:void(0)">
                                    <span class="main-user-name">{{ userName }}</span>
                                    <Icon type="arrow-down-b"></Icon>
                                </a>
                                <DropdownMenu slot="list">
                                    <DropdownItem name="loginout">退出登录</DropdownItem>
                                    <DropdownItem name="changePassword">修改登录密码</DropdownItem>
                                    <DropdownItem name="changeGooglecode">修改Google验证码</DropdownItem>
                                    <!--<DropdownItem name="ownSpace">个人中心</DropdownItem>-->
                                </DropdownMenu>
                            </Dropdown>
                            <Avatar :src="avatorPath" style="background: #619fe7;margin-left: 10px;"></Avatar>
                        </Row>
                    </div>
                </div>
            </div>
            <div class="tags-con">
                <tags-page-opened :pageTagsList="pageTagsList"></tags-page-opened>
            </div>
        </div>
        <div class="single-page-con" :style="{left: shrink?'60px':'200px'}">
            <div class="single-page">
                <keep-alive :include="cachePage">
                    <router-view></router-view>
                </keep-alive>
            </div>
        </div>
<!-- 修改Google验证码 -->
        <Modal v-model="modalStatus" :title="modalTitle" width="500" @on-cancel="handleReset">
            <Form ref="formItem" :model="formItem" :label-width="110" :rules="ruleValidate">
                    <FormItem label="谷歌验证标识" prop="secret">
                        <div class="qrcode-box">
                            <img :src="qrcodeUrl" alt="" width="150" height="150" style="display: block;">
                        </div>
                        <Input v-model="formItem.secret" placeholder="谷歌验证标识" readonly style="width: 200px;"></Input>
                        <Button type="dashed" size="small" @click="getGoogleStr" style="padding: 5px 10px; margin-left: 10px;">刷新</Button>
                    </FormItem>
                    <FormItem label="谷歌验证码" prop="code">
                        <Input v-model.trim="formItem.code" placeholder="请输入谷歌验证码" style="width: 200px;"></Input>
                    </FormItem>
            </Form>
            <div slot="footer">
                <Button type="text" size="large" @click="handleReset">取消</Button>
                <Button type="primary" size="large" @click="handleSubmit">确定</Button>
            </div>
        </Modal>

        <!-- 修改密码 -->
        <Modal v-model="modalStatusPwd" title="修改密码" width="500" @on-cancel="handleResetPwds">
            <Form ref="formItemPwd" :model="formItemPwd" :label-width="90" :rules="ruleValidatePwds">
                <FormItem label="原始密码" prop="password">
                    <Input v-model.trim="formItemPwd.password" type="password" placeholder="请输入原始密码"></Input>
                </FormItem>
                <FormItem label="新密码" prop="newPassword">
                    <Input v-model.trim="formItemPwd.newPassword" type="password" placeholder="请输入新密码"></Input>
                </FormItem>
                <FormItem label="确认密码" prop="confirmPassword">
                    <Input v-model.trim="formItemPwd.confirmPassword" type="password" placeholder="请再次输入密码"></Input>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button type="text" size="large" @click="handleResetPwds">取消</Button>
                <Button type="primary" size="large" @click="handleSubmitPwd">确定</Button>
            </div>
        </Modal>

    </div>
</template>
<script>
    import shrinkableMenu from './main-components/shrinkable-menu/shrinkable-menu.vue';
    import tagsPageOpened from './main-components/tags-page-opened.vue';
    import breadcrumbNav from './main-components/breadcrumb-nav.vue';
    import fullScreen from './main-components/fullscreen.vue';
    import lockScreen from './main-components/lockscreen/lockscreen.vue';
    import messageTip from './main-components/message-tip.vue';
    import themeSwitch from './main-components/theme-switch/theme-switch.vue';
    import axios from 'axios';
    import QRCode from 'qrcode';
    import Cookies from 'js-cookie';
    import util from '@/libs/util.js';
    import scrollBar from '@/views/my-components/scroll-bar/vue-scroller-bars';

    export default {
        components: {
            shrinkableMenu,
            tagsPageOpened,
            breadcrumbNav,
            fullScreen,
            lockScreen,
            messageTip,
            themeSwitch,
            scrollBar
        },
        data () {
            const number = (rule, value, callback) => {
                if (isNaN(value)) {
                    callback(new Error('格式不正确，必须为数字'));
                }
                callback();
            };
            const validatorNewPwd = (rule, value, callback) => {
                if (value === '') {
                    callback();
                } else {
                    if (this.formItemPwd.newPassword === this.formItemPwd.password) {
                        callback(new Error('新密码不能和旧密码一样'));
                    }
                    callback();
                }
            };
            const validatorPwd = (rule, value, callback) => {
                if (value === '') {
                    callback();
                } else {
                    if (!(this.formItemPwd.confirmPassword === this.formItemPwd.newPassword)) {
                        callback(new Error('两次输入密码不一致'));
                    }
                    callback();
                }
            };
            return {
                shrink: false,
                userName: '',
                isFullScreen: false,
                openedSubmenuArr: this.$store.state.app.openedSubmenuArr,
                modalStatus: false,
                modalStatusPwd: false,
                modalTitle: '修改Google验证码',
                formItem: {
                    secret: '',
                    code: ''
                },
                formItemPwd: {
                    password: '',
                    newPassword: '',
                    confirmPassword: ''
                },
                qrcodeUrl: '', // 谷歌二维码链接
                ruleValidate: {
                    code: [
                        {required: true, len: 6, message: '请输入6位数字的谷歌验证码', trigger: 'blur'},
                        {validator: number, trigger: 'blur'}
                    ]
                },
                ruleValidatePwds: {
                    password: [
                        {required: true, message: '请输入密码', trigger: 'blur'}
                    ],
                    newPassword: [
                        {required: true, message: '请输入新密码', trigger: 'blur'},
                        {validator: validatorNewPwd, trigger: 'blur'}
                    ],
                    confirmPassword: [
                        {required: true, message: '请再次输入新密码', trigger: 'blur'},
                        {validator: validatorPwd, trigger: 'blur'}
                    ]
                }
            };
        },
        computed: {
            menuList () {
                return this.$store.state.app.menuList;
            },
            pageTagsList () {
                return this.$store.state.app.pageOpenedList; // 打开的页面的页面对象
            },
            currentPath () {
                return this.$store.state.app.currentPath; // 当前面包屑数组
            },
            avatorPath () {
                return localStorage.avatorImgPath;
            },
            cachePage () {
                return this.$store.state.app.cachePage;
            },
            lang () {
                return this.$store.state.app.lang;
            },
            menuTheme () {
                return this.$store.state.app.menuTheme;
            },
            mesCount () {
                return this.$store.state.app.messageCount;
            }
        },
        methods: {
            init () {
                let pathArr = util.setCurrentPath(this, this.$route.name);
                this.$store.commit('updateMenulist');
                if (pathArr.length >= 2) {
                    this.$store.commit('addOpenSubmenu', pathArr[0].name);
                }
                this.userName = Cookies.get('user');
                let messageCount = 3;
                this.messageCount = messageCount.toString();
                this.checkTag(this.$route.name);
                this.$store.commit('setMessageCount', 3);
            },
            // 获取谷歌认证标识
            getGoogleStr () {
                axios.get('/sysUser/getGoogleSecret').then((res) => {
                    if (res.data.code == 1) {
                        this.formItem.secret = res.data.data.split('=')[1];
                        this.generateQrCode(res.data.data);
                    }
                });
            },
            generateQrCode (text) {
                QRCode.toDataURL(text).then(url => {
                    // console.log(url);
                    this.qrcodeUrl = url;
                }).catch(err => {
                    console.error(err);
                    this.qrcodeUrl = '';
                });
            },
            handleReset () {
                this.modalStatus = false;
                this.formItem.secret = '';
                this.formItem.code = '';
                // 关闭 清空谷歌验证部分
                this.qrcodeUrl = '';
            },
            handleResetPwds () {
                this.modalStatusPwd = false;
                this.formItemPwd.password = '';
                this.formItemPwd.newPassword = '';
                this.formItemPwd.confirmPassword = '';
            },
            handleSubmit () {
                this.$refs.formItem.validate((valid) => {
                    if (valid) {
                        this.submitRequest();
                    }
                });
            },
            handleSubmitPwd () {
                this.$refs.formItemPwd.validate((valid) => {
                    if (valid) {
                        this.submitRequest();
                        console.log(this.formItemPwd.password);
                    }
                });
            },
            submitRequest () {
                if (this.modalStatus) {
                    let params = {};
                    let obj = Object.assign(params, this.formItem);
                    axios.post('/sysUser/updateGoogle', params).then((res) => {
                        if (res.data.code == 1) {
                            this.$Message.success('修改Google验证码成功');
                            this.modalStatus = false;
                            this.$store.commit('logout', this);
                        }
                    });
                } else if (this.modalStatusPwd) {
                    let params = {};
                    let obj = Object.assign(params, this.formItemPwd);
                    let {confirmPassword, ...arr} = obj;
                    axios.post('/sysUser/updatePwd', arr).then((res) => {
                        if (res.data.code == 1) {
                            this.$Message.success('修改密码成功');
                            this.modalStatusPwd = false;
                            this.$store.commit('logout', this);
                        }
                    });
                }
            },
            toggleClick () {
                this.shrink = !this.shrink;
            },
            handleClickUserDropdown (name) {
                if (name === 'ownSpace') {
                    util.openNewPage(this, 'ownspace_index');
                    this.$router.push({
                        name: 'ownspace_index'
                    });
                } else if (name === 'loginout') {
                    // 退出登录
                    this.$store.commit('logout', this);
                } else if (name === 'changeGooglecode') {
                    this.getGoogleStr();
                    this.modalStatus = true;
                } else if (name === 'changePassword') {
                    this.modalStatusPwd = true;
                }
            },
            checkTag (name) {
                let openpageHasTag = this.pageTagsList.some(item => {
                    if (item.name === name) {
                        return true;
                    }
                });
                if (!openpageHasTag) { //  解决关闭当前标签后再点击回退按钮会退到当前页时没有标签的问题
                    util.openNewPage(this, name, this.$route.params || {}, this.$route.query || {});
                }
            },
            handleSubmenuChange (val) {
                // console.log(val)
            },
            beforePush (name) {
                // if (name === 'accesstest_index') {
                //     return false;
                // } else {
                //     return true;
                // }
                return true;
            },
            fullscreenChange (isFullScreen) {
                // console.log(isFullScreen);
            },
            scrollBarResize () {
                this.$refs.scrollBar.resize();
            }
        },
        watch: {
            '$route' (to) {
                this.$store.commit('setCurrentPageName', to.name);
                let pathArr = util.setCurrentPath(this, to.name);
                if (pathArr.length >= 2) {
                    this.$store.commit('addOpenSubmenu', pathArr[0].name);
                }
                this.checkTag(to.name);
                localStorage.currentPageName = to.name;
            },
            lang () {
                util.setCurrentPath(this, this.$route.name); // 在切换语言时用于刷新面包屑
            },
            openedSubmenuArr () {
                setTimeout(() => {
                    this.scrollBarResize();
                }, 300);
            }
        },
        mounted () {
            this.init();
            window.addEventListener('resize', this.scrollBarResize);
        },
        created () {
            // 显示打开的页面的列表
            this.$store.commit('setOpenedList');
        },
        dispatch () {
            window.removeEventListener('resize', this.scrollBarResize);
        }
    };
</script>
