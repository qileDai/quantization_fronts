<template>
  <div class="bazaar-config">
    <h2>交易对配置</h2>
    <div class="config-box">
      <div class="market-left">
        <h3>请选择交易对</h3>
        <!-- 交易市场分类 -->
        <div class="market-classify">
          <ul>
            <li 
              :class="{active: marketActive === item}" 
              v-for="(item, index) in allmarket" 
              :key="index"
              @click="selectMarket(item)">{{item}}</li>
          </ul>
        </div>
        <div class="search-box">
          <input type="text" placeholder="搜索" v-model="inputText" @input="inputSearch">
          <Checkbox v-model="checkall" class="checkall" @click.native="checkallHandle">全选</Checkbox>
        </div>
        <!-- 交易对 -->
        <div class="market-list">
          <ul>
            <div v-if="currentMarket.length">
              <li 
                v-for="(item, index) in currentMarket" 
                :key="index"
                @click="select(item)"
                :class="{checked: item.checked}"
                >
                {{item.marketName}}
                <!-- <div class="cover" v-show="item.checked"><Icon type="checkmark" ></Icon></div> -->
                <div class="cover" v-show="item.checked"><Icon type="checkmark-circled"></Icon></div>
              </li>
            </div>
            <div v-else style="text-align:center; margin-top:20px;">未搜索到该币种</div>
          </ul>
        </div>
      </div>
      <div class="market-right">
        <h3>已选<span>（以下交易对将显示在你的交易所中）</span></h3>
        <div class="selected-box">
          <div class="selected-list" v-for="(value, key) in selected" :key="key">
            <div class="title"  v-if="value.length">
              <!-- <Tag closable color="blue" v-if="value.length" class="title-tag">{{key}}市场</Tag> -->
              <p>{{key}}市场</p>
              <Icon type="close-round" class="del-all" size="14" @click.native="delAll(key)"></Icon>
            </div>

              <div class="selected-item">
                <ul>
                  <!-- <li v-for="(market, index) in value" :key="index">
                    {{market.marketName}}
                    <Icon type="close-circled" size="18" color="#f00" @click.native="delSelected(market)"></Icon>
                  </li> -->
                  <Tag 
                    type="dot" 
                    class="tag" 
                    closable 
                    color="#2ac5b3" 
                    v-for="(market, index) in value" 
                    :key="index"
                    @on-close="delSelected(market)"
                    >{{market.marketName}}</Tag>
                </ul>
              </div>
          </div>

        </div>
      </div>
    </div>
    <div class="footer">
      <Button type="primary" style="width:100px" @click="saveConfig" v-if="g_perm('save') && !forbid">保存</Button>
    </div>
  </div>
</template>

<script>
import api from '@/api/transactionAlliance/bazaarConfig.js'
export default {
  data() {
    return {
      marketActive: "BTC",
      fullMarket: [], // 全部交易对
      selectedMarket: {}, // 选择的数据
      forbid: false, // 禁止用户操作，主要处理没有交易所的用户
      checkall: false,
      inputText: '',
      currentM: [] // 当前市场
    }
  },

  computed: {
    // 所有市场
    allmarket() {
      return Object.keys(this.fullMarket).map(item => {
        return item
      })
    },
    // 每个市场下的交易对
    currentMarket() {
      return this.currentM
    },

    // 已选择的交易对
    selected() {
      let selectedData = {}
      Object.keys(this.fullMarket).forEach(key => {
        this.checkall = this.fullMarket[this.marketActive].every(item => {
          return item.checked
        })
        selectedData[key] = this.fullMarket[key].filter(item => {
          return item.checked
        })
      })
      return selectedData
    },

    marketIdArr() {
      let arr = []
      Object.keys(this.selected).forEach(key => {
        this.selected[key].forEach(item => {
          arr.push(item.marketId)
        })
      })
      return arr
    }
  },
  methods: {
    currentHandle(text) {
      for(let key in this.fullMarket) {
        if (key === this.marketActive) {
          this.currentM = this.fullMarket[this.marketActive]
        }
      }
      if(text) {
        this.currentM = this.currentM.filter(item => {
          return item.marketName.includes(text.toUpperCase())
        })
      }
    },
    // 选择交易市场
    selectMarket(item) {
      this.marketActive = item
      this.inputText = ''
      this.currentHandle()
    },
    // 选择交易对
    select(item) {
      this.$set(item, "checked", true)
    },
    // 搜索
    inputSearch(ev) {
      this.currentHandle(this.inputText)
      // this.currentMarket = this.inputText
      
    },
    // 删除已选交易对
    delSelected(market) {
      this.$set(market, "checked", false)
    },
    // 左侧全选
    checkallHandle() {
      this.fullMarket[this.marketActive].forEach(item => {
        this.$set(item, "checked", !this.checkall)
      })
    },
    // 右侧全删
    delAll(key) {
      this.fullMarket[key].forEach(item => {
        item.checked = false
      })
    },
    // 保存配置
    async saveConfig() {
      if(this.marketIdArr.length) {
        const { data } = await api.saveConfig(this.marketIdArr.join())
        this.$Message.success(data.msg)
      } else {
        this.$Message.info('您还没选择任何交易对')
      }
    },
    // 获取所有市场
    async getMarket() {
      const { data } = await api.getMarket()
      this.fullMarket = data.data || []
    },
    // 获取已选交易所
    async getSelected() {
      // 先获取所有交易对
      await this.getMarket()
      const { data }  = await api.getSelected()
      if(data.code !== 1) {
        this.forbid = true
      }
      let result = data.data || {}
      // 拿到之前已选过的交易对，每一个交易对添加checked字段并设置为true
      // Object.keys(this.fullMarket).forEach(key => {
      //   result[key]
      //   this.fullMarket[key].forEach
      // })
      Object.keys(result).forEach(key => {
        result[key].forEach((ele, index) => {
          this.fullMarket[key].forEach(item => {
            if(ele.marketId === item.marketId) {
              // item.checked = true
              this.$set(item, 'checked', true)
            }
          })
        })
      })
      this.currentHandle()
    }
  },
  created() {
    this.getSelected()
  }

}
</script>

<style lang="less" scoped>

.bazaar-config {
  padding: 20px;
  background: #fff;
  h2 {
    line-height: 36px;
    border-bottom: 1px solid #aaa;
  }
  .config-box {
    margin-top: 20px;
    display: flex;
    h3 {
      // background: #f5f5f5;
      background: #2ac5b3;
      color: #fff;
      // border: 1px solid #f5f5f5;
      line-height: 36px;
      // color: #333;
      text-align: center;
      // border-bottom: 1px solid #f5f5f5;
    }
    .market-left {
      border: 1px solid #f1f1f1;
      height: 800px;
      .market-classify{
        ul {
          display: flex;
          justify-content: space-around;
          flex-wrap: nowrap;
          border-bottom: 1px solid #f1f1f1;
          border-top: 1px solid #2ac5b3;
          li {
            display: block;
            width: 100%;
            text-align: center;
            line-height: 30px;
            width: 46px;
            cursor: pointer;
            font-weight: 600;
            &:not(:first-of-type) {
              border-left: 1px solid #f1f1f1;
            }
            &.active {
              background: #2ac5b3;
              color: #fff;
            }
          }
        }
      }
      .search-box {
        display: flex;
        align-items: center;
        margin-top: 10px;
        input {
          width: 100%;
          border-color: #f1f1f1;
          border-style: solid;
          border-width: 1px;
          padding: 4px 6px;
          line-height: 20px;
          font-size: 12px;
          outline: none;
          flex-grow: 1;
          margin-left: 5px;
        }
        .checkall {
          width: 90px;
          line-height: 28px;
          height: 28px;
          text-align: center;
          font-size: 16px;
          // background: #2ac5b3;
          
        }
      }
      .market-list {
        margin-top: 10px;
        // background: #f9fafc;
        height: 680px;
        overflow-y: auto;
        ul {
        overflow-y: auto;
          li {
            // border-top: 1px solid #ddd;
            line-height: 38px;
            text-align: center;
            cursor: pointer;
            width: 100%;
            position: relative;
            font-weight: 500;
            &:hover {
              background: rgba(97, 159, 231, .2);
            }
            // &:last-of-type {
              // border-bottom: 1px solid #ddd;
            // }
            &.checked {
              color: #2ac5b3;
            }
            &.checked:hover {
              background: none;
            }
            .cover {
              height: 38px;
              width: 100%;
              background: rgba(255, 255, 255, 0.6);
              position: absolute;
              top: 0;
              left: 0;
              cursor: not-allowed;
              text-align: right;
              i {
                color: #2ac5b3;
                font-size: 20px;
                line-height: 38px;
                margin-right: 10px;
              }
            }
          }
        }
      }
    }
    .market-right {
      margin-left: 20px;
      height: 800px;
      // width: 800px;
      border: 1px solid #f1f1f1;
      flex-grow: 1;
        h3 {
          text-align: center;
          span{
            font-weight: normal;
            font-size: 12px;
          }
        }
      .selected-box {
        height: 760px;
        overflow-y: auto;
        padding: 0 10px 30px;
        .selected-list {
          .title {
            position: relative;
            // width: 100px;
            // .title-tag {
            //   height: 36px;
            //   line-height: 36px;
            //   width: 100px;
            //   font-size: 12px;
            //   text-align: center;
            //   font-weight: 700;
            // }
            & > p {
              // background: #2d8cf0;
              line-height: 28px;
              // color: #fff;
              padding: 0 10px;
              font-weight: 700;
              border-radius: 3px;
              margin-top: 16px;
              text-align: center;
              &::before{
                content: '';
                // padding: 0 5px;
                // margin-top: -5px;
                border-top: 1px solid #333;
                width: 50px;
                display: inline-block;
                transform: translateY(-4px);
                margin-right: 5px;
              }
              &::after{
                content: '';
                border-top: 1px solid #333;
                width: 50px;
                display: inline-block;
                transform: translateY(-4px);
                margin-left: 5px;
              }
            }
            .del-all{
              position: absolute;
              top: 0;
              right: 10px;
              line-height: 28px;
              // color: #fff;
              color: #f00;
              padding: 0 4px;
              cursor: pointer;
            }
          }
          .selected-item {
            // padding-bottom: 16px;
            ul {
              display: flex;
              flex-wrap: wrap;
              .tag {
                margin: 16px 16px 0 0;
              }
              // li {
              //   border: 1px solid #f1f1f1;
              //   width: 80px;
              //   line-height: 38px;
              //   text-align: center;
              //   margin: 10px;
              //   position: relative;
              //   font-weight: 500;
              //   i {
              //     position: absolute;
              //     top: -9px;
              //     right: -9px;
              //     cursor: pointer;
              //   }
              // }
            }
          }
        }
      }
    }
  }
  .footer {
    text-align: center;
    margin-top: 30px;
  }
}
</style>

