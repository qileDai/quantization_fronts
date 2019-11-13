<template>
  <!-- 提币模块 -->
  <div class="extract-module">
    <Row>
      <Col>
        <Button 
          v-for="(watch, index) in watchBtnText" 
          :key="index" 
          :type="watchFlag === index ? 'primary': 'ghost'"
          @click="watchFlag = index, setType()"
          style="margin-right: 10px"
          >{{watch}}</Button>
      </Col>
    </Row>
    <!-- 检索条件 -->
    <div class="selectBox">
        <!-- 时间区域 -->
        <span>选择时间：</span>
        <span class="option-text">开始时间</span>
        <DatePicker v-model="startTime" format="yyyy-MM-dd HH:mm:ss" :clearable="false" :options="optionsStart" :editable="false" @on-change="setStartDateVal" type="datetime" style="width: 180px"></DatePicker>
        <span class="option-text">结束时间</span>
        <DatePicker v-model="endTime" format="yyyy-MM-dd HH:mm:ss" :clearable="false" :options="optionsEnd" :editable="false" @on-change="setEndDateVal" type="datetime" style="width: 180px"></DatePicker>
        <!-- 币种 -->
        <span class="left-space">币种：</span>
        <Select style="width:100px" filterable v-model="coinName" @on-change="optionsChange">
            <Option v-for="(coin, index) in allCoins" :key="index" :value="coin">{{coin}}</Option>
        </Select>
        <!-- 用户名 -->
        <span>用户名：</span>
        <Input style="width:150px" placeholder="搜索用户名" v-model="userName"></Input>
        <!-- 最小值 -->
        <span>最小数量：</span>
        <Input style="width:150px" placeholder="请输入最小数量" v-model="minAmount"></Input>
        <Button class="left-space" type="primary"  v-if="g_perm('select')" @click="selectGetData">查询</Button>
        <Button class="right-pos" type="primary" @click="exportExcel" v-if="g_perm('exportDownload')">导出EXCEL</Button>
    </div>
    <!-- 表格数据 -->
    <Table border :columns="tHeader" :data="fieldsData" style="margin-top: 10px"></Table>
    <!-- 数据量 -->
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
import axios from '@/axios/config';
import commonApi from "@/api/commonApi/commonApi.js";
import { getCoins, getCoinsId } from '@/api/inoutentrust/inoutentrust.js' ;// 封装的获取 所有币种 Promise 函数 
import api from '@/api/inoutentrust/inoutentrustApi.js'

function setTime () {
    let year = new Date().getFullYear();
    let month =new Date().getMonth() + 1 < 10? "0" + (new Date().getMonth() + 1): new Date().getMonth() + 1;
    let date =new Date().getDate() < 10? "0" + new Date().getDate(): new Date().getDate();
    let time = year + "-" + month + "-" + date +" ";
    return time
}
function setStartTime () {
    let time = setTime() + '00:00:00'
    return time
}
function setEndTime () {
    let time = setTime() + '23:59:59'
    return time
}
export default {
    data () {
        return {
            watchBtnText: ['净买入', '净卖出'],
            watchFlag: 0, 
            type: 20, // 类型
            startTime: setStartTime(), // 开始时间
            startDate: setStartTime(),
            endTime: setEndTime(), // 结束时间
            endDate: setEndTime(),
            allCoins: [], // 所有币种
            coinName: '', // 币种名
            allFundsType: [], // 所有币种ID
            fundsType: 0, // 币种ID
            fundsTypeNum: 0, // 当前币种名对应的序号
            minAmount: '', // 最小值
            userName: '', // 用户名

            totalCount: 0, // 数据总数
            pageSizeOpts: [10, 20, 50, 100], //选择每页数量
            pageSize: 20, // 每页显示数量
            pageNum: 1, // 页码

            tHeader: [
                { title: '用户ID', key: 'userId'},
                { title: '用户名', key: 'userName'},
                { title: '姓名', key: 'realName'},
                { title: '证件号', key: 'credentials'},
                { title: '币种', key: 'coinName' },
                { title: '数量', key: 'amount'},
                { 
                    title: '时间',
                    key: 'sendTime',
                    render: (h, params) => {
                        return h('span',{},params.row.sendTime.split('.')[0]);
                    }
                }
            ],
            fieldsData: [], // 表格数据
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
        }
    },
    methods: {
        // 时间区间
        setStartDateVal (formatDate) {
            console.log('f',formatDate)
            this.startDate = formatDate;
        },
        setEndDateVal (formatDate) {
            this.endDate = formatDate;
        },
        // 表格切换
        setType() {
            this.type = this.watchFlag === 0 ? 20 : 21
            this.getTabData()
        },
        optionsChange(e) {
            this.pageSize = 20;
            this.pageNum = 1;
            this.fundsTypeNum = this.allCoins.indexOf(this.coinName)
            if (this.allFundsType.length != 0) {
                this.fundsType = this.allFundsType[this.fundsTypeNum]
                this.getTabData()
            } 
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
        selectGetData() {
            this.pageSize = 20
            this.pageNum = 1
            this.getTabData()
        },
        setCurrencyMarket (data) {
            let currency = this.allMarketType.filter((item, key) => {
                return item.marketName === data;
            });
            this.formItemActivity.marketId = currency[0].id;
            this.getTabData()
        },
        // 获取币种
        async getForm() {
            const { data } = await commonApi.getForm();
            this.froms = data.data || [];
        },
        // 导出表格
        exportExcel() {
            let { endTime, fundsType, minAmount, pageNum, pageSize, startTime, userName, type } = this;
            endTime = this.endDate;
            startTime = this.startDate;
            let args = { endTime, fundsType, minAmount, pageNum, pageSize, startTime, userName, type }
            api.extractExportExcel(args).then(res => {
                // 处理文件流
                let blob = new Blob([res.data], {
                    type:
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    });
                let objectUrl = URL.createObjectURL(blob);

                const filename = this.watchFlag == 0 ? "净买入.xlsx" : '净卖出.xlsx';
                let link = document.createElement("a");
                link.download = filename;
                link.href = objectUrl;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                // this.$Message.success("下载成功！");
            });
        },
        getTabData() {
            axios({
                method: 'post',
                url: this.req_url + 'entrust/currentRecord/getBillByInOut',
                data: {
                    endTime: this.endDate ,
                    fundsType: this.fundsType,
                    minAmount: this.minAmount,
                    pageNum: this.pageNum,
                    pageSize: this.pageSize,
                    startTime: this.startDate , 
                    userName: this.userName,
                    type: this.type,
                }
            })
            .then(response => {
                if ( response.data.data == null || response.data.data.obj == null ) {
                    this.fieldsData = []
                    this.totalCount = 0
                } else {
                    this.fieldsData = response.data.data.obj
                    this.totalCount = response.data.data.totalCount
                }
            })
        }
    },
    created () {
        //币种获取
        this.getForm(),
        getCoins().then(res => {
            this.allCoins = res
            this.coinName = this.allCoins[0]
            this.fundsTypeNum = this.allCoins.indexOf(this.coinName)
            getCoinsId().then(res => {
                this.allFundsType = res
                this.fundsType = this.allFundsType[this.fundsTypeNum]
                this.getTabData()
            })
        })
    }
}
</script>
<style lang="less" scoped>
    .ivu-col {
        margin: 10px 0;
    }
    .selectBox {
        margin-left: 10px;
        position: relative;
        margin-bottom: 20px;
    }
    .right-pos {
        position: absolute;
        right: 0;
        bottom: -15px;
    }
</style>