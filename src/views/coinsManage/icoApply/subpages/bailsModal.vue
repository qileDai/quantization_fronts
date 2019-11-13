<style lang="less" scoped>
    @import '../../../../styles/common.less';
    @import 'bailsModal.less';
</style>

<template>
    <div class="content">
        <Modal v-model="modalStatus" :title="modalTitle" width="1000" @on-cancel="handleReset" :mask-closable="false" :closable="false">
            <p class="close-icon" @click="handleReset"><Icon type="ios-close-empty" size="30"></Icon></p>
            <Form ref="formItem" :model="formItem" :label-width="120" :rules="ruleValidate">
                <FormItem label="项目方EXX帐户">
                    <span>{{userAccountName || '-'}}</span>
                </FormItem>
                <FormItem label="项目保证金" prop="marketAmount">
                    <Input v-model="formItem.marketAmount" placeholder="请输入返还项目保证金金额" number style="width: 200px;"></Input>
                    <Button type="warning" @click="handleSubmit" style="margin-left: 10px;">返还</Button>
                    <!--<div class="operator-box" style="margin-top: 5px;">
                        <Button type="ghost" size="small" @click="setBailAmount(0)" style="margin-right: 5px;">全部</Button>
                        <Button type="ghost" size="small" @click="setBailAmount(1)" style="margin-right: 5px;">1/2</Button>
                        <Button type="ghost" size="small" @click="setBailAmount(2)">1/6</Button>
                    </div>-->
                </FormItem>
            </Form>
            <div style="padding: 0 30px; margin-top: 60px;">
                <Table border :columns="tableColumns" :data="tableData"></Table>
            </div>
            <div slot="footer">
                <Button type="text" size="large" @click="handleReset">取消</Button>
            </div>
        </Modal>
        <Modal v-model="modalStatusGoogle" title="谷歌验证" width="500" @on-cancel="handleResetGoogle" :mask-closable="false">
            <Form ref="formItemGoogle" :model="formItemGoogle" :label-width="90" :rules="ruleValidateGoogle" @keydown.native.enter.prevent>
                <FormItem label="谷歌验证码" prop="googleCode">
                    <Input v-model="formItemGoogle.googleCode" :maxlength="6" placeholder="请输入谷歌验证码"></Input>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button type="text" size="large" @click="handleResetGoogle">取消</Button>
                <Button type="primary" size="large" @click="handleSubmitGoogle" :loading="loadingGoogle">确定</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import api from '@/api/coins'
    import axios from '@/axios/config'

    export default {
        name: 'bailsModal',
        props: {
            modalStatus: {
                required: true,
                type: Boolean,
                default: false
            },
            row: {
                required: true,
                type: Object,
                default: {}
            }
        },
        data () {
            const number = (rule, value, callback) => {
                if (isNaN(value)) {
                    callback(new Error('格式不正确，必须为数字'));
                }
                callback();
            };
            return {
                req_url: axios.defaults.baseURL,
                modalTitle: '项目方保证金管理',
                modalStatusGoogle: false,
                loadingGoogle: false,
                tableColumns: [
                    {
                        title: '时间',
                        key: 'createTime',
                        render: (h, params) => {
                            return h('span', params.row.createTime ? params.row.createTime.split('.')[0] : '');
                        }
                    },
                    {
                        title: '金额',
                        key: 'marketAmount'
                    },
                    {
                        title: '操作类型',
                        key: 'type',
                        render: (h, params) => {
                            return h('span', params.row.type === 0 ? '返还保证金' : '扣除保证金');
                        }
                    },
                    {
                        title: '待返还保证金',
                        key: 'marketBalance'
                    }
                ],
                tableData: [],
                formItem: {
                    marketAmount: ''
                },
                ruleValidate: {
                    marketAmount: [
                        {required: true, type: 'number', message: '请输入返还保证金金额', trigger: 'blur'}
                    ]
                },
                // 谷歌验证码
                formItemGoogle: {
                    googleCode: ''
                },
                ruleValidateGoogle: {
                    googleCode: [
                        {required: true, len: 6, message: '请输入6位数字的谷歌验证码', trigger: 'blur'},
                        {validator: number, trigger: 'blur'}
                    ]
                }
            };
        },
        watch: {
            modalStatus (val, oldVal) {
                if (val) {
                    this.getListData();
                }
            }
        },
        computed: {
            userAccountName () {
                return this.row.userAccountName || '';
            }
        },
        methods: {
            handleSubmit () {
                this.$refs.formItem.validate((valid) => {
                    if (valid) {
                        this.returnBailsCheck();
                    }
                });
            },
            handleReset () {
                this.$refs.formItem.resetFields();

                this.tableData = [];

                this.$emit('closeModal');
            },
            handleSubmitGoogle () {
                this.$refs.formItemGoogle.validate((valid) => {
                    if (valid) {
                        // 上线
                        this.returnBails();
                    }
                });
            },
            returnBailsCheck () {
                this.modalStatusGoogle = true;
            },
            handleResetGoogle () {
                this.$refs.formItemGoogle.resetFields();
                this.modalStatusGoogle = false;
            },
            returnBails () {
                let params = {
                    coinsinfoId: this.row.id,
                    userName: this.userAccountName,
                    googleCode: this.formItemGoogle.googleCode
                }
                let obj = Object.assign(params, this.formItem);

                this.loadingGoogle = true;
                api.returnBailsBill(obj).then((res) => {
                    this.loadingGoogle = false;
                    if (res.data.code == 1) {
                        this.$Message.success('返还成功！');
                        this.$refs.formItem.resetFields();
                        this.handleResetGoogle();
                        // 提交成功重新获取
                        this.getListData();
                    }
                });
            },
            getListData () {
                let params = {
                    coinsinfoId: this.row.id
                }
                api.getCoinsBillList(params).then((res) => {
                    if (res.data.code == 1) {
                        this.tableData = res.data.data;
                    }
                });
            }
        },
        created () {
            // this.getListData();
        },
        mounted () {
        }
    };
</script>
