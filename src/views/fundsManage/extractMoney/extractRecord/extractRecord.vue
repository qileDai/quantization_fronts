<template>
    <!-- 提币记录 -->
    <div>
        <Row style="padding:20px 0">
          <Col>
            <span>提币时间：</span>
            从
            <DatePicker type="date" style="width: 150px" placeholder="请选择开始时间" :options="optionsStart"
                        :value="extractTimeStart" @on-change="val => extractTimeStart = val"></DatePicker>
            到
            <DatePicker type="date" style="width: 150px" placeholder="请选择结束时间" :options="optionsEnd"
                        :value="extractTimeEnd" @on-change="val => extractTimeEnd = val"></DatePicker>
            <span class="left-space">币种：</span>
            <Select style="width:100px" placeholder="全部" filterable clearable v-model="coinName" @on-change="optionsChange">
              <Option v-for="(coin, index) in allCoins" :key="index" :value="coin">{{coin}}</Option>
            </Select>
            <span class="left-space">处理状态：</span>
            <Select style="width:100px" placeholder="全部" v-model="status" @on-change="optionsChange">
                <Option v-for="status in statusData" :value="status.key" :key="status.key">{{status.text}}</Option>
            </Select>
            <span class="left-space">处理方式：</span>
            <Select style="width:100px" placeholder="全部" v-model="way" @on-change="optionsChange">
                <Option value="">全部</Option>
                <Option value="0">人工</Option>
                <Option value="1">自动</Option>
            </Select>
            <div style="display:inline-block" v-if="$isCustomize()">
              <span class="left-space">来源：</span>
              <Select style="width:150px" placeholder="全部" filterable clearable v-model="from" @on-change="optionsChange">
                  <Option value="">全部</Option>
                  <Option v-for="(item, index) in froms" :value="item.stationName" :key="index">{{ item.stationName }}</Option>
              </Select>
            </div>
            <Input style="width: 150px; margin-left: 20px" placeholder="使用用户名搜索" v-model="userName"></Input>
            <Button type="primary" style="margin-left:10px" @click="search">查询</Button>
            <Button type="error" @click="reset">重置</Button>
            <Button class="right-pos" type="primary" @click="exportExcel" v-if="g_perm('exportDownload')">导出EXCEL</Button>
          </Col>
        </Row>
        <Table border :columns="tHeaderData" :data="extractRecordData"></Table>
        <div style="position:relative">
            <Page 
                class="pages" 
                :page-size-opts="sizeOpts" 
                :page-size="pageSize" 
                show-sizer show-elevator show-total
                :total="totalCount" 
                @on-page-size-change="changePageSize" 
                @on-change="changePage"
                :current = pageNum
                ></Page>
        </div>
        <Modal v-model="showModal" title="交易号" style="width: 80%" ok-text="复制交易号" @on-ok="copyAddHash">
            <span style="font-weight: 600">交易号：</span><span style="color:blue">{{addHash}}</span>
        </Modal>
    </div>
</template>

<script>
import api from "@/api/funds.js";
import { getCoins } from "../../common.js"; // 封装的获取 所有币种 Promise 函数
import commonApi from "@/api/commonApi/commonApi.js";
import { parseString } from "xml2js";

export default {
  data() {
    return {
      optionsEnd: {
        disabledDate: function(date) {
          return (
            date &&
            date.valueOf() < new Date(this.extractTimeStart).valueOf() - 8639000
          );
        }.bind(this)
      },
      optionsStart: {
        disabledDate: function(date) {
          return (
            date && date.valueOf() > new Date(this.extractTimeEnd).valueOf()
          );
        }.bind(this)
      },
      sizeOpts: [10, 20, 50, 100],
      pageNum: 1,
      pageSize: 20,
      extractTimeStart: "", // 提币的开始时间
      extractTimeEnd: "", // 提币的结束时间
      coinName: "", // 币种
      status: "", // 处理状态
      way: "", // 处理方式
      userName: "", // 搜索用户名
      from: "", // 来源
      froms: null, // 所有来源
      // 处理状态数据
      statusData: [
        { text: "全部", key: "" },
        { text: "待确认", key: -1 },
        { text: "已确认", key: 0 },
        // { text: "已确认", key: 5 },
        { text: "成功", key: 2 },
        { text: "失败", key: 1 },
        { text: "已取消", key: 3 }
      ],
      // 表头数据和配置
      tHeaderData: [
        { title: "提币编号", key: "merchantOrderNo" },
        { title: "提币时间", key: "submitTime" },
        { title: "确认时间", key: "manageTime" },
        { title: "用户名", key: "userName" },
        { title: "提取数量", key: "amount" },
        // { title: "来源", key: "stationName" },
        { title: "实际到账数量", key: "realFee" },
        { title: "提币地址", key: "toAddress" },
        {
          title: "处理方式(是否审核)",
          key: "isAuto",
          render: (h, params) => {
            return h("span", params.row.isAuto ? "自动" : "人工");
          }
        },
        {
          title: "处理状态",
          key: "status",
          render: (h, params) => {
            return h("span", params.row.statusText);
          }
        },
        {
          title: "操作",
          key: "operation",
          render: (h, params) => {
            if (params.row.status === 0) {
              // 状态为待确认的时候，显示 确认/取消 按钮
              if (params.row.commandId>0) {
              } else {
               return h("div", [
                this.g_perm("confirm")
                  ? h(
                      "Button",
                      {
                        props: {
                          type: "primary",
                          size: "small"
                        },
                        on: {
                          click: () => {
                            this.confirm(params.row);
                          }
                        }
                      },
                      "确认"
                    )
                  : "",
                this.g_perm("cancel")
                  ? h(
                      "Button",
                      {
                        props: {
                          type: "error",
                          size: "small"
                        },
                        style: {
                          marginLeft: "5px"
                        },
                        on: {
                          click: () => {
                            this.cancel(params.row);
                          }
                        }
                      },
                      "取消"
                    )
                  : ""
                ]);
              }
            } else if (params.row.status === 2) {
              // 状态为成功的时候，显示的 查看交易 按钮
              return h("div", [
                this.g_perm("view")
                  ? h(
                      "Button",
                      {
                        props: {
                          type: "primary",
                          size: "small"
                        },
                        on: {
                          click: () => {
                            this.showModal = true;
                            this.addHash = params.row.addHash;//params.row.toAddress;
                          }
                        }
                      },
                      "查看交易"
                    )
                  : ""
              ]);
            }
          }
        }
      ],
      allCoins: [], // 所有币种
      totalCount: 0, // 当前币种所有数据
      extractRecordData: [], // 表格数据
      showModal: false, // 弹框
      addHash: "" // 交易号
    };
  },
  methods: {
    // 获取来源
    async getForm() {
      const { data } = await commonApi.getForm();
      this.froms = data.data || [];
    },
    // 查询
    search() {
      this.pageNum = 1; // 重置页码
      this.totalCount = 1; // 重置数据总数量
      this.getListData();
    },
    // 重置
    reset() {
      this.ageNum = 1
      this.pageSize = 20
      this.extractTimeStart = ""
      this.extractTimeEnd = "";
      this.status = "";
      this.way = "";
      this.userName = "";
      this.from = "";
      this.coinName = this.allCoins[0];
      this.getListData();
    },
    // 转换状态的操作，（后端数据是数字，要显示为文字）
    transstatus(val) {
      let statusText = "";
      this.statusData.forEach(item => {
        if (item.key === val) {
          statusText = item.text;
        }
      });
      return statusText;
    },
    // 导出表格
    exportExcel() {
      let { timeStart, timeEnd, coinName, status, userName, from } = this;
      let args = {
        timeStart,
        timeEnd,
        coinName,
        status,
        userName,
        stationName: from
      };
      api.extractExportExcel(args).then(res => {
        // 处理文件流
        let blob = new Blob([res.data], {
          type:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        });
        let objectUrl = URL.createObjectURL(blob);

        const filename = "提币记录.xlsx";
        let link = document.createElement("a");
        link.download = filename;
        link.href = objectUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // this.$Message.success("下载成功！");
      });
    },
    // 确认操作
    confirm(row) {
      // 获取cookie中的用户名
      let cookieArr = document.cookie.split(";");
      let loginUser = "";
      cookieArr.forEach(item => {
        item.split("=");
        if (item.split("=")[0].trim() === "user") {
          loginUser = item.split("=")[1];
        }
      });

      let coinName = this.coinName,
        idq = row.id,
        args = { coinName, userName: loginUser, idq };
      api.extractConfirm(args).then(res => {
        if (res.data.code === 1) {
          // 解析xml数据
          parseString(res.data.msg, { explicitArray: false }, (err, final) => {
            if (!err) {
              let state = final.ROOT.BODY.State; // xml数据里的state状态
              let des = final.ROOT.BODY.Des; // xml里的操作说明

              if (state === "true") {
                this.$Message.success(des);
                this.getListData();
              } else {
                this.$Message.error(des);
              }
            }
          });
        }
      });
    },
    // 取消操作
    cancel(row) {
      // 获取cookie中的用户名
      let cookieArr = document.cookie.split(";");
      let loginUser = "";
      cookieArr.forEach(item => {
        item.split("=");
        if (item.split("=")[0].trim() === "user") {
          loginUser = item.split("=")[1];
        }
      });

      let coinName = this.coinName,
        idq = row.id,
        args = { coinName, userName: loginUser, idq };
      api.extractCancel(args).then(res => {
        if (res.data.code === 1) {
          this.$Message.success(res.data.msg);
          this.getListData();
        }
      });
    },
    // 复制交易号
    copyAddHash() {
      this.$copyText(this.addHash).then(res => {
        // this.showModal = false
        this.$Message.success("交易号复制成功");
      });
    },
    // 切换每页显示条数
    changePageSize(size) {
      this.pageSize = size;
      if (this.pageNum === 1) {
        this.getListData();
      }
    },
    // 页数改变时
    changePage(page) {
      this.pageNum = page;
      this.getListData();
    },
    // 选项改变时
    optionsChange() {
      this.pageSize = 20;
      this.pageNum = 1;
      this.getListData();
    },
    // 获取表格数据
    getListData() {
      let {
        pageSize,
        pageNum,
        extractTimeStart,
        extractTimeEnd,
        coinName,
        status,
        way,
        userName,
        from
      } = this;
      let params = {
        pageSize,
        pageNum,
        submitTimeS: extractTimeStart, // 提币开始时间
        submitTimeE: extractTimeEnd, // 提币结束时间
        coinName, // 币种
        isAuto: way, // 处理方式
        status,
        stationName: from, //来源
        userName: userName.trim()
      };
      api.extractRecord(params).then(res => {
        if (res.data.code === 1) {
          this.extractRecordData = res.data.data.obj || [];
          this.totalCount = res.data.data.totalCount || 1;
        } else {
          this.extractRecordData = [];
          this.totalCount = 1;
        }
      });
    }
  },
  created() {
    this.getForm(); // 获取所有来源
    // 第一次进来加载的数据，必须传递币种，使用封装的 加载所有币种 Promise
    getCoins().then(res => {
      this.allCoins = res;
      this.coinName = this.allCoins[0];
      this.getListData();
      if(this.$isCustomize()) {
          this.tHeaderData.splice(5, 0, 
            { title: "来源", key: "stationName" }
          )
      }
    });
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

