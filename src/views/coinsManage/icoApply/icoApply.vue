<style lang="less" scoped>
    @import '../../../styles/common.less';
    @import 'icoApply.less';
</style>

<template>
    <div class="content">
        <Row class="et-row">
            <Col>
                <span>申请日期：</span>
                <span class="option-text">从</span>
                <DatePicker v-model="coinStartDate" format="yyyy-MM-dd" :options="optionsStart" :editable="false" @on-change="setStartDateVal" type="date" placeholder="请选择开始日期" style="width: 180px"></DatePicker>
                <span class="option-text">到</span>
                <DatePicker v-model="coinEndDate" format="yyyy-MM-dd" :options="optionsEnd" :editable="false" @on-change="setEndDateVal" type="date" placeholder="请选择结束日期" style="width: 180px"></DatePicker>
                <span style="margin-left: 15px;">币种简称：</span>
                <div class="search-out" style="margin-left: 0;" @keydown.enter="searchData">
                    <Input v-model="searchVal" placeholder="搜索币种简称" clearable></Input>
                </div>
                <span style="margin-left: 15px;">是否带有memo地址：</span>
                <Select style="width:100px; margin-right:15px" v-model="isMemo" placeholder="全部">
                    <Option value="">全部</Option>
                    <Option value="0">不带</Option>
                    <Option value="1">带</Option>
                </Select>
                <Button type="primary" icon="ios-search" @click="searchData">查询</Button>
                <Button type="info" class="add_account" icon="plus-round" @click="showEditModal(null, 0)" v-if="g_perm('add')">新增项目</Button>
            </Col>
        </Row>
        <Table border :columns="tableColumns" :data="tableData"></Table>
        <div style="position: relative;">
            <Page class="pages" :current="pageNum" :total="total" show-elevator show-sizer :page-size="pageSize" :page-size-opts="sizeOpts" @on-change="changePageNum" @on-page-size-change="changePageSize"></Page>
        </div>
        <Modal v-model="modalStatus" :title="modalTitle" width="500" @on-cancel="handleReset" :mask-closable="false">
            <Form ref="formItem" :model="formItem" :label-width="90" :rules="ruleValidate" @keydown.native.enter.prevent>
                <FormItem label="谷歌验证码" prop="googleCode">
                    <Input v-model="formItem.googleCode" :maxlength="6" placeholder="请输入谷歌验证码"></Input>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button type="text" size="large" @click="handleReset">取消</Button>
                <Button type="primary" size="large" @click="handleSubmit" :loading="loading">确定</Button>
            </div>
        </Modal>
        <edit-modal :modal-status="editType === 0" :row="currRow" @closeModal="setCloseModal"></edit-modal>
        <configs-modal :modal-status="editType === 1" :row="currRow" @closeModal="setCloseModal"></configs-modal>
        <wallet-test-modal :modal-status="editType === 2" :row="currRow" @closeModal="setCloseModal"></wallet-test-modal>
        <bails-modal :modal-status="editType === 3" :row="currRow" @closeModal="setCloseModal"></bails-modal>
    </div>
</template>

<script>
    import api from '@/api/coins'
    import googleApi from '@/api/google'
    import axios from '@/axios/config'
    import editModal from './subpages/editModal'
    import configsModal from './subpages/configsModal'
    import walletTestModal from './subpages/walletTestModal'
    import bailsModal from './subpages/bailsModal'

    export default {
        name: 'icoApply',
        components: {
            editModal,
            configsModal,
            walletTestModal,
            bailsModal
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
                tableColumns: [
                    {
                        width: 80,
                        title: '序号',
                        key: 'sort'
                    },
                    {
                        title: '币种logo',
                        key: 'projectLogo',
                        render: (h, params) => {
                            return h('img', {
                                attrs: {
                                    'src': params.row.projectLogo,
                                    'class': 'imgblock',
                                    'width': 50,
                                    'height': 50
                                },
                                style: {
                                    cursor: 'pointer'
                                },
                                on: {
                                    click: () => {
                                        this.showEditModal(params.row, 0);
                                    }
                                }
                            });
                        }
                    },
                    {
                        title: '币种ID',
                        key: 'fundsType'
                    },
                    {
                        title: '币种简称',
                        key: 'coinName',
                        render: (h, params) => {
                            return h('span', {
                                style: {
                                    cursor: 'pointer'
                                },
                                on: {
                                    click: () => {
                                        this.showEditModal(params.row, 0);
                                    }
                                }
                            }, params.row.coinName);
                        }
                    },
                    {
                        title: '币种分组',
                        key: 'currencyGroup',
                        render: (h, params) => {
                            return h('span', this.getCurrencyGroupName(params.row.currencyGroup));
                        }
                    },
                    // {
                    //     title: 'Memo地址',
                    //     key: 'coinDes',
                    //     render: (h, params) => {
                    //         return h('span', params.row.coinDes ? params.row.coinDes.substring(0, 50) + '…' : '-');
                    //     }
                    // },
                    {
                        title: '发行总量',
                        key: 'totalNumber'
                    },
                    {
                        title: '联系人',
                        key: 'userName'
                    },
                    {
                        title: '手机号',
                        key: 'userTel'
                    },
                    {
                        title: 'Skype',
                        key: 'userSkype'
                    },
                    /* {
                        title: '上币申请书',
                        key: 'projectExcel',
                        render: (h, params) => {
                            if (params.row.projectExcel) {
                                return h('a', {
                                    attrs: {
                                        'href': params.row.projectExcel,
                                        'target': '_blank'
                                    }
                                }, '查看上币申请书');
                            } else {
                                return h('span', '-');
                            }
                        }
                    }, */
                    {
                        title: '白皮书地址',
                        key: 'whiteBook',
                        render: (h, params) => {
                            if (params.row.whiteBook) {
                                return h('a', {
                                    attrs: {
                                        'href': params.row.whiteBook,
                                        'target': '_blank'
                                    }
                                }, '查看白皮书');
                            } else {
                                return h('span', '-');
                            }
                        }
                    },
                    // 用户上币申请状态 1:审核中 2:未通过 3:已通过代缴费 4:调试中 5:已上线
                    {
                        title: '状态',
                        key: 'applyState',
                        render: (h, params) => {
                            return h('span', this.applyState[params.row.applyState]);
                        }
                    },
                    {
                        title: '申请时间',
                        key: 'createTime',
                        render: (h, params) => {
                            return h('span', params.row.createTime ? params.row.createTime.split('.')[0] : '');
                        }
                    },
                    {
                        title: '更新时间',
                        key: 'updateTime',
                        render: (h, params) => {
                            return h('span', params.row.updateTime ? params.row.updateTime.split('.')[0] : '');
                        }
                    },
                    {
                        width: 200,
                        title: '操作',
                        render: (h, params) => {
                            return h('div', {
                                style: {
                                    paddingBottom: '5px'
                                }
                            }, [
                                this.g_perm('by') ? h('Button', {
                                    props: {
                                        type: 'success',
                                        size: 'small',
                                        disabled: params.row.applyState > 3 || params.row.applyState === 0 || params.row.applyState === 3
                                    },
                                    style: {
                                        marginTop: '5px',
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.setCoinStatus(params.row, 1);
                                        }
                                    }
                                }, '通过') : '',
                                this.g_perm('fail') ? h('Button', {
                                    props: {
                                        type: 'warning',
                                        size: 'small',
                                        disabled: params.row.applyState > 3 || params.row.applyState === 0 || params.row.applyState === 2
                                    },
                                    style: {
                                        marginTop: '5px',
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.setCoinStatus(params.row, 0);
                                        }
                                    }
                                }, '不通过') : '',
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
                                            this.showEditModal(params.row, 0);
                                        }
                                    }
                                }, '编辑') : '',
                                this.g_perm('config') ? h('Button', {
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
                                            this.showEditModal(params.row, 1);
                                        }
                                    }
                                }, '配置') : '',
                                this.g_perm('test') ? h('Button', {
                                    props: {
                                        type: 'warning',
                                        size: 'small',
                                        disabled: params.row.fundsType === null
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
                                }, '测试') : '',
                                this.g_perm('margin') ? h('Button', {
                                    props: {
                                        type: 'error',
                                        size: 'small',
                                        disabled: params.row.userAccountName === null
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
                                }, '保证金') : ''
                            ]);
                        }
                    }
                ],
                formItem: {
                    status: '',
                    googleCode: ''
                },
                ruleValidate: {
                    googleCode: [
                        {required: true, len: 6, message: '请输入6位数字的谷歌验证码', trigger: 'blur'},
                        {validator: number, trigger: 'blur'}
                    ]
                },
                currencyGroupList: [
                    {
                        value: 1,
                        label: '主流币种'
                    },
                    {
                        value: 2,
                        label: '创新币种'
                    }
                ],
                optionsStart: {
                    disabledDate: (date) => {
                        let end = this.coinEndDate.valueOf();
                        if (end) {
                            return date && date.valueOf() > end;
                        } else {
                            return false;
                        }
                    }
                },
                optionsEnd: {
                    disabledDate: (date) => {
                        let start = this.coinStartDate.valueOf();
                        if (start) {
                            return date && date.valueOf() < start;
                        } else {
                            return false;
                        }
                    }
                },
                applyState: ['-', '审核中', '未通过', '已通过', '调试中', '已上线'], // 用户上币申请状态 1:审核中 2:未通过 3:已通过代缴费 4:调试中 5:已上线  0是老数据
                currRow: {}, // 当前编辑项
                modalStatus: false,
                modalTitle: '添加',
                loading: false, // 按钮加载状态
                tableData: [],
                coinStartDate: '',
                coinEndDate: '',
                dateStartVal: '',
                dateEndVal: '',
                searchVal: '',
                isMemo: '', // 是否带有 memo 
                editType: -1, // 编辑类型 0编辑或新增项目 1配置 2钱包测试 3释放保证金
                pageNum: 1,
                pageSize: 10,
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
                        // 提交变更
                        this.updateCoinStatus();
                    }
                });
            },
            handleReset () {
                this.$refs.formItem.resetFields();
                this.modalStatus = false;
            },
            setCloseModal () {
                // 重置编辑类型,关闭弹窗
                this.editType = -1;
            },
            // 更新审核状态
            updateCoinStatus () {
                let params = {
                }
                let obj = Object.assign(params, this.currRow);
                obj.applyState = this.formItem.status;
                obj.googleCode = this.formItem.googleCode;

                this.loading = true;
                api.updateCoinInfo(obj).then((res) => {
                    this.loading = false;
                    if (res.data.code == 1) {
                        this.$Message.success('审核成功！');
                        this.handleReset();
                        // 提交成功重新获取
                        this.getListData();
                    }
                });
            },
            showEditModal (currRow, type) {
                this.editType = type;
                this.currRow = currRow || {};
            },
            searchData () {
                // 重置页码
                this.pageNum = 1;
                this.total = 0;

                this.getListData();
            },
            getListData () {
                let params = {
                    beginTime: this.dateStartVal,
                    endTime: this.dateEndVal,
                    coinName: this.searchVal,
                    currentPage: this.pageNum,
                    pageSize: this.pageSize,
                    isMemo: this.isMemo
                }
                api.getCoinsList(params).then((res) => {
                    if (res.data.code == 1) {
                        this.tableData = res.data.data.obj || [];
                        this.total = res.data.data.totalCount;
                    }
                });
            },
            getCurrencyGroupName (value) {
                for (let i = 0; i < this.currencyGroupList.length; i++) {
                    if (this.currencyGroupList[i].value === value) {
                        return this.currencyGroupList[i].label;
                    }
                }
                return '-';
            },
            // 用户上币申请状态 1:审核中 2:未通过 3:已通过代缴费 4:调试中 5:已上线
            setCoinStatus (currRow, type) {
                if (type === 0) {
                    this.modalTitle = '审核不通过';
                    this.formItem.status = 2;
                } else {
                    this.modalTitle = '审核通过';
                    this.formItem.status = 3;
                }
                this.currRow = currRow;
                this.modalStatus = true;
            },
            setStartDateVal (formatDate) {
                this.dateStartVal = formatDate;
            },
            setEndDateVal (formatDate) {
                this.dateEndVal = formatDate;
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
            this.getListData();
        },
        mounted () {
        }
    };
</script>
