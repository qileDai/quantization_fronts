<style lang="less">
    @import '../../../styles/common.less';
    @import 'operateLog.less';
</style>

<template>
    <div class="content">
        <Row class="et-row">
            <Col>
                <div class="search-out">
                    <Input v-model="searchVal" size="small" placeholder="搜索用户名" clearable></Input>
                </div>
                <Button type="primary" size="small" icon="ios-search">搜索</Button>
            </Col>
        </Row>
        <Table border :columns="tableColumns" :data="tableData"></Table>
        <div style="position: relative;"><Page class="pages" :current="pageNum" :total="total" show-elevator show-sizer :page-size="pageSize" :page-size-opts="sizeOpts"></Page></div>
    </div>
</template>

<script>
    import api from '@/api/systems'
    import axios from '@/axios/config'
    import moment from 'moment'

    export default {
        name: 'operateLog',
        data () {
            return {
                req_url: axios.defaults.baseURL,
                tableColumns: [
                    {
                        title: '用户名',
                        key: 'userName'
                    },
                    {
                        title: '角色',
                        key: 'roles'
                    },
                    {
                        title: '操作页面',
                        key: 'pages'
                    },
                    {
                        title: '操作类型',
                        key: 'types'
                    },
                    {
                        title: '操作时间',
                        key: 'createTime',
                        render: (h, params) => {
                            return h('span', params.row.createTime ? params.row.createTime.split('.')[0] : '');
                        }
                    }
                ],
                tableData: [],
                pageNum: 1,
                pageSize: 20,
                total: 0, // 总页数
                searchVal: '',
                sizeOpts: [10, 20, 50, 100]
            };
        },
        watch: {
        },
        computed: {
        },
        methods: {
            getDataList () {
                let params = {
                    pageNum: this.pageNum,
                    pageSize: this.pageSize
                }
                api.getLogs(params).then((res) => {
                    if (res.data.code == 1) {
                        this.tableData = res.data.data;
                        this.total = res.data.total;
                    }
                });
            }
        },
        created () {
            // this.getDataList();
        },
        mounted () {
        }
    };
</script>
