<template>
  <!-- 提币模块 -->
  <div class="extract-module">
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
    <div>
      <!-- 提币记录 -->
      <ExtractRecord v-if="watchFlag === 0" />
      <!-- 提币地址 -->
      <ExtractAddress v-else-if="watchFlag === 1"/>
    </div>
  </div>
</template>

<script>
import ExtractRecord from './extractRecord/extractRecord'
import ExtractAddress from './extractAddress/extractAddress'
export default {
  data () {
    return {
      watchFlag: 0, // 查看那个模块，1 表示提币记录，2表示提币地址
      watchBtnText: ['提币记录', '提币地址'], // 模块按钮    
    }
  },
  components: { ExtractRecord, ExtractAddress }
  
}
</script>

<style lang="less" scoped>
  .extract-module {
    padding: 15px 10px;
  }
  .left-space {
    margin-left: 20px;
  }
</style>


