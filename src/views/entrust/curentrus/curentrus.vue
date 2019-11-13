<template>
  <div class="assets-manage">
    <Row class="search-padding">
      <Col>
          <Form ref="formItem" :model="formItemActivity" :rules="ruleValidateActivity">
            <FormItem label="购买交易对：" prop="marketName">
              <Select style="width:150px" v-model="formItemActivity.marketName" @on-change="setCurrencyMarket" clearable filterable>
                <Option v-for="(item, index) in allMarketType" :key="index" :value="item.marketName">{{item.marketName}}</Option>
              </Select>
            </FormItem>
          </Form>
        <span>用户名：</span>
        <Input style="width:150px" placeholder="搜索用户名" v-model="userName"></Input>
        &nbsp;
        <span>选择时间：</span>
        <span class="option-text">开始时间:</span>
        <DatePicker v-model="startTime" format="yyyy-MM-dd HH:mm:ss" :options="optionsStart" :editable="false" @on-change="setStartDateVal" type="datetime" placeholder="请选择开始日期" style="width: 180px"></DatePicker>
        <span class="option-text">结束时间:</span>
        <DatePicker v-model="endTime" format="yyyy-MM-dd HH:mm:ss" :options="optionsEnd" :editable="false" @on-change="setEndDateVal" type="datetime" placeholder="请选择结束日期" style="width: 180px"></DatePicker>
        <Form ref="formItem">
          <FormItem label='类型：' prop="typesName">
            <Select style="width:120px" v-model="typesSel.typesName" @on-change="typesSelect">
              <Option v-for="(item, key) in typesList" :key="key" :value="item.label"></Option>
            </Select>
          </FormItem>
        </Form>
        <Button class="left-space" type="primary"  v-if="g_perm('select')" @click="selectGetData">查询</Button>
        <Button class="right-pos" type="primary" @click="exportExcel" v-if="g_perm('exportDownload')">导出EXCEL</Button>
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
import apiB from '@/api/banner';
import axios from '@/axios/config';
import api from '@/api/fundsManage/assetsmanage.js'
import commonApi from '@/api/commonApi/commonApi.js'
import apiA from '@/api/inoutentrust/curentrusApi.js'
import {setTime, setStartTime, setEndTime} from '@/api/inoutentrust/curentrusApi.js'
export default {
  data () {
    return {
      // 用户ID  用户名  姓名  价格  数量  时间 
      
      // userID: '', // 用户ID
      startTime: '', // 开始时间
      startDate: '',
      endTime: '', // 结束时间
      endDate: '',
      userName: '',
      // 交易对
      formItemActivity: {
        marketName: '', // 交易对名称
        marketId: '', // 交易对id
        selectActivityInfo: null
      },
      typesList: [
        {
          value: null,
          label: '全部'
        },
        {
          value: 0,
          label: '卖出'
        },
        {
          value: 1,
          label: '买入'
        },
      ],
      // 类型
      typesSel: {
        typesId: null, // 类型ID
        typesName: '全部' //类型名称
      },
      allMarketType: [],
      ruleValidateActivity: {},

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

      totalCount: 0, // 数据总数
      pageSizeOpts: [10, 20, 50, 100], //选择每页数量
      pageSize: 20, // 每页显示数量
      pageNum: 1, // 页码
      tHeader: [
        { title: '用户ID', key: 'userId'},
        { title: '用户名', key: 'userName'},
        { title: '姓名', key: 'realName'},
        { title: '单价', key: 'unitPrice'},
        { 
          title: '类型', 
          key: 'types',
          render: (h, params) => {
            return h('span',{},params.row.types == 0 ? '卖出' : '买入');
          }
        },
        { title: '数量', key: 'numbers'},
        { title: '总价', key: 'totalMoney'},
        { 
          title: '时间',
          key: 'submitTime',
          render: (h, params) => {
              return h('span',{},params.row.submitTime.split('.')[0]);
          }
        },
      ],
      fieldsData: [],
      req_url: axios.defaults.baseURL,
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
    // 类型选择
    typesSelect () {
      this.typesSel.typesId = this.typesSel.typesName == '全部'? null : (this.typesSel.typesName == '卖出'? 0 : 1)
    },
    //获取交易对
    getMarketType () {
     apiB.searchMarketType().then(res => {
      this.allMarketType = res.data.data || [];
      this.formItemActivity.marketId = this.allMarketType[0].id
      this.formItemActivity.marketName = this.allMarketType[0].marketName
     })
    },

    getTabData() {
      axios({
        method: 'post',
        url: this.req_url + 'entrust/currentRecord/getEntrustRecordByMarket',
        data: {
          endTime: this.endDate ,
          marketId: this.formItemActivity.marketId,
          pageNum: this.pageNum,
          pageSize: this.pageSize,
          startTime: this.startDate , 
          userName: this.userName,
          types: this.typesSel.typesId
        }
      })
      .then(response => {
        if (response.data.data == null) {
          this.fieldsData = []
          this.totalCount = 0
        } else {
          this.fieldsData = response.data.data.obj
          this.totalCount = response.data.data.totalCount
        }
      })
    },
    // 导出表格
        exportExcel() {
            let { endTime, marketId, pageNum, pageSize, startTime, userName, types } = this;
            endTime = this.endDate;
            startTime = this.startDate;
            marketId = this.formItemActivity.marketId;
            types = this.typesSel.typesId;
            let args = { endTime, marketId, pageNum, pageSize, startTime, userName, types }
            apiA.extractExportExcel(args).then(res => {
                // 处理文件流
                console.log(args)
                let blob = new Blob([res.data], {
                    type:
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    });
                let objectUrl = URL.createObjectURL(blob);

                const filename = '当前委托.xlsx';
                let link = document.createElement("a");
                link.download = filename;
                link.href = objectUrl;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                // this.$Message.success("下载成功！");
            });
        },
  },
  async created() {
    this.getMarketType()
  }
}
</script>

<style lang="less" scoped>
  form.ivu-form.ivu-form-label-right {
    display: inline-block;
    width: 240px;
  }
</style>
