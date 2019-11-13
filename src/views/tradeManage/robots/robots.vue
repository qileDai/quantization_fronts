<style lang="less" scoped>
@import "../../../styles/common.less";
@import "robots.less";
</style>

<template>
  <div class="content">
    <Row class="et-row">
      <Col>
        <span>交易币种</span>

        <div class="search-out">
          <Select v-model="coinName" clearable filterable>
            <Option v-for="item in currencyList" :value="item" :key="item">{{item}}</Option>
          </Select>
        </div>
        <span style="margin-left: 15px;">交易市场</span>
        <div class="search-out">
          <Select v-model="marketName" clearable filterable>
            <Option v-for="item in currencyList" :value="item" :key="item">{{ item }}</Option>
          </Select>
        </div>
        <span style="margin-left: 15px;">状态</span>
        <div class="search-out">
          <Select v-model="status" clearable filterable>
            <Option v-for="item in robotState" :value="item.key" :key="item.key">{{ item.status }}</Option>
          </Select>
        </div>
        <Button type="primary" @click="screeningRobot" v-if="this.g_perm('accountlist')">查询</Button>
        <!-- <Button type="primary" icon="ios-search" style="margin-left: 5px;" @click="searchMarket">查询</Button> -->
        <Button
          type="primary"
          size="large"
          class="add_account"
          style=" margin-left:20px;"
          @click="createrRobots=true"
          v-if="this.g_perm('createrobot')"
        >创建机器人</Button>
        <Button
          type="info"
          class="add_account"
          style="margin-left:20px;"
          @click="operationRobot(0)"
          v-if=" this.g_perm('onestop')"
        >一键停止</Button>
        <Button type="info" class="add_account" @click="operationRobot(1)"   v-if=" this.g_perm('onestart')">一键运行</Button>
      </Col>
    </Row>
    <Table border :columns="tableColumns" :data="tableData"></Table>
    <div style="position: relative;">
      <Page
        class="pages"
        :current="pageNum"
        :total="total"

        show-sizer
        show-total
        :page-size="pageSize"
        :page-size-opts="sizeOpts"
        @on-page-size-change="changePageSize"
        @on-change="changePageNum"
      ></Page>
    </div>
    <Modal v-model="createrRobots" width="700" :mask-closable="false">
      <p slot="header" style="color:#f60;text-align:left">
        <span>创建机器人</span>
      </p>
      <div style="text-align:center">
        <Steps :current="current">
          <Step title="选择交易对"></Step>
          <Step title="选择交易策略"></Step>
          <Step title="设置策略参数"></Step>
          <Step title="设置策略风险"></Step>
        </Steps>
        <div v-if="this.current==0">
          <div style="text-align:left">
            <span>选择交易对</span>
            <Form
              ref="formvalidate"
              :model="formValidatezero"
              :rules="ruleValidatezero"
              :label-width="80"
            >
              <Form-item
                label="交易币种"
                prop="currencyType"
                style="margin-top:80px; margin-button:80px;"
              >
                <Select v-model="formValidatezero.currencyType" placeholder="请选择交易币种">
                  <Option v-for="item in currencyList" :label="item" :value="item" :key="item"></Option>
                </Select>
              </Form-item>
              <Form-item label="交易市场" prop="platform" style="margin-top:80px; margin-button:80px;">
                <Select v-model="formValidatezero.platform" placeholder="请选择交易市场">
                  <Option v-for="item in accountPlatform" :label="item" :value="item" :key="item"></Option>
                </Select>
              </Form-item>
            </Form>
          </div>
        </div>
        <div v-if="this.current==1">
          <div style="text-align:left; display:block; margin-botton:50px;">
            <span>选择交易对</span>
            <span>{{formValidatezero.currencyType}}/{{formValidatezero.platform}}</span>
            <span style="display:block">选择交易策略</span>
          </div>
          <div style="text-align:center">
            <RadioGroup v-model="tradingStrategies" type="button" style="margin-top:100px;">
              <Radio label="网格交易V1.0">网格交易V1.0</Radio>
              <Radio label="三角套利V1.0" style="margin:0 80px;">三角套利1.0</Radio>
              <Radio label="搬砖套利V1.0">搬砖套利V1.0</Radio>
            </RadioGroup>
          </div>
        </div>
        <div v-if="this.current==2">
          <div style="text-align:left">
            <span>选择交易对</span>
            <span>{{formValidatezero.currencyType}}/{{formValidatezero.platform}}</span>

            <span style="display:block">选择交易策略: {{tradingStrategies}}</span>
            <span>设置策略参数</span>
          </div>

          <div>
            <Form
              ref="formvalidateTwo"
              :model="formValidateTwo"
              :rules="ruleValidateTwo"
              :label-width="150"
            >
              <Form-item label="交易账户" prop="tradingAccount">
                <Select
                 
                  v-model="formValidateTwo.tradingAccount"
                  placeholder="交易账户"
                  @on-change="accountInfo"
                   :label-in-value ="true"
                >
                  <Option
                    v-for="(item,key) in tradingAccountList"
                    :label="item.title"
                    :value="item.id"
                    :key="key"
                  ></Option>
                </Select>
              </Form-item>
              <Form-item>
                <span>可用</span>
                <span>{{tradingCurrency}}</span>
                <span>{{availableTradingMarket}}</span>
              </Form-item>
              <Form-item label=" 当前价" prop="currentPrice">
                <span>{{defaultCurrentPrice}}</span>
                <span>{{formValidatezero.platform}}</span>
                <Input style="width: 300px" v-model="currentPrice"></Input>
                <Button type="primary" @click="ChangeCurrentPrice">设置当前价</Button>
              </Form-item>
              <Form-item label=" 重新设置挂单频率" prop="resetFrequency">
                <Input style="width: 300px" v-model="formValidateTwo.resetFrequency"></Input>
                <span>毫秒</span>
              </Form-item>
              <Form-item label="阻力位" prop="resistance">
                <Input style="width: 300px" v-model="formValidateTwo.resistance"></Input>
              </Form-item>
              <Form-item label=" 支撑位" prop="support">
                <Input style="width: 300px" v-model="formValidateTwo.support"></Input>
              </Form-item>
              <Form-item label=" 网格数量" prop="gridNumber">
                <Input style="width: 300px" v-model="formValidateTwo.gridNumber"></Input>
              </Form-item>
              <Form-item label=" 单次交易手续费" prop="singleTransaction">
                <Input style="width: 300px" v-model="formValidateTwo.singleTransaction"></Input>
              </Form-item>
              <Form-item label=" 单网格最小交易数量" prop="minimumNumber">
                <Input style="width: 300px" v-model="formValidateTwo.minimumNumber"></Input>
              </Form-item>
              <Form-item label=" 单网格最大交易数量" prop="maximumNumber">
                <Input style="width: 300px" v-model="formValidateTwo.maximumNumber"></Input>
              </Form-item>
            </Form>
            <span>单网格利润</span>
            <span>{{minimumProfit}}-{{biggestProfits}}</span>
          </div>
        </div>
        <div v-if="this.current==3">
          <div style="text-align:left; display:block; margin-botton:50px;">
            <span>选择交易对</span>
            <span>{{formValidatezero.currencyType}}/{{formValidatezero.platform}}</span>
            <span style="display:block">选择交易策略: {{tradingStrategies}}</span>
            <span>设置策略参数:</span>
            <span>交易账户</span>
            <span>{{formValidateTwoTradingAccountLable}}</span>
            <span>阻力位</span>
            <span>{{formValidateTwo.resistance}}</span>
            <span>支撑位</span>
            <span>{{formValidateTwo.support}}</span>
            <span>网格数量</span>
            <span>{{formValidateTwo.gridNumber}}</span>
            <span>单次交易手续费</span>
            <span>{{formValidateTwo.singleTransaction}}</span>
            <span>单网格利润</span>
            <span>{{minimumProfit}}-{{biggestProfits}}</span>>
            <span>设置风险策略</span>
          </div>
          <div style="text-align:center">
            <Form
              ref="formvalidateFour"
              :model="formValidateFour"
              :rules="ruleValidateFour"
              :label-width="150"
            >
             <Form-item label=" 止损价" prop="stopLossPrice">
                <Input style="width: 300px" v-model="formValidateFour.stopLossPrice"></Input>
              </Form-item>
             <Form-item label=" 预警价" prop="warningPrice">
                <Input style="width: 300px" v-model="formValidateFour.warningPrice"></Input>
              </Form-item>
             <Form-item label=" 预警频率" prop="warningTime">
                <Input style="width: 300px" v-model="formValidateFour.warningTime"></Input> <span>分钟</span>
              </Form-item>
            </Form>
            <!-- <p>
              <span>止损价</span>
              <Input style="width: 200px" v-model="stopLossPrice"></Input>
            </p>
            <span>预警价</span>
            <Input style="width: 200px" v-model="warningPrice"></Input>
          </div>
          <div> -->
            <span>预警账户</span>
            <!-- <ul>
                <li v-for="item in warningAccount" :key="item.id" >
                   <label :for="item.nickname" :label='item.nickname'></label>
                   <input type="checkbox"  :id="item.id"  />
                </li>
            </ul>-->
            <!-- <Input style="width: 300px" type="checkbox"123></Input>
               <Input style="width: 300px" type="checkbox">123</Input>
               <Input style="width: 300px" type="checkbox">123</Input>
            <Input style="width: 300px" type="checkbox">123</Input>-->
            <!-- <input type="checkbox"> -->
            <Checkbox-group v-model="selectedAccount" @on-change="checkAllGroupChange">
              <Checkbox
                type="button"
                v-for="item in warningAccount"
                :key="item.id"
                :label="item.id"
                :value="item.id"
                style="width:100px; height:25px; background-color :skyblue; text-align:left;"
              >{{item.username}}</Checkbox>
            </Checkbox-group>
          </div>
        </div>
      </div>
      <div slot="footer">
        <Button type="primary" @click="last" v-if="this.current > 0">上一步</Button>
        <Button type="primary" @click="nextOne(current)" v-if="this.current == 0">下一步</Button>
        <Button type="primary" @click="nextTwo(current)" v-if="this.current == 2">下一步</Button>
        <Button type="primary" @click="next(current)" v-if="this.current == 1">下一步</Button>
        <Button type="primary" @click="createrRobotsConnection()" v-if="this.current == 3">完成</Button>
      </div>
    </Modal>

    <Modal
      v-model="parameterConfiguration"
      title="参数配置"
      width="700"
      @on-ok="modifyRobotConfiguration()"
    >
      <span>策略参数</span>

      <div>
        <Form
          ref="form-validateThree"
          :model="formValidateThree"
          :rules="ruleValidateThree"
          :label-width="130"
        >
          <Form-item label="交易账户" prop="tradingAccount">
             <Input style="width: 300px" v-model="formValidateThree.tradingAccount" disabled></Input>
            <!-- <Select v-model="formValidateThree.tradingAccount" placeholder="交易账户" disabled>
              <Option
                v-for="(item,key) in tradingAccountList"
                :label="item.title"
                :value="item.id"
                :key="key"
              ></Option>
            </Select> -->
          </Form-item>
          <Form-item label=" 当前价" prop="currentPrice">
            <span>{{defaultCurrentPrice}}</span>usdt
            <Input style="width: 300px" v-model="currentPrice" disabled></Input>
          </Form-item>
          <Form-item label=" 重新设置挂单频率" prop="resetFrequency">
            <Input style="width: 300px" v-model="formValidateThree.resetFrequency"></Input>
          </Form-item>
          <Form-item label="阻力位" prop="resistance">
            <Input style="width: 300px" v-model="formValidateThree.resistance" disabled></Input>
          </Form-item>
          <Form-item label=" 支撑位" prop="support">
            <Input style="width: 300px" v-model="formValidateThree.support" disabled></Input>
          </Form-item>
          <Form-item label=" 网络数量" prop="gridNumber">
            <Input style="width: 300px" v-model.number="formValidateThree.gridNumber" disabled></Input>
          </Form-item>
          <Form-item label=" 单次交易手续费" prop="singleTransaction">
            <Input style="width: 300px" v-model="formValidateThree.singleTransaction"></Input>
          </Form-item>
          <Form-item label=" 单网格最小交易数量" prop="minimumNumber">
            <Input style="width: 300px" v-model="formValidateThree.minimumNumber"></Input>
          </Form-item>
          <Form-item label=" 单网格最大交易数量" prop="maximumNumber">
            <Input style="width: 300px" v-model="formValidateThree.maximumNumber"></Input>
          </Form-item>
          <Form-item label="止损价" prop="stopLossPrice">
            <span>设置风险策略</span>
            <Input style="width: 200px" v-model="formValidateThree.stopLossPrice"></Input>
          </Form-item>
          <Form-item label="预警价" prop="warningPrice">
            <Input style="width: 200px" v-model="formValidateThree.warningPrice"></Input>
          </Form-item>
        </Form>

        <span>预警账户</span>
        <Checkbox-group v-model="robotSelectedAccount">
          <Checkbox
            type="button"
            v-for="item in warningAccount"
            :key="item.id"
            :label="item.id"
            :value="item.id"
            style="width:100px; height:25px; background-color :skyblue; text-align:left;"
          >{{item.username}}</Checkbox>
        </Checkbox-group>
      </div>
    </Modal>
    <Modal v-model="transactionDetails" title="详情" width="800">
      <Button type="text" @click="trigger(0)">待成交{{openNum}}</Button>
      <Button type="text" @click="trigger(1)">已完成{{closedNum}}</Button>
      <div v-if="this.switch">
        <div>
          <span>总投入:</span>
          <span>{{totalInput}}</span>
          <span style=" display:inline_block;  margin-left:30px;">策略已运行</span>
          <span>{{runningTime}}</span>
          <p style=" margin: 10px 0;">
            <span>账户可用：</span>
            <span>{{marketBalance}}</span>
            <span>{{currencyBalance}}</span>
            <span  style=" display:inline_block;  margin-left:30px;">账户冻结：</span>
            <span>{{marketFreeze}}</span>
            <span>{{currencyFreeze}}</span>
          </p>
          <span>现价</span>
          （{{currencyOne}}/{{marketOne}}）：
          <span >{{Last}}</span>
        </div>
        <div style="text-align:left;display:inline-block">
          <Table
            :columns="concludedList"
            :data="concludedData"
            width="350"
            height="200"
            style="display:inline-block"
          ></Table>
        </div>
        <div style="text-align:left;display:inline-block">
          <Table
            :columns="concludedListOne"
            :data="concludedDataOne"
            width="350"
            height="200"
            style="display:inline-block"
          ></Table>
        </div>
      </div>

      <div v-if="!this.switch">
        <div>
          <span>总投入:</span>
          <span>{{totalInput}}</span>
          <span  style=" display:inline_block;  margin-left:30px;">策略已运行</span>
          <span>{{runningTime}}</span>
          <p style=" margin: 10px 0;">
            <span>账户可用：</span>
            <span>{{marketBalance}}</span>
            <span>{{currencyBalance}}</span>
            <span  style=" display:inline_block;  margin-left:30px;">账户冻结：</span>
            <span>{{marketFreeze}}</span>
            <span>{{currencyFreeze}}</span>
          </p>
          <span>现价</span>
          （{{currencyOne}}/{{marketOne}}）：
          <span>{{Last}}</span>
        </div>
        <div style=" text-align:right;margin-bottom:10px; margin-right: 20px;">
          <span >总收益</span>
          <span>{{total_profit}}</span>
        </div>
        <Table width="750" border  :columns="completed" :data="completedData"></Table>
        <div  style="position:relative">
               <Page
               placement="top"
          class="pages"
          :current="pageNumOne"
          :total="totalCount"

          show-sizer
          show-total
          :page-size="pageSizeOne"
          :page-size-opts="sizeOptsOne"
          @on-change="changePageNumOne"
          @on-page-size-change="changePageSizeOne"
        ></Page>

          
        </div>
   
      </div>
    </Modal>
  </div>
</template>

<script>
import api from "@/api/robots";
import axios from "@/axios/config";
var _this = ""
export default {
  name: "robots",
  data() {
    const validateresistance = (rule, value, callback) => {
      // console.log(value)
      // console.log(this.defaultCurrentPrice)
      if (value * 1 <= this.defaultCurrentPrice * 1) {
        return callback(new Error("阻力位不得低于或等于当前价"));
      } else {
        return callback();
      }
    };
    const validatesupport = (rule, value, callback) => {
      if (value * 1 >= this.defaultCurrentPrice * 1) {
        return callback(new Error("支撑位不得高于或等于当前价"));
      } else {
        return callback();
      }
    };
    const validatstopLossPrice = (rule, value, callback) => {
      if (value * 1 >= this.formValidateTwo.support * 1) {
        return callback(new Error("止损价必须低于支撑价"));
      } else {
        return callback();
      }
    };
      const validaaccountBalance = (rule, value, callback) => {
        console.log(this.availableTradingMarket)
      if (
        Number(this.availableTradingMarket.replace(/[a-zA-Z]+/gi,"")) < (this.formValidateTwo.resistance+this.formValidateTwo.support)*value*this.formValidateTwo.gridNumber) {
        return callback(new Error("市场币种余额不足"));
      } else if(
        Number(this.tradingCurrency.replace(/[a-zA-Z]+/gi,"")) < value*this.formValidateTwo.gridNumber) {
          console.log(value*this.formValidateTwo.gridNumber)
        return callback(new Error("交易币种余额不足"));
      }else {
         return callback();
      }
    };

    return {
      req_url: axios.defaults.baseURL,
      tableColumns: [
        {
          type: "selection",
          width: 60,
          align: "center"
        },
        {
          title: "机器人ID",
          key: "robotId"
        },
        {
          title: "交易账户",
          key: "tradingAccount"
        },
        {
          title: "交易币种",
          key: "tradingCurrencies"
        },
        {
          title: "交易市场",
          key: "tradingMarket"
        },
        {
          title: "交易策略",
          key: "tradingStrategiesone"
        },
        {
          title: "总投入",
          key: "tradingStrategiestwo"
        },
        {
          title: "浮动盈亏",
          key: "floatingProfit"
        },
        {
          title: "实现利润",
          key: "profits"
        },
        {
          title: "总利润",
          key: "grossProfit"
        },
        {
          title: "年化收益率",
          key: "annualizedRate"
        },
        {
          title: "创建日期",
          key: "createTime",
          render: (h, params) => {
            return h(
              "span",
              params.row.createTime ? params.row.createTime.split(".")[0] : "-"
            );
          }
        },
        {
          title: "状态",
          key: "isOpen",
          render: (h, params) => {
            if (params.row.status === 0) {
              return h("span", "已停止");
            } else if (params.row.status === 1) {
              return h("span", "运行中");
            } else if (params.row.status === 2) {
              return h("span", "运行中(保护)");
            } else {
              return h("span", "停止中(保护)");
            }
          }
          // params.row.status === 0 ? "已停止" : "运行中"运行中（保护）
        },

        {
          title: "操作",
          render: (h, params) => {
            return h(
              "div",
              {
                style: {
                  paddingBottom: "5px"
                }
              },
              [
                this.g_perm("startrobot")
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
                            this.runRobot(params.row);
                          }
                        }
                      },
                      params.row.run_status === 0 ? "停止" : "运行"
                    )
                  : "",

                this.g_perm("showtradedetail")
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
                            this.robotDetails(params.row);
                           
                          }
                        }
                      },
                      "详情"
                    )
                  : "",
                this.g_perm("showconfig")
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
                            this.robotConfiguration(params.row);

                            // this.setOpenStatus(params.row, 0);
                          }
                        }
                      },
                      "配置"
                    )
                  : "",
                this.g_perm("protection")
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
                            // this.setOpenStatus(params.row.protection, 0);
                            this.protectiveRobot(params.row);
                          }
                        }
                      },
                      params.row.protection === 0 ? "解除" : "保护"
                    )
                  : ""
              ]
            );
          }
        }
      ],
      concludedList: [
        {
          type: "index",
          title: "买入",
          key: "order_type"
        },
        {
          title: "价格",
          key: "price"
        },
        {
          title: "数量",
          key: "amount"
        }
      ],
      concludedListOne: [
        {
          type: "index",
          title: "卖出",
          key: "order_type"
        },
        {
          title: "价格",
          key: "price"
        },
        {
          title: "数量",
          key: "amount"
        }
      ],
      completed: [
        {
          title: "类型",
        render (h, params) {
                      return h('div',[
                    params.row.order_type ? h('div', '买入') :''
                  ])
        }
        },
        {
             renderHeader (h, params) {
                      return h('div',[
                     h('div', '价格'+_this.marketOne) ,
                  ])
        },
          key: "closing_price",
    
        },
        {
          // title: "总额(USDT)",
           renderHeader (h, params) {
                      return h('div',[
                     h('div', '总额'+_this.marketOne) ,
                  ])
        },
          key: "total_price"
        },
        {
          title: "创建时间",
          key: "closing_time",
          width: 100,

        },
        {
          title: "类型",
       render (h, params) {
        //  console.log(params)
                  return h('div',[
                    params.row.order_type1 ? h('div', '卖出') :''
                  ])

        }
        },
        {
          // title: "价格(USDT)",
           renderHeader (h, params) {
                      return h('div',[
                     h('div', '价格'+_this.marketOne) ,
                  ])
        },
          key: "closing_price1"
        },
        {
          // title: "总额(USDT)",
             renderHeader (h, params) {
                      return h('div',[
                     h('div', '总额'+_this.marketOne) ,
                  ])
        },
          key: "total_price1"
        },
        {
          title: "创建时间",
          key: "closing_time1",
          width: 100,
        },
        {
          // title: "收益",
                   renderHeader (h, params) {
                      return h('div',[
                     h('div', '收益'+_this.marketOne) ,
                  ])
        },
          key: "profit"
        }
      ],
      concludedData: [
        // {
        //   buy: 1
        // },
      ],
      concludedDataOne: [
        // {
        //   sell: 1
        // }
      ],
      tableData: [], //机器人列表数据
      completedData: [],
      searchVal: "",
      modalStatus: false,
      modalTitle: "添加",
      formItem: {
        id: "",
        isOpen: 1,
        marketName: "",
        numbers: "",
        speed: "",
        huobiMarket: "ltcusdt",
        amountCoefficient: 1
        // 以下字段用于下拉选择
      },
      ruleValidate: {
        // marketName: [
        //     {required: true, message: '请输入市场名称', trigger: 'blur'}
        // ],
        numbers: [
          {
            required: true,
            type: "number",
            message: "请输入交易量",
            trigger: "blur"
          }
        ],
        speed: [
          {
            required: true,
            type: "number",
            message: "请输入速率，单位毫秒",
            trigger: "blur"
          }
        ],
        huobiMarket: [
          { required: false, message: "请输入火币市场", trigger: "blur" }
        ],
        amountCoefficient: [
          {
            required: false,
            type: "number",
            message: "请输入数量系数",
            trigger: "blur"
          }
        ],
        coin: [{ required: true, message: "请选择交易区", trigger: "change" }],
        market: [{ required: true, message: "请选择币种", trigger: "change" }]
      },
      marketName: "",
      coinName: "",
      status: "",
      markets: [],
      coins: [],
      addCoins: [],
      editType: 0, // 编辑类型 0添加 1编辑
      pageNum: 1,
      pageNumOne: 1,
      pageSize: 20,
      pageSizeOne: 20,
      total: 1, // 总页数
      totalCount: 1, // 总页数
      sizeOpts: [10, 20, 50, 100],
      sizeOptsOne: [10, 20, 50, 100],

      createrRobots: false,
      current: 0, //步骤进度控制
      tradingStrategies: "网格交易V1.0", //交易策略
      //创建机器人第一个弹出框数据
      formValidatezero: {
        currencyType: "", //交易币种
        platform: "" //交易平台
      },
      formValidateTwo: {
        tradingAccount: "", //交易账户

        resetFrequency: "", //挂单频率
        resistance: "", //阻力位
        support: "", //支撑位
        gridNumber: "100", //网格数量
        singleTransaction: "0.001", //单次交易手续费
        minimumNumber: "", //单网格最小交易数量
        maximumNumber: "" //单网格最大交易数量
      },
      formValidateThree: {
        id: "",
        tradingAccount: "", //交易账户
        resetFrequency: "", //挂单频率
        resistance: "", //阻力值
        support: "", //支撑位
        gridNumber: "", //网格数量
        singleTransaction: "", //单次交易手续费
        minimumNumber: "", //单网格最小交易数量
        maximumNumber: "", //单网格最大交易数量
        stopLossPrice: "", //止损价
        warningPrice: "" //预警价
      },
      formValidateFour: {
        stopLossPrice: "", //止损价
        warningPrice: "", //预警价
        warningTime: "" //预警频率
      },
      // minimumProfit: "", //单网格交易最小利润
      // biggestProfits: "", //单网格交易最大利润
      warningAccount: [], //所有的预警账户
      selectedAccount: [], //已选择的预警账户
      robotSelectedAccount: [], //单个机器人已选账户
      // stopLossPrice: "", //止损价
      // warningPrice: "", //预警价
      currentPrice: "", //设置的当前价
      defaultCurrentPrice: "72.56", //默认的当前价
      parameterConfiguration: false, //参数配置弹框
      transactionDetails: false, //参数详情页面弹出框
      switch: false, //切换未成交和已完成
      pagingID:{
        robotId:''
      },
      formValidateTwoTradingAccountLable:'',//暂存一下用户名

      ruleValidatezero: {
        currencyType: [
          { required: true, message: "请选择交易币种", trigger: "change" }
        ],
        platform: [
          { required: true, message: "请选择交易市场", trigger: "change" }
        ]
      },
      ruleValidateTwo: {
        tradingAccount: [
          {
            required: true,
            type: "number",
            message: "请选择交易账户",
            trigger: "change"
          }
        ],
        resetFrequency: [
          { required: true, message: "挂单频率不能为空", trigger: "blur" }
        ],
        resistance: [
          { validator: validateresistance, trigger: "change" }
          // {
          //   required: true,
          //   type: "number",
          //   message: "阻力值需要大于当前价",
          //   trigger: "blur"
          // }
        ],
        support: [
          { validator: validatesupport, trigger: "change" }
          // {
          //   required: true,
          //   type: "number",
          //   message: "支撑位需要小于当前价",
          //   trigger: "blur"
          // }
        ],
        gridNumber: [
          {
            required: true,
            message: "网格数量不能为空",
            trigger: "blur"
          }
        ],
        singleTransaction: [
          { required: true, message: "单次交易手续费不能为空", trigger: "blur" }
        ],
        minimumNumber: [
          {
            required: true,
            message: "单网格最小交易数量不能为空",
            trigger: "blur"
          }
        ],
        maximumNumber: [
          // {
          //   required: true,
          //   message: "单网格最大交易数量不能为空",
          //   trigger: "blur"
          // }
            {validator:validaaccountBalance,trigger: 'change'}
        ]
      },
      ruleValidateThree: {},
      ruleValidateFour: {
        stopLossPrice: [{ validator: validatstopLossPrice, trigger: "change" }],
        warningPrice: [
          { required: true, message: "预警价不能为空", trigger: "blur" }
        ],
        warningTime: [
          { required: true, message: "单次交易手续费不能为空", trigger: "blur" }
        ]
      },

      //账户币种配置获取币种列表
      currencyList: [], //创建机器人的交易币种
      accountPlatform: [],
      tradingAccountList: [],

      robotState: [
        {
          status: "运行中",
          key: 1
        },
        {
          status: "已停止",
          key: 0
        }
      ],
      total_currency: "", //交易总资产
      total_market: "", //交易市场总资产
      tradingCurrency: "", //交易币种可用
      availableTradingMarket: "", //交易市场可用
      // singleGrid: "", //单网格
      openNum: "", //未完成数量
      closedNum: "", //已完成数量
      totalInput: "", //总投入
      runningTime: "", //运行时间
      currencyBalance: "", //币种可用
      currencyFreeze: "", //币种冻结
      marketBalance: "", //交易市场可用
      marketFreeze: "", //交易市场冻结
      Last: "", //现价
      currencyOne: "", //交易币种
      marketOne: "" ,//交易市场
      total_profit:''//总收益
    };
  },
  watch: {},
  computed: {},
  methods: {
      //分页改变
    changePageSize(size) {
        this.pageSize = size
        if (this.pageNum === 1) {
          this.getListCurrencies()
        }
      },
      changePageSizeOne(size){
         this.pageSizeOne = size
        if (this.pageNumOne === 1) {
            this.robotDetails(this.pagingID)
        
        }
      },
    next() {
      //     this.$refs.formvalidate.validate((valid) => {
      //              if (valid) {
      //                   alert('验证成功')
      //              }
      //  });
      // console.log(this.current);
      if (this.current == 3) {
      } else if (this.current == 2) {
        this.current += 1;
      } else if (this.current == 1) {
        this.current += 1;
      } else {
        this.current += 1;
      }
    },
    last() {
      if (this.current == 4) {
      } else {
        this.current -= 1;
      }
    },
    complete() {
      // console.log("创建了一个机器人");
    },
    checkAllGroupChange(data) {
      // console.log(data);
      // this.selectedAccount = data;
      // console.log(this.selectedAccount);
    },
    //更改默认当前价
    ChangeCurrentPrice() {
      this.defaultCurrentPrice = this.currentPrice;
      this.currentPrice = "";
    },
    //切换未成交和已完成
    trigger(data) {
      if (data == 0) {
        this.switch = true;
      } else if (data == 1) {
        this.switch = false;
      }
    },
    nextOne(data) {
      this.$refs.formvalidate.validate(valid => {
        if (valid) {
          this.current += 1;
          // } else {
          //   this.$Message.error("表单验证失败!");
        }
      });
    },
    nextTwo() {
      this.$refs.formvalidateTwo.validate(valid => {
        if (valid) {

          console.log(this.formValidateTwo.tradingAccount)
          // console.log(valid);
          // if (
          //   this.formValidateTwo.resistance > this.defaultCurrentPrice &&
          //   this.formValidateTwo.support < this.defaultCurrentPrice
          // ) {
          //   this.current += 1;
          // } else {
          // return this.$Message.error("表单验证失败!");
          // }
          this.current += 1;
          // } else {
          //   this.$Message.error("表单验证失败!");
        } else {
          this.$Message.error("表单验证失败!");
        }
      });
    },

    // 获取机器人列表
    getListCurrencies() {
      let params = {
        pageIndex: this.pageNum,
        pageSize: this.pageSize
      };
      api.AllCurrencies(params).then(res => {
        // console.log(res);
        this.tableData = [];
        // console.log(res.data.data);
        // console.log(res.data.data);
        if (res.data.code == 200) {
          for (let i = 0; i < res.data.data.result.length; i++) {
            // console.log(res.data.data.result[i].trading_account.id);
            let obj = {
              robotId: res.data.data.result[i].id, //机器人ID
              tradingAccount: res.data.data.result[i].account_title, //交易账户
              tradingMarket: res.data.data.result[i].market, //交易市场
              tradingCurrencies: res.data.data.result[i].currency, //交易币种
              tradingStrategiesone: res.data.data.result[i].trading_strategy, //交易策略
              tradingStrategiestwo: res.data.data.result[i].total_money, //总投入
              floatingProfit: res.data.data.result[i].float_profit, //浮动盈亏
              profits: res.data.data.result[i].realized_profit, //实现利润
              grossProfit: res.data.data.result[i].total_profit, //总利润
              annualizedRate: res.data.data.result[i].annual_yield, //年化收益率
              createTime: res.data.data.result[i].create_time, //创建时间
              status: res.data.data.result[i].status, //机器人运行
              protection: res.data.data.result[i].protection, //机器人保护
              run_status: res.data.data.result[i].run_status
            };
            this.tableData.push(obj);
          }
          // this.pageSize = res.data.data.numPerPage;
          this.total = res.data.data.totalCount;

          // this.tradingAccountList = res.data.data.account;
        }
      });
    },
    //获取机器人配置信息 (部分字段无)
    robotConfiguration(data) {
      // console.log(data)
      let params = {
        robot_id: data.robotId
      };
      api.robotConfiguration(params).then(res => {
        if (res.data.code == 200) {
          // console.log(res.data.data);
          let obj = {
            id: res.data.data.robot.id,
            tradingAccount: res.data.data.account_name, //账户名称
            warningPrice: res.data.data.robot.warning_price, //预警价格
            stopLossPrice: res.data.data.robot.stop_price, //止损价

            resetFrequency: res.data.data.robot.orders_frequency, //挂单频率
            resistance: res.data.data.robot.resistance, //阻力值
            support: res.data.data.robot.support_level, //支撑位
            gridNumber: res.data.data.robot.girding_num, //网格数量
            singleTransaction: res.data.data.robot.procudere_fee, //单网格手续费
            minimumNumber: res.data.data.robot.min_num, //单网格最小交易
            maximumNumber: res.data.data.robot.max_num //单网格最小交易
          };
          this.formValidateThree = obj;
          this.robotSelectedAccount = JSON.parse(
            res.data.data.robot.warning_account
          );
          this.defaultCurrentPrice = res.data.data.robot.current_price;
          // console.log(this.selectedAccount)
        }
        // console.log(res.data.data);
      });
      this.parameterConfiguration = true;
    },
    //获取创建机器人的市场
    getmarketList() {
      api.getmarketList().then(res => {
        if (res.data.code == 200) {
          var obj = JSON.parse(res.data.data);
          for (let i = 0; i < obj.length; i++) {
            this.currencyList.push(obj[i].currency);
            this.accountPlatform.push(obj[i].currency);
          }
        }
      });
    },
    //获取账户信息
    accountInfo(data) {
      this.formValidateTwoTradingAccountLable= data.label;
      let params = {
        curry_title: this.formValidatezero.currencyType,
        market_title: this.formValidatezero.platform,
        account_id: this.formValidateTwo.tradingAccount
      };
      api.getaccountinfo(params).then(res => {
        if (res.data.code == 200) {
          // console.log(res);
          this.formValidateTwo.resistance = res.data.data.resistance;
          this.formValidateTwo.support = res.data.data.support_level;
          (this.defaultCurrentPrice = Number(
            res.data.data.last.replace(/[a-zA-Z]+/gi, "")
          )),
            (this.total_currency = res.data.data.total_currency);
          this.total_market = res.data.data.total_market;
          this.tradingCurrency = res.data.data.currency;
          this.availableTradingMarket = res.data.data.market;
          // console.log(this.formValidateTwo.gridNumber);
          // console.log(res.data.data.resistance - res.data.data.support_level);
          // this.singleGrid =
          //   (res.data.data.resistance - res.data.data.support_level) /
          //   this.formValidateTwo.gridNumber;
          // console.log(this.singleGrid);
        }
        // console.log(this.totalMoney)
      });
    },
    //获取预警账户
    getwarningAccount() {
      api.warningAccount().then(res => {
        if (res.data.code == 200) {
          // console.log(res)
          this.warningAccount = res.data.data;
          // console.log(this.warningAccount);
        }
      });
    },
    //创建机器人
    createrRobotsConnection() {
  

      this.$refs.formvalidateFour.validate(valid => {
        if (valid) {
          let params = {
            currency: this.formValidatezero.currencyType,
            market: this.formValidatezero.platform,
            trading_strategy: this.tradingStrategies,
            // current_price: Number(this.defaultCurrentPrice.replace(/\USDT/gi, "")),
            current_price: this.defaultCurrentPrice,
            orders_frequency: this.formValidateTwo.resetFrequency,
            resistance: this.formValidateTwo.resistance,
            support_level: this.formValidateTwo.support,
            girding_num: this.formValidateTwo.gridNumber,
            procudere_fee: this.formValidateTwo.singleTransaction,
            min_num: this.formValidateTwo.minimumNumber,
            max_num: this.formValidateTwo.maximumNumber,
            girding_profit: this.minimumProfit,
            stop_price: this.formValidateFour.stopLossPrice,
            warning_price: this.formValidateFour.warningPrice,
            warning_time: this.formValidateFour.warningTime,
            warning_account: this.selectedAccount,
            // warning_account:'123',
            trading_account: this.formValidateTwo.tradingAccount,
            total_money: this.totalMoney,
            currency_num: this.tradingCurrency,
            market_num: this.availableTradingMarket
          };
          // console.log(params);
          api.createrRobotsConnection(params).then(res => {
            if (res.data.code == 200) {
              // console.log("创建机器人成功");
              this.createrRobots = false;
              this.$Message.success("创建机器人成功");
            }
          });
        }
      });
    },
    //更改页码数量
    changePageNum(data) {
      this.pageNum = data;

      this.getListCurrencies();
    },
    changePageNumOne(data) {
      // console.log('123')
      this.pageNumOne = data;
      this.robotDetails(this.pagingID);
    },
    //修改机器人参数配置
    modifyRobotConfiguration() {
      let params = {
        robot_id: this.formValidateThree.id,
        orders_frequency: this.formValidateThree.resetFrequency,
        min_num: this.formValidateThree.minimumNumber,
        max_num: this.formValidateThree.maximumNumber,
        stop_price: this.formValidateThree.stopLossPrice,
        warning_price: this.formValidateThree.warningPrice
      };
      api.modifyRobotConfiguration(params).then(res => {
        if (res.data.code == 200) {
          this.$Message.success("更改机器配置成功");
          this.parameterConfiguration = false;
          this.getListCurrencies();
        }
      });
      // console.log(params);
    },
    //机器人运行停止
    runRobot(data) {
      // console.log(data)
      let params = {
        robot_id: data.robotId,
        flag: data.run_status
      };
      // console.log(params)
      api.runRobot(params).then(res => {
        if (res.data.code == 200) {
          // console.log('机器人运行')
          this.getListCurrencies();
        }
      });
    },
    //一键运行  一键停止
    operationRobot(type) {
      let params = {
        robot_id: [],
        flag: type
      };

      api.runRobot(params).then(res => {
        if (res.data.code == 200) {
          // console.log('机器人运行')
          this.getListCurrencies();
        }
      });
    },
    //保护机器人
    protectiveRobot(data) {
      console.log(data);
      let params = {
        robot_id: data.robotId,
        flag: data.status,
        protect: data.protection
      };
      api.protectiveRobot(params).then(res => {
        if (res.data.code == 200) {
          this.getListCurrencies();
        }
      });
    },
    getUserList() {
      this.tradingAccountList = [];
      api.getUserList().then(res => {
        //  console.log('1223')
        // console.log(res.data.data);
        if (res.data.code == 200) {
          for (let i = 0; i < res.data.data.length; i++) {
            let obj = {
              id: res.data.data[i].id,
              title: res.data.data[i].title
            };
            // console.log(obj);
            this.tradingAccountList.push(obj);
          }

          //  console.log(  JSON.parse(res.data.data))
          // console.log(typeof(res.data.data))

          //  this.tradingAccountList= JSON.parse(res.data.data)
        }
      });
    },
    screeningRobot() {
      let params = {
        t_currency: this.coinName,
        t_market: this.marketName,
        t_status: this.status,
        pageIndex: this.pageNum,
        pageSize: this.pageSize
      };
      this.tableData = [];
      api.screeningRobot(params).then(res => {
        if (res.data.code == 200) {
          console.log("搜索成功");
          // console.log(res.data.data);
          // console.log(res.data.data);
          if (res.data.code == 200) {
            console.log(res);
            for (let i = 0; i < res.data.data.result.length; i++) {
              // console.log(res.data.data.result[i].trading_account.id);
              let obj = {
                robotId: res.data.data.result[i].id, //机器人ID
                tradingAccount: res.data.data.result[i].account_title, //交易账户
                tradingMarket: res.data.data.result[i].market, //交易市场
                tradingCurrencies: res.data.data.result[i].currency, //交易币种
                tradingStrategiesone: res.data.data.result[i].trading_strategy, //交易策略
                tradingStrategiestwo: res.data.data.result[i].total_money, //总投入
                floatingProfit: res.data.data.result[i].float_profit, //浮动盈亏
                profits: res.data.data.result[i].realized_profit, //实现利润
                grossProfit: res.data.data.result[i].total_profit, //总利润
                annualizedRate: res.data.data.result[i].annual_yield, //年化收益率
                createTime: res.data.data.result[i].create_time, //创建时间
                status: res.data.data.result[i].status, //机器人运行
                protection: res.data.data.result[i].protection, //机器人保护
                run_status: res.data.data.result[i].run_status
              };
              this.tableData.push(obj);
            }
            // this.pageSize = res.data.data.numPerPage;
            this.total = res.data.data.totalCount;

            // this.tradingAccountList = res.data.data.account;
          }
        }
      });
    },


    //详情页面
    robotDetails(data) {
      // console.log(data);
      let params = {
        pageIndex: this.pageNumOne,
        // pageIndex: 2,
        // pageSize: 10,
        pageSize: this.pageSizeOne,


        robot_id: data.robotId
      };
      this.pagingID.robotId = data.robotId
      api.robotDetails(params).then(res => {
        if (res.data.code == 200) {



          // console.log(res);
          this.closedNum = res.data.data.closed_num;
          this.openNum = res.data.data.open_num;
          this.totalInput = res.data.data.total_input;
          this.runningTime = res.data.data.running_time;
          this.currencyBalance = res.data.data.currency_balance;
          this.currencyFreeze = res.data.data.currency_freeze;
          this.marketBalance = res.data.data.market_balance;
          this.marketFreeze = res.data.data.market_freeze;
          this.Last = res.data.data.last;
          this.currencyOne = res.data.data.currency_market.currency;
          this.marketOne = res.data.data.currency_market.market;

          let arrOpenSell = [];
          for (let i in res.data.data.open_sell) {

            
            arrOpenSell.push(res.data.data.open_sell[i]); //属性
          }
          // console.log(arrOpenSell);
          // this.concludedDataOne = arrOpenSell;
          // console.log(this.concludedListOne)
          this.concludedDataOne=[];
          for(let k=0; k < arrOpenSell.length ;k++) {
            let obj = {
                price :Number(arrOpenSell[k].price).toFixed(2),
                amount : Number(arrOpenSell[k].amount).toFixed(2),
            } 
            this.concludedDataOne.push(obj)
          }




          let arrOpenBuy = [];
          for (let i in res.data.data.open_buy) {
            arrOpenBuy.push(res.data.data.open_buy[i]); //属性
          }
          // console.log(arrOpenBuy);
          // this.concludedData = arrOpenBuy;
          for(let k=0; k < arrOpenBuy.length ;k++) {
            let obj = {
                price :Number(arrOpenBuy[k].price).toFixed(2),
                amount : Number(arrOpenBuy[k].amount).toFixed(2),
            } 
            this.concludedData.push(obj)
          }




           this.total_profit = res.data.data.total_profit.toFixed(2);
                this.completedData=[]
          for(let i= 0 ;i<res.data.data.closed_order.length; i++){
                console.log(res.data.data.closed_order[i].closing_time)

              let obj ={
                    order_type:res.data.data.closed_order[i].order_type,
                    closing_price:
                    res.data.data.closed_order[i].closing_price ?
                    Number(res.data.data.closed_order[i].closing_price).toFixed(2):'',
                    total_price:res.data.data.closed_order[i].total_price?
                    Number(res.data.data.closed_order[i].total_price).toFixed(2):'',

                    closing_time:
                    res.data.data.closed_order[i].closing_time?
                    res.data.data.closed_order[i].closing_time:'',
                    order_type1:res.data.data.closed_order[i].order_type1,
                    closing_price1:res.data.data.closed_order[i].closing_price1?
                    Number(res.data.data.closed_order[i].closing_price1).toFixed(2):'',
                    total_price1:res.data.data.closed_order[i].total_price1?
                    Number(res.data.data.closed_order[i].total_price1).toFixed(2):'',

                    closing_time1:res.data.data.closed_order[i].closing_time1?
                    res.data.data.closed_order[i].closing_time1:'',
                    profit:res.data.data.closed_order[i].profit ?
                    Number(res.data.data.closed_order[i].profit).toFixed(2):'',
                    marketOne: res.data.data.currency_market.market,
                    // currencyOne: res.data.data.currency_market.currency,
                    // currencyOne:this.currencyOne,
                    // marketOne:this.marketOne
              }
              this.completedData.push(obj)
          }

          this.totalCount= res.data.data.totalCount;

         

          // for (let i = 0; i < res.data.data.closed_order_buy.length; i++) {
          //   // console.log(res.data.data.closed_order_buy);

          //     if(res.data.data.closed_order_buy[i].mark == res.data.data.closed_order_sell){
          //                 console.log('123')
          //     }

          // }

          //   type

          // price

          // amount

          // {
          //   title: "创建时间",
          //   key: "creationTime"
          // },
          // {
          //   title: "类型",
          //   key: "typeOne"
          // },
          // {
          //   title: "价格(USDT)",
          //   key: "priceOne"
          // },
          // {
          //   title: "总额(USDT)",
          //   key: "amountOne"
          // },
          // {
          //   title: "创建时间",
          //   key: "creationTimeOne"

          this.transactionDetails = true;
        }
      });
    },
    renderData(){
      // api.renderData().then(res =>{
      //   if(res.data.code == 200){
          
          
      //   }
      // })
      setTimeout(api.renderData().then(res =>{
        if(res.data.code == 200){
          console.log('第一遍链接成功')
          // this.renderData()
        }
      }), 5000);
    }
  },
  computed: {
           singleGrid:function(){
             return(
                (this.formValidateTwo.resistance - this.formValidateTwo.support) /
            this.formValidateTwo.gridNumber

             );
           }, 
           



    minimumProfit: function() {
      return (
        (
          (((this.singleGrid -
            (this.formValidateTwo.resistance * 2 + this.singleGrid) *
              this.formValidateTwo.singleTransaction) /
            this.formValidateTwo.resistance) *
            10000) /
          100.0
        ).toFixed(2) + "%"
      );
    },
    biggestProfits: function() {
      
      return (
        (
          (((this.singleGrid -
            (this.formValidateTwo.support * 2 + this.singleGrid) *
              this.formValidateTwo.singleTransaction) /
            this.formValidateTwo.support) *
            10000) /
          100.0
        ).toFixed(2) + "%"
      );
    },
    totalMoney: function() {
      console.log(this.defaultCurrentPrice);
      return (
        (Number(this.tradingCurrency.replace(/[a-zA-Z]+/gi, "")) *
          this.defaultCurrentPrice +
        Number(this.availableTradingMarket.replace(/[a-zA-Z]+/gi, ""))).toFixed(2) +
        this.formValidatezero.platform
      );
      // var reg = /[a-zA-Z]+/;

      // Number(this.defaultCurrentPrice.replace(/[a-zA-Z]+/gi, ""))
    }
  },
  created() {
    _this = this
    this.getListCurrencies();
    // this.getListData();
    this.getmarketList();
    this.getwarningAccount();
    this.getUserList();
    //渲染数据   
    this.renderData();

  },
  mounted() {}
};
</script>
