<style lang="less" scoped>
    @import '../../../styles/common.less';
    @import 'financialReport.less';
</style>
<style>
    /*加载动画*/
    @keyframes ani-demo-spin {
        from { transform: rotate(0deg);}
        50%  { transform: rotate(180deg);}
        to   { transform: rotate(360deg);}
    }
    .demo-spin-icon-load{
        animation: ani-demo-spin 1s linear infinite;
    }
</style>

<template>
    <div class="content">
        <Row class="et-row">
            <Col>
                <template v-if="contact === 'userStatistics'">
                    <span>请选择月份：</span>
                    <DatePicker v-model="monthObj" format="yyyy-MM" :editable="false" :clearable="false" @on-change="setSendMonthVal" type="month" placeholder="请选择月份" style="width: 180px"></DatePicker>
                </template>
                <template v-else>
                    <span>请选择日期：</span>
                    <DatePicker v-model="dateObj" format="yyyy-MM-dd" :editable="false" :clearable="false" @on-change="setSendDateVal" type="date" placeholder="请选择日期" style="width: 180px"></DatePicker>
                </template>
                <span style="margin-left: 15px;">请选择报表：</span>
                <div class="search-out">
                    <Select v-model="contact" @on-change="getResetData">
                        <Option v-for="item in reportList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                    </Select>
                </div>
                <Button type="primary" icon="ios-search" style="margin-left: 5px;" @click="getResetData">查询</Button>
                <Button type="info" class="add_account" icon="plus-round" @click="exportReportHandle" v-if="g_perm('export')">导出Excel</Button>
            </Col>
        </Row>
        <Table border :columns="tableColumns1" :data="tableData1" v-if="contact === 'companyEarningsFinancial'"></Table>
        <Table border :columns="tableColumns2" :data="tableData2" v-if="contact === 'bitbankFinancial'"></Table>
        <Table border :columns="tableColumns3" :data="tableData3" v-if="contact === 'clientFinancial'"></Table>
        <Table border :columns="tableColumns4" :data="tableData4" v-if="contact === 'userStatistics'"></Table>
        <Table border :columns="tableColumns5" :data="tableData5" v-if="contact === 'companyFinancial'"></Table>
        <div style="position: relative;">
            <Page class="pages" :current="pageNum" :total="total" show-elevator show-sizer :page-size="pageSize" :page-size-opts="sizeOpts" @on-change="changePageNum" @on-page-size-change="changePageSize"></Page>
        </div>
        <Spin size="large" fix v-if="spinShow"></Spin>
    </div>
</template>

<script>
    import api from '@/api/financial'
    import axios from '@/axios/config'
    import moment from 'moment'

    export default {
        name: 'financialReport',
        data () {
            return {
                req_url: axios.defaults.baseURL,
                spinShow: false,
                dateObj: '',
                sendTime: '', // 选择日期
                monthObj: '',
                sendMonth: '', // 选择月份
                contact: 'companyEarningsFinancial', // 报表类型
                // 报表名称
                reportList: [
                    {
                        value: 'companyEarningsFinancial',
                        label: '公司收益统计表',
                        index: 1
                    },
                    {
                        value: 'bitbankFinancial',
                        label: '数字货币总表-银行',
                        index: 2
                    },
                    {
                        value: 'clientFinancial',
                        label: '数字货币总表-客户',
                        index: 3
                    },
                    {
                        value: 'userStatistics',
                        label: '用户活跃统计表',
                        index: 4
                    },
                    {
                        value: 'companyFinancial',
                        label: '公司自有账户',
                        index: 5
                    }
                ],
                tableColumns1: [
                    {
                        title: '日期',
                        key: 'date',
                        // render: (h, params) => {
                        //     return h('span', params.row.date ? params.row.date.split(' ')[0] : '');
                        // }
                    },
                    {
                        title: '币种',
                        key: 'propTag'
                    },
                    {
                        title: '提币手续费',
                        key: 'eluateCoinCharge'
                    },
                    {
                        title: '公司本日支出手续费',
                        key: 'companyTodayCharge'
                    },
                    {
                        title: '公司账户返还佣金',
                        key: 'companyReturnCommission'
                    },
                    {
                        title: '公司账户分红收入',
                        key: 'companyAccountDividend'
                    },
                    {
                        title: '公司帐户挖矿收入',
                        key: 'companyMine'
                    },
                    {
                        title: '公司帐户营销支出',
                        key: 'companyMarketing'
                    },
                    {
                        title: '公司帐户净收入小计',
                        key: 'companyNetReceiptCount'
                    },
                    {
                        title: '实际手续费',
                        key: 'practicalCharge'
                    },
                    {
                        title: '返佣佣金',
                        key: 'returnCommission'
                    },
                    {
                        title: '分红支出',
                        key: 'dividendPay'
                    },
                    {
                        title: '挖矿支出',
                        key: 'minePay'
                    },
                    {
                        title: '平台净收入小计',
                        key: 'platformIncomeCount'
                    },
                    {
                        title: '归属公司净收入',
                        key: 'companyNetReceiptCount1'
                    },
                    {
                        title: 'EXX成交价',
                        key: 'exxCurrentRate'
                    },
                    {
                        title: '公司净收入金额',
                        key: 'companyNetReceiptAmount'
                    },
                    {
                        title: '收入占比',
                        key: 'incomeProportion'
                    }
                ],
                tableData1: [],
                tableColumns2: [
                    {
                        title: '日期',
                        key: 'date'
                    },
                    {
                        title: '币种',
                        key: 'propTag'
                    },
                    {
                        title: 'Bitbank商户版存币数',
                        key: 'merchantEditionDeposit'
                    },
                    {
                        title: '交易系统存币数',
                        key: 'transactionDeposit'
                    },
                    {
                        title: '差异',
                        key: 'difference'
                    }
                ],
                tableData2: [],
                tableColumns3: [
                    {
                        title: '日期',
                        key: 'date'
                    },
                    {
                        title: '币种',
                        key: 'propTag'
                    },
                    {
                        title: 'T-2日24:00结存数量',
                        key: 'beforeYesterDayNumber'
                    },
                    {
                        title: 'T-1日发放糖果数量',
                        key: 'candyNumber'
                    },
                    {
                        title: 'QC与CNYT互转',
                        key: 'qccnytTransform'
                    },
                    {
                        title: 'T-1日币充值数量',
                        key: 'rechargeNumber'
                    },
                    {
                        title: 'T-1日币提现数量',
                        key: 'bringUpNumber'
                    },
                    {
                        title: 'T-1日净流入/(出）数量',
                        key: 'pureInOutNumber'
                    },
                    {
                        title: '本日手续费支出',
                        key: 'fees'
                    },
                    {
                        title: '返还佣金',
                        key: 'returnCommission'
                    },
                    {
                        title: '分红收入',
                        key: 'dividendIncome'
                    },
                    {
                        title: '挖矿收入',
                        key: 'mineDiggingIncome'
                    },
                    {
                        title: 'T-1日24:00结存数量',
                        key: 'yesterdayNumber'
                    },
                    {
                        title: '结存数量误差',
                        key: 'numberError'
                    },
                    {
                        title: 'exx 系统成交价格',
                        key: 'transactionPrice'
                    },
                    {
                        title: 'T-1结存 * exx币种价格',
                        key: 'incomePrice'
                    }
                ],
                tableData3: [],
                tableColumns4: [
                    {
                        title: '日期',
                        key: 'date'
                    },
                    {
                        title: '今日活跃用户',
                        key: 'todayAvtiveUserNumber'
                    },
                    {
                        title: '用户总数',
                        key: 'userTotalNumber'
                    },
                    {
                        title: '新增用户数',
                        key: 'newAddUsers'
                    },
                    {
                        title: '用户活跃率',
                        key: 'userActiveRate'
                    },
                    {
                        title: '今日交易用户数',
                        key: 'entrustNumber'
                    },
                    {
                        title: '交易用户占比',
                        key: 'entrustRate'
                    }
                ],
                tableData4: [],
                tableColumns5: [
                    {
                        title: '日期',
                        key: 'date'
                    },
                    {
                        title: '币种',
                        key: 'propTag'
                    },
                    {
                        title: 'T-2日24:00结存数量',
                        key: 'beforeYesterDayNumber'
                    },
                    {
                        title: 'T-1日发放糖果数量',
                        key: 'candyNumber'
                    },
                    {
                        title: 'T-1日币充值数量',
                        key: 'rechargeNumber'
                    },
                    {
                        title: 'T-1日币提现数量',
                        key: 'bringUpNumber'
                    },
                    {
                        title: 'T-1日净流入/(出）数量',
                        key: 'pureInOutNumber'
                    },
                    {
                        title: '交易买入',
                        key: 'tradeBuy'
                    },
                    {
                        title: '交易卖出',
                        key: 'tradeSell'
                    },
                    {
                        title: '本日手续费支出',
                        key: 'fees'
                    },
                    {
                        title: '返还佣金',
                        key: 'returnCommission'
                    },
                    {
                        title: '分红收入',
                        key: 'dividendIncome'
                    },
                    {
                        title: '挖矿收入',
                        key: 'mineDiggingIncome'
                    },
                    {
                        title: '营销支出',
                        key: 'companyMarketing'
                    },
                    {
                        title: 'T-1日24:00结存数量',
                        key: 'yesterdayNumber'
                    },
                    {
                        title: '结存数量误差',
                        key: 'numberError'
                    },
                    {
                        title: '收入累计',
                        key: 'incomeAccumulated'
                    },
                    {
                        title: 'exx 系统成交价格',
                        key: 'transactionPrice'
                    },
                    {
                        title: '公司账户结存 * exx币种价格',
                        key: 'incomePrice'
                    },
                    {
                        title: '平台收入 * exx成交价',
                        key: 'platformIncomePrice'
                    }
                ],
                tableData5: [],
                // 分页
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
            getListData () {
                if (this.sendTime === '') {
                    this.$Message.warning('请先选择日期！');
                    return;
                }

                this.spinShow = true;
                let dateVal = this.contact === 'userStatistics' ? this.sendMonth + '-01' : this.sendTime;
                let params = {
                    sendTime: dateVal,
                    contact: this.contact,
                    pageIndex: this.pageNum,
                    pageSize: this.pageSize
                }
                const currTableData = 'tableData' + this.getTableIndex(this.contact);

                api.getFinancialList(params).then((res) => {
                    if (res.data.code == 1) {
                        this[currTableData] = res.data.data.list;
                        this.total = res.data.data.count;
                    }
                    this.spinShow = false;
                });
            },
            exportReportHandle () {
                let bitbank = [],
                    tabHead = [];
                const currTableColumns = this['tableColumns' + this.getTableIndex(this.contact)];
                currTableColumns.forEach((item, index) => {
                    bitbank.push(item.key);
                    tabHead.push(item.title);
                });

                let dateVal = this.contact === 'userStatistics' ? this.sendMonth + '-01' : this.sendTime;
                let params = {
                    sendTime: dateVal,
                    contact: this.contact,
                    bitbank: bitbank,
                    tabHead: tabHead
                }
                api.exportReportList(params).then((res) => {
                    // 处理文件流
                    let blob = new Blob([res.data], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
                    let objectUrl = URL.createObjectURL(blob);
                    // window.location.href = objectUrl;

                    const filename = this.getTableLabel(this.contact) + '_' + this.sendTime + '.xlsx';
                    let link = document.createElement('a');
                    link.download = filename;
                    link.href = objectUrl;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                    this.$Message.success('导出成功！');
                });
            },
            getResetData () {
                this.pageNum = 1;
                this.total = 0;

                this.getListData();
            },
            getTableIndex (table) {
                for (let i = 0; i < this.reportList.length; i++) {
                    if (this.reportList[i].value === table) {
                        return this.reportList[i].index;
                    }
                }
            },
            getTableLabel (table) {
                for (let i = 0; i < this.reportList.length; i++) {
                    if (this.reportList[i].value === table) {
                        return this.reportList[i].label;
                    }
                }
            },
            setSendDateVal (formatDate) {
                this.sendTime = formatDate;

                this.getResetData();
            },
            setSendMonthVal (formatMonth) {
                this.sendMonth = formatMonth;

                this.getResetData();
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
            // 设置当前日期
            this.dateObj = new Date();
            this.sendTime = moment(this.dateObj).format('YYYY-MM-DD');
            this.monthObj = new Date();
            this.sendMonth = moment(this.dateObj).format('YYYY-MM');

            this.getListData();
        },
        mounted () {
        }
    };
</script>
