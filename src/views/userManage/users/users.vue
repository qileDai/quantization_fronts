<style lang="less" scoped>
    @import '../../../styles/common.less';
    @import 'users.less';
</style>

<template>
    <div class="content">
        <Row class="et-row">
            <Col>
                <span>用户名：</span>
                <div class="search-out">
                    <Input v-model="searchVal" placeholder="搜索用户名" clearable></Input>
                </div>
                <span style="margin-left: 15px;">用户状态：</span>
                <div class="search-out">
                    <Select v-model="freezStatus" @on-change="getListData">
                        <Option v-for="item in freezList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                    </Select>
                </div>
                <div style="display:inline-block" v-if="$isCustomize()">
                    <span class="left-space">用户类型：</span>
                    <Select v-model="userType" style="width:150px" placeholder="全部" @on-change="getListData">
                        <Option value="">全部</Option>
                        <Option :value="1">普通用户</Option>
                        <Option :value="2">站长</Option>                       
                    </Select>
                    <span class="left-space">来源：</span>
                    <Select v-model="from" filterable style="width:150px" placeholder="全部" @on-change="getListData" >
                        <Option value="">全部</Option>
                        <Option v-for="(item, index) in froms" :value="item.stationName" :key="index">{{ item.stationName }}</Option>
                    </Select>
                </div>
                <Button type="primary" icon="ios-search" @click="findUsers" style="margin-left: 5px;">搜索</Button>
            </Col>
        </Row>
        <Table border :columns="tableColumns" :data="tableData"></Table>
        <div style="position: relative;">
            <Page class="pages" :current="pageNum" :total="total" show-elevator show-sizer :page-size="pageSize" :page-size-opts="sizeOpts" @on-change="changePageNum" @on-page-size-change="changePageSize"></Page>
        </div>
        <Modal v-model="modalStatusRecommend" :title="modalTitle" width="500" @on-cancel="handleResetRecommend">
            <Form ref="formItemRecommend" :model="formItemRecommend" :label-width="120" :rules="ruleValidateRecommend" @keydown.native.enter.prevent>
                <FormItem label="推荐人用户名" prop="recommendName">
                    <Input v-model="formItemRecommend.recommendName" placeholder="请输入推荐人用户名"></Input>
                </FormItem>
                <FormItem label="谷歌验证码" prop="googleCode">
                    <Input v-model="formItemRecommend.googleCode" :maxlength="6" placeholder="请输入谷歌验证码"></Input>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button type="text" size="large" @click="handleResetRecommend">取消</Button>
                <Button type="primary" size="large" @click="handleSubmitRecommend">确定</Button>
            </div>
        </Modal>
        <Modal v-model="modalStatusFreeze" :title="modalTitle" width="500" @on-cancel="handleResetFreeze" :mask-closable="false">
            <Form ref="formItemFreeze" :model="formItemFreeze" :label-width="90" :rules="ruleValidateFreeze">
                <FormItem label="谷歌验证码" prop="googleCode">
                    <Input v-model="formItemFreeze.googleCode" :maxlength="6" placeholder="请输入谷歌验证码"></Input>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button type="text" size="large" @click="handleResetFreeze">取消</Button>
                <Button type="primary" size="large" @click="handleSubmitFreeze">确定</Button>
            </div>
        </Modal>
        <Modal v-model="modalStatusVip" :title="modalTitle" width="500" @on-cancel="handleResetVip" :mask-closable="false">
            <Form ref="formItemVip" :model="formItemVip" :label-width="90" :rules="ruleValidateVip">
                <FormItem label="用户名">
                    <span>{{formItemVip.userName || '-'}}</span>
                </FormItem>
                <FormItem label="vip等级" prop="vipRate">
                    <Select v-model="formItemVip.vipRate" style="width:200px" placeholder="请选择VIP等级">
                        <Option v-for="item in vipList" :value="item.value + ''" :key="item.value">VIP_{{ item.value }}</Option>
                    </Select>
                </FormItem>
                <FormItem label="谷歌验证码" prop="googleCode">
                    <Input v-model="formItemVip.googleCode" :maxlength="6" placeholder="请输入谷歌验证码"></Input>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button type="text" size="large" @click="handleResetVip">取消</Button>
                <Button type="primary" size="large" @click="handleSubmitVip">确定</Button>
            </div>
        </Modal>
        <!-- 用户资产 -->
        <Modal v-model="showUserAsset" title="用户资产管理" width="1000">
            <div class="user-info">
                <div class="user-info-item">
                    <p>用户名：{{ userAssetsMsg.userName}}</p>
                    <p>注册时间：{{ userAssetsMsg.registerTime}}</p>
                </div>
                <div class="user-info-item">
                    <p>登录IP：{{ userAssetsMsg.loginIp}}</p>
                    <p>最后登录时间：{{ userAssetsMsg.lastLoginTime}}</p>
                </div>
                <div class="user-info-item all-recall-btn" v-if="g_perm('cancelEntrust')">
                    <Button type="primary" @click="allRecall">一键撤单</Button>
                </div>
            </div>
            <Table 
                border 
                :columns="userAssetHeader" 
                :data="userAssetData" 
                style="margin-top: 20px"
                no-data-text="该用户暂无资产"
                ></Table>
            <div slot="footer" style="text-align: center">
                <Button type="primary" @click="userAssetConfir">确定</Button>
            </div>
        </Modal>

        <!-- 修改手机号 -->
        <Modal v-model="showChangeMobile" :title="modalTitle" width="500" @on-cancel="handleResetPhone">
            <Form ref="formItemPhoneChange" :model="formItemPhoneChange" :label-width="120" :rules="ruleValidatePhoneChange" @keydown.native.enter.prevent>
                <FormItem label="旧手机号" prop="oldMobile">
                    <Input v-model="formItemPhoneChange.oldMobile" placeholder="请输入旧手机号码"></Input>
                </FormItem>
                <FormItem label="新手机号" prop="newMobile">
                    <Input v-model="formItemPhoneChange.newMobile" :maxlength="11" placeholder="请输入新手机号码"></Input>
                </FormItem>
                <FormItem label="谷歌验证码" prop="googleCode">
                    <Input v-model="formItemPhoneChange.googleCode" :maxlength="6" placeholder="请输入谷歌验证码"></Input>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button type="text" size="large" @click="handleResetPhone">取消</Button>
                <Button type="primary" size="large" @click="handleSubmitPhone">确定</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import api from '@/api/users'
    import googleApi from '@/api/google'
    import axios from '@/axios/config'
    import commonApi from '@/api/commonApi/commonApi.js'
    import funds from '@/api/fundsManage/assetsmanage.js'

    export default {
        name: 'users',
        data () {
            const number = (rule, value, callback) => {
                if (isNaN(value)) {
                    callback(new Error('格式不正确，必须为数字'));
                }
                callback();
            };
            return {
                req_url: axios.defaults.baseURL,
                showUserAsset: false, // 显示用户资产弹框
                showChangeMobile: false, // 显示用户修改手机号弹框
                userType: '', // 用户类型
                from: '', // 搜索条件选择的用户来源
                froms: null, // 所有用户来源数据
                userAssetsMsg: {},
                userAssetHeader: [
                    { title: '币种', key: 'propTag' },
                    { title: '可用', key: 'balance' },
                    { title: '冻结', key: 'freez' },
                    { title: '总计', key: 'total' },
                    { title: '操作', key: 'options', render: (h,params) => {
                        return h('div', [
                            this.g_perm('cancelCoinsEntrust') ? h('Button', {
                                props: {
                                    type: 'primary',
                                    size: 'small'
                                },
                                on: {
                                    click: () => {
                                        this.recall(params)
                                    }
                                }
                            }, '撤单') : '',
                            this.g_perm('assetsFreeze') ? h('Button', {
                                props: {
                                    type: 'error',
                                    size: 'small'
                                },
                                style: {
                                    marginLeft: '5px'
                                },
                                on: {
                                    click: () => {
                                        this.aseetsFreeze(params)
                                    }
                                }
                            }, params.row.isFreez ? '解冻': '冻结') : '',
                        ])
                    } },
                ],
                userAssetData: [], // 用户资产列表
                tableColumns: [
                    {
                        title: '用户名',
                        key: 'userName'
                    },
                    // {
                    //     title: '账户昵称',
                    //     key: 'nick'
                    // },
                    {
                        title: '手机号',
                        key: 'mobile'
                    },
                    {
                        title: '邮箱',
                        key: 'email'
                    },
                    {
                        title: '推荐人',
                        key: 'recommendName',
                        render: (h, params) => {
                            return h('span', params.row.recommendName ? params.row.recommendName : '-');
                        }
                    },
                    {
                        title: 'VIP等级',
                        key: 'vipRate'
                    },
                    // {
                    //     title: '用户类型',
                    //     key: 'userType',
                    //     render: (h, params) => {
                    //         return h('span', this.transUserType(params.row.userType));
                    //     }
                    // },
                    // {
                    //     title: '来源',
                    //     key: 'name'
                    // },
                    {
                        title: '用户状态',
                        key: 'freez',
                        render: (h, params) => {
                            return h('span', params.row.freez ? '禁止登录' : '正常');
                        }
                    },
                    {
                        title: 'C2C状态',
                        key: 'unfreeze',
                        render: (h, params) => {
                            return h('span', params.row.unfreeze ? '正常' : '冻结');
                        }
                    },
                    {
                        title: '登录IP',
                        key: 'loginIp'
                    },
                    {
                        title: '注册时间',
                        key: 'registerTime',
                        render: (h, params) => {
                            return h('span', params.row.registerTime ? params.row.registerTime.split('.')[0] : '');
                        }
                    },
                    {
                        title: '最后登录时间',
                        key: 'lastLoginTime',
                        render: (h, params) => {
                            return h('span', params.row.lastLoginTime ? params.row.lastLoginTime.split('.')[0] : '');
                        }
                    },
                    {
                        width: 255,
                        title: '操作',
                        render: (h, params) => {
                            return h('div', {
                                style: {
                                    paddingBottom: '5px'
                                }
                            }, [
                                this.g_perm('check') ? h('Button', {
                                    props: {
                                        type: 'info',
                                        size: 'small'
                                    },
                                    style: {
                                        marginTop: '5px',
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.checkUserAssets(params)
                                        }
                                    }
                                }, '查看资产') : '',
                                this.g_perm('edit') ? h('Button', {
                                    props: {
                                        type: 'primary',
                                        size: 'small'
                                    },
                                    style: {
                                        marginTop: '5px',
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.showEditModal(params.row, 1);
                                        }
                                    }
                                }, '修改推荐人') : '',
                                this.g_perm('setting') ? h('Button', {
                                    props: {
                                        type: 'warning',
                                        size: 'small',
                                        disabled: params.row.status == 0
                                    },
                                    style: {
                                        marginTop: '5px',
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.showEditModal(params.row, 2);
                                        }
                                    }
                                }, '设置VIP等级') : '',
                                this.g_perm('freeze') ? h('Button', {
                                    props: {
                                        type: params.row.freez ? 'success' : 'error',
                                        size: 'small'
                                    },
                                    style: {
                                        marginTop: '5px',
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.showEditModal(params.row, 3);
                                        }
                                    }
                                }, params.row.freez ? '启用登录' : '禁用登录') : '',
                                this.g_perm('updateMobile') ? h('Button', {
                                    props: {
                                        type: 'warning',
                                        size: 'small',
                                    },
                                    style: {
                                        marginTop: '5px',
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.showEditModal(params.row, 4);
                                        }
                                    }
                                }, '修改手机号码(国内)') : '',
                                this.g_perm('disableC2C') ? h('Button', {
                                // h('Button', {
                                    props: {
                                        type: params.row.id ? 'success' : 'error',
                                        size: 'small'
                                    },
                                    style: {
                                        marginTop: '5px',
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.disableC2C(params.row);
                                        }
                                    }
                                }, params.row.id ? '启用C2C' : '禁用C2C') : '',
                                this.g_perm('unfreeze') ? h('Button', {
                                // h('Button', {
                                    props: {
                                        type: params.row.unfreeze ? '' : 'success',
                                        size: 'small'
                                    },
                                    style: {
                                        marginTop: '5px',
                                        marginRight: '5px',
                                        cursor:params.row.unfreeze?'not-allowed':'pointer'
                                    },
                                    on: {
                                        click: () => {
                                            
                                            params.row.unfreeze?'':this.unfreeze(params.row);
                                        }
                                    }
                                }, 'C2C解冻') : ''
                                // }, params.row.id ? '解禁' : '禁用c2c交易')
                            ]);
                        }
                    }
                ],
                vipList: [
                    {
                        value: 0
                    },
                    {
                        value: 10
                    }
                ],
                freezList: [
                    {
                        label: '全部',
                        value: ''
                    },
                    {
                        label: '禁止登录',
                        value: 1
                    },
                    {
                        label: '正常',
                        value: 0
                    }
                ],
                freezStatus: '',
                tableData: [],
                searchVal: '',
                modalStatusVip: false,
                modalStatusFreeze: false,
                modalStatusRecommend: false,
                modalTitle: '添加',
                formItemVip: {
                    userId: '',
                    userName: '',
                    vipRate: '',
                    googleCode: ''
                },
                ruleValidateVip: {
                    vip: [
                        {required: true, message: '请选择VIP等级', trigger: 'blur'}
                    ],
                    googleCode: [
                        {required: true, len: 6, message: '请输入6位数字的谷歌验证码', trigger: 'blur'},
                        {validator: number, trigger: 'blur'}
                    ]
                },
                ruleValidatePhoneChange: {
                    oldMobile: [
                        {required: true, message: '旧手机号不能为空', trigger: 'blur'}
                    ],
                    newMobile: [
                        {required: true, message: '新手机号不能为空', trigger: 'blur'}
                    ],
                    googleCode: [
                        {required: true, len: 6, message: '请输入6位数字的谷歌验证码', trigger: 'blur'},
                        {validator: number, trigger: 'blur'}
                    ]
                },
                formItemFreeze: {
                    userId: '',
                    freez: '',
                    googleCode: ''
                },
                ruleValidateFreeze: {
                    googleCode: [
                        {required: true, len: 6, message: '请输入6位数字的谷歌验证码', trigger: 'blur'},
                        {validator: number, trigger: 'blur'}
                    ]
                },
                formItemRecommend: {
                    userId: '',
                    recommendName: '',
                    googleCode: ''
                },
                formItemPhoneChange: {
                    userId:'',
                    oldMobile: '',
                    newMobile: '',
                    googleCode:''     
                },
                ruleValidateRecommend: {
                    recommendName: [
                        {required: true, message: '请输入推荐人用户名', trigger: 'blur'}
                    ],
                    googleCode: [
                        {required: true, len: 6, message: '请输入6位数字的谷歌验证码', trigger: 'blur'},
                        {validator: number, trigger: 'blur'}
                    ]
                },
                editType: 0, // 编辑类型 1编辑推荐人 2设置VIP等级 3冻结解冻
                pageNum: 1,
                pageSize: 20,
                total: 0, // 总页数
                sizeOpts: [10, 20, 50, 100]
            };
        },

        methods: {
            // 禁止c2c交易
            disableC2C(row) {
                console.log(row)
                this.$Modal.confirm({
                    title: '确认操作',
                    content: '<p style="color:red">确认使用该操作？</p>',
                    onOk: () => {
                        let args = {
                            userId: row.userId,
                            userName: row.userName,
                            c2cFreez: row.id ? false : true
                        }
                        api.disableC2C(args).then(res => {

                            if (res.data.code) {
                                this.getListData()
                                this.$Message.success(res.data.msg)
                            }
                        })
                    }
                });
            },
            unfreeze(row){
                 this.$Modal.confirm({
                    title: '确认操作',
                    content: '<p style="color:red">确认使用该操作？</p>',
                    onOk: () => {
                        let args = {
                            userId: row.userId,
                        }
                        api.Unfreeze(args).then(res => {

                            if (res.data.code) {
                                this.getListData()
                                this.$Message.success(res.data.msg)
                            }
                        })
                    }
                });
            },
            // 获取来源
            async getForm() {
                const { data } = await commonApi.getForm()
                this.froms = data.data || []
            },
            // 用户资产确认按钮事件
            userAssetConfir() {
                this.showUserAsset = false
            },
            // 查看用户资产
            async checkUserAssets(params) {
                this.userAssetsMsg = params.row
                this.showUserAsset = true
                let userId = params.row.userId
                const { data } = await api.checkUserAssets({userId})
                this.userAssetData = data.data.userFinancial || []
            },
            // 撤单
            async recall(params) {
                this.$Modal.confirm({
                    title: '确认撤单',
                    content: '<p style="color:red">注意：确定要撤销该订单？</p>',
                    onOk: () => {
                        let fundsType = params.row.fundsType
                        let args = {
                            fundsType: params.row.fundsType,
                            exxUserId: this.userAssetsMsg.userId
                        }
                        api.recall(args).then(res => {
                            if(res.data.code === 1) {
                            this.$Message.success(res.data.msg)
                            }
                        })
                    }   
                });
            },
            // 冻结
            async aseetsFreeze(params) {
                this.$Modal.confirm({
                    title: '确认冻结',
                    content: '<p style="color:red">注意：该操作将会冻结此用户下的该币种资金</p>',
                    onOk: () => {
                        let isFreez = params.row.isFreez
                        isFreez = isFreez ? 0 : 1
                        let args = { 
                            userId: this.userAssetsMsg.userId,
                            userName: this.userAssetsMsg.userName,
                            isFreez 
                        }
                        funds.freeze(args).then(res => {
                            if(res.data.code === 1) {
                                this.userAssetData[params.index].isFreez = isFreez
                                this.$Message.success(res.data.msg)
                            }
                        })
                    }
                });
            },
            // 一键撤单
            async allRecall() {
                this.$Modal.confirm({
                    title: '确认一键撤单',
                    content: '<p style="color:red">注意：一键撤单将撤消该用户所有交易订单</p>',
                    onOk: () => {
                        let userId = this.userAssetsMsg.userId
                        console.log(this.userAssetsMsg)
                        api.allRecall({exxUserId: userId}).then(res => {
                            if(res.data.code === 1) {
                                this.$Message.success(res.data.msg)
                            }
                        })
                    }
                });
            },
            // 转换用户类型
            transUserType(type) {
                switch(type) {
                    case 1: 
                        return '普通用户'
                    case 2: 
                        return '站长'
                    default:
                        return '未知用户'
                }
            },
            handleSubmitVip () {
                this.$refs.formItemVip.validate((valid) => {
                    if (valid) {
                        this.submitRequest();
                    }
                });
            },
 
            handleResetVip () {
                this.$refs.formItemVip.resetFields();
                this.formItemVip.userId = '';
                this.formItemVip.userName = '';
                this.formItemVip.vipRate = '';
                this.formItemVip.googleCode = '';
                this.modalStatusVip = false;
            },
            handleSubmitFreeze () {
                this.$refs.formItemFreeze.validate((valid) => {
                    if (valid) {
                        this.submitRequest();
                    }
                });
            },
            handleResetFreeze () {
                this.$refs.formItemFreeze.resetFields();
                this.formItemFreeze.userId = '';
                this.formItemFreeze.freez = '';
                this.formItemFreeze.googleCode = '';
                this.modalStatusFreeze = false;
            },
            handleSubmitRecommend () {
                this.$refs.formItemRecommend.validate((valid) => {
                    if (valid) {
                        this.submitRequest();
                    }
                });
            },
            handleResetRecommend () {
                this.$refs.formItemRecommend.resetFields();
                this.formItemRecommend.userId = '';
                this.formItemRecommend.recommendName = '';
                this.formItemRecommend.googleCode = '';
                this.modalStatusRecommend = false;
            },
            handleSubmitPhone () {
                this.$refs.formItemPhoneChange.validate((valid) => {
                    if (valid) {
                        this.submitRequest();
                    }
                });
            },
            handleResetPhone(){
                this.$refs.formItemPhoneChange.resetFields();
                this.formItemPhoneChange.oldMobile = '';
                this.formItemPhoneChange.newMobile = '';
                this.formItemPhoneChange.googleCode = '';
                this.showChangeMobile = false;
            },
            // 数据解析
            submitRequest () {
                let obj = {
                    }
                let googleCode = '';
                if (this.editType == 1) {
                    obj = this.formItemRecommend
                    googleCode = this.formItemRecommend.googleCode;
                } else if (this.editType == 2) {
                    obj = this.formItemVip
                    googleCode = this.formItemVip.googleCode;
                } else if (this.editType == 3) {
                    obj = this.formItemFreeze
                    googleCode = this.formItemFreeze.googleCode;
                } else if (this.editType == 4) {
                    obj = this.formItemPhoneChange
                    googleCode = this.formItemPhoneChange.googleCode;
                }

                this.checkGoogle(obj, googleCode);
            },
            updateUsers (obj) {
                let {googleCode, ...args} = obj
                if (this.editType == 1) {
                    api.updateUserRecommend(args).then(res => {
                        if(res.data.code === 1) {
                            this.$Message.success('修改成功！');
                            this.modalStatusRecommend = false;
                            this.handleResetRecommend();
                            this.getListData();

                        }
                    })
                } else if (this.editType == 2) {
                    let {userName, ...newArgs} = args
                    api.setVip(newArgs).then(res => {
                        if(res.data.code === 1) {
                            this.$Message.success('设置成功！');
                            this.modalStatusVip = false;
                            this.handleResetVip();
                            this.getListData();

                        }
                    })
                } else if (this.editType == 3) {
                    api.freezeUser(args).then(res => {
                        if(res.data.code === 1) {
                            this.$Message.success('操作成功！');
                            this.modalStatusFreeze = false;
                            this.handleResetFreeze();
                            this.getListData();
                        }
                    })
                } else if (this.editType == 4){
                    api.changePhoneNumber(obj).then(res => {
                        if(res.data.code === 1) {
                            this.$Message.success('操作成功！');
                            this.showChangeMobile = false;
                            this.handleResetPhone();
                            this.getListData();
                        }
                    })
                }
            },
            checkGoogle (obj, googleCode) {
                // 传0检验是否需要谷歌验证
                let params = {
                    code: googleCode
                }
                googleApi.checkGoogleCode(params).then((res) => {
                    if (res.data.code == 1) {
                        // 通过
                        this.updateUsers(obj);
                    } else {
                        this.$Message.error(res.data.msg);
                    }
                });
            },
            getListData () {
                let params = {
                    userName: this.searchVal,
                    freezz: this.freezStatus,
                    pageIndex: this.pageNum,
                    pageSize: this.pageSize,
                    userType: this.userType,
                    name: this.from 
                }
                api.getUserList(params).then((res) => {
                    if (res.data.code == 1) {
                        this.tableData = res.data.data.userList || [];
                        this.total = res.data.data.totalNumber;
                    }
                });
            },
            findUsers () {
                this.pageNum = 1;
                this.total = 0;
                this.getListData();
            },
            showEditModal (currRow, type) {
                this.editType = type;
                if (type == 1) {
                    this.modalTitle = '修改推荐人';
                    this.formItemRecommend.userId = currRow.userId;
                    this.formItemRecommend.recommendName = currRow.recommendName || '';

                    this.modalStatusRecommend = true;
                } else if (type == 2) {
                    this.modalTitle = '修改VIP等级';
                    this.formItemVip.userId = currRow.userId;
                    this.formItemVip.userName = currRow.userName;
                    this.formItemVip.vipRate = currRow.vipRate + '';

                    console.log(this.formItemVip)

                    this.modalStatusVip = true;
                } else if (type == 3) {
                    this.modalTitle = currRow.freez ? '解冻' : '冻结';
                    this.formItemFreeze.userId = currRow.userId;
                    this.formItemFreeze.freez = !currRow.freez;

                    this.modalStatusFreeze = true;
                } else if (type == 4) {
                    this.modalTitle = '修改手机号码(国内)';
                    this.formItemPhoneChange.userId = currRow.userId;
                    this.showChangeMobile = true;
                }
            },
            changePageNum (pageNum) {
                this.pageNum = pageNum;
                this.getListData();
            },
            changePageSize (pageSize) {
                this.pageNum = 1;
                this.pageSize = pageSize;
                this.getListData();
            }
        },
        created () {
            this.getForm()
            this.getListData();
            // 如果是定制交易所
            if(this.$isCustomize()) {
                this.tableColumns.splice(5, 0,
                    {
                        title: '用户类型',
                        key: 'userType',
                        render: (h, params) => {
                            return h('span', this.transUserType(params.row.userType));
                        }
                    },
                    {
                        title: '来源',
                        key: 'name'
                    }
                )
            }
        },
    };
</script>

<style lang="less" scoped>
.user-info {
    position: relative;
    display: flex;
    align-items: center;
    .user-info-item {
        width: 33%;
        p {
            margin-top: 10px;
        }
    }
    .all-recall-btn {
        text-align: right;
    }
}
</style>

