<style lang="less" scoped>
    @import '../../../../styles/common.less';
    @import '../activityStatistics.less';
</style>

<template>
    <div class="content">
        <Row class="et-row">
            <Col>
            <span>活动名称：</span>
            <div class="search-out">
                <Select v-model="activitiesName" filterable placeholder="请选择活动名称" @on-change="findData">
                    <Option v-for="item in actsList" :value="item" :key="item">{{ item }}</Option>
                </Select>
            </div>
            <span style="margin-left: 15px;">请选择日期：</span>
            <span class="option-text">从</span>
            <DatePicker v-model="startDateObj" format="yyyy-MM-dd" :options="optionsStart" :editable="false" @on-change="setStartDateVal" type="date" placeholder="请选择开始日期" style="width: 180px"></DatePicker>
            <span class="option-text">到</span>
            <DatePicker v-model="endDateObj" format="yyyy-MM-dd" :options="optionsEnd" :editable="false" @on-change="setEndDateVal" type="date" placeholder="请选择结束日期" style="width: 180px"></DatePicker>
            <span style="margin-left: 15px;">用户名：</span>
            <div class="search-out">
                <Input v-model.trim="userName" placeholder="搜索用户名" clearable></Input>
            </div>
            <!--<span style="margin-left: 15px;">币种：</span>
            <div class="search-out" style="width: 100px;">
                <Select v-model="fundsType" filterable clearable placeholder="请选择币种">
                    <Option v-for="item in fundsList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                </Select>
            </div>-->

            <Button type="primary" icon="ios-search" style="margin-left: 5px;" @click="findData">查询</Button>
            <Button type="info" class="add_account" icon="plus-round" :loading="loading" @click="exportListHandle" v-if="g_perm('export')">导出名单</Button>
            </Col>
        </Row>
        <Table border :columns="tableColumns" :data="tableData"></Table>
        <div style="position: relative;">
            <Page class="pages" :current="pageNum" :total="total" show-elevator show-sizer :page-size="pageSize" :page-size-opts="sizeOpts" @on-change="changePageNum" @on-page-size-change="changePageSize"></Page>
        </div>
    </div>
</template>

<script>
    import api from '@/api/activity'
    import axios from '@/axios/config'

    export default {
        name: 'payinStatistics',
        props: {
            activityType: {
                required: true,
                type: Number
            }
        },
        data () {
            return {
                req_url: axios.defaults.baseURL,
                tableColumns: [
                    {
                        title: '发奖账号',
                        key: 'prizesName'
                    },
                    {
                        title: '用户账号',
                        key: 'userName'
                    },
                    {
                        title: '币种',
                        key: 'fundsType'
                    },
                    {
                        title: '活动累计充值',
                        key: 'accumulativeRecharge'
                    },
                    {
                        title: '活动充值金额',
                        key: 'rechargeAmount'
                    },
                    {
                        title: '活动充值笔数',
                        key: 'rechargePenNumber'
                    },
                    {
                        title: '应发奖励',
                        key: 'award'
                    },
                    // {
                    //     title: '奖励类型',
                    //     key: 'type',
                    //     render: (h, params) => {
                    //         return h('span', params.row.type == 1 ? '可用' : (params.row.type == 2 ? '冻结' : '半可用半冻结'));
                    //     }
                    // }
                ],
                tableData: [],
                actsList: [], // 所有活动
                fundsList: [], // 所有币种
                startDateObj: '',
                endDateObj: '',
                startDate: '', // 开始时间
                endDate: '', // 结束时间
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
                activitiesName: '',
                userName: '',
                // fundsType: '',
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
            findData () {
                // 重置页码
                this.pageNum = 1;
                this.total = 0;

                this.getListData();
            },
            getListData () {
                let params = {
                    startTime: this.startDate,
                    endTime: this.endDate,
                    activityType: this.activityType,
                    rechargeName: this.activitiesName,
                    userName: this.userName,
                    // fundsType: this.fundsType,
                    pageIndex: this.pageNum,
                    pageSize: this.pageSize
                }
                api.getPayinStatistics(params).then((res) => {
                    if (res.data.code == 1) {
                        this.tableData = res.data.data.list;
                        this.total = res.data.data.count;
                    }
                });
            },
            getFundsList () {
                api.findFundsList().then((res) => {
                    if (res.data.code == 1) {
                        let result = res.data.data;
                        let resultArr = [];
                        Object.keys(result).forEach((item, index) => {
                            let arrObj = {};
                            arrObj.value = Number(item);
                            arrObj.label = result[item];

                            resultArr.push(arrObj);
                        });

                        this.fundsList = resultArr;
                    }
                });
            },
            getActivityNames () {
                let params = {
                    activityType: this.activityType
                }
                api.getActivityLabels(params).then((res) => {
                    if (res.data.code == 1) {
                        this.actsList = res.data.data;
                        this.activitiesName = this.actsList[0] || '';

                        // 获取统计
                        this.getListData();
                    }
                });
            },
            exportListHandle () {
                let bitbank = [],
                    tabHead = [];
                this.tableColumns.forEach((item, index) => {
                    bitbank.push(item.key);
                    tabHead.push(item.title);
                });

                let params = {
                    rechargeName: this.activitiesName,
                    bitbank: bitbank,
                    tabHead: tabHead
                }
                this.loading = true;
                api.exportPayinList(params).then((res) => {
                    this.loading = false;
                    // 处理文件流
                    let blob = new Blob([res.data], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
                    let objectUrl = URL.createObjectURL(blob);
                    // window.location.href = objectUrl;

                    const filename = this.activitiesName + '.xlsx';
                    let link = document.createElement('a');
                    link.download = filename;
                    link.href = objectUrl;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                    this.$Message.success('导出成功！');
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
            // 获取币种列表
            // this.getFundsList();
            // 获取所有活动名称
            this.getActivityNames();
        },
        mounted () {
        }
    };
</script>
