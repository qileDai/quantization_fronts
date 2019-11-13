<style lang="less" scoped>
    @import '../../../styles/common.less';
    @import 'transfer.less';
</style>

<template>
    <div class="content">
        <Row class="et-row">
            <Col>
                <span>输入用户名查询：</span>
                <div class="search-out" @keydown.enter="searchData">
                    <Input v-model.trim="searchVal" placeholder="请输入用户名查询" clearable></Input>
                </div>
                <Button type="primary" icon="ios-search" @click="searchData">查询</Button>
            </Col>
        </Row>
        <Table border :columns="tableColumns" :data="tableData"></Table>
        <Modal v-model="modalStatus" :title="modalTitle" width="500" @on-cancel="handleReset">
            <Form ref="formItem" :model="formItem" :label-width="90" :rules="ruleValidate">
                <FormItem label="转入账户" prop="toUserName">
                    <Input v-model="formItem.toUserName" placeholder="请输入转入账户" style="width: 300px;"></Input>
                </FormItem>
                <FormItem label="转入金额" prop="amount">
                    <Input v-model="formItem.amount" ref="amount" placeholder="请输入转入金额" number style="width: 300px;">
                        <Button slot="append" icon="reply-all" @click="setAll">全部</Button>
                    </Input>
                </FormItem>
                <FormItem label="谷歌验证码" prop="googleCode">
                    <Input v-model="formItem.googleCode" placeholder="请输入谷歌验证码" :maxlength="6" style="width: 200px;"></Input>
                </FormItem>
                <FormItem label="ET资金类型" v-if="row.fundsTypeName === 'ET'">
                    <RadioGroup v-model="etType">
                        <Radio label="2">可用和冻结</Radio>
                        <Radio label="1">可用</Radio>
                    </RadioGroup>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button type="text" size="large" @click="handleReset">取消</Button>
                <Button type="primary" size="large" @click="handleSubmit">确定</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import api from '@/api/funds'
    import googleApi from '@/api/google'
    import axios from '@/axios/config'

    export default {
        name: 'transfer',
        data () {
            const validator = (rule, value, callback) => {
                if (value === '') {
                    callback();
                } else {
                    let val = value.toString();
                    if (val.indexOf('.') > -1 && val.split('.')[1].length > 8) {
                        callback(new Error('小数位不能超过8位'));
                    }
                    callback();
                }
            };
            const number = (rule, value, callback) => {
                if (isNaN(value)) {
                    callback(new Error('格式不正确，必须为数字'));
                }
                callback();
            };
            return {
                req_url: axios.defaults.baseURL,
                tableColumns: [
                    {
                        title: '账户',
                        key: 'userName'
                    },
                    {
                        title: '币种名称',
                        key: 'fundsTypeName'
                    },
                    {
                        title: '可用金额',
                        key: 'balance'
                    },
                    {
                        title: '冻结金额',
                        key: 'freez'
                    },
                    {
                        title: '总金额',
                        key: 'total'
                    },
                    {
                        title: '操作',
                        render: (h, params) => {
                            return h('div', {
                                style: {
                                    paddingBottom: '5px'
                                }
                            }, [
                                this.g_perm('transfer') ? h('Button', {
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
                                }, '转账') : '',
                                /* h('Button', {
                                    props: {
                                        type: 'error',
                                        size: 'small'
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
                                }, '解冻资金') */
                            ]);
                        }
                    }
                ],
                tableData: [],
                searchVal: '',
                modalStatus: false,
                modalTitle: '',
                row: '', // 当前操作项目
                formItem: {
                    fundsType: '',
                    fromUserName: '',
                    toUserName: '',
                    amount: '',
                    googleCode: ''
                    // etType: ''
                },
                etType: 2, // 1可用 2可用和冻结
                ruleValidate: {
                    toUserName: [
                        {required: true, message: '请输入转入账户', trigger: 'blur'}
                    ],
                    amount: [
                        {required: true, type: 'number', message: '请输入转账金额', trigger: 'blur'},
                        {validator: validator, trigger: 'blur'}
                    ],
                    googleCode: [
                        {required: true, len: 6, message: '请输入6位数字的谷歌验证码', trigger: 'blur'},
                        {validator: number, trigger: 'blur'}
                    ]
                },
                editType: 1, // 编辑类型  1转账
                pageNum: 1,
                pageSize: 20,
                total: 0, // 总页数
                sizeOpts: [10, 20, 50, 100]
            };
        },
        watch: {
        },
        computed: {
        },
        methods: {
            handleSubmit () {
                this.$refs.formItem.validate((valid) => {
                    if (valid) {
                        this.submitRequest();
                    }
                });
            },
            handleReset () {
                this.row = '';
                this.formItem.fromUserName = '';
                this.formItem.fundsType = '';
                this.etType = 2;
                this.$refs.formItem.resetFields();
                this.modalStatus = false;
            },
            submitRequest () {
                let params = {
                }

                let obj = Object.assign(params, this.formItem);
                if (this.row.fundsTypeName === 'ET') {
                    // ET要传资金类型
                    obj.etType = this.etType;
                }

                if (this.editType == 1) {
                    api.fundTransfer(obj).then((res) => {
                        if (res.data.code == 1) {
                            this.$Message.success('转账成功！');
                            this.handleReset();
                            // 提交成功重新获取
                            this.getListData();
                        } else if (res.data.code == -1) {
                            this.$Message.error(res.data.msg);
                        }
                    });
                } else if (this.editType == 2) {
                    //
                }
            },
            searchData () {
                // 重置页码
                this.pageNum = 1;
                this.total = 0;

                this.getListData();
            },
            getListData () {
                if (this.searchVal == '') {
                    this.$Message.warning('请先输入查询的用户名！');
                    this.tableData = [];
                    return;
                }

            //    let emailReg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
                let phoneReg = /^[0-9]*$/;
                // 校验手机号和邮箱
                let account = this.searchVal;
                // if (!emailReg.test(account) && !phoneReg.test(account)) {
                //     this.$Message.warning('请输入正确格式的用户名！');
                //     return;
                // }

                let params = {
                    userName: this.searchVal
                }
                api.getFundsInfoByUser(params).then((res) => {
                    if (res.data.code == 1) {
                        this.tableData = res.data.data;
                    }
                });
            },
            showEditModal (currRow, type) {
                this.editType = type;
                if (type == 1) {
                    this.modalTitle = '转账 ' + currRow.fundsTypeName;

                    // 添加
                    this.setFormItem(currRow);
                } else if (type == 2) {
                    //
                }
                this.modalStatus = true;
            },
            setAll () {
                this.$refs.amount.focus();
                // et根据选择的资金类型判断
                if (this.row.fundsTypeName === 'ET' && this.etType == '2') {
                    this.formItem.amount = this.row.total;
                } else {
                    this.formItem.amount = this.row.balance;
                }
            },
            setFormItem (row) {
                if (row) {
                    this.row = row;
                    this.formItem.fromUserName = row.userName;
                    this.formItem.fundsType = row.fundsType;
                }
            }
        },
        created () {
            // this.getListData();
        },
        mounted () {
        }
    };
</script>
