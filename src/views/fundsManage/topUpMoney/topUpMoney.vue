<template>
  <!-- 充币模块 -->
  <div class="topUp-module">
    <Row>
      <Col>
        <Button 
          v-for="(watch, index) in watchBtnText" 
          :key="index" 
          :type="watchFlag === index ? 'primary': 'ghost'"
          @click="watchFlag = index"
          style="margin-right: 10px"
          >{{watch}}</Button>
      </Col>
    </Row>
    <div class="module-box">
      <!-- 充币记录 -->
      <TopUpRecord v-if="watchFlag === 0" />
      <!-- 充币地址模块 -->
      <TopUpAddress v-else-if="watchFlag === 1" />
    </div>
  </div>
</template>

<script>
import TopUpRecord from './topUpRecord/topUpRecord'
import TopUpAddress from './topUpAddress/topUpAddress'
export default {
  data () {
    return {
      watchFlag: 0, // 查看那个模块，1 表示提币记录，2表示提币地址
      watchBtnText: ['充币记录', '充币地址'], // 模块按钮    
    }
  },
  components: { TopUpRecord, TopUpAddress }
}
</script>

<style lang="less" scoped>
  .topUp-module {
    padding: 15px 10px;
  }
</style>
