<style lang="less" scoped>
    @import '../../../styles/common.less';
    @import 'bitmallManager.less';
</style>

<template>
    <div class="content">
        <Row class="et-row">
            <Col>
            <span style="margin-left: 15px;">订单编号</span>
            <div class="search-out">
                <Input v-model.trim="orderId" placeholder="请输入订单编号" clearable></Input>
            </div>
            <span style="margin-left: 15px;">用户名称</span>
            <div class="search-out">
                <Input v-model.trim="orderUserName" placeholder="请输入用户名称" clearable></Input>
            </div>
            <span style="margin-left: 15px;">订单类型</span>
            <div class="search-out" style="width: 100px;">
                <Select v-model="orderType" clearable placeholder="请选择">
                    <Option v-for="item in orderStatusList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                </Select>
            </div>
            <span style="margin-left: 15px;">订单状态</span>
            <div class="search-out" style="width: 100px;">
                <Select v-model="orderStatus" clearable placeholder="请选择">
                    <Option v-for="item in orderTypeList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                </Select>
            </div>
            <span class="option-text">开始时间</span>
            <DatePicker v-model="startTime" format="yyyy-MM-dd HH:mm:ss" :options="optionsStart" :editable="false" @on-change="setStartDateVal" type="datetime" placeholder="请选择开始日期" style="width: 180px"></DatePicker>
            <span class="option-text">结束时间</span>
            <DatePicker v-model="endTime" format="yyyy-MM-dd HH:mm:ss" :options="optionsEnd" :editable="false" @on-change="setEndDateVal" type="datetime" placeholder="请选择结束日期" style="width: 180px"></DatePicker>
            <Button type="primary" icon="ios-search" style="margin-left: 5px;" @click="findData">查询</Button>
            <Button type="info" class="add_account"  @click="exportListHandle" v-if="g_perm('exportOrder')">导出报表</Button>
            </Col>
        </Row>
        <Row style="margin:20px 0;font-size:16px;line-height:24px">
            <span style="margin:0 16px 0 20px;">总买入: <strong style="font-size:20px;font-weight:600;color:#629fe7">{{buySum}}</strong></span>
            <span style="margin:0 30px;">总卖出: <strong style="font-size:20px;font-weight:600;color:#629fe7">{{sellSum}}</strong></span>
        </Row>
        <Table border :columns="tableColumns" :data="tableData"></Table>
        <div style="position: relative;">
            <Page class="pages" :current="pageNum" :total="total" show-elevator show-sizer :page-size="pageSize" :page-size-opts="sizeOpts" @on-change="changePageNum" @on-page-size-change="changePageSize"></Page>
        </div>
    </div>
</template>

<script>
    import api from '@/api/ctoc'
    import axios from '@/axios/config'
    import Cookies from 'js-cookie'

    export default {
        name: 'bitmallManager',
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
                        title: '订单编号',
                        key: 'orderId'
                    },
                    {
                        title: '用户名称',
                        key: 'userName'
                    },
                    {
                        title: '交易类型',
                        key: 'type',
                        render: (h, params) => {
                            return h('span', params.row.type==1?'买入':'卖出');
                        }
                    },
                    {
                        title: '交易金额',
                        key: 'amount'
                    },
                    {
                        title: '状态',
                        key: 'status',
                        render: (h, params) => {
                            return h('span', params.row.status==0?'未完成':(params.row.status==1?'取消订单':'完成订单'));
                        }
                    },
                    {
                        title: '下单时间',
                        key: 'createTime',
                        render: (h,params) => {
                            return h('span',params.row.createTime?params.row.createTime.split('.')[0]:'')
                        }
                    },
                    {
                        title: '完成时间',
                        key: 'updateTime',
                        render: (h,params) => {
                            return h('span',params.row.updateTime?params.row.updateTime.split('.')[0]:'')
                        }
                    }
                ],
                tableData: [],
                startTime: '',
                endTime: '',
                buySum:'',//总买入
                sellSum:'',//总卖出
                startDate: '', // 开始时间
                endDate: '', // 结束时间
                orderId: '',//订单编号
                orderUserName: '',//用户名
                orderStatus: '',//订单状态
                orderType: '',//订单类型
                orderTypeList: [
                    {
                        value: 'all',
                        label: '全部'
                    },
                    {
                        value: 0,
                        label: '未完成'
                    },
                    {
                        value: 1,
                        label: '取消订单'
                    },
                    {
                        value: 2,
                        label: '完成订单'
                    }
                ],
                orderStatusList: [
                    {
                        value: 'all',
                        label: '全部'
                    },
                    {
                        value: 1,
                        label: '买入'
                    },
                    {
                        value: 2,
                        label: '卖出'
                    }
                ],
                optionsStart: {
                    disabledDate: (date) => {
                        let end = this.endTime.valueOf();
                        if (end) {
                            return date && date.valueOf() > end || date.valueOf() > Date.now();
                        } else {
                            return date.valueOf() > Date.now();
                        }
                    }
                },
                optionsEnd: {
                    disabledDate: (date) => {
                        let start = this.startTime.valueOf();
                        if (start) {
                            return date && date.valueOf() < start || date.valueOf() > Date.now();
                        } else {
                            return date.valueOf() > Date.now();
                        }
                    }
                },
                pageNum: 1,
                pageSize: 20,
                total: 0, // 总页数
                sizeOpts: [10, 20, 50, 100]
            };
        },
        watch: {
        },
        filters:{
            orderStatusSet (status) {
                 return {
                     0:'未处理',
                     1:'取消订单',
                     2:'完成订单'
                 }[status]
            }
        },
        computed: {
            // 买家凭证
            picfilename () {
                let value = this.appealList.appealUserId == this.appealList.buyUserId ? this.appealList.picfilename : this.appealList.picture;
                return value ? value.split(',') : [];
            },
            // 卖家凭证
            picture () {
                let value = this.appealList.appealUserId == this.appealList.sellUserId ? this.appealList.picfilename : this.appealList.picture;
                return value ? value.split(',') : [];
            }
        },
        methods: {
            exportListHandle () {
                let params = {
                    startTime: this.startDate,
                    endTime: this.endDate,
                    orderId: this.orderId,
                    status: this.orderStatus=='all'?'':this.orderStatus,
                    userName: this.orderUserName,
                    type: this.orderType=='all'?'':this.orderType,
                    pageIndex: this.pageNum,
                    pageSize: this.pageSize
                }
                api.bitMallExportOrders(params).then((res) => {
                    // 处理文件流
                    let blob = new Blob([res.data], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
                    let objectUrl = URL.createObjectURL(blob);
                    const filename = 'bitMall订单报表' + '.xlsx';
                    let link = document.createElement('a');
                    link.download = filename;
                    link.href = objectUrl;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                    this.$Message.success('导出成功！');
                });
            },
            findData () {
                // 重置页码
                this.pageNum = 1;
                this.total = 0;

                this.getListData();
            },
            getListData () {
                let params = {
                    startTime: this.startDate,
                    endTime: this.endDate,
                    orderId: this.orderId,
                    status: this.orderStatus=='all'?'':this.orderStatus,
                    userName: this.orderUserName,
                    type: this.orderType=='all'?'':this.orderType,
                    pageIndex: this.pageNum,
                    pageSize: this.pageSize
                }
                api.bitMallOrders(params).then((res) => {
                    if (res.data.code == 1) {
                        this.tableData = res.data.data.obj || [];
                        this.total = res.data.data.totalCount;
                        this.buySum = Number(res.data.data.buySum);
                        this.sellSum = Number(res.data.data.sellSum);
                    }
                });
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
            this.getListData();
        },
        mounted () {
        }
    };
</script>
