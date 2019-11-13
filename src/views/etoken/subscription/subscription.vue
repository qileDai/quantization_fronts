<style lang="less" scoped>
    @import '../../../styles/common.less';
    @import 'subscription.less';
</style>

<template>
    <div class="content">
        <Row class="et-row">
            <Col>
                <span>请选择日期：</span>
                <DatePicker class="et-date" :value="et_date" format="yyyy年MM月dd日" type="date" placeholder="请选择日期" style="width: 200px"></DatePicker>
                <span>请选择购买币种：</span>
                <Select class="et-select" v-model="selVal" style="width:200px">
                    <Option v-for="item in payCoins" :value="item" :key="item">{{ item.toUpperCase() }}</Option>
                </Select>
                <div class="total-num">总计：<span>{{totalCoin}}</span> {{selVal.toUpperCase() || 'ET'}}</div>
            </Col>
        </Row>
        <Table border :columns="tableColumns" :data="tableData"></Table>
        <div style="position: relative;"><Page class="pages" :current="pageNum" :total="total" show-elevator show-sizer :page-size="pageSize" :page-size-opts="sizeOpts"></Page></div>
    </div>
</template>

<script>
    import api from '@/api/etokenManage'
    import axios from '@/axios/config'
    import moment from 'moment'

    export default {
        name: 'subscription',
        data () {
            return {
                req_url: axios.defaults.baseURL,
                tableColumns: [
                    {
                        title: '用户',
                        key: 'userName'
                    },
                    {
                        title: '认购套餐',
                        key: 'crowdfunding_config_Name'
                    },
                    {
                        title: '套餐金额',
                        key: 'amount'
                    },
                    {
                        title: '认购份数',
                        key: 'numPart'
                    },
                    {
                        title: '持有比例',
                        key: 'rate'
                    },
                    {
                        title: '认购时间',
                        key: 'createTime',
                        render: (h, params) => {
                            return h('span', params.row.createTime ? params.row.createTime.split('.')[0] : '');
                        }
                    }
                ],
                tableData: [],
                pageNum: 1,
                pageSize: 20,
                total: 0, // 总页数
                sizeOpts: [10, 20, 50, 100],
                et_date: '',
                selVal: '',
                payCoins: ['eth', 'zb', 'cnyt', 'usdt', 'btc', 'ltc'], // 货币类型
                totalCoin: 0
            };
        },
        watch: {
        },
        computed: {
        },
        methods: {
            getSubscription () {
                let params = {
                    date: this.et_date,
                    coin: this.selVal,
                    pageNum: this.pageNum,
                    pageSize: this.pageSize
                }
                api.getCrowdfunding(params).then((res) => {
                    if (res.data.code == 1) {
                        this.tableData = res.data.data;
                        this.total = res.data.total;
                    }
                });
                api.getTotalFund(params).then((res) => {
                    if (res.data.code == 1) {
                        this.totalCoin = res.data.data;
                    }
                });

            }
        },
        created () {
            this.getSubscription();
        },
        mounted () {
        }
    };
</script>
