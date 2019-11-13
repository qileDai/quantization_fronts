<template>
    <div id="transentrust">
        <Row class="search-padding">
            <Col>
                <!-- 查询条件： 时间范围，卖用户，买用户，交易对，价格范围 -->

                <Form ref="formItem" :model="formItemActivity" :rules="ruleValidateActivity">
                    <FormItem label="购买交易对：" prop="marketName">
                    <Select style="width:100px" v-model="formItemActivity.marketName" @on-change="setCurrencyMarket" filterable>
                        <Option v-for="(item, index) in allMarketType" :key="index" :value="item.marketName">{{item.marketName}}</Option>
                    </Select>
                    </FormItem>
                </Form>
                <span>价格范围：从</span>
                <Input placeholder="请输入最低价格" v-model="fromUnitPrice" style="width:100px" clearable ></Input>
                <span>-</span>
                <Input placeholder="请输入最高价格" v-model="toUnitPrice" style="width:100px" clearable></Input>
                <span>卖方用户账号：</span>
                <Input placeholder="请输入卖方账号" v-model="userNameSell" style="width:100px" clearable ></Input>
                <span>买方用户账号：</span>
                <Input placeholder="请输入买方账号" v-model="userNameBuy" style="width:100px" clearable ></Input>
                <span>选择时间：</span>
                <span class="option-text">开始时间:</span>
                <DatePicker v-model="startTime" format="yyyy-MM-dd HH:mm:ss" :options="optionsStart" :editable="false" @on-change="setStartDateVal" type="datetime" placeholder="请选择开始日期" style="width: 160px"></DatePicker>
                <span class="option-text">结束时间:</span>
                <DatePicker v-model="endTime" format="yyyy-MM-dd HH:mm:ss" :options="optionsEnd" :editable="false" @on-change="setEndDateVal" type="datetime" placeholder="请选择结束日期" style="width: 160px"></DatePicker>
                
                <Button type="primary" icon="ios-search" @click="getTabData" v-if="g_perm('select')">查询</Button>
                <Button  icon="ios-download-outline" type="primary" class="rightBtn" @click="exportExcel" v-if="g_perm('exportDownload')">导出表格</Button>

            </Col>
        </Row>
            <Table border :columns="tHeader" :data="tData" style="margin-top: 10px"></Table>
        <div style="position: relative">
        <Page 
            class="pages" 
            show-sizer 
            show-elevator
            show-total
            :total="totalCount" 
            :page-size-opts="pageSizeOpts"
            :page-size="pageSize" 
            :current="pageNum"
            @on-page-size-change="changePageSize" 
            @on-change="changePage"></Page>
        </div>
    </div>
</template>
<script>
import apiB from '@/api/banner';
import axios from '@/axios/config';
import api from '@/api/inoutentrust/transentrust';
    export default {
        data () {
            return {
                // 交易对
                formItemActivity: {
                    marketName: '', // 交易对名称
                    marketId: '', // 交易对id
                    selectActivityInfo: null
                },
                allMarketType: [],
                ruleValidateActivity: {},
                fromUnitPrice: '',// 开始价格范围 
                toUnitPrice: '',//结束价格范围
                userNameSell: '',//卖方用户账号
                userNameBuy: '',//买方用户账号
                startTime: '', // 开始时间
                startDate: '',
                endTime: '', // 结束时间
                endDate: '',
                req_url: axios.defaults.baseURL,
                // 时间区间
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
                //表格数据
                tHeader: [
                    {
                        title: '卖方账户',
                        key: 'userNameSell'
                    },
                    {
                        title: '卖方(实名信息)',
                        key: 'realNameSell'
                    },
                    {
                        title: '买方账户',
                        key: 'userNameBuy'
                    },
                    {
                        title: '买方（实名信息）',
                        key: 'realNameBuy'
                    },
                    {
                        //价格
                        title: '单价',
                        key: 'unitPrice'
                    },
                    {
                        title: '数量',
                        key: 'numbers'
                    },
                    {
                        //交易金额
                        title: '总价',
                        key: 'totalPrice'
                    },
                    {
                        title: '成交时间',
                        key: 'times'
                    },
                    {
                        title: '状态',
                        key: 'statusAlies',
                    }
                ],
                tData: [],
                
                totalCount: 0, // 数据总数
                pageSizeOpts: [10, 20, 50, 100], //选择每页数量
                pageSize: 20, // 每页显示数量
                pageNum: 1, // 页码
            }
        },
        methods: {
            //获取交易对
            getMarketType () {
                apiB.searchMarketType().then(res => {
                    this.allMarketType = res.data.data || [];
                    this.formItemActivity.marketId = this.allMarketType[0].id
                    this.formItemActivity.marketName = this.allMarketType[0].marketName
                })
            },
            setCurrencyMarket (data) {
                let currency = this.allMarketType.filter((item, key) => {
                    return item.marketName === data;
                });
                this.formItemActivity.marketId = currency[0].id;
                this.getTabData()
            },

            //表格获取
            async getTabData () {
                let {endTime, fromUnitPrice, marketId, pageNum, pageSize, startTime, toUnitPrice, userNameBuy, userNameSell} = this;
                marketId = this.formItemActivity.marketId;
                endTime = this.endDate;
                startTime = this.startDate;
                axios({
                    method: 'post',
                    url: this.req_url + 'entrust/transRecord/getTransRecordByMarket',
                    data: {
                        endTime, fromUnitPrice, marketId, pageNum, pageSize, startTime, toUnitPrice, userNameBuy, userNameSell
                    }
                })
                .then(response => {
                    if (response.data.data == null) {
                        this.tData = []
                        this.totalCount = 0
                    } else {
                        this.tData = response.data.data.obj
                        this.totalCount = response.data.data.totalCount
                    }
                })
            },

            // 时间选择
            setStartDateVal (formatDate) {
                this.startDate = formatDate;
            },
            setEndDateVal (formatDate) {
                this.endDate = formatDate;
            },

            // 切换每页显示条数
            changePageSize(size) {
                this.pageSize = size
                if (this.pageNum === 1) {
                    this.getTabData()
                }
            },
            // 页数改变时
            changePage(page) {
                this.pageNum = page
                this.getTabData()
            },




            // 导出表格
            exportExcel() {
                let { endTime, fromUnitPrice, marketId, pageNum, pageSize, startTime, toUnitPrice, userNameBuy, userNameSell } = this;
                endTime = this.endDate;
                startTime = this.startDate;
                marketId = this.formItemActivity.marketId;

                let args = { endTime, fromUnitPrice, marketId, pageNum, pageSize, startTime, toUnitPrice, userNameBuy, userNameSell }
                api.extractExportExcel(args).then(res => {
                    // 处理文件流
                    let blob = new Blob([res.data], {
                        type:
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        });
                    let objectUrl = URL.createObjectURL(blob);

                    const filename = '成交记录.xlsx';
                    let link = document.createElement("a");
                    link.download = filename;
                    link.href = objectUrl;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                    // this.$Message.success("下载成功！");
                });
            }
        },
        async created() {
            this.getMarketType()
        }
    }
</script>
<style lang="less" scoped>
    form.ivu-form.ivu-form-label-right {
        display: inline-block;
        width: 200px;
    }
    .rightBtn {
        float: right;
    }
</style>