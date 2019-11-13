<style lang="less" scoped>
    @import '../../../styles/common.less';
    @import 'transferMultiple.less';
</style>

<template>
    <div class="content">
        <Modal v-model="modalStatus" :title="modalTitle" width="1200" @on-cancel="handleReset" :mask-closable="false" :closable="false">
            <p class="close-icon" @click="handleReset"><Icon type="ios-close-empty" size="30"></Icon></p>
            <Row class="et-row">
                <Col>
                    <span>转入账户：</span>
                    <div class="search-out">
                        <Input v-model.trim="userName" placeholder="搜索转入账户" clearable></Input>
                    </div>
                    <span style="margin-left: 15px;">状态：</span>
                    <div class="search-out">
                        <Select v-model="status">
                            <Option v-for="item in transferList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                        </Select>
                    </div>
                    <Button type="primary" icon="ios-search" style="margin-left: 5px;" @click="getListData">搜索</Button>
                    <Button type="info" class="add_account" icon="plus-round" @click="transferBefore">一键转账</Button>
                </Col>
            </Row>
            <Table border :columns="tableColumns" :data="tableData" @on-selection-change="setSelectedItems"></Table>
            <div style="position: relative;">
                <Page class="pages" :current="pageNum" :total="total" show-elevator show-sizer :page-size="pageSize" :page-size-opts="sizeOpts" @on-change="changePageNum" @on-page-size-change="changePageSize"></Page>
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
    import api from '@/api/funds';
    import axios from '@/axios/config';

    export default {
        name: 'transferMultiple',
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
                tableColumns: [
                    {
                        type: 'selection',
                        width: 60,
                        align: 'center'
                    },
                    {
                        title: '转出账户',
                        key: 'fromUserName'
                    },
                    {
                        title: '转入账户',
                        key: 'toUserName'
                    },
                    {
                        title: '币种',
                        key: 'coinsName',
                        width: 80
                    },
                    {
                        title: '转账金额',
                        key: 'amount'
                    },
                    {
                        title: '转账类型',
                        render: (h, params) => {
                            return h('span', params.row.transferType === 1 ? '可用' : (params.row.transferType === 3 ? '可用转未释放' : '可用和未释放'));
                        }
                    },
                    {
                        title: '状态',
                        width: 100,
                        render: (h, params) => {
                            return h('span', this.cellStatus[params.row.status]);
                        }
                    },
                    {
                        title: '创建时间',
                        key: 'createTime',
                        render: (h, params) => {
                            return h('span', params.row.createTime ? params.row.createTime.split('.')[0] : '');
                        }
                    },
                    {
                        title: '转账时间',
                        key: 'sendTime',
                        render: (h, params) => {
                            return h('span', params.row.sendTime ? params.row.sendTime.split('.')[0] : '');
                        }
                    }
                ],
                // -1数据异常 0未处理 1处理失败 2处理成功
                cellStatus: {
                    '-1': '数据异常',
                    '0': '未处理',
                    '1': '处理失败',
                    '2': '处理成功'
                },
                // startDateObj: '',
                // endDateObj: '',
                // startDate: '', // 开始时间
                // endDate: '', // 结束时间
                tableData: [],
                userName: '',
                status: '',
                modalStatusGoogle: false,
                modalTitle: '批量转账',
                loadingGoogle: false,
                // 谷歌验证码
                formItemGoogle: {
                    googleCode: ''
                },
                ruleValidateGoogle: {
                    googleCode: [
                        {required: true, len: 6, message: '请输入6位数字的谷歌验证码', trigger: 'blur'},
                        {validator: number, trigger: 'blur'}
                    ]
                },
                selections: '', // 已选中ids
                transferList: [
                    {
                        value: 'all',
                        label: '全部'
                    },
                    {
                        value: 0,
                        label: '未处理'
                    },
                    {
                        value: 1,
                        label: '转账失败'
                    },
                    {
                        value: 2,
                        label: '转账成功'
                    }
                ],
                // optionsStart: {
                //     disabledDate: (date) => {
                //         let end = this.endDateObj.valueOf();
                //         if (end) {
                //             return date && date.valueOf() > end;
                //         } else {
                //             return false;
                //         }
                //     }
                // },
                // optionsEnd: {
                //     disabledDate: (date) => {
                //         let start = this.startDateObj.valueOf();
                //         if (start) {
                //             return date && date.valueOf() < start;
                //         } else {
                //             return false;
                //         }
                //     }
                // },
                editType: 0, // 编辑类型 0添加 1编辑
                pageNum: 1,
                pageSize: 20,
                total: 0, // 总页数
                sizeOpts: [10, 20, 50, 100]
            };
        },
        watch: {
            modalStatus (val, oldVal) {
                if (val) {
                    // 获取文件数据
                    this.getListData();
                }
            }
        },
        computed: {
        },
        methods: {
            handleReset () {
                this.selections = '';
                this.userName = '';
                this.status = '';

                this.$emit('closeModal');
            },
            handleSubmitGoogle () {
                this.$refs.formItemGoogle.validate((valid) => {
                    if (valid) {
                        // 转账
                        this.doTransferBatch();
                    }
                });
            },
            handleResetGoogle () {
                this.$refs.formItemGoogle.resetFields();
                this.modalStatusGoogle = false;
            },
            getListData () {
                let params = {
                    fileId: this.row.id,
                    userName: this.userName,
                    status: this.status === 'all' ? '' : this.status,
                    pageNum: this.pageNum,
                    pageSize: this.pageSize
                };
                api.getFilesTransferRecord(params).then((res) => {
                    if (res.data.code == 1) {
                        let result = res.data.data.obj || [];
                        result.forEach((item, index) => {
                            if (item.status === -1 || item.status === 2) {
                                // 已处理成功
                                item._disabled = true;
                            }
                        });

                        this.tableData = result;
                        this.total = res.data.data.totalCount;
                    }
                });
            },
            doTransferBatch () {
                let params = {
                    ids: this.selections,
                    googleCode: this.formItemGoogle.googleCode
                };
                api.transferBatch(params).then((res) => {
                    if (res.data.code == 1) {
                        // 转账成功
                        this.$Message.success('转账成功！');
                        this.handleResetGoogle();
                        // 提交成功重新获取
                        this.getListData();
                    } else if (res.data.code == -1) {
                        this.$Message.error(res.data.msg);
                    }
                });
            },
            setSelectedItems (selection) {
                let selectArr = [];
                selection.forEach((item, index) => {
                    selectArr.push(item.id);
                });

                this.selections = selectArr.join(',');
            },
            transferBefore () {
                if (this.selections === '') {
                    this.$Message.warning('未选中任何记录！');
                    return;
                }

                this.modalStatusGoogle = true;
            },
            setStartDateVal (formatDate) {
                this.startDate = formatDate;
            },
            setEndDateVal (formatDate) {
                this.endDate = formatDate;
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
        },
        mounted () {
        }
    };
</script>
