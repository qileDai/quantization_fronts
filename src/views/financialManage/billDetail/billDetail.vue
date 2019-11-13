<template>
  <div class="bill-detail">
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
        <span class="left-space">用户名：</span>
        <Input style="width:150px" placeholder="搜索用户名" v-model="userName"></Input>
        <span class="left-space">币种：</span>
        <Select style="width:150px" placeholder="全部" filterable v-model="coin" @on-change="optionsChange">
          <Option value="">全部</Option>
          <Option :value="item.fundsType" v-for="(item, index) in allCoins" :key="index">{{ item.keyEn }}</Option>
        </Select>
        <span class="left-space">记账类型：</span>
        <Select style="width:100px" placeholder="全部" v-model="type" @on-change="optionsChange">
          <Option value="">全部</Option>
          <Option :value="1">充值</Option>
          <Option :value="2">提现</Option>
          <Option :value="10003">分成</Option>
          <Option :value="15">佣金</Option>
          <Option value="buySellCoin">币币交易</Option>
          <Option value="other">其他</Option>
        </Select>
        <div style="display:inline-block" v-if="$isCustomize()">
          <span class="left-space">来源：</span>
          <Select style="width:150px" placeholder="全部" filterable v-model="from" @on-change="optionsChange">
            <Option value="">全部</Option>
            <Option :value="item.id" v-for="(item, index) in froms" :key="index" >{{ item.stationName }}</Option>
          </Select>
        </div>
        <Button class="left-space" type="primary" icon="ios-search" @click="optionsChange">查询</Button>
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
        :current= pageNum
        >
        </Page>
    </div>
  </div>
</template>

<script>
import api from '@/api/financialManage/billDetail.js'
import commonApi from '@/api/commonApi/commonApi.js'

export default {
  data () {
    return {
      pageNum: 1,
      pageSize: 20,
      startTime: '', //开始时间
      endTime: '', // 结束时间
      userName: '', // 用户名
      type: '', // 记账类型
      coin: '', // 币种
      from: '', // 来源
      endDateObj: '',
      startDateObj: '',
      sizeOpts: [10, 20, 50, 100],
      totalCount: 0,
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
      
      tHeaderText: [
        {title: '发生时间', key: 'sendTime' },
        {title: '用户名', key: 'userName'},
        {title: '记账类型', key: 'typeText'},
        // {title: '来源', key: 'stationName'},
        {title: '币种', key: 'coinName'},
        {title: '发生金额', key: 'amount'},
        {title: '费用', key: 'fees'},
        {title: '余额', key: 'balance'}
      ],
      tableData: [],
      allCoins: null, // 说有币种
      froms: null
    }
  },
  methods: {
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
    // 选项改变时
    optionsChange() {
      this.pageNum = 1
      this.pageSize = 20
      this.getData()
    },
    // 获取数据
    async getData() {
      let args = {
        pageIndex: this.pageNum,
        pageSize: this.pageSize,
        startTime: this.startTime,
        endTime: this.endTime,
        userName: this.userName.trim(),
        fundsType: this.coin,
        type: this.type,
        stationId: this.from
      }
      const { data } = await api.getData(args)
      this.tableData = data.data.obj || []
      this.totalCount = data.data.totalCount
    },
    // 获取币种
    async getAllCoins() {
      const { data } = await commonApi.getAllCoins()
      this.allCoins = data.data || []
    },
    // 获取来源
    async getFrom() {
      const { data } = await commonApi.getForm()
      this.froms = data.data || []
    }
  },
  created() {
    this.getAllCoins()
    this.getFrom()
    this.getData()
    if(this.$isCustomize()) {
      this.tHeaderText.splice(3, 0, 
        // {title: '记账类型', key: 'typeText'},
        {title: '来源', key: 'stationName'}
      )
    }
  }
}
</script>

<style>

</style>

