<style lang="less" scoped>
    @import '../../../styles/common.less';
    @import 'etokenIssue.less';
</style>

<template>
    <div class="content">
        <Row class="et-row">
            <Col>
                <span>请选择日期：</span>
                <DatePicker class="et-date" v-model="et_date" :clearable="false" format="yyyy-MM-dd" type="date" placeholder="请选择日期" style="width: 180px" @on-change="doChangeHandle"></DatePicker>
                <Button type="primary" @click="getEtIssueStatus">查询</Button>
                <div class="search-out">
                    <Input v-model="searchVal" placeholder="搜索用户名" clearable></Input>
                </div>
                <Button type="primary" icon="ios-search">搜索</Button>
                <Button type="primary" style="float: right;" icon="android-send" @click="doIssueTip" v-if="g_perm('dell')">发放ET</Button>
            </Col>
        </Row>
        <Row class="et-row" v-cloak>
            <Col>
                <span>请选择时间点：</span>
                <RadioGroup v-model="time_radio" type="button" @on-change="getDataList" v-if="issueStatus.length > 0">
                    <Radio :label="getEtHours(item.countTime)" v-for="(item, index) in issueStatus" :key="index" :disabled="item.status == 2">{{getEtHours(item.countTime)}}点</Radio>
                </RadioGroup>
                <span class="nodig" v-else>该日期暂无挖矿记录</span>
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
        name: 'etokenIssue',
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
                        title: '待发放ET数量',
                        key: 'amount'
                    },
                    {
                        title: '状态',
                        key: 'status',
                        render: (h, params) => {
                            return h('span', params.row.status == '0' ? '未处理' : (params.row.status == '1' ? '处理异常' : '处理完成'));
                        }
                    },
                    {
                        title: '统计时间点',
                        key: 'countTimeString',
                        render: (h, params) => {
                            return h('span', params.row.countTimeString ? params.row.countTimeString.split('.')[0] : '');
                        }
                    },
                    {
                        title: '统计时间',
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
                time_radio: '', // 时间点
                issueStatus: [],
                pageNum: 1,
                pageSize: 20,
                total: 0, // 总页数
                sizeOpts: [10, 20, 50, 100]
            };
        },
        watch: {
        },
        computed: {
            // 昨日零点时刻
            nowTime: function () {
                let dateVal = new Date().getTime();
                let yesterdayVal = new Date(dateVal - 24 * 60 * 60 * 1000);
                yesterdayVal.setHours(0);
                yesterdayVal.setMinutes(0);
                yesterdayVal.setSeconds(0);
                yesterdayVal.setMilliseconds(0);

                return yesterdayVal.getTime();
            },
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
                    this.$Message.warning('请选择发放时间!');
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

                let selectDate = this.et_date;
                selectDate.setHours(this.time_radio);
                let params = {
                    timestamp: selectDate.getTime()
                }
                api.doIssueEt(params).then((res) => {
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
            getEtHours (item) {
                let dateItem = new Date(item);
                return dateItem.getHours();
            },
            getDataList () {
                let timeVal;
                if (typeof this.et_date === 'object') {
                    let selectDate = this.et_date;
                    selectDate.setHours(this.time_radio);
                    timeVal = selectDate.getTime();
                } else {
                    // 重新获取
                    this.getEtIssueStatus();
                    return false;
                }
                let params = {
                    timestamp: timeVal,
                    pageNum: this.pageNum,
                    pageSize: this.pageSize
                }
                api.getIssueList(params).then((res) => {
                    if (res.data.code == 1) {
                        this.tableData = res.data.data.obj || [];
                        this.total = res.data.data.totalCount;
                    }
                });
            },
            getEtIssueStatus () {
                // 获取时间点发放状态
                let dateVal;
                if (typeof this.et_date === 'object') {
                    let selectDate = this.et_date;
                    selectDate.setHours(0);
                    dateVal = selectDate.getTime();
                } else {
                    dateVal = this.nowTime;
                    this.et_date = new Date(this.nowTime);
                }
                let pm = {
                    timestamp: dateVal
                }
                api.getEtIssueStatusByHour(pm).then((res) => {
                    if (res.data.code == 1) {
                        this.issueStatus = res.data.data;
                        // 设置默认时间点
                        this.setDefaultHour();

                        this.getDataList();
                    }
                });
            },
            // 设置默认时间点
            setDefaultHour () {
                if (this.issueStatus.length > 0) {
                    for (let i = 0; i < this.issueStatus.length; i++) {
                        if (this.issueStatus[i].status === 0 || this.issueStatus[i].status === 1) {
                            this.time_radio = new Date(this.issueStatus[i].countTime).getHours();
                            console.log(this.time_radio)
                            break;
                        }
                    }
                } else {
                    this.time_radio = '';
                }
            },
            doChangeHandle () {
                this.$nextTick(() => {
                    this.getEtIssueStatus();
                });
            },
            changePageNum (pageNum) {
                this.pageNum = pageNum;
                this.getEtIssueStatus();
            },
            changePageSize (pageSize) {
                this.pageNum = 1;
                this.pageSize = pageSize;
                this.getEtIssueStatus();
            }
        },
        created () {
            this.getEtIssueStatus();
        },
        mounted () {
        }
    };
</script>
