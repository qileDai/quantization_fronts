<template>
    <!-- 充币记录 -->
    <div>
        <Row style="padding:20px 0">
            <Col>
            <span>充币时间：</span>
            从
            <DatePicker type="date" placeholder="请选择开始时间" style="width: 150px" :options="optionsStart"
                        :value="timeStart" @on-change="val => timeStart = val"></DatePicker>
            到
            <DatePicker type="date" placeholder="请选择结束时间" style="width: 150px" :options="optionsEnd" :value="timeEnd"
                        @on-change="val => timeEnd = val"></DatePicker>
            <span class="left-space">币种：</span>
            <Select style="width:100px" placeholder="全部" filterable clearable v-model="coinName" @on-change="optionsChange">
                <Option v-for="(coin, index) in allCoins" :key="index" :value="coin">{{coin}}</Option>
            </Select>
            <span class="left-space">处理状态：</span>
            <Select style="width:100px" placeholder="全部" v-model="status" @on-change="optionsChange">
                <Option value="">全部</Option>
                <Option value="0">等待确认</Option>
                <Option value="1">失败</Option>
                <Option value="2">确认成功</Option>
                <Option value="3">取消</Option>
            </Select>
            <div style="display:inline-block" v-if="$isCustomize()">
                <span class="left-space">来源：</span>
                <Select style="width:150px" placeholder="全部" filterable v-model="from" @on-change="optionsChange">
                    <Option value="">全部</Option>
                    <Option v-for="(item, index) in froms" :value="item.stationName" :key="index">{{ item.stationName }}</Option>
                </Select>
            </div>
            <Input placeholder="使用用户名搜索" style="width: 150px; margin-left:20px" v-model="userName"></Input>
            <Button type="primary" style="margin-left:10px" @click="search">查询</Button>
            <Button type="error" @click="reset">重置</Button>
            <Button class="right-pos" type="primary" @click="exportExcel" v-if="g_perm('exportRechage')">导出EXCEL</Button>
            </Col>
        </Row>
        <Table border :columns="tHeaderData" :data="topupData" ref="tabDom"></Table>
        <div style="position:relative">
            <Page 
                class="pages" 
                :page-size-opts="sizeOpts" 
                :page-size="pageSize" 
                show-sizer show-elevator
                :total="totalCount" 
                @on-page-size-change="changePageSize" 
                @on-change="changePage"
                :current = pageNum
                ></Page>
        </div>

    </div>
</template>

<script>
    import api from '@/api/funds.js'
    import {getCoins} from '../../common.js' // 封装的获取 所有币种 Promise 函数
    import commonApi from '@/api/commonApi/commonApi.js'

    export default {
        data() {
            return {
                optionsEnd: {
                    disabledDate: function (date) {
                        return date && date.valueOf() < (new Date(this.timeStart).valueOf() - 8639000)
                    }.bind(this)
                },
                optionsStart: {
                    disabledDate: function (date) {
                        return date && date.valueOf() > new Date(this.timeEnd).valueOf()
                    }.bind(this)
                },
                pageNum: 1,
                pageSize: 20,
                timeStart: "", // 充币开始时间
                timeEnd: "", // 充币结束时间
                coinName: "", // 币种
                status: "", // 处理状态
                userName: "", // 用户名
                from: '', // 来源
                froms: null, // 所有来源
                // 表头
                tHeaderData: [
                    {title: "充值编号", key: "merchantsSyncId"},
                    {title: "充值时间", key: "sendTime"},
                    {title: "确认时间", key: "configTime"},
                    {title: "用户名", key: "userName"},
                    // { title: "充币币种", key: "coinName" },
                    {title: "充币数量", key: "amount"},
                    // {title: "来源", key: "stationName"},
                    {title: "充值确认次数", key: "confirmTimes"},
                    {title: "发起充币地址", key: "fromAddr"},
                    {title: "接受充币地址", key: "toAddr"},
                    {
                        title: "处理状态", key: "status",
                        render: (h, params) => {
                            return h('span', this.transStatus(params.row.status))
                        }
                    },
                    {
                        title: "操作", key: "operation",
                        render: (h, params) => {
                            if (params.row.status === 0) {
                                return h('div', [
                                    this.g_perm('confirm') ? h('Button', {
                                        props: {
                                            type: 'primary',
                                            size: 'small'
                                        },
                                        on: {
                                            click: () => {
                                                this.handConfirm(params)
                                            }
                                        }
                                    }, '手动确认') : '',
                                    this.g_perm('sync') ? h('Button', {
                                        props: {
                                            type: 'primary',
                                            size: 'small'
                                        },
                                        style: {
                                            marginLeft: '5px'
                                        },
                                        on: {
                                            click: () => {
                                                this.confirmSync(params)
                                            }
                                        }
                                    }, '同步确认次数') : ''
                                ])
                            } else if (params.row.status === 2) {
                                return h('div', [
                                    this.g_perm('sync') ? h('Button', {
                                        props: {
                                            type: 'primary',
                                            size: 'small'
                                        },
                                        on: {
                                            click: () => {
                                                this.confirmSync(params)
                                            }
                                        }
                                    }, '同步确认次数') : ''
                                ])
                            }
                        }
                    }
                ],
                allCoins: [],
                topupData: [], // 表格数据
                totalCount: 0, // 当前币种总数据量
                sizeOpts: [10, 20, 50, 100], // 选择每页显示多少条数据
            };
        },
  methods: {
    // 获取来源
    async getForm() {
        const { data } = await commonApi.getForm()
        this.froms = data.data || []
    },
    // 处理状态转换
    transStatus (val) {
      switch (val) {
        case 0:
          return '等待确认'
        case 1:
          return '失败'
        case 2:
          return '确认成功'
        case 3:
          return '取消'
      }
    },
    // 查询
    search () {
      this.pageNum = 1 // 重置页码
      this.totalCount = 1 // 重置数据总数量
      this.getListData()
		},
		// 重置
		reset () {
      this.pageNum = 1
      this.pageSize = 20
      this.timeStart = ''
      this.timeEnd = ''
      this.coinName = this.allCoins[0]
      this.status = ''
      this.from = ''
      this.userName = ''
      console.log(this.timeEnd)
      this.getListData()
    },
    // 改变每页显示多少条数据
    changePageSize (size) {
      this.pageSize = size
      if (this.pageNum === 1) {
        this.getListData()
      }
    },
    // 页码发生改变时
    changePage (page) {
      this.pageNum = page
      this.getListData()
    },
    // 选项改变时
    optionsChange() {
        this.pageSize = 20
        this.pageNum = 1
        this.getListData()
    },
    // 导出表格
    exportExcel () {
      let { timeStart, timeEnd, coinName, status, userName, from } = this
      let args = { timeStart, timeEnd, coinName, status, userName, stationName: from}
      api.topUpExportExcel(args).then(res => {
        // 处理文件流
        let blob = new Blob([res.data], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
        let objectUrl = URL.createObjectURL(blob);

        const filename = '充币记录.xlsx';
        let link = document.createElement('a');
        link.download = filename;
        link.href = objectUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        // this.$Message.success('下载成功！');
      })
    },
    // 同步确认次数
    confirmSync (params) {
      let keyId = params.row.detailsId,
        args = { coinName: this.coinName, keyId }
      api.confirmSync(args).then(res => {
        if (res.data.code === 1) {
          this.getListData()
          this.$Message.success(res.data.msg)
        }
      })
    },
    // 手动确认
    handConfirm (params) {
      // 获取cookie中的用户名
      let cookieArr = document.cookie.split(';')
      let loginUser = ''
      cookieArr.forEach(item => {
        item.split('=')
        if (item.split('=')[0].trim() === 'user') {
          loginUser = item.split('=')[1]
        }
      })

      let keyId = params.row.detailsId,
        args = { coinName: this.coinName, keyId, userName: loginUser }

      api.handConfirm(args).then(res => {
        if (res.data.code === 1) {
          this.getListData()
          this.$Message.success(res.data.msg)
        }
      })
    },
    // 获取表格数据
    getListData () {
      let {pageNum, pageSize,coinName, status, timeStart, timeEnd, userName, from } = this,
        args = {
          pageNum,
          pageSize,
          coinName,
          status,
          stationName: from,
          userName: userName.trim(),
          manageTimeS: timeStart,
          manageTimeE: timeEnd
        }
      api.topUpRecord(args).then(res => {
        this.topupData = res.data.data.obj || []
        this.totalCount = res.data.data.totalCount || 1
      })
    }
  },
  created () {
      this.getForm() // 获取所有来源
    // 第一次进来加载的数据，必须传递币种，使用封装的 加载所有币种 Promise
    getCoins().then(res => {
      this.allCoins = res
      this.coinName = this.allCoins[0]
      this.getListData()
      if(this.$isCustomize()) {
          this.tHeaderData.splice(5, 0, 
            {title: "来源", key: "stationName"}
          )
      }
    })
  }
};
</script>

<style lang="less" scoped>
    .left-space {
        margin-left: 20px;
    }

    .right-pos {
        position: absolute;
        right: 0;
        bottom: -15px;
    }
</style>

