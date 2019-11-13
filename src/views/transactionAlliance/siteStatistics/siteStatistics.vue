<template>
  <div class="income">
    <Row class="search-padding">
      <Col>
        <span>开始时间：</span>
        <DatePicker 
          v-model="startDateObj" 
          @on-change = "val => startTime = val"
          :editable="false" 
          :clearable="true" 
          type="date" 
          placeholder="请选择开始时间" 
          style="width: 150px"
          :options="optionsStart"
          >
          </DatePicker>
        <span class="left-space">结束时间：</span>
        <DatePicker 
          v-model="endDateObj" 
          @on-change = "val => endTime = val"
          :editable="false" 
          :clearable="true" 
          type="date" 
          placeholder="请选择开始时间" 
          style="width: 150px"
          :options="optionsEnd"
          >
          </DatePicker>
        <!-- <Button class="left-space" type="info" v-for="(item, index) in fastTiem" :key="index">{{ item }}</Button> -->
        <Button class="left-space" type="primary" icon="ios-search" @click="search">查询</Button>
      </Col>
    </Row>
    <Table border :columns="tHeaderText" :data="tableData"></Table>
    <div style="position:relative">
      <Page 
        class="pages" 
        :page-size-opts="sizeOpts" 
        :page-size="pageSize" 
        show-sizer 
        show-elevator
        :total="totalCount" 
        @on-page-size-change="changePageSize" 
        @on-change="changePage"
        >
        </Page>
    </div>
  </div>
</template>

<script>
import api from '@/api/transactionAlliance/siteStatistics'

export default {
  data() {
    return {
      startTime: '', //开始时间
      endTime: '', // 结束时间
      endDateObj: '',
      startDateObj: '',
      // fastTiem: ['前一天', '近30天', '近一年'],
      tHeaderText: [
        {title: '日期', key: 'date'},
        {title: '注册用户', key: 'register_number'},
        {title: '登录用户', key: 'login_number'},
        {title: '交易用户', key: 'trade_number'},
        {title: '币种数量', key: 'coin_number'},
        {title: '交易对数量', key: 'market_number'}
      ],
      tableData: [],
      coins: [],
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
      sizeOpts: [10, 20, 50, 100],
      pageNum: 1,
      pageSize: 20,
      totalCount: 0,
    }
  },
  methods: {
    // 查询
    search() {
      this.pageNum = 1 // 重置页码
      this.totalCount = 1 // 重置数据总数量
      this.getData()
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
    // 获取数据
    async getData() {
      let { pageSize, pageNum, startTime, endTime } = this
      let args = {
        pageSize,
        pageIndex:pageNum,
        startTime,
        endTime,
      }
      let { data } = await api.getData(args)
      this.tableData = data.data.siteStatisticsModelList || []
      this.totalCount = data.data.totalCount
    },
  },
  async created() {
    this.getData()
  }
}
</script>


<style lang="less" scoped>

</style>

