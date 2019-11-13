<style lang="less" scoped>
    @import '../../../styles/common.less';
    @import 'activityStatistics.less';
</style>

<template>
    <div class="content">
        <Tabs :animated="false" v-model="currTab">
            <TabPane name="1" label="注册">
                <register-statistics v-if="currTab === '1'" :activity-type="1"></register-statistics>
            </TabPane>
            <TabPane name="2" label="充值">
                <payin-statistics v-if="currTab === '2'" :activity-type="2"></payin-statistics>
            </TabPane>
            <TabPane name="3" label="红包">
                <reward-statistics v-if="currTab === '3'" :activity-type="3"></reward-statistics>
            </TabPane>
            <TabPane name="4" label="交易">
                <exchange-statistics v-if="currTab === '4'" :activity-type="4"></exchange-statistics>
            </TabPane>
        </Tabs>
    </div>
</template>

<script>
    import api from '@/api/activity'
    import axios from '@/axios/config'
    import moment from 'moment'
    import registerStatistics from './subpages/registerStatistics'
    import payinStatistics from './subpages/payinStatistics'
    import exchangeStatistics from './subpages/exchangeStatistics'
    import rewardStatistics from './subpages/rewardStatistics'

    export default {
        name: 'activityStatistics',
        components: {
            registerStatistics,
            payinStatistics,
            exchangeStatistics,
            rewardStatistics
        },
        data () {
            return {
                req_url: axios.defaults.baseURL,
                currTab: '1' // 默认活动类型
            };
        },
        watch: {
        },
        computed: {
        },
        methods: {
        },
        created () {
        },
        mounted () {
        }
    };
</script>
