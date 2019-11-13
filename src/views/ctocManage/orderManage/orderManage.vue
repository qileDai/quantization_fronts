<style lang="less" scoped>
    @import '../../../styles/common.less';
    @import 'orderManage.less';
</style>

<template>
    <div class="content">
        <Row class="et-row">
            <Col>
            <span>订单创建时间：</span>
            <span class="option-text">从</span>
            <DatePicker v-model="startDateObj" format="yyyy-MM-dd" :options="optionsStart" :editable="false" @on-change="setStartDateVal" type="date" placeholder="请选择开始日期" style="width: 180px"></DatePicker>
            <span class="option-text">到</span>
            <DatePicker v-model="endDateObj" format="yyyy-MM-dd" :options="optionsEnd" :editable="false" @on-change="setEndDateVal" type="date" placeholder="请选择结束日期" style="width: 180px"></DatePicker>
            <!--<span style="margin-left: 15px;">币种：</span>-->
            <!--<div class="search-out" style="width: 100px;">
                <Select v-model="fundsName" clearable placeholder="请选择币种">
                    <Option value="cnyt">CNYT</Option>
                    <Option value="usdt">USDT</Option>
                </Select>
            </div>-->
            <span style="margin-left: 15px;">订单类型：</span>
            <div class="search-out" style="width: 100px;">
                <Select v-model="orderType" clearable placeholder="请选择">
                    <Option v-for="item in orderTypeList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                </Select>
            </div>
            <span style="margin-left: 15px;">订单状态：</span>
            <div class="search-out" style="width: 100px;">
                <Select v-model="orderStatus" clearable placeholder="请选择">
                    <Option v-for="item in orderStatusList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                </Select>
            </div>
            <span style="margin-left: 15px;">用户名：</span>
            <div class="search-out">
                <Input v-model.trim="userName" placeholder="搜索用户名" clearable></Input>
            </div>
            <Button type="primary" icon="ios-search" style="margin-left: 5px;" @click="findData">查询</Button>
            <Button type="info" class="add_account" icon="plus-round" @click="exportListHandle" v-if="g_perm('export')">导出报表</Button>
            </Col>
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

    export default {
        name: 'orderManage',
        data () {
            return {
                req_url: axios.defaults.baseURL,
                tableColumns: [
                    {
                        title: '订单编号',
                        key: 'no'
                    },
                    {
                        title: '订单类型',
                        key: 'adType',
                        render: (h, params) => {
                            return h('span', params.row.adType == 1 ? '买入' : '卖出');
                        }
                    },
                    {
                        title: '买方账号',
                        key: 'buyUserName'
                    },
                    {
                        title: '卖方账号',
                        key: 'sellUserName'
                    },
                    {
                        title: '价格',
                        key: 'price'
                    },
                    {
                        title: '数量',
                        key: 'amount'
                    },
                    {
                        title: '订单金额',
                        key: 'fundPrice'
                    },
                    {
                        title: '订单状态',
                        key: 'status',
                        render: (h, params) => {
                            return h('span', this.getOrderStatus(params.row.status));
                        }
                    },
                    {
                        title: '创建时间',
                        key: 'createTime',
                        render: (h, params) => {
                            return h('span', params.row.createTime ? params.row.createTime.split('.')[0] : '');
                        }
                    }
                ],
                tableData: [],
                startDateObj: '',
                endDateObj: '',
                startDate: '', // 开始时间
                endDate: '', // 结束时间
                // fundsName: 'cnyt',
                orderType: '',
                orderStatus: '',
                userName: '',
                orderTypeList: [
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
                orderStatusList: [
                    {
                        value: 'all',
                        label: '全部',
                        types: []
                    },
                    {
                        value: '2',
                        label: '已完成',
                        types: [2, 9, 10, 11]
                    },
                    {
                        value: '3',
                        label: '处理中',
                        types: [1, 3, 4, 7]
                    },
                    {
                        value: '1',
                        label: '已取消',
                        types: [0, 5, 6, 8]
                    }
                ],
                optionsStart: {
                    disabledDate: (date) => {
                        let end = this.endDateObj.valueOf();
                        if (end) {
                            return date && date.valueOf() > end;
                        } else {
                            return false;
                        }
                    }
                },
                optionsEnd: {
                    disabledDate: (date) => {
                        let start = this.startDateObj.valueOf();
                        if (start) {
                            return date && date.valueOf() < start;
                        } else {
                            return false;
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
        computed: {
        },
        methods: {
            findData () {
                // 重置页码
                this.pageNum = 1;
                this.total = 0;

                this.getListData();
            },
            getListData () {
                let params = {
                    startDate: this.startDate,
                    endDate: this.endDate,
                    // fundsType: this.fundsName,
                    adType: this.orderType === 'all' ? '' : this.orderType,
                    status: this.orderStatus === 'all' ? '' : this.orderStatus,
                    userName: this.userName,
                    pageIndex: this.pageNum,
                    pageSize: this.pageSize
                }
                api.orderManageList(params).then((res) => {
                    if (res.data.code == 1) {
                        this.tableData = res.data.data.orderList || [];
                        this.total = res.data.data.count;
                    }
                });
            },
            getOrderStatus (val) {
                for (let i = 0; i < this.orderStatusList.length; i++) {
                    if (this.orderStatusList[i].types.indexOf(parseInt(val)) >= 0) {
                        return this.orderStatusList[i].label;
                    }
                }
                return '-';
            },
            exportListHandle () {
                let bitbank = [],
                    tabHead = [];
                this.tableColumns.forEach((item, index) => {
                    bitbank.push(item.key);
                    tabHead.push(item.title);
                });

                let params = {
                    bitbank: bitbank,
                    tabHead: tabHead,
                    startDate: this.startDate,
                    endDate: this.endDate,
                    // fundsType: this.fundsName,
                    adType: this.orderType === 'all' ? '' : this.orderType,
                    status: this.orderStatus === 'all' ? '' : this.orderStatus,
                    userName: this.userName
                }
                api.exportOrderList(params).then((res) => {
                    // 处理文件流
                    let blob = new Blob([res.data], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
                    let objectUrl = URL.createObjectURL(blob);
                    // window.location.href = objectUrl;

                    const filename = 'c2c订单报表' + '.xlsx';
                    let link = document.createElement('a');
                    link.download = filename;
                    link.href = objectUrl;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                    this.$Message.success('导出成功！');
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
