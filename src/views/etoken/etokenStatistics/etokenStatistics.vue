<style lang="less" scoped>
    @import '../../../styles/common.less';
    @import 'etokenStatistics.less';
</style>

<template>
    <div class="content">
        <Row class="et-row">
            <Col>
                <span>请选择日期：</span>
                <DatePicker class="et-date" v-model="et_date" :clearable="false" format="yyyy-MM-dd" type="date" placeholder="请选择日期" style="width: 180px" @on-change="doChangeHandle"></DatePicker>
                <Button type="primary" @click="getEtIssueStatus">查询</Button>
                <div class="search-out">
                    <Input v-model="searchVal" placeholder="按用户名搜索" clearable></Input>
                </div>
                <Button type="primary" icon="ios-search">搜索</Button>
                <p class="ettotal">当前ET均价：<span>{{currentEtPrice}} BTC</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 当前ET挖矿数量：<span>{{currentEtAmount}}</span></p>
            </Col>
        </Row>
        <Row class="et-row" v-cloak>
            <Col>
            <span>请选择时间点：</span>
            <RadioGroup v-model="time_radio" type="button" @on-change="getDataList" v-if="issueStatus.length > 0">
                <Radio :label="getEtHours(item.countTime)" v-for="(item, index) in issueStatus" :key="index">{{getEtHours(item.countTime)}}点</Radio>
            </RadioGroup>
            <span class="nodig" v-else>该日期暂无挖矿记录</span>
            </Col>
        </Row>
        <Row class="et-row">
            <Col span="6">
                <Card>
                    <p slot="title">
                        <Icon type="social-bitcoin"></Icon>
                        币种挖矿统计
                    </p>
                    <Table border :columns="statisticsCol" :data="statisticsData"></Table>
                </Card>
            </Col>
            <Col span="18" class="padding-left-10">
                <Card>
                    <p slot="title">
                        <Icon type="cube"></Icon>
                        用户挖矿统计
                    </p>
                    <Table border :columns="tableColumns" :data="filterData"></Table>
                    <div style="position: relative;">
                        <Page class="pages" :current="pageNum" :total="total" show-elevator show-sizer :page-size="pageSize" :page-size-opts="sizeOpts" @on-change="changePageNum" @on-page-size-change="changePageSize"></Page>
                    </div>
                </Card>
            </Col>
        </Row>
    </div>
</template>

<script>
    import api from '@/api/etokenManage'
    import axios from '@/axios/config'
    import moment from 'moment'

    export default {
        name: 'etokenStatistics',
        data () {
            return {
                req_url: axios.defaults.baseURL,
                tableColumns: [
                    {
                        title: '用户',
                        key: 'userName'
                    },
                    {
                        title: '账户ET数量',
                        key: 'etBalance'
                    },
                    {
                        title: '账户冻结ET数量',
                        key: 'etfreez'
                    },
                    {
                        title: '未发放ET数量',
                        key: 'notfreedet'
                    },
                    {
                        title: '发放数量',
                        key: 'amount'
                    },
                    {
                        title: '统计时间',
                        key: 'countTimeSting',
                        render: (h, params) => {
                            return h('span', params.row.countTimeSting ? params.row.countTimeSting.split('.')[0] : '');
                        }
                    },
                    {
                        title: '发放时间',
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
                tableData: [],
                statisticsCol: [
                    {
                        title: '币种名称',
                        key: 'keyEn'
                    },
                    {
                        title: '总金额',
                        key: 'feeAmount'
                    }
                ],
                statisticsData: [],
                currentEtPrice: 0,
                currentEtAmount: 0,
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

                // 获取挖矿手续费币种信息
                let vals = {
                    timestamp: timeVal,
                    pageNum: this.pageNum,
                    pageSize: this.pageSize
                }
                api.getEtDigStatistic(vals).then((res) => {
                    if (res.data.code == 1) {
                        this.tableData = res.data.data.digPayRecordModelPage.obj || [];
                        this.total = res.data.data.digPayRecordModelPage.totalCount;

                        this.statisticsData = res.data.data.etFeeSumModelList;
                        this.currentEtPrice = res.data.data.etPriceModel ? res.data.data.etPriceModel.etPrice : 0;
                        this.currentEtAmount = res.data.data.etSum;
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
                    this.time_radio = new Date(this.issueStatus[0].countTime).getHours();
                    console.log(this.time_radio)
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
