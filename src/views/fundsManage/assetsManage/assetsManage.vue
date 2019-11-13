<template>
  <div class="assets-manage">
    <Row class="search-padding">
      <Col>
        <span>用户名：</span>
        <Input style="width:150px" placeholder="搜索用户名" v-model="userName"></Input>
        <span class="left-space">资产币种：</span>
        <Select placeholder="全部" style="width:150px" filterable v-model="assetsCoin" @on-change="selectGetData">
          <Option value="">全部</Option>
          <Option v-for="(item, index) in allCoins" :value="item.keyEn" :key="index">{{ item.keyEn }}</Option>
        </Select>
        <div style="display:inline-block" v-if="$isCustomize()">
          <span class="left-space">来源：</span>
          <Select placeholder="全部" style="width:150px" filterable v-model="from" @on-change="selectGetData">
            <Option value="">全部</Option>
            <Option v-for="(item, index) in froms" :value="item.stationName" :key="index">{{ item.stationName }}</Option>
          </Select>
        </div>
        <Button class="left-space" type="primary" @click="selectGetData">查询</Button>
        <Button type="info" class="add_account" icon="plus-round" @click="exportAssetsHandle" v-if="g_perm('exportFund')">导出报表</Button>
      </Col>
    </Row>
    <div class="assets-count">
      <div class="count" v-if="assetsCoin">
        <span>数据汇总：</span>
          <p>可用 <span>{{ collect.balance }}</span></p>
          <p>冻结 <span>{{ collect.freez }}</span></p>
          <p>总计 <span>{{ collect.total }}</span></p>
      </div>
      <div class="count no-assetsCoin" v-else>数据汇总：<span>选择资产币种后进行数据汇总</span></div>
    </div>
    <Table border :columns="tHeader" :data="fieldsData" style="margin-top: 10px"></Table>
    <div style="position: relative">
      <Page 
        class="pages" 
        show-sizer 
        show-elevator 
        :total="totalCount" 
        :page-size-opts="pageSizeOpts"
        :page-size="pageSize" 
        :current="pageIndex"
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
      userName: '', // 用户名
      assetsCoin: '', // 资产币种
      from: '', // 来源
      totalCount: 0, // 数据总数
      pageSizeOpts: [10, 20, 50, 100],
      pageSize: 20, // 每页显示数量
      pageIndex: 1, // 页码
      allCoins: [], // 所有资产币种
      collect: {}, // 数据汇总
      froms: null, // 来源
      tHeader: [
        { title: '用户名', key: 'userName'},
        { title: '注册时间', key: 'createTime'},
        // { title: '来源', key: 'stationName'},
        { title: '资产币种', key: 'coinName'},
        { title: '可用金额', key: 'balance'},
        { title: '冻结金额', key: 'freez'},
        { title: '总额', key: 'total'},
        { title: '操作', key: 'options', render: (h,params) => {
          return h('div',[
            this.g_perm('cancelCoinsEntrust') ? h('Button', {
              props: {
                type: 'primary',
                size: 'small'
              },
              style: {
                marginTop: '5px',
                marginRight: '5px'
              },
              on: {
                click: () => {
                  this.recall(params)
                }
              }
            }, '撤单') : '',
            this.g_perm('isFreez') ? h('Button', {
              props: {
                type: params.row.isFreez ? 'warning' : 'error',
                size: 'small'
              },
              style: {
                marginTop: '5px',
                marginRight: '5px'
              },
              on: {
                click: () => {
                  this.freeze(params)
                }
              }
            }, params.row.isFreez ? '解冻' : '冻结') : '',
          ])
        }},
      ],
      // 表格数据
      fieldsData: [],
    }
  },
  methods: {
    // 切换每页显示条数
    changePageSize(size) {
      this.pageSize = size
      if (this.pageIndex === 1) {
          this.getData()
      }
    },
    // 页数改变时
    changePage(page) {
      this.pageIndex = page
      this.getData()
    },
    // 撤单
    recall(params) {
      this.$Modal.confirm({
        title: '确认撤单',
        content: '<p style="color:red">注意：确定要撤销该订单？</p>',
        onOk: () => {
          let { userId, fundsType } = params.row
          let args = {
            fundsType,
            exxUserId: userId
          }
          api.recall(args).then(res => {
            if(res.data.code === 1) {
              this.$Message.success(res.data.msg)
            }
          })
        }
      });
    },
    // 冻结
    freeze(params) {
      this.$Modal.confirm({
        title: '确认冻结',
        content: '<p style="color:red">确定使用该操作？</p>',
        onOk: () => {
          let { userId, userName, isFreez, fundsType } = params.row
          isFreez = isFreez ? 0 : 1
          let args = { userId, userName, isFreez, fundsType }
          api.freeze(args).then(res => {
            if(res.data.code === 1) {
              this.fieldsData[params.index].isFreez = isFreez
              this.$Message.success(res.data.msg)
            }
          })
        }
      });
    },
    selectGetData() {
      this.pageSize = 20
      this.pageIndex = 1
      this.getData()
    },
    // 获取资金数据
    async getData() {
      await this.dataCollect()
      let { userName, assetsCoin, from, pageSize, pageIndex } = this
      let args = {
        pageSize,
        coinName: assetsCoin,
        currentPage: pageIndex,
        userName,
        stationName: from
      }
      const { data } = await api.getData(args)
      this.fieldsData = data.data.obj || []
      this.totalCount = data.data.totalCount
    },
    // 导出资产报表
    async exportAssetsHandle () {
        let { userName, assetsCoin, from, pageSize, pageIndex } = this
        let params = {
          pageSize,
          coinName: assetsCoin,
          currentPage: pageIndex,
          userName,
          stationName: from
        }
        api.exportAssetsList(params).then((res) => {
            // 处理文件流
            let blob = new Blob([res.data], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
            let objectUrl = URL.createObjectURL(blob);
            // window.location.href = objectUrl;

            const filename = '用户资产报表' + '.xlsx';
            let link = document.createElement('a');
            link.download = filename;
            link.href = objectUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            this.$Message.success('导出成功！');
        });
    },
    // 获取来源
    async getForm() {
      const { data } = await commonApi.getForm()
      this.froms = data.data || []
    },
    // 获取数据汇总
    async dataCollect() {
      let { userName, assetsCoin, from} = this
      let args = {
        coinName: assetsCoin,
        userName,
        stationName: from
      }
      const { data } = await api.dataCollect(args)
      this.collect = data.data
      
    }
  },
  
  async created() {
    // 获取所有资产币种
    const { data } = await commonApi.getAllCoins()
    this.allCoins = data.data
    await this.getForm()
    await this.getData()
    if(this.$isCustomize()) {
      this.tHeader.splice(2, 0, { title: '来源', key: 'stationName'})
    }
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

