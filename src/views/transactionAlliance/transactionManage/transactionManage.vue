<template>


  <!-- 注意：此模块已合并到站点管理里，此模块暂无用 -->


  <div class="transaction-manage">
    <Row class="search-padding">
      <Col>
        <span>EXX账号：</span>
        <Input type="text" placeholder="搜索账号" style="width: 150px" v-model="account"></Input>
        <span class="left-space">域名：</span>
        <Input type="text" placeholder="搜索域名" style="width: 150px" v-model="domain"></Input>
        <Button type="primary" icon="ios-search" class="left-space" >查询</Button>
      </Col>
    </Row>
    <Table border :columns="tHeader" :data="fieldsData"></Table>
    <div style="position: relative">
      <Page 
        class="pages" 
        show-sizer 
        show-elevator 
        :total="totalCount" 
        :page-size-opts="pageSizeOpts"
        :page-size="pageSize" 
        @on-page-size-change="changePageSize" 
        @on-change="changePage"></Page>
    </div>

    <!-- 修改弹框 -->
    <Modal title="修改" v-model="showModel">
      <Form :model="modelForm" ref="modalForm" :label-width="100">
        <FormItem label="交易所名称">
          <Input v-model="modelForm.name"></Input>
        </FormItem>
        <FormItem label="域名">
          <Input v-model="modelForm.domain"></Input>
        </FormItem>
        <FormItem label="设置EXX账号">
          <Input v-model="modelForm.setAccount"></Input>
        </FormItem>
        <FormItem label="设置EXX密码">
          <Input v-model="modelForm.setPassword"></Input>
        </FormItem>
      </Form>
      <div slot="footer" style="text-align:center">
        <Button type="primary" @click="modelSave">保存</Button>
        <Button @click="modelCancel">取消</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
export default {
  data() {
    return {
      account: '', // 账号
      domain: '', // 域名
      totalCount: 0, // 数据总数
      pageSizeOpts: [10, 20, 50, 100],
      pageSize: 20, // 每页显示数量
      pageIndex: 1, // 页码
      tHeader: [
        { title: '交易所ID', key: 'id'},
        { title: '创建时间', key: 'id'},
        { title: '交易所名称', key: 'id'},
        { title: 'EXX账号', key: 'id'},
        { title: '域名', key: 'id'},
        { title: '操作', key: 'options', render: (h,params) => {
          return h('div',[
            this.g_perm('edit') ? h('Button', {
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
                  this.showModel = true
                }
              }
            }, '修改') : '',
            this.g_perm('disable') ? h('Button', {
              props: {
                type: 'error',
                size: 'small'
              },
              style: {
                marginTop: '5px',
                marginRight: '5px'
              },
              on: {
                click: () => {
                    
                }
              }
            }, '禁用') : '',
          ])
        }},
      ],
      fieldsData: [
        {id: 1}
      ],
      showModel: false, // 修改弹框显示控制
      // 修改弹框
      modelForm: {
        name: '',
        domain: '',
        setAccount: '',
        setPassword: '',
      }
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
    modelSave() {
      console.log(this.modelForm)
    },
    modelCancel() {
      this.showModel = false
    },
    // 获取数据
    async getData() {
      console.log(123)
    }
  },
  created() {
    this.getData()
  }
}
</script>

<style lang="less" scoped>

</style>
