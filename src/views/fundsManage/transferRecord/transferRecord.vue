<style lang="less" scoped>
    @import '../../../styles/common.less';
    @import 'transferRecord.less';
</style>

<template>
    <div class="content">
        <Row class="et-row">
            <Col>
                <span>开始日期：</span>
                <DatePicker v-model="startDateObj" format="yyyy-MM-dd HH:mm:ss" :options="optionsStart" :editable="false" @on-change="setStartDateVal" type="datetime" placeholder="请选择开始日期" style="width: 180px"></DatePicker>
                <span style="margin-left: 15px;">结束日期：</span>
                <DatePicker v-model="endDateObj" format="yyyy-MM-dd HH:mm:ss" :options="optionsEnd"  :editable="false" @on-change="setEndDateVal" type="datetime" placeholder="请选择结束日期" style="width: 180px"></DatePicker>
                <span style="margin-left: 30px;">用户名：</span>
                <div class="search-out">
                    <Input v-model.trim="searchVal" placeholder="搜索转账用户名" clearable></Input>
                </div>
                <span style="margin-left: 15px;">状态：</span>
                <div class="search-out">
                    <Select v-model="billStatus">
                        <Option v-for="item in billList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                    </Select>
                </div>
                <Button type="primary" icon="ios-search" style="margin-left: 5px;" @click="getListData">搜索</Button>
            </Col>
        </Row>
        <Table border :columns="tableColumns" :data="tableData"></Table>
        <div style="position: relative;">
            <Page class="pages" :current="pageNum" :total="total" show-elevator show-sizer :page-size="pageSize" :page-size-opts="sizeOpts" @on-change="changePageNum" @on-page-size-change="changePageSize"></Page>
        </div>
    </div>
</template>

<script>
    import api from '@/api/funds'
    import axios from '@/axios/config'

    export default {
        name: 'transferRecord',
        data () {
            return {
                req_url: axios.defaults.baseURL,
                tableColumns: [
                    {
                        title: '转出账户',
                        key: 'fromUserName'
                    },
                    {
                        title: '转入账户',
                        key: 'toUserName'
                    },
                    {
                        title: '币种',
                        key: 'fundsTypeName'
                    },
                    {
                        title: '转出冻结金额',
                        key: 'amountFreez'
                    },
                    {
                        title: '转出可用金额',
                        key: 'amount'
                    },
                    {
                        title: '转出总金额',
                        render: (h, params) => {
                            return h('span', params.row.amountFreez + params.row.amount);
                        }
                    },
                    {
                        title: '状态',
                        render: (h, params) => {
                            return h('span', params.row.status === 0 ? '处理异常' : (params.row.status === 1 ? '处理失败' : '处理成功'));
                        }
                    },
                    {
                        title: '转账时间',
                        key: 'sendTime',
                        render: (h, params) => {
                            return h('span', params.row.sendTime ? params.row.sendTime.split('.')[0] : '');
                        }
                    }
                ],
                startDateObj: '',
                endDateObj: '',
                startDate: '', // 开始时间
                endDate: '', // 结束时间
                tableData: [],
                searchVal: '',
                modalStatus: false,
                modalTitle: '添加',
                formItem: {
                    id: ''
                },
                ruleValidate: {
                    id: [
                        {required: true, message: '', trigger: 'blur'}
                    ]
                },
                billStatus: '',
                billList: [
                    {
                        value: 'all',
                        label: '全部'
                    },
                    {
                        value: 0,
                        label: '处理异常'
                    },
                    {
                        value: 1,
                        label: '处理失败'
                    },
                    {
                        value: 2,
                        label: '处理成功'
                    }
                ],
                optionsStart: {
                    disabledDate: (date) => {
                        let end = this.endDateObj.valueOf();
                        if (end) {
                            return date && date.valueOf() > end;
                        } else {
                            return false;
                        }
                    }
                },
                optionsEnd: {
                    disabledDate: (date) => {
                        let start = this.startDateObj.valueOf();
                        if (start) {
                            return date && date.valueOf() < start;
                        } else {
                            return false;
                        }
                    }
                },
                editType: 0, // 编辑类型 0添加 1编辑
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
                let emailReg = /@/;
                let phoneReg = /^[0-9]*$/;
                // 校验手机号和邮箱
                let account = this.searchVal;
                if (!emailReg.test(account) && !phoneReg.test(account)) {
                    this.$Message.warning('请输入正确格式的用户名！');
                    return;
                }
                let params = {
                    userName: this.searchVal,
                    startTime: this.startDate,
                    endTime: this.endDate,
                    status: this.billStatus === 'all' ? '' : this.billStatus,
                    pageNum: this.pageNum,
                    pageSize: this.pageSize
                }
                api.getFundsRecords(params).then((res) => {
                    if (res.data.code == 1) {
                        this.tableData = res.data.data.obj || [];
                        this.total = res.data.data.totalCount;
                    }
                });
            },
            setStartDateVal (formatDate) {
                this.startDate = formatDate;
            },
            setEndDateVal (formatDate) {
                this.endDate = formatDate;
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
