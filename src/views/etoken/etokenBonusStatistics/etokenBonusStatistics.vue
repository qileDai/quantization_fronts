<style lang="less" scoped>
    @import '../../../styles/common.less';
    @import 'etokenBonusStatistics.less';
</style>

<template>
    <div class="content">
        <Row class="et-row">
            <Col>
            <span>请选择日期：</span>
            <DatePicker class="et-date" v-model="et_date" :clearable="false" format="yyyy-MM-dd" @on-change="setDateVal" type="date" placeholder="请选择日期" style="width: 180px"></DatePicker>
            <Button type="primary" @click="getDataList">查询</Button>
            <div class="search-out">
                <Input v-model="searchVal" placeholder="使用用户名过滤" clearable></Input>
            </div>
            <!-- <Button type="primary" icon="ios-search">搜索</Button> -->
            <Button type="primary" icon="plus-round" @click="downloadHandle" style="float: right;" v-if="g_perm('export')">下载分红统计</Button>
            </Col>
        </Row>
        <Row class="et-row">
            <Col span="6">
            <Card>
                <p slot="title">
                    <Icon type="social-bitcoin"></Icon>
                    币种分红统计
                </p>
                <Table border :columns="bonusCol" :data="bonusData"></Table>
            </Card>
            </Col>
            <Col span="18" class="padding-left-10">
            <Card>
                <p slot="title">
                    <Icon type="cube"></Icon>
                    用户分红统计
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
        name: 'etokenBonusStatistics',
        data () {
            return {
                req_url: axios.defaults.baseURL,
                tableColumns: [
                    {
                        title: '用户',
                        key: 'userName'
                    },
                    {
                        title: '分红金额',
                        key: 'addAmount'
                    },
                    {
                        title: '币种名称',
                        key: 'keyEn'
                    },
                    {
                        title: '折合CNYT金额',
                        key: 'cnytAmount'
                    },
                    {
                        title: '用户可用余额',
                        key: 'balance'
                    },
                    {
                        title: '用户冻结余额',
                        key: 'freez'
                    },
                    {
                        title: '未释放金额',
                        key: 'notfreedet'
                    },
                    {
                        title: '总分红收益',
                        key: 'sumIncome'
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
                tableData: [],
                bonusCol: [
                    {
                        title: '币种名称',
                        key: 'keyEn'
                    },
                    {
                        title: '总金额',
                        key: 'feeAmount'
                    }
                ],
                bonusData: [],
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
                api.getEtBonusRecords(params).then((res) => {
                    if (res.data.code == 1) {
                        this.tableData = res.data.data.obj || [];
                        this.total = res.data.data.totalCount;
                    }
                });
                // 分红币种列表
                this.getCoinsBonus();
            },
            // 分红币种统计
            getCoinsBonus () {
                let dateVal = new Date().getTime();
                let yesterdayVal = new Date(dateVal - 24 * 60 * 60 * 1000);

                let nowDate = yesterdayVal.toLocaleDateString();
                let nowVal = nowDate.split('/').join('-');
                if (!this.dateVal) {
                    this.et_date = yesterdayVal;
                }

                let params = {
                    countTime: this.dateVal || nowVal,
                    status: '2'
                }
                api.getEtBonusCoins(params).then((res) => {
                    if (res.data.code == 1) {
                        this.bonusData = res.data.data;
                    }
                });
            },
            downloadHandle () {
                let params = {
                }
                api.downloadStatistics(params).then((res) => {
                    // 处理文件流
                    let blob = new Blob([res.data], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
                    let objectUrl = URL.createObjectURL(blob);
                    // window.location.href = objectUrl;

                    const filename = 'ET分红统计.xlsx';
                    let link = document.createElement('a');
                    link.download = filename;
                    link.href = objectUrl;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                    // this.$Message.success('下载成功！');
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
