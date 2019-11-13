<template>
  <div class="sys-seting">
    <Form :model="modelForm" ref="modalForm" :label-width="100" :rules="ruleValidate">
      <FormItem label="交易所名称" prop="name">
        <Input v-model="modelForm.name" style="width:300px"></Input>
      </FormItem>
      <FormItem label="交易所图标">
        <div class="bg-img" v-if="modelForm.logo">
          <template>
            <img :src="modelForm.logo">
            <div class="bg-img-cover">
              <Icon type="ios-trash-outline" @click.native="delBgImg"></Icon>
          </div>
          </template>
        </div>
        <Upload
          v-else
          ref="upload"
          :on-success="handleSuccess"
          :format="['jpg','jpeg','png']"
          :max-size="2048"
          :on-format-error="handleFormatError"
          :on-exceeded-size="handleMaxSize"
          type="drag"
          :action="uploadUrl + 'fileUpload'"
          style="display: inline-block;width:100px;">
          <div style="width: 100px;height:100px;line-height: 100px;">
              <Icon type="camera" size="20"></Icon>
          </div>
      </Upload>
      </FormItem>
    </Form>
    <!-- 交易对 -->
    <h3 class="selected-bazaar-h3">已配置交易对</h3>
    <div class="selected-bazaar selected">
      <div v-if="Object.keys(selectedPazaar).length">
        <div class="selected-wrapper" v-for="(val, key) in selectedPazaar" :key="key">
          <div class="bazaar-box">
            <div class="bazaar">
              <p class="bazaar-title">{{ key }}市场</p>
              <ul>
                <li @click="addRecommend(item, index)" v-for="(item, index) in val" :key="index" :class="{cehckd: item.isRecommend === 1}">
                  {{ item.marketName }}
                  <div class="cover" v-show="item.isRecommend === 1">
                    <!-- <Icon type="checkmark"></Icon> -->
                    <Icon type="checkmark-circled"></Icon>
                    </div>
                  </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div v-else style="text-align:center; margin-top:30px">
        <p >暂无数据  <router-link to="/transactionAlliance/bazaarconfig">点击去配置？</router-link></p>
      </div>
    </div>
    <!-- 首页滚动推荐列表 -->
    <h3 class="recommend-h3">首页滚动推荐列表</h3>
    <div class="selected-bazaar recommend">
      <div class="have-data" v-if="recommend.length">
        <div class="selected-wrapper">
          <div class="bazaar-box">
            <div class="bazaar">
              <ul>
                <!-- <li class="recommend-li" v-for="(item, index) in recommend" :key="index">
                  {{ item.marketName }}
                  <Icon type="ios-close" size="18" color="#f00" @click.native="delRecommend(item, index)"></Icon>
                </li> -->
                <Tag 
                  type="dot" 
                  class="tag" 
                  closable 
                  color="#2ac5b3" 
                  v-for="(item, index) in recommend" 
                  :key="index"
                  @on-close="delRecommend(item, index)"
                  >{{ item.marketName }}</Tag>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div class="nodata selected-wrapper" v-else>
        <p style="text-align:center">首页滚动推荐列表为空！</p>
      </div>
    </div>
    <div class="footer" v-if="g_perm('saveRecommend')">
      <Button type="primary" style="width:100px" @click="saveConfig">保存</Button>
    </div>
  </div>
</template>

<script>
import axios from '@/axios/config'
import config from '@/api/transactionAlliance/bazaarConfig.js'
import api from '@/api/transactionAlliance/systemsetting.js'

export default {
  data() {
    return {
      uploadUrl: axios.defaults.baseURL,
      modelForm: {
        name: '',
        // domain: '',
        logo: ''
      },
      ruleValidate: {
        name: [{
          required: true, trigger: 'blur', validator: (rule, value, callback) => {
            // value = value.toString() // 一开始值是数值类型，转为string再判断
            if (value.replace(/\s/g, '') === '') {
              callback(new Error('交易所名称不能为空'))
            } else {
              callback()
            }
          }
        }],
        logo: [{
          required: true, trigger: 'change', validator: (rule, value, callback) => {
            // value = value.toString() // 一开始值是数值类型，转为string再判断
            if (value.replace(/\s/g, '') === '') {
              callback(new Error('交易所logo不能为空'))
            } else {
              callback()
            }
          }
        }]
      },
      selectedPazaar:[], // 已选市场
      recommend: [], // 首页滚动推荐
    }
  },
  computed: {
    marketIdArr() {
      return this.recommend.map(item => {
        return item.marketId
      })
    }
  },
  methods: {
    handleSuccess(res, file) {
      this.modelForm.logo = file.response.data
      this.$Message.success('上传成功')
    },
    // 上传格式错误
    handleFormatError(file) {
      this.$Notice.warning({
        title: '图片格式错误',
        desc: `文件${file.name}的格式不正确，请上传jpg/jpeg/png格式图片`
      });
    },
    // 超出大小
    handleMaxSize() {
      this.$Notice.warning({
        title: '图片的大小超出限制',
        desc: `文件${file.name}太大，最大不能超过2M`
      });
    },
    // 查看图片
    lookBgImg() {
      
    },
    // 删除图片
    delBgImg() {
      this.modelForm.logo = ''
    },
    // 添加到首页推荐滚动列表
    addRecommend(item) {
      if (item.isRecommend) { // 如果 isRecommend === 1，点击的时候就删除
        // 获取当前点击对象在 已选（recommend）中的索引
        let index = this.recommend.findIndex((val,index) => {
          return item.marketId === val.marketId
        })
        this.recommend.splice(index, 1)
      }else {
        this.recommend.push(item)
      }
      this.$set(item, 'isRecommend', item.isRecommend ? 0 : 1)
    },
    // 删除首页推荐列表
    delRecommend(item, index) {
      this.$set(item, 'isRecommend', 0)
      this.recommend.splice(index, 1)
    },
    // 保存配置
    async saveConfig() {
      // 判断图片是否为空
      if (!this.modelForm.logo) {
        this.$Message.error({content: '请上传交易所logo', duration: 2})
        return
      }
      this.$refs.modalForm.validate(valid => {
        if (valid) {
          axios.all([api.nameLogoSave(this.modelForm), api.saveConfig(this.marketIdArr.join())]).then(axios.spread((info, config) => {
            if(info.data.code === 1 && config.data.code === 1) {
              this.$Message.success(config.data.msg)
            }
          }))
        }
      })
    },
    // 获取所有市场
    async getMarket() {
      const { data } = await config.getSelected()
      this.selectedPazaar = data.data || {}
      if(Object.keys(this.selectedPazaar).length) {
        Object.keys(this.selectedPazaar).forEach(key => {
          this.selectedPazaar[key].forEach(item => {
            if(item.isRecommend === 1) {
              this.recommend.push(item)
            }
          })
        })
      }
    },
  },
  async created() {
    // 获取交易所名字和logo
    const { data } = await api.trasactionMsg()
    this.modelForm.name = data.data[0].name
    this.modelForm.logo = data.data[0].logo
    this.getMarket()
  }
}
</script>

<style lang="less" scoped>
.sys-seting{
  background: #fff;
  padding: 40px;
  .bg-img {
    display: inline-block;
    width: 100px;
    height: 100px;
    text-align: center;
    line-height: 115px;
    border: 1px solid transparent;
    border-radius: 4px;
    overflow: hidden;
    background: #fff;
    position: relative;
    box-shadow: 0 1px 1px rgba(0, 0, 0, .2);
    margin-right: 4px;
    img {
      width: 100%;
      height: 100%;
    }
    .bg-img-cover {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, .6);
      display: none;
      i {
        color: #fff;
        font-size: 30px;
        margin: 0 6px;
        cursor: pointer;
      }
    }
  }
  .bg-img:hover .bg-img-cover {
    display: block;
  }
  .upload-btn {
      height: 100px;
      border: 1px dashed #dddee1;
      vertical-align: top;
      box-sizing: border-box;
  }

  .upload-btn-icon {
      display: block;
      width: 100px;
      height: 100px;
      text-align: center;
  }

  .upload-btn-icon i {
      margin-top: 20px;
  }

  .upload-btn-icon span {
      display: block;
  }
  // 已配置交易对
  .selected-bazaar-h3 {
    font-size: 18px;
  }
  .selected {
    height: 500px;
    overflow-y: auto;
  }
  .selected-bazaar {
    border: 1px solid #f0f0f0;
    margin-top: 10px;
    padding-bottom: 40px;
    .selected-wrapper {
      padding: 0px 40px;
      margin-top: 10px;
      .bazaar-box {
        margin-top: 20px;
        .bazaar {
          .bazaar-title {
            border-bottom: 1px solid #f0f0f0;
            font-size: 16px;
            color: #333;
          }
          ul {
            margin-top: 10px;
            display: flex;
            flex-wrap: wrap;
            .tag {
              margin: 20px 10px 0 0;
            }
            li {
              cursor: pointer;
              border: 1px solid #ccc;
              border-radius: 4px;
              margin: 5px;
              line-height: 38px;
              width: 80px;
              text-align: center;
              position: relative;
              // overflow: hidden;
              &.cehckd {
                color: #2ac5b3;
              }
            }
          }
        }
      }
    }
  }
  .recommend-li {
    position: relative;
    i {
      position: absolute;
      top: -8px;
      right: -8px;
    }
  }
  // 推荐列表
  .recommend-h3 {
    margin-top: 40px;
    font-size: 18px;
  }
  .recommend {
    margin-top: 10px;
  }
  .footer {
    margin-top: 30px;
  }
  .cover {
    height: 38px;
    width: 100%;
    background: rgba(255, 255, 255, 0.6);
    position: absolute;
    top: 0;
    left: 0;
    // cursor: not-allowed;
    text-align: right;
    i {
      display: inline-block;
      width: 100%;
      color: #2ac5b3;
      font-size: 20px;
      line-height: 38px;
      text-align: center;
      // margin-right: 10px;
    }
  }
}
</style>

