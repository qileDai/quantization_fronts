<style lang="less" scoped>
    @import '../../../styles/common.less';
    @import 'activityList.less';
</style>

<template>
    <div class="content">
        <Tabs :animated="false" v-model="currTab">
            <TabPane name="1" label="注册">
                <register-list v-if="currTab === '1'" :activity-type="1"></register-list>
            </TabPane>
            <TabPane name="2" label="充值">
                <payin-list v-if="currTab === '2'" :activity-type="2"></payin-list>
            </TabPane>
            <TabPane name="3" label="红包">
                <reward-list v-if="currTab === '3'" :activity-type="3"></reward-list>
            </TabPane>
            <TabPane name="4" label="交易">
                <exchange-list v-if="currTab === '4'" :activity-type="4"></exchange-list>
            </TabPane>
            <TabPane name="5" label="周周赛">
                <week-list v-if="currTab === '5'" :activity-type="5"></week-list>
            </TabPane>
        </Tabs>
    </div>
</template>

<script>
    import api from '@/api/activity'
    import axios from '@/axios/config'
    import registerList from './subpages/registerList'
    import payinList from './subpages/payinList'
    import exchangeList from './subpages/exchangeList'
    import rewardList from './subpages/rewardList'
    import weekList from './subpages/weekList'

    export default {
        name: 'activityList',
        components: {
            registerList,
            payinList,
            exchangeList,
            rewardList,
            weekList
        },
        data () {
            return {
                componentList: ['registerList', 'payinList', 'exchangeList', 'rewardList', 'weekList'],
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
