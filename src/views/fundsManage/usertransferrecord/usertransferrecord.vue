<template>
  <div class="assets-manage">
    <Row class="search-padding">
      <Col>
        <span>订单号：</span>
        <Input style="width:150px" placeholder="搜索订单号" v-model="orderId"></Input>
        <span>转出账户：</span>
        <Input style="width:150px" placeholder="搜素转出账户" v-model="userName"></Input>
        <span>选择时间：</span>
        <span class="option-text">开始时间</span>
        <DatePicker v-model="startTime" format="yyyy-MM-dd HH:mm:ss" :options="optionsStart" :editable="false" @on-change="setStartDateVal" type="datetime" placeholder="请选择开始日期" style="width: 180px"></DatePicker>
        <span class="option-text">结束时间</span>
        <DatePicker v-model="endTime" format="yyyy-MM-dd HH:mm:ss" :options="optionsEnd" :editable="false" @on-change="setEndDateVal" type="datetime" placeholder="请选择结束日期" style="width: 180px"></DatePicker>
        <Button class="left-space" type="primary"  v-if="g_perm('select')" @click="selectGetData">查询</Button>
      </Col>
    </Row>
    <Table border :columns="tHeader" :data="fieldsData" style="margin-top: 10px"></Table>
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
import api from '@/api/fundsManage/assetsmanage.js'
import commonApi from '@/api/commonApi/commonApi.js'
export default {
  data() {
    return {
      orderId: '', // 订单号
      userName: '', // 转账账户
      startTime: '',
      endTime: '',
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
      assetsCoin: '', // 资产币种
      from: '', // 来源
      totalCount: 0, // 数据总数
      pageSizeOpts: [10, 20, 50, 100],
      pageSize: 20, // 每页显示数量
      pageNum: 1, // 页码
      allCoins: [], // 所有资产币种
      collect: {}, // 数据汇总
      froms: null, // 来源
      tHeader: [
        { title: '订单号', key: 'orderId'},
        { title: '转出账户', key: 'userName'},
        // { title: '来源', key: 'stationName'},
        { title: '转入账户', key: 'receiveUserName'},
        { title: '转账金额', key: 'amount'},
        { title: '转账手续费', key: 'fee'},
        { 
          title: '转账时间',
          key: 'transferTime',
          render: (h, params) => {
              return h('span',{},params.row.transferTime.split('.')[0]);
          }},
        { 
          title: '转账状态', 
          key: 'status',  
          render: (h, params) => {
              return h('span', {},
                 params.row.status == 0 ? '转账失败' : '转账成功'
              );
          }}
      ],
      // 表格数据
      fieldsData: [],
    }
  },
  methods: {
    setStartDateVal (formatDate) {
        console.log('f',formatDate)
        this.startDate = formatDate;
    },
    setEndDateVal (formatDate) {
        this.endDate = formatDate;
    },
    // 切换每页显示条数
    changePageSize(size) {
      this.pageSize = size
      if (this.pageNum === 1) {
          this.getData()
      }
    },
    // 页数改变时
    changePage(page) {
      this.pageNum = page
      this.getData()
    },
    selectGetData() {
      this.pageSize = 20
      this.pageNum = 1
      this.getData()
    },
    // 获取资金数据
    async getData() {
      let { userName, pageSize, pageNum, orderId, endTime, startTime } = this
      const { data } = await api.searchTransferRecord({
        pageSize,
        pageNum,
        userName,
        orderId,
        startTime:this.startDate,
        endTime:this.endDate,
      })
      this.fieldsData = data.data.obj || []
      this.totalCount = data.data.totalCount || 0
    }
  },
  
  async created() {
    // 获取所有资产币种
    // const { data } = await commonApi.getAllCoins()
    // this.allCoins = data.data
    // await this.getForm()
    await this.getData()
    // if(this.$isCustomize()) {
    //   this.tHeader.splice(2, 0, { title: '来源', key: 'stationName'})
    // }
  }
}
</script>

<style lang="less" scoped>
.assets-count{
  position: relative;
  font-size: 16px;
  margin: 5px 10px 0;
  .count {
    display: flex;
    p {
      margin-left: 10px;
      span {
        color: #ed3f14;
      }
    }
  }
  .no-assetsCoin {
    span {
      margin-left: 10px;
      color: #999;
    }
  }
}
</style>

