<style lang="less" scoped>
    @import '../../../styles/common.less';
    @import 'etokenBonus.less';
</style>

<template>
    <div class="content">
        <Row class="et-row">
            <Col>
                <span>请选择日期：</span>
                <DatePicker class="et-date" v-model="et_date" :clearable="false" format="yyyy-MM-dd" @on-change="setDateVal" type="date" placeholder="请选择日期" style="width: 180px"></DatePicker>
                <Button type="primary" @click="getDataList">查询</Button>
                <div class="search-out">
                    <Input v-model="searchVal" placeholder="搜索用户名" clearable></Input>
                </div>
                <Button type="primary" icon="ios-search">搜索</Button>
                <Button type="primary" style="float: right;" icon="android-send" @click="doIssueTip" v-if="g_perm('dell')">发放分红</Button>
            </Col>
        </Row>
        <Table border :columns="tableColumns" :data="filterData"></Table>
        <div style="position: relative;">
            <Page class="pages" :current="pageNum" :total="total" show-elevator show-sizer :page-size="pageSize" :page-size-opts="sizeOpts" @on-change="changePageNum" @on-page-size-change="changePageSize"></Page>
        </div>
        <Modal v-model="modalStatus" title="谷歌验证" width="500" @on-cancel="handleReset" :mask-closable="false">
            <Form ref="formItem" :model="formItem" :label-width="90" :rules="ruleValidate">
                <FormItem label="谷歌验证码" prop="code">
                    <Input v-model="formItem.code" :maxlength="6" placeholder="请输入谷歌验证码"></Input>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button type="text" size="large" @click="handleReset">取消</Button>
                <Button type="primary" size="large" @click="handleSubmit" :loading="loading">确定</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import api from '@/api/etokenManage'
    import googleApi from '@/api/google'
    import axios from '@/axios/config'
    import moment from 'moment'

    export default {
        name: 'etokenBonus',
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
                        title: '用户',
                        key: 'userName'
                    },
                    {
                        title: '分红金额',
                        key: 'amount'
                    },
                    {
                        title: '币种名称',
                        key: 'keyEn'
                    },
                    {
                        title: '状态',
                        key: 'status',
                        render: (h, params) => {
                            return h('span', params.row.status == '0' ? '未处理' : (params.row.status == '1' ? '处理异常' : '处理完成'));
                        }
                    },
                    {
                        title: '统计日期',
                        key: 'countTime',
                        render: (h, params) => {
                            return h('span', params.row.countTime ? params.row.countTime.split('.')[0] : '');
                        }
                    },
                    {
                        title: '创建时间',
                        key: 'createTime',
                        render: (h, params) => {
                            return h('span', params.row.createTime ? params.row.createTime.split('.')[0] : '');
                        }
                    },
                    /* {
                        title: '操作',
                        render: (h, params) => {
                            return h('div', {
                                style: {
                                    paddingBottom: '5px'
                                }
                            }, [
                                h('Button', {
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
                                            //
                                        }
                                    }
                                }, '发放')
                            ]);
                        }
                    } */
                ],
                formItem: {
                    code: ''
                },
                ruleValidate: {
                    code: [
                        {required: true, len: 6, message: '请输入6位数字的谷歌验证码', trigger: 'blur'},
                        {validator: number, trigger: 'blur'}
                    ]
                },
                modalStatus: false,
                loading: false, // 按钮加载状态
                tableData: [],
                searchVal: '',
                et_date: '',
                dateVal: '',
                pageNum: 1,
                pageSize: 20,
                total: 0, // 总页数
                sizeOpts: [10, 20, 50, 100]
            };
        },
        watch: {
        },
        computed: {
            // 过滤数据
            filterData () {
                let value = this.searchVal;
                if (value) {
                    return this.tableData.filter((item) => {
                        // 大小写都匹配
                        return item.userName.indexOf(value) > -1;
                    });
                } else {
                    return this.tableData;
                }
            }
        },
        methods: {
            handleSubmit () {
                this.$refs.formItem.validate((valid) => {
                    if (valid) {
                        // 进行谷歌检验
                        this.checkGoogle();
                    }
                });
            },
            handleReset () {
                this.$refs.formItem.resetFields();
                this.modalStatus = false;
            },
            doIssueTip () {
                // 发放校验
                if (this.et_date == '') {
                    this.$Message.warning('请选择发放日期!');
                    return;
                }
                if (this.tableData.length == 0) {
                    this.$Message.warning('该时间段暂无待发放用户!');
                    return;
                }

                this.$Modal.confirm({
                    title: '提示',
                    content: '确认发放 ？',
                    loading: true,
                    onOk: () => {
                        // 进行谷歌检验
                        this.checkGoogle();
                    }
                });
            },
            checkGoogle () {
                this.loading = true;

                // 传0检验是否需要谷歌验证
                let params = {
                    code: this.formItem.code || 0
                }
                googleApi.checkGoogleCode(params).then((res) => {
                    this.loading = false;
                    if (res.data.code == 1) {
                        // 清空输入
                        this.$refs.formItem.resetFields();
                        // 发放
                        this.doIssue();
                    } else if (res.data.code === -1 && this.formItem.code === '') {
                        // 需要谷歌验证码
                        this.googleModal();
                    } else {
                        this.$Message.error(res.data.msg);
                    }
                });
            },
            googleModal () {
                this.$Modal.remove();

                this.modalStatus = true;
            },
            doIssue () {
                this.loading = true;

                let nowDate = new Date(this.et_date).toLocaleDateString();
                let nowVal = nowDate.split('/').join('-');
                let params = {
                    times: this.dateVal || nowVal
                }
                api.doEtBonus(params).then((res) => {
                    this.loading = false;
                    if (res.data.code == 1) {
                        this.$Message.success('发放成功!');
                        this.handleReset();
                        // 刷新列表
                        this.getDataList();

                        this.$Modal.remove();
                    }
                });
            },
            getDataList () {
                let dateVal = new Date().getTime();
                let yesterdayVal = new Date(dateVal - 24 * 60 * 60 * 1000);

                let nowDate = yesterdayVal.toLocaleDateString();
                let nowVal = nowDate.split('/').join('-');
                if (!this.dateVal) {
                    this.et_date = yesterdayVal;
                }
                let params = {
                    times: this.dateVal || nowVal,
                    pageNum: this.pageNum,
                    pageSize: this.pageSize
                }
                api.getEtBonus(params).then((res) => {
                    if (res.data.code == 1) {
                        this.tableData = res.data.data.obj || [];
                        this.total = res.data.data.totalCount;
                    }
                });
            },
            setDateVal (formatDate) {
                this.dateVal = formatDate;
                // 切换日期自动查询
                this.getDataList();
            },
            changePageNum (pageNum) {
                this.pageNum = pageNum;
                this.getDataList();
            },
            changePageSize (pageSize) {
                this.pageNum = 1;
                this.pageSize = pageSize;
                this.getDataList();
            }
        },
        created () {
            this.getDataList();
        },
        mounted () {
        }
    };
</script>
