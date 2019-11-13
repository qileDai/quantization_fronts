<style lang="less" scoped>
    @import '../../../styles/common.less';
    @import 'verificationcode.less';
</style>

<template>
    <div class="content">
        <Row class="et-row">
            <Col>
                <span>请选择日期：</span>
                <DatePicker v-model="verificationDate" format="yyyy-MM-dd" :editable="false" @on-change="setDateVal" type="date" placeholder="请选择日期" style="width: 180px"></DatePicker>
                <span style="margin-left: 30px;">请输入手机号或邮箱：</span>
                <div class="search-out">
                    <Input v-model="searchVal" placeholder="请输入手机号或邮箱" clearable></Input>
                </div>
                <Button type="primary" icon="ios-search" :loading="loading" @click="searchCode">搜索</Button>
            </Col>
        </Row>
        <Table border :columns="tableColumns" :data="tableData"></Table>
        <div style="position: relative;">
            <Page class="pages" :current="pageNum" :total="total" show-elevator show-sizer :page-size="pageSize" :page-size-opts="sizeOpts" @on-change="changePageNum" @on-page-size-change="changePageSize"></Page>
        </div>
    </div>
</template>

<script>
    import api from '@/api/systems'
    import axios from '@/axios/config'

    export default {
        name: 'verificationcode',
        data () {
            return {
                req_url: axios.defaults.baseURL,
                tableColumns: [
                    {
                        title: '联系方式',
                        key: 'contact'
                    },
                    {
                        title: '账户名',
                        key: 'userName'
                    },
                    {
                        title: 'IP地址',
                        key: 'ip'
                    },
                    {
                        title: '消息内容',
                        key: 'cont'
                    },
                    {
                        title: '发送次数',
                        key: 'sendNum'
                    },
                    {
                        title: '状态',
                        key: 'status',
                        render: (h, params) => {
                            return h('span', params.row.status == '0' ? '成功' : '失败');
                        }
                    },
                    {
                        title: '发送时间',
                        key: 'sendTime',
                        render: (h, params) => {
                            return h('span', params.row.sendTime ? params.row.sendTime.split('.')[0] : '');
                        }
                    }
                ],
                verificationDate: '',
                tableData: [],
                dateVal: '',
                searchVal: '',
                loading: false,
                pageNum: 1,
                pageSize: 20,
                total: 0, // 总页数
                sizeOpts: [10, 20, 50, 100]
            };
        },
        watch: {
        },
        computed: {
        },
        methods: {
            getListData () {
                let params = {
                    contact: this.searchVal,
                    sendTime: this.dateVal,
                    pageIndex: this.pageNum,
                    pageSize: this.pageSize
                }
                this.loading = true;
                api.getVerificationList(params).then((res) => {
                    this.loading = false;
                    if (res.data.code == 1) {
                        this.tableData = res.data.data.sendCodeList;
                        this.total = res.data.data.count;
                    }
                });
            },
            // 后端搜索手机号或者邮箱查询验证码
            searchCode () {
                let emailReg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
                let phoneReg = /^[0-9]*$/;
                // 校验手机号和邮箱
                let account = this.searchVal;
                if (!emailReg.test(account) && !phoneReg.test(account)) {
                    this.$Message.warning('请输入正确的手机号和邮箱！');
                    return;
                }

                this.pageNum = 1;
                this.pageSize = 20;
                this.getListData();
            },
            setDateVal (formatDate) {
                this.dateVal = formatDate;
            },
            changePageNum (pageNum) {
                this.pageNum = pageNum;
                this.getListData();
            },
            changePageSize (pageSize) {
                this.pageNum = 1;
                this.pageSize = pageSize;
                this.getListData();
            }
        },
        created () {
            this.getListData();
        },
        mounted () {
        }
    };
</script>
