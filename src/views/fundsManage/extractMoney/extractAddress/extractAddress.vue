<template>
  <div class="topUp-address">
    <Row>
      <Col style="padding:20px 0">
        <span>提币地址：</span>
        <Input style="width:200px" v-model="extractAddress" placeholder="请输入提币地址"></Input>
        <span class="left-space">币种：</span>
        <Select style="width:100px" placeholder="全部" filterable clearable v-model="coinName">
          <Option v-for="(item, index) in allCoins" :key="index" :value="item">{{item}}</Option>
        </Select>
        <Input style="width: 150px; margin-left:20px" placeholder="使用用户ID搜索" v-model="userId"></Input>
        <Input style="width: 150px; margin-left:20px" placeholder="使用用户名搜索" v-model="userName"></Input>
        <Button type="primary" style="margin-left: 10px" @click="search">查询</Button>
        <Button type="error" style="margin-left: 10px" @click="reset">重置</Button>
      </Col>
    </Row>
    <Table border :columns="tHeaderData" :data="extractAddressData"></Table>
    <div style="position:relative">
      <Page class="pages" :page-size-opts="sizeOpts" :page-size="pageSize" show-sizer show-elevator show-total :total="totalCount" @on-page-size-change="changePageSize" @on-change="changePage"></Page>
    </div>
  </div>
</template>

<script>
import api from '@/api/funds.js'
import { getCoins } from '../../common.js' // 封装的获取 所有币种 Promise 函数 
export default {
  data () {
    return {
      pageNum: 1,
      pageSize: 20, 
      extractAddress: '', // 提币地址
      coinName: '', // 币种
      userId: '', // 用户ID
      userName: '', // 用户名
      // 表头文字
      tHeaderData: [
        { title: '提币编号', key: 'id' },
        { title: '用户ID', key: 'userId' },
        { title: '用户名', key: 'userName' },
        { title: '提币地址', key: 'address',
          render: (h, params) => {
            return h('div', [
              h('span', {
                on: {
                  click: () => {
                    this.copyAddress(params.row.address)
                  }
                }
              }, params.row.address)
            ])
          }
        },
        {title: '创建时间', key: 'createTime'},
        {title: '是否删除', key: 'isDeleted',
          render: (h, params) => {
            return h('span', params.row.isDeleted ? '是': '否')
          }
        }
      ],
      sizeOpts: [10, 20, 50, 100], // 选择每页显示多少条数据
      totalCount: 0, // 当前币种总数据
      allCoins: [], // 所有币种
      extractAddressData: [], // 表单数据
    }
  },

  methods: {
    // 查询
    search () {
      this.pageNum = 1 // 重置页码
      this.totalCount = 1 // 重置数据总数量
      // 限制用户ID为数字时才可以发起请求
      if (this.userId === '' || !/\D/g.test(this.userId.trim())) {
        this.getListData()
      } else {
        this.$Message.warning({content:'用户ID不能包含空格或非数字', duration: 2})
      }
    },
    // 重置
    reset () {
      this.pageNum = 1,
      this.pageSize = 20,
      this.extractAddress = ''
      this.coinName = this.allCoins[0]
      this.userId = ''
      this.userName = ''
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
    // 点击复制地址
    copyAddress (addr) {
      this.$copyText(addr).then(res => {
        this.$Message.success('提币地址复制成功')
      })
    },
    // 获取表格数据
    getListData () {
      let { pageNum, pageSize, coinName, extractAddress, userId, userName } = this,
        args = { pageNum, pageSize, coinName, keyPre: extractAddress.trim(), userId: userId.trim(), userName: userName.trim() }
      api.extractAddress(args).then(res => {
        if (res.data.code === 1) {
          this.extractAddressData = res.data.data.obj || []
          this.totalCount = res.data.data.totalCount || 1
        }
      })
    }
  },
  created() {
    // 第一次进来加载的数据，必须传递币种，使用封装的 加载所有币种 Promise
    getCoins().then(res => {
      this.allCoins = res
      this.coinName = this.allCoins[0]
      this.getListData()
    })
  }
}
</script>

<style lang="less" scoped>
.top {
  padding: 15px 10px;
}
.left-space {
  margin-left: 20px;
}

</style>

