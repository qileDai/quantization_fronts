<template>
  <div class="assets-manage">
    <div>
      <span class="label">用户转账</span>
      <RadioGroup v-model="TransferSettings.isOpen">
          <Radio label="1">
              <span>开启</span>
          </Radio>
          <Radio label="0">
              <span>关闭</span>
          </Radio>
      </RadioGroup>
    </div>
    <template v-if="TransferSettings.isOpen==1">
      <!-- <p>&nbsp;&nbsp;&nbsp;&nbsp;* 最多设置两位小数</p> -->
        <div>
          <span class="label"></span>
         * 最多设置两位小数
        </div>
        <div>
          <span class="label">单笔最小转账额度</span>
          <InputNumber v-model="TransferSettings.minAmount" :min="0"   placeholder="" />
        </div>
        <div>
          <span class="label">单笔最大转账额度</span>
          <InputNumber v-model="TransferSettings.maxAmount" :min="0"  placeholder="" />
        </div>
        <div>
          <span class="label">全天最大转账额度</span>
          <InputNumber v-model="TransferSettings.oneDayMaxAmount" :min="0"  placeholder="" />
        </div>
        <div>
          <span class="label">转账手续费</span>
          <Select v-model="TransferSettings.feeType" clearable style="width:200px">
              <Option v-for="item in types" :value="item.value" :key="item.value">{{ item.label }}</Option>
          </Select>
        </div>
        <div>
          <span class="label"></span>

          <InputNumber v-if="TransferSettings.feeType == 1"  :min="0" v-model="TransferSettings.fixFee"  placeholder="最多设置两位小数" />
          <InputNumber v-if="TransferSettings.feeType == 2"  :min="0" v-model="TransferSettings.feeRate" placeholder="最多设置两位小数" />
        </div>
    </template>
    <div class="assets-count">
      <Button type="primary" style="margin-left:10px" v-if="g_perm('save')" @click="save">保存</Button>
    </div>
  </div>
</template>

<script>
import api from '@/api/fundsManage/assetsmanage.js'
import commonApi from '@/api/commonApi/commonApi.js'
export default {
  data() {
    return {
      switched: 1,
      types:[
        {value:1,label:'按固定收取'},
        {value:2,label:'按比例收取'}
      ],
      fixFee:null,
      feeRate:null,
      TransferSettings:{
        minAmount: '',
        maxAmount: '',
        oneDayMaxAmount: '',
        feeRate: null,
        feeType: null,
        fixFee: null,
        isOpen: 0,
      }
    }
  },
  methods: {
    changeVal(val,type) {
     
      //  switch (type) {
      //    case 1:
      //     console.log('v',val)
      //      this.TransferSettings.fixFee = this.fixDecimal(val, 2)
      //      break;
      //    case 2:
      //     console.log('v2',this.fixDecimal(val, 2))
      //      this.TransferSettings.feeRate = this.fixDecimal(val, 2)
      //      this.feeRate = this.fixDecimal(val, 2)
      //      this.$forceUpdate()
      //      break;
       
      //    default:
      //      break;
      //  }
    },
    fixNumber(value, unit) {
          var value = parseFloat(value).toFixed(9);
          var unit = unit || 0;
          var isInt = value.indexOf(".") == -1 ? true : false;
          var intNum = value.split(".")[0];
          var floatNum = !isInt ? value.split(".")[1] : "0";
          var floatArry = floatNum.split("");
          var newFloatNum = ".";
          for (var i = 0; i < unit; i++) {
              if (!floatArry[i]) {
                  newFloatNum += "0";
              } else {
                  newFloatNum += floatArry[i];
              }
          }
          if (unit > 0) {
              return parseFloat(intNum + newFloatNum).toFixed(unit);
          } else {
              return parseInt(intNum);
          }
      },
      //非严格的小数位控制方法，末位如果是0则省略,最多返回unit位小数
      //value接受数字、字符串，返回数字或字符串类型
      fixDecimal(value, unit) {
          var $this = this;
          var result = $this.fixNumber(value, unit);
          if (unit > 0) {
              result = parseFloat(result);
          } else {
              result = parseInt(result);
          }
          if (result > 0 && result < 0.000001) {
              //解决科学计数法显示问题，转为字符串
              result = $this.fixNumber(value, unit);
          }
          return result;
      },
      /** 小数相乘 */
      numMultiply(arg1, arg2) {
          var m = 0, s1 = arg1.toString(), s2 = arg2.toString();
          try {
              m += s1.split(".")[1].length
          } catch (e) {
          }
          try {
              m += s2.split(".")[1].length
          } catch (e) {
          }

          var tradeAmount = Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m);
          return tradeAmount;
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
    save() {
      if(this.TransferSettings.isOpen){
        if(this.TransferSettings.minAmount==0){
          this.$Message.error('单笔最小转账额度设置有误')
          return;
        }
        if(this.TransferSettings.maxAmount < this.TransferSettings.minAmount ){
          this.$Message.error('单笔最大转账额度设置有误')
           return;
        }
        if(this.TransferSettings.oneDayMaxAmount==0){
          this.$Message.error('全天转账额度设置有误')
           return;
        }
        if(this.TransferSettings.feeType== ''){
          this.$Message.error('请选择转账手续费类型')
           return;
        }
        // if(this.TransferSettings.feeRate==0 && this.TransferSettings.feeType==2){
        //   this.$Message.error('手续费比例设置有误')
        //    return;
        // }
        // if(this.TransferSettings.fixFee==0 && this.TransferSettings.feeType==1){
        //   this.$Message.error('固定手续费设置有误')
        //    return;
        // }
        api.saveTransfer(this.TransferSettings).then(res => {
          if(res.data.code === 1) {
            this.$Message.success(res.data.msg)
          }
        })
      } else {
        api.saveTransfer(this.TransferSettings).then(res => {
            if(res.data.code === 1) {
              this.$Message.success(res.data.msg)
            }
          })
      }
    },
    // 获取转账管理
    async gettransfer() {
      try {
        const { data } = await api.searchTransfer()

        this.TransferSettings = {
            minAmount: data.data.minAmount?Number(data.data.minAmount):0,
            maxAmount: data.data.maxAmount?Number(data.data.maxAmount):0,
            oneDayMaxAmount: data.data.oneDayMaxAmount?Number(data.data.oneDayMaxAmount):0,
            feeRate: data.data.feeRate?Number(data.data.feeRate):0,
            feeType: data.data.feeType?Number(data.data.feeType):0,
            fixFee: data.data.fixFee?Number(data.data.fixFee):0,
            isOpen: data.data.isOpen?Number(data.data.isOpen):0,
          };
          // this.feeRate = data.data.feeRate?Number(data.data.feeRate):0
          // this.fixFee = data.data.fixFee?Number(data.data.fixFee):0
      } catch (error) {
      }
      
    }
  },
  watch:{ 
  },
    async created() {
      await this.gettransfer();
      // 获取所有资产币种
      // const { data } = await commonApi.getAllCoins()
      // this.allCoins = data.data
      // await this.getForm()
      // await this.getData()
      // if(this.$isCustomize()) {
      //   this.tHeader.splice(2, 0, { title: '来源', key: 'stationName'})
      // }
  }
}
</script>

<style lang="less" scoped>
    .assets-count{
      display: flex;
      justify-content: center;
      margin-top: 50px;
      button{
        width: 200px;
      }
    }
    .assets-manage{
      &>div{
        display: flex;
        width: 600px;
        height: 50px;
        align-items: center;
      }
      .label{
        width: 150px;
        display: inline-block;
      }
      .ivu-input-number{
        flex: 1;
      }
      .ivu-input{
        width: 300px;
      }
    }
</style>

