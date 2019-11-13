import commonApi from '@/api/commonApi/commonApi.js'

module.exports = {
  // 这个是请求所有币种的数据方法，返回一个Promise，再.then后的回调函数中再写逻辑代码
  getCoins () {
    return new Promise((resolve, reject) => {
      commonApi.getAllCoins().then(res => {
        if (res.data.code === 1) {
          let coins = []
          res.data.data.forEach(item => {
            coins.push(item.keyEn)
          })
          resolve(coins)
        }
      })
    })
  }
}