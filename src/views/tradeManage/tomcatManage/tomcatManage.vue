<style lang="less" scoped>
@import "../../../styles/common.less";
@import "tomcatManage.less";
</style>

<template>
  <div class="content">
    <Row class="et-row">
      <Col>
        <Button
          type="info"
          class="add_account"
          icon="plus-round"
          @click="showEditModal(null , 0)"
          v-if="this.g_perm('addaccount')"
          
        >添加账户</Button>
        <Button
          type="warning"
          class="add_account"
          style="margin-right: 15px;"
          @click="assetInformation() "
          v-if="this.g_perm('showcollectasset')"
          
        >资产汇总</Button>
        <Button
          type="error"
          class="add_account"
          style="margin-right: 15px;"
          @click="showDenomination()"
          v-if="this.g_perm('configcurrency')"
        >账户币种配置</Button>
      </Col>
    </Row>
    <Table border :columns="tableColumns" :data="tableData" @on-selection-change="selectedId"></Table>
    <div style="position: relative;">
      <Page
        class="pages"
        :current="pageNum"
        :total="total"
        show-elevator
        show-sizer
        :page-size="pageSize"
        :page-size-opts="sizeOpts"
        @on-change="changePage"
      ></Page>
    </div>
    <!-- 账户币种配置 -->
    <Modal v-model="denomination" width="650">
      <p slot="header">
        <span>账户币种配置</span>
      </p>
      <div style="text-align:left">
        <CheckboxGroup v-model="checkAllGroup">
          <Checkbox v-for="item in accountPlatform" :label="item" :key="item"></Checkbox>
        </CheckboxGroup>
        <Input v-model="Currency" placeholder="请输入新增币种" style="width: 300px"></Input>
        <Button type="primary" @click="newCurrency()">新增币种</Button>
      </div>
      <div slot="footer">
        <Button type="primary" size="large" @click="denomination=false">取消</Button>
        <Button type="primary" size="large" @click="currencyDetermine">确定</Button>
      </div>
    </Modal>
    <!-- 账户资产汇总 -->
    <Modal v-model="assetAccount" width="900">
      <p slot="header" style="text-align:left">
        <span>资产汇总</span>
      </p>
      <div style="text-align:center">
        <div style="text-align:right">
          <Button type="primary" size="large"  @click="assetInformation()">刷新账户</Button>
        </div>
        <span>今日资产变化</span>
        <span>{{allAssetChange}}</span>
        <span>{{percentage}}</span>
        <span style="margin:0 131px 0 131px">初始总资产{{allOriginalAssets}}</span>
        <span>历史盈亏</span>
        <span>{{allHistoryProfit}}</span>
        <span>{{historypercentage}}</span>
        <div style="text-align:right; margin-right:32px;">
          <span>总计提币</span>
          <span>{{totalMention}}</span>
        </div>

        <p style="text-align:left ">账户资产表</p>
        <Table border :columns="assetAccount1" :data="assetAccountTable1"></Table>
        <p style="text-align:left ">资产损益表</p>
        <Table border :columns="assetAccount2" :data="assetAccountTable2"></Table>
        <!-- <Table border :columns="assetAccount1" :data="assetAccountTable2"></Table> -->
      </div>
      <div slot="footer" style="text-align:center">
        <Button type="primary" size="large" @click="shutDown()">关闭</Button>
      </div>
    </Modal>
    <!-- 添加API账户 -->
    <Modal v-model="addAPIAccount" title="添加API账户" width="700">
      <Form ref="formValidateRef" :model="formValidate" :rules="ruleValidate" :label-width="120">
        <Form-item label="账户平台选择" prop="platformKey">
          <Select v-model="formValidate.platformKey" style="width:500px" placeholder="请选择平台">
            <Option
              v-for="item in platform"
              :label="item.Platform_name"
              :value="item.id"
              :key="item.id"
            ></Option>
          </Select>
        </Form-item>
        <Form-item label="账户名称" prop="name">
          <Input v-model="formValidate.name" placeholder="请输入账户名称" style="width: 300px"></Input>
        </Form-item>
        <Form-item label="Access Key" prop="access">
          <Input v-model="formValidate.access" style="width: 300px"></Input>
        </Form-item>
        <Form-item label="Secret Key" prop="secret">
          <Input v-model="formValidate.secret" style="width: 300px"></Input>
        </Form-item>
      </Form>
      <div slot="footer">
        <Button type="primary" size="large" @click="addAPIAccount=false">取消</Button>
        <Button type="primary" size="large" @click="addUser">确定</Button>
      </div>
    </Modal>
    <!-- 编辑API账户 -->
    <Modal v-model="addAPIAccountEditor" title="编辑API账户" width="700">
      <Form ref="formValidateRefEditor" :model="formValidateEditor" :rules="ruleValidateEditor" :label-width="120">
        <Form-item label="账户平台选择" prop="platformKey">
          <!--   @on-change="select(formValidate)" -->
          <Select v-model="formValidateEditor.platformKey" style="width:500px">
            <Option
              v-for="item in platform"
              :label="item.Platform_name"
              :value="item.id"
              :key="item.id"
             
            ></Option>
          </Select>
        </Form-item>
        <Form-item label="账户名称" prop="name">
          <Input v-model="formValidateEditor.name" placeholder="请输入账户名称" style="width: 300px"></Input>
        </Form-item>
        <Form-item label="Access Key" prop="access">
          <Input v-model="formValidateEditor.access" style="width: 300px"></Input>
        </Form-item>
        <Form-item label="Secret Key" prop="secret">
          <Input v-model="formValidateEditor.secret" style="width: 300px"></Input>
        </Form-item>
      </Form>
      <div slot="footer">
        <Button type="primary" size="large" @click="addAPIAccountEditor=false">取消</Button>
        <Button type="primary" size="large" @click="editorUser">确定</Button>
      </div>
    </Modal>
    <!-- 增加账户初始资金 -->
    <Modal v-model="capitalIncrease" title="增加账户初始资产" @on-ok="increaseCurrency">
      <Form :model="formItem" :label-width="80">
        <Form-item label="请选择">
          <Select v-model="formItem.capitalCurrency" placeholder="增加币种">
            <Option v-for="item in accountPlatform" :label="item" :value="item" :key="item"></Option>
          </Select>
        </Form-item>
        <Form-item label="增加数量">
          <Input v-model="formItem.number" placeholder="请输入"></Input>
        </Form-item>
      </Form>
    </Modal>
    <!-- 提币的接口 -->
    <Modal v-model="capitalMoney" title="提币" @on-ok="mentionMoney">
      <Form :model="formItemTwo" :label-width="80">
        <Form-item label="请选择">
          <Select v-model="formItemTwo.capitalCurrency" placeholder="提取币种">
            <Option v-for="item in accountPlatform" :label="item" :value="item" :key="item"></Option>
          </Select>
        </Form-item>
        <Form-item label="提币数量">
          <Input v-model="formItemTwo.number" placeholder="请输入"></Input>
        </Form-item>
      </Form>
    </Modal>
    <!-- 单个账户资产汇总 -->
    <Modal v-model="singleAssetAccount" width="900">
      <p slot="header" style="text-align:left">
        <span>资产汇总</span>
      </p>
      <div style="text-align:center">
        <div style="text-align:right">
          <Button type="primary" size="large" @click="refreshId">刷新账户</Button>
        </div>
        <span>今日资产变化</span>
        <span>{{assetChange}}</span>
        <span style="margin:0 131px 0 131px">初始总资产{{originalAssets}}</span>
        <span>历史盈亏</span>
        <span>{{historyProfit}}</span>
        <p style="text-align:left ">账户资产表</p>
        <Table border :columns="assetAccount1" :data="singleAssetAccountTable1"></Table>
        <p style="text-align:left ">资产损益表</p>
        <Table border :columns="assetAccount2" :data="singleAssetAccountTable2"></Table>
      </div>
      <div slot="footer" style="text-align:center">
        <Button type="primary" size="large" @click="shutDown()">关闭</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import api from "@/api/autoMarkets";
import axios from "@/axios/config";

export default {
  name: "tomcatManage",
  data() {
    return {
      req_url: axios.defaults.baseURL,
      tableColumns: [
        {
          type: "selection",
          width: 60,
          align: "center"
        },
        {
          title: "EXX账户",
          key: "name"
        },
        {
          title: "所属平台",
          key: "platformKey"
          // render: (h, params) => {
          //     return h('span', this.getServerName(params.row.serverId));
          // }
        },
        {
          title: "账户添加时间",
          key: "createTime"
        },
        {
          title: "操作",
          width: 310,
          render: (h, params) => {
            return h(
              "div",
              {
                style: {
                  paddingBottom: "5px"
                }
              },
              [
                // this.g_perm("command")
                h(
                  "Button",
                  {
                    props: {
                      type: "warning",
                      size: "small"
                    },
                    style: {
                      marginTop: "5px",
                      marginRight: "5px"
                    },
                    on: {
                      click: () => {
                        this.addSetTomcatStatus(params.row);
                      }
                    }
                  },
                  "查看资产"
                ),
                this.g_perm("editaccount")
                  ? h(
                      "Button",
                      {
                        props: {
                          type: "primary",
                          size: "small"
                        },
                        style: {
                          marginTop: "5px",
                          marginRight: "5px"
                        },
                        on: {
                          click: () => {
                            this.showEditModal(params.row, 1);
                          }
                        }
                      },
                      "修改"
                    )
                  : "",
                this.g_perm("deleteaccount")
                  ? h(
                      "Button",
                      {
                        props: {
                          type: "error",
                          size: "small"
                        },
                        style: {
                          marginTop: "5px",
                          marginRight: "5px"
                        },
                        on: {
                          click: () => {
                            // this.deleteTip(params.row);

                            this.confirm(params.row);
                          }
                        }
                      },
                      "删除"
                    )
                  : "",

                this.g_perm("withdraw")
                  ? h(
                      "Button",
                      {
                        props: {
                          type: "success",
                          size: "small",
                          disabled: params.row.isOpen === 1
                        },
                        style: {
                          marginTop: "5px",
                          marginRight: "5px"
                        },
                        on: {
                          click: () => {
                            this.increase(params.row);
                          }
                        }
                      },
                      "增资"
                    )
                  : "",
                this.g_perm("withdraw")
                  ? h(
                      "Button",
                      {
                        props: {
                          type: "error",
                          size: "small",
                          disabled: params.row.isOpen === 0
                        },
                        style: {
                          marginTop: "5px",
                          marginRight: "5px"
                        },
                        on: {
                          click: () => {
                            this.setTomcatStatus(params.row);
                          }
                        }
                      },
                      "提币"
                    )
                  : ""
              ]
            );
          }
        }
      ],
      tableData: [],
      Currency: "", //新增币种
      modalStatus: false,
      checkStatus: false,
      checkLoading: false,
      loadingStatus: false, // 全局loading
      submitLoading: false, // 提交loading
      modalTitle: "添加",
      currCheckResult: "", // 当前检测结果
      formItem: {},
      formItemTwo: {},
      formValidate: {
        platformKey: "",
        name: "",
        access: "",
        secret: ""
      },
      //编辑
      formValidateEditor: {
        platformKey: "",
        name: "",
        access: "",
        secret: ""
      },
      ruleValidate: {
        platformKey: [
          { required: true, type:'number',  message: "请选择平台", trigger: "blur" }
        ],
        name: [
          { required: true, message: "账户名称不能为空", trigger: "blur" }
        ],
        access: [{ required: true, message: "不能为空", trigger: "blur" }],
        secret: [{ required: true, message: "不能为空", trigger: "blur" }]
      },
      //编辑验证规则
      ruleValidateEditor: {
        platformKey: [
          { required: true, type:'number',  message: "请选择平台", trigger: "blur" }
        ],
        name: [
          { required: true, message: "账户名称不能为空", trigger: "blur" }
        ],
        access: [{ required: true, message: "不能为空", trigger: "blur" }],
        secret: [{ required: true, message: "不能为空", trigger: "blur" }]
      },

      name: "", //账户名称
      // platformKey: "", //所属平台
      createTime: "", //创建时间
      denomination: false, //币种配置
      checkAllGroup: [], //
      currencyList: "", //币种列表
      assetAccount: false,
      capitalIncrease: false, //账户增资
      capitalCurrency: "", //增资的币种
      assetAccount1: [
        {
          title: "币种名称",
          key: "currencyName"
        },
        {
          title: "可用",
          key: "available"
        },
        {
          title: "冻结",
          key: "freeze"
        },
        {
          title: "当前总资产",
          key: "totalAssets"
        },
        {
          title: "初始资产",
          key: "initialAsset"
        }
      ],
      assetAccount2: [
        {
          title: "币种名称",
          key: "currencyName"
        },
        {
          title: "初始资产",
          key: "initialAsset"
        },
        {
          title: "当前资产",
          key: "currentAssets"
        },
        {
          title: "差额",
          key: "difference"
        },
        {
          title: "参考价格(USDT)",
          key: "usdtPrice"
        },
        {
          title: "折合差额(USDT)",
          key: "amountDifference"
        }
      ],
      assetAccountTable1: [],
      assetAccountTable2: [],
      singleAssetAccountTable1: [],
      singleAssetAccountTable2: [],
      platform: [],

      addAPIAccount: false,
      addAPIAccountEditor:false,

      marketArea: "",
      marketList: ["usdt", "btc", "eth", "et", "cnyt", "tusd"],
      serverListMarket: [], // 对应市场的服务器列表
      serverList: [], // 服务器列表
      tradeList: [], // 交易对列表
      // editType: 0, // 编辑类型 0添加 1编辑
      pageNum: 1, //当前页
      pageSize: 20, //每页条数
      total: 0, // 数据   总条数
      sizeOpts: [10, 20, 50, 100],
      // users_id: "", //用户id
      accountPlatform: [],
      CurrencyID: "", //操作点击之后的账户id
      mentionMoneyID: "", //点击提币之后的账户id
      removeWindow: false, //删除弹窗
      capitalMoney: false, //提币窗口
      singleAssetAccount: false, //单账户资产汇总
      idList: [], //资产汇总id
      idRefresh :'',//查看资产信息id
      assetChange: "", //资产变化
      historyProfit: "", //历史资产盈亏
      originalAssets: "", //初始资产
      allAssetChange: "", //资产变化
      allHistoryProfit: "", //历史资产盈亏
      allOriginalAssets: "", //初始资产
      percentage: "", //浮动盈亏百分比
      historypercentage: "", //历史浮动盈亏比
      totalMention: "", //总计提币
      addID:''//单个选项ID
    };
  },
  watch: {},
  computed: {},
  methods: {
    confirm(data) {
      this.$Modal.confirm({
        title: "删除账户",
        content: "<p>是否删除</p>",
        onOk: () => {
          this.deleteTip(data);
        },
        onCancel: () => {
          this.$Message.info("已取消");
        }
      });
    },

    showDenomination() {
      this.denomination = true;
    },

    newCurrency() {
      // console.log(this.currency.trim())
      if (this.Currency.trim() == "") {
        this.$Message.error("币种不能为空");
        return;
      }

      let params = {
        currency: this.Currency
      };

      api.newCurrency(params).then(res => {
        // console.log(res);

        if (res.data.code) {
          // console.log(res.data.data)
          this.$Message.success("新增币种成功");
        }
      });

      this.accountPlatform.push(this.Currency);
      this.Currency = "";
    },
    shutDown() {
      this.singleAssetAccount = false;
    },
    //查看账户资产汇总

    assetInformation() {
      let params = {
        id: this.idList
      };
      this.assetAccountTable1 = [];
      this.assetAccountTable2 = [];

      api.assetInformation(params).then(res => {
        if (res.data.code == 200) {
          console.log(res.data.data);
          if (!res.data.data) {
            return;
          }

          let stagingTwo = res.data.data.history_profit.number;
          this.allHistoryProfit = stagingTwo;

          let historyAssets = Number(stagingTwo.replace(/\usdt/gi, ""));
          let historyinitialAsset = res.data.data.history_profit.original_total;
          // console.log(historyAssets)
          // console.log(historyinitialAsset)
          // console.log(historyAssets/historyinitialAsset)
          if (historyAssets / historyinitialAsset >= 0) {
            this.historypercentage =
              "+" +
              (((historyAssets / historyinitialAsset) * 10000) / 100.0).toFixed(
                2
              ) +
              "%";
          } else {
            this.historypercentage =
           
              (((historyAssets / historyinitialAsset) * 10000) / 100.0).toFixed(
                2
              ) +
              "%";
          }

          let stagingOne = res.data.data.asset_change.number;

          this.allAssetChange = stagingOne;
          let todayAssets = Number(stagingOne.replace(/\usdt/gi, ""));
          let initialAsset = res.data.data.asset_change.lastday_assets;

          if (todayAssets / initialAsset >= 0) {
            this.percentage =
              "+" +
              (((todayAssets / initialAsset) * 10000) / 100.0).toFixed(2) +
              "%";
          } else {
            this.percentage =
  
              (((todayAssets / initialAsset) * 10000) / 100.0).toFixed(2) +
              "%";
          }

          //   const renderContent   = (todayAssets/initialAsset) => {
          //      if (value != undefined && value != null) {

          //          const scale = ((Math.round((value * 10000)))/100.00).toFixed(2) + '%';
          //          return scale;
          //      }
          //  };

          // console.log(res.data.data.asset_change.number)
          // console.log(typeof(res.data.data.asset_change.number));
          let staging = res.data.data.original_assets;
          this.allOriginalAssets = staging;

          this.totalMention = res.data.data.withdraw_record;

          // console.log(res.data.data.assets_dict);
          let arr1 = Object.keys(res.data.data.assets_dict);
          // console.log(arr1);
          let abcList = res.data.data.assets_dict;
          for (let i = 0; i < arr1.length; i++) {
            let abc = arr1[i];
            // console.log(abcList);
            let obj = {
              currencyName: arr1[i],
              available: abcList[abc].balance,
              freeze: abcList[abc].freeze,
              initialAsset: abcList[abc].original_assets,
              totalAssets: abcList[abc].current_assets
            };
            // console.log(obj);
            this.assetAccountTable1.push(obj);
          }
          let profitAndLoss = res.data.data.profit_loss_dict;
          // console.log(profitAndLoss);
          let arr2 = Object.keys(res.data.data.profit_loss_dict);

          for (let k = 0; k < arr2.length; k++) {
            let abc = arr2[k];

            let objTwo = {
              currencyName: arr2[k],
              initialAsset: profitAndLoss[abc].original_assets,
              currentAssets: profitAndLoss[abc].current_assets,
              amountDifference: profitAndLoss[abc].convert,
              difference: profitAndLoss[abc].gap,
              usdtPrice: profitAndLoss[abc].last
            };
            // console.log(objTwo)
            this.assetAccountTable2.push(objTwo);
          }
        }
      });

      this.assetAccount = true;
    },

    //已选id  信息
    selectedId(data) {
      // console.log(data);
      this.idList = [];
      for (let i = 0; i < data.length; i++) {
        this.idList.push(data[i].id);
      }
      // console.log(idList);

      // console.log(params)
    },
    //获取用户所有账户信息
    getAllUsers() {
      let params = {
        pageIndex: this.pageNum,
        pageSize:this.pageSize
      };
      api.getTomcatList(params).then(res => {
        // console.log(res);
        this.tableData = [];
        if (res.data.code == 200) {
          // console.log(res.data.data.result)
          for (let i = 0; i < res.data.data.result.length; i++) {
            let obj = {
              name: res.data.data.result[i].title,
              platformKey: res.data.data.result[i].platform_name,
              createTime: res.data.data.result[i].createtime,
              id: res.data.data.result[i].id,
              access: res.data.data.result[i].accesskey,
              secret: res.data.data.result[i].secretkey,
              platform_name:res.data.data.result[i].platform_name,
              platform_id:res.data.data.result[i].platform_id,
            };
            // this.users_id = res.data.data.result[i].users_id;
            // this.tableData = [];
            this.tableData.push(obj);
          }

          console.log(res.data.data.numPerPage);
          // this.pageSize = res.data.data.numPerPage;
          this.total = res.data.data.totalCount;

          let arr = JSON.parse(res.data.data.currency_list);
          for (let k = 0; k < arr.length; k++) {
            // console.log(arr[k].currency)
            this.checkAllGroup.push(arr[k].currency);
          }
        }
      });
    },
    //获取账户平台
    getAddPlatform() {
      api.getUserPlatform().then(res => {
        // console.log(res)
        if (res.data.code == 200) {
          // console.log(res.data.message)
          this.platform = res.data.message;
        }
      });
    },
    //添加账户
    addUser() {
      this.$refs.formValidateRef.validate(valid => {
        if (valid) {
          let params = {
            // id: this.users_id,
            platform: this.formValidate.platformKey,
            title: this.formValidate.name,
            accesskey: this.formValidate.access,
            secretkey: this.formValidate.secret
          };
          api.addAddaccount(params).then(res => {
            if (res.data.code == 200) {
              // console.log(res);
              this.addAPIAccount = false;
              this.$Message.success("添加账户成功");
              this.getAllUsers();
            }
          });
        }
      });
    },
    //编辑账户
    editorUser() {
      this.$refs.formValidateRefEditor.validate(valid => {
        if (valid) {
          let params = {
            // id: this.users_id,
            platform: this.formValidateEditor.platformKey,
            title: this.formValidateEditor.name,
            accesskey: this.formValidateEditor.access,
            secretkey: this.formValidateEditor.secret
          };
          api.editorUser(params).then(res => {
            console.log(res)
            if (res.data.code == 200) {
              // console.log(res);
              this.addAPIAccountEditor = false
              this.$Message.success("修改账户成功");

              this.getAllUsers();
            }
          });
        }
      });
    },
    //获取用户币种
    getListCurrencies() {
      api.AllCurrencies().then(res => {
        if (res.data.code == 200) {
          var obj = JSON.parse(res.data.data);
          for (let i = 0; i < obj.length; i++) {
            this.accountPlatform.push(obj[i].currency);
          }
        }
      });
    },
    increase(data) {
      this.capitalIncrease = true;
      // this.getListCurrencies();
      this.CurrencyID = data.id;
    },
    //账户增资
    increaseCurrency() {
      // this.getListCurrencies();
      // console.log('123')
      let params = {
        id: this.CurrencyID,
        currency: this.formItem.capitalCurrency,
        num: this.formItem.number
      };
      api.increaseCurrency(params).then(res => {
        // console.log(res)
        if (res.data.code == 200) {
          this.$Message.success("账户增资成功");
        }
      });
    },
    //更改账户币种配置
    currencyDetermine() {
      // let string =JSON.stringify(this.checkAllGroup)
      // console.log(string)
      let params = {
        currency: this.checkAllGroup
      };
      let string = JSON.stringify(params);

      // console.log(string)

      // console.log(typeof(string))

      api.currencyDetermine(string).then(res => {
        if (res.data.code == 200) {
          this.$Message.success("账户币种配置成功");
          this.denomination = false;

        }
      });
    },


    //编辑和新增账户

       showEditModal(data, type) {

      if (type == 1) {
        console.log(data)
        // this.formValidateEditor = data;

        this.formValidateEditor.platformKey=data.platform_id,
        this.formValidateEditor.name=data.name,
        this.formValidateEditor.access=data.access,
        this.formValidateEditor.secret=data.secret



        this.addAPIAccountEditor = true;
        // this. addUser()
      } else {
        this.$refs.formValidateRef.resetFields();
        // this.addUser();
          this.addAPIAccount = true;
      }
    
    },
    //删除账户
    deleteTip(data) {
      let params = {
        id: data.id
      };
      api.removeuser(params).then(res => {
        // console.log(res)
        if (res.data.code == 200) {
          this.$Message.success("删除成功");
          this.getAllUsers();
        }
      });
    },
    setTomcatStatus(data) {
      // console.log(data);
      this.mentionMoneyID = data.id;
      this.capitalMoney = true;
    },
    mentionMoney() {
      let params = {
        id: this.mentionMoneyID,
        currency: this.formItemTwo.capitalCurrency,
        num: this.formItemTwo.number
      };
      api.mentionMoney(params).then(res => {
        // console.log(res);
        if (res.data.code == 200) {
          this.$Message.success("提币成功");
        }
      });
    },
    // this.selectedId

    //d单个用户资产信息
    addSetTomcatStatus(data) {
      console.log(data);
      this.idRefresh = data.id;
      let params = {
        id: data.id
      };
      this.addID =data.id
      this.singleAssetAccountTable1 = [];
      this.singleAssetAccountTable2 = [];
      // console.log(params);
      api.userAssetInformation(params).then(res => {
        if (res.data.code == 200) {
          console.log(res.data.data);
          let stagingTwo = res.data.data.history_profit.number;
          this.historyProfit = stagingTwo;
          let stagingOne = res.data.data.asset_change.number;
          this.assetChange = stagingOne;
          // console.log(res.data.data)

          console.log(res.data.data.asset_change.number);
          console.log(typeof res.data.data.asset_change.number);
          let staging = res.data.data.original_assets;
          this.originalAssets = staging;
          // console.log(this.originalAssets);
          let arr1 = Object.keys(res.data.data.assets_dict);
          // console.log(arr1);
          let abcList = res.data.data.assets_dict;
          for (let i = 0; i < arr1.length; i++) {
            let abc = arr1[i];
            // console.log(abcList);
            let obj = {
              currencyName: arr1[i],
              available: abcList[abc].balance,
              freeze: abcList[abc].freeze,
              initialAsset: abcList[abc].original_assets,
              totalAssets: abcList[abc].current_assets
            };
            // console.log(obj);
            this.singleAssetAccountTable1.push(obj);
          }
          let profitAndLoss = res.data.data.profit_loss_dict;
          // console.log(profitAndLoss);
          let arr2 = Object.keys(res.data.data.profit_loss_dict);

          for (let k = 0; k < arr2.length; k++) {
            let abc = arr2[k];

            let objTwo = {
              currencyName: arr2[k],
              initialAsset: profitAndLoss[abc].original_assets,
              currentAssets: profitAndLoss[abc].current_assets,
              amountDifference: profitAndLoss[abc].convert,
              difference: profitAndLoss[abc].gap,
              usdtPrice: profitAndLoss[abc].last
            };
            // console.log(objTwo)
            this.singleAssetAccountTable2.push(objTwo);
          }
        }
      });

      this.singleAssetAccount = true;
    },
    //刷新单用户id 
    refreshId(){
        let params = {
          id :this. idRefresh
        }
         this.singleAssetAccountTable1 = [];
      this.singleAssetAccountTable2 = [];
      // console.log(params);
      api.userAssetInformation(params).then(res => {
        if (res.data.code == 200) {
          console.log(res.data.data);
          let stagingTwo = res.data.data.history_profit.number;
          this.historyProfit = stagingTwo;
          let stagingOne = res.data.data.asset_change.number;
          this.assetChange = stagingOne;
          // console.log(res.data.data)

          console.log(res.data.data.asset_change.number);
          console.log(typeof res.data.data.asset_change.number);
          let staging = res.data.data.original_assets;
          this.originalAssets = staging;
          // console.log(this.originalAssets);
          let arr1 = Object.keys(res.data.data.assets_dict);
          // console.log(arr1);
          let abcList = res.data.data.assets_dict;
          for (let i = 0; i < arr1.length; i++) {
            let abc = arr1[i];
            // console.log(abcList);
            let obj = {
              currencyName: arr1[i],
              available: abcList[abc].balance,
              freeze: abcList[abc].freeze,
              initialAsset: abcList[abc].original_assets,
              totalAssets: abcList[abc].current_assets
            };
            // console.log(obj);
            this.singleAssetAccountTable1.push(obj);
          }
          let profitAndLoss = res.data.data.profit_loss_dict;
          // console.log(profitAndLoss);
          let arr2 = Object.keys(res.data.data.profit_loss_dict);

          for (let k = 0; k < arr2.length; k++) {
            let abc = arr2[k];

            let objTwo = {
              currencyName: arr2[k],
              initialAsset: profitAndLoss[abc].original_assets,
              currentAssets: profitAndLoss[abc].current_assets,
              amountDifference: profitAndLoss[abc].convert,
              difference: profitAndLoss[abc].gap,
              usdtPrice: profitAndLoss[abc].last
            };
            // console.log(objTwo)
            this.singleAssetAccountTable2.push(objTwo);
          }
        }
       });
    },
    //更换页码
    changePage(data) {
      this.pageNum = data;
      this.pageSize=pageSize
      this.getAllUsers();
    },
      //  select (value) {
      //   for (let i in this.platform) {
      //     if(this.platform[i].Platform_name == value.platform_name) {
      //       this.formValidate.id = this.rolesList[i].platform_id
      //     }
      //   }
      //   // this.formValidate.roleId = value.id
      // },
  },
  created() {
    this.getAllUsers();
    this.getAddPlatform();
    this.getListCurrencies();
  },
  mounted() {}
};
</script>
