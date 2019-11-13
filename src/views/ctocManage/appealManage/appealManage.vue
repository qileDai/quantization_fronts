<style lang="less" scoped>
    @import '../../../styles/common.less';
    @import 'appealManage.less';
</style>

<template>
    <div class="content">
        <Row class="et-row">
            <Col>
            <span>申诉时间：</span>
            <span class="option-text">从</span>
            <DatePicker v-model="startDateObj" format="yyyy-MM-dd" :options="optionsStart" :editable="false" @on-change="setStartDateVal" type="date" placeholder="请选择开始日期" style="width: 180px"></DatePicker>
            <span class="option-text">到</span>
            <DatePicker v-model="endDateObj" format="yyyy-MM-dd" :options="optionsEnd" :editable="false" @on-change="setEndDateVal" type="date" placeholder="请选择结束日期" style="width: 180px"></DatePicker>
            <span style="margin-left: 15px;">订单编号：</span>
            <div class="search-out">
                <Input v-model.trim="orderNo" placeholder="请输入订单编号" clearable></Input>
            </div>
            <span style="margin-left: 15px;">申诉人：</span>
            <div class="search-out">
                <Input v-model.trim="appealUserName" placeholder="请输入申诉人" clearable></Input>
            </div>
            <!--<span style="margin-left: 15px;">币种：</span>
            <div class="search-out" style="width: 100px;">
                <Select v-model="fundsName" clearable placeholder="请选择币种">
                    <Option value="cnyt">CNYT</Option>
                    <Option value="usdt">USDT</Option>
                </Select>
            </div>-->
            <span style="margin-left: 15px;">申诉状态：</span>
            <div class="search-out" style="width: 100px;">
                <Select v-model="orderStatus" clearable placeholder="请选择">
                    <Option v-for="item in appealStatusList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                </Select>
            </div>
            <Button type="primary" icon="ios-search" style="margin-left: 5px;" @click="findData">查询</Button>
            </Col>
        </Row>
        <Table border :columns="tableColumns" :data="tableData"></Table>
        <div style="position: relative;">
            <Page class="pages" :current="pageNum" :total="total" show-elevator show-sizer :page-size="pageSize" :page-size-opts="sizeOpts" @on-change="changePageNum" @on-page-size-change="changePageSize"></Page>
        </div>
        <Modal v-model="modalStatus" :title="modalTitle" width="800" @on-cancel="handleReset">
            <Form ref="formItem" :model="formItem" :label-width="90" :rules="ruleValidate">
                <div class="user-infos">
                    <p>买方账号：{{appealList.buyUserName}}</p>
                    <p>订单编号：{{orderList.no}}</p>
                </div>
                <div class="user-infos">
                    <p>卖方账号：{{appealList.sellUserName}}</p>
                    <p>付款时间：{{orderList.repayTime}}</p>
                </div>
                <div class="user-infos">
                    <p>发起方：{{appealList.appealUserId == appealList.buyUserId ? appealList.buyUserName : appealList.sellUserName}}</p>
                    <p>结束时间：{{orderList.endTime}}</p>
                </div>
                <div class="user-infos">
                    <p>申诉状态：{{getAppealStatus(appealList.appealStautus)}}</p>
                    <p>单价：{{orderList.price}}</p>
                </div>
                <div class="user-infos">
                    <p>申诉时间：{{appealList.createTime}}</p>
                    <p>数量：{{orderList.amount}}</p>
                </div>
                <div class="user-infos">
                    <p>申诉理由：{{getAppealReason(appealList.appealReason)}}</p>
                    <p>交易金额：{{orderList.fundPrice}}</p>
                    <!--<p>付款方式：-</p>-->
                </div>
                <div class="user-infos">
                    <p>问题描述：{{appealList.message}}</p>
                    <!--<p>交易金额：{{orderList.fundPrice}}</p>-->
                </div>
                <template v-if="operateType === 1">
                    <div class="appealImg">
                        <h4>买方凭证</h4>
                        <p>上传于 {{appealList.appealUserId == appealList.buyUserId ? appealList.createTime : appealList.createDate}}</p>
                        <div class="img-list">
                            <img v-for="item,index in picfilename" :src="item" :alt="'买方凭证' + (index + 1)" @click="handleView(item)">
                        </div>
                        <p>描述：{{appealList.appealUserId == appealList.buyUserId ? appealList.message : appealList.messagePicture}}</p>
                    </div>
                    <div class="appealImg">
                        <h4>卖方凭证</h4>
                        <p>上传于 {{appealList.appealUserId == appealList.sellUserId ? appealList.createTime : appealList.createDate}}</p>
                        <div class="img-list">
                            <img v-for="item,index in picture" :src="item" :alt="'卖方凭证' + (index + 1)" @click="handleView(item)">
                        </div>
                        <p>描述：{{appealList.appealUserId == appealList.sellUserId ? appealList.message : appealList.messagePicture}}</p>
                    </div>
                </template>
                <template v-if="operateType === 2">
                <!--<div class="user-infos" style="margin-top: 20px; margin-bottom: 15px;">
                    <p>当前状态：{{getAppealStatus(appealList.appealStautus)}}</p>
                </div>-->
                <FormItem label="处理方式" prop="status">
                    <Select v-model="formItem.status" style="width: 200px;" placeholder="请选择处理方式">
                        <Option v-for="item in dealwithList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                    </Select>
                </FormItem>
                <FormItem label="仲裁理由" prop="adminMemo" style="width: 500px;">
                    <Input v-model="formItem.adminMemo" type="textarea" :autosize="{minRows: 3,maxRows: 5}" placeholder="请输入仲裁理由"></Input>
                </FormItem>
                <FormItem label="谷歌验证码" prop="googleCode">
                    <Input v-model="formItem.googleCode" placeholder="请输入谷歌验证码" style="width: 200px;"></Input>
                </FormItem>
                </template>
            </Form>
            <div slot="footer">
                <template v-if="operateType === 1">
                    <Button type="text" size="large" @click="handleReset">关闭</Button>
                </template>
                <template v-if="operateType === 2">
                    <Button type="text" size="large" @click="handleReset">取消</Button>
                    <Button type="primary" size="large" @click="handleSubmit" :loading="submitLoading">提交</Button>
                </template>
            </div>
        </Modal>
        <!--预览图片-->
        <Modal title="预览" width="1200" v-model="visible" class="viewimg">
            <img :src="imgUrl" v-if="visible" style="max-width: 100%">
        </Modal>
    </div>
</template>

<script>
    import api from '@/api/ctoc'
    import axios from '@/axios/config'
    import Cookies from 'js-cookie'

    export default {
        name: 'appealManage',
        data () {
            const number = (rule, value, callback) => {
                if (isNaN(value)) {
                    callback(new Error('格式不正确，必须为数字'));
                }
                callback();
            };
            return {
                req_url: axios.defaults.baseURL,
                tableColumns: [
                    {
                        title: '订单编号',
                        key: 'orderNo'
                    },
                    {
                        title: '申诉发起方',
                        key: 'appealUserName'
                    },
                    {
                        title: '买方账号',
                        key: 'buyUserName'
                    },
                    {
                        title: '卖方账号',
                        key: 'sellUserName'
                    },
                    {
                        title: '申诉理由',
                        key: 'appealReason',
                        render: (h, params) => {
                            return h('span', this.getAppealReason(params.row.appealReason));
                        }
                    },
                    {
                        title: '申诉状态',
                        key: 'appealStautus',
                        render: (h, params) => {
                            return h('span', this.getAppealStatus(params.row.appealStautus));
                        }
                    },
                    {
                        title: '仲裁员',
                        key: 'adminName'
                    },
                    {
                        title: '仲裁理由',
                        key: 'adminMemo'
                    },
                    {
                        title: '申诉时间',
                        key: 'createTime',
                        render: (h, params) => {
                            return h('span', params.row.createTime ? params.row.createTime.split('.')[0] : '');
                        }
                    },
                    {
                        title: '仲裁时间',
                        key: 'endTime',
                        render: (h, params) => {
                            return h('span', params.row.endTime ? params.row.endTime.split('.')[0] : '');
                        }
                    },
                    {
                        title: '操作',
                        render: (h, params) => {
                            return h('div', {
                                style: {
                                    paddingBottom: '5px'
                                }
                            }, [
                                this.g_perm('view') ? h('Button', {
                                    props: {
                                        type: 'primary',
                                        size: 'small'
                                    },
                                    style: {
                                        marginTop: '5px',
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.viewAppealDetails(params.row, 1);
                                        }
                                    }
                                }, '查看') : '',
                                this.g_perm('arbitration') ? h('Button', {
                                    props: {
                                        type: 'error',
                                        size: 'small',
                                        disabled: params.row.appealStautus !== '0'
                                    },
                                    style: {
                                        marginTop: '5px',
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.arbitrationAppeal(params.row, 2);
                                        }
                                    }
                                }, '仲裁') : ''
                            ]);
                        }
                    }
                ],
                modalStatus: false,
                modalTitle: '',
                operateType: 0, // 1查看 2仲裁
                formItem: {
                    status: '',
                    adminMemo: '',
                    googleCode: '' // 默认开启谷歌验证
                },
                ruleValidate: {
                    status: [
                        {required: true, type: 'number', message: '请选择处理方式', trigger: 'change'}
                    ],
                    adminMemo: [
                        {required: true, message: '请输入仲裁理由', trigger: 'blur'}
                    ],
                    googleCode: [
                        {required: true, len: 6, message: '请输入6位数字的谷歌验证码', trigger: 'blur'},
                        {validator: number, trigger: 'blur'}
                    ]
                },
                tableData: [],
                startDateObj: '',
                endDateObj: '',
                startDate: '', // 开始时间
                endDate: '', // 结束时间
                orderNo: '',
                appealUserName: '',
                // fundsName: 'cnyt',
                orderStatus: '',
                currentRow: '',
                appealList: '', // 当前申诉信息
                orderList: '', // 当前订单信息
                appealReasonList: [
                    {
                        value: 1,
                        label: '对方不放币'
                    },
                    {
                        value: 2,
                        label: '对方未汇款'
                    },
                    {
                        value: 3,
                        label: '其他'
                    },
                    // {
                    //     value: 4,
                    //     label: '对方有欺诈行为'
                    // },
                    // {
                    //     value: 5,
                    //     label: '其他'
                    // }
                ],
                appealStatusList: [
                    {
                        value: 'all',
                        label: '全部'
                    },
                    {
                        value: '0',
                        label: '申诉中'
                    },
                    {
                        value: '1',
                        label: '已放行'
                    },
                    {
                        value: '2',
                        label: '已拒绝'
                    }
                ],
                orderStatusList: [
                    {
                        value: 'all',
                        label: '全部'
                    },
                    {
                        value: 0,
                        label: '接单中'
                    },
                    {
                        value: 1,
                        label: '交易中'
                    },
                    {
                        value: 2,
                        label: '交易完成'
                    },
                    {
                        value: 3,
                        label: '买家已支付'
                    },
                    {
                        value: 4,
                        label: '申诉中'
                    },
                    {
                        value: 5,
                        label: '接单超时'
                    },
                    {
                        value: 6,
                        label: '支付超时'
                        // label: '已取消'
                    },
                    {
                        value: 7,
                        label: '放行超时'
                    },
                    {
                        value: 8,
                        label: '订单取消'
                    },
                    {
                        value: 9,
                        label: '申诉失败'
                    },
                    {
                        value: 10,
                        label: '申诉成功'
                    },
                    {
                        value: 11,
                        label: '申诉结束'
                    }
                ],
                dealwithList: [
                    {
                        value: 1,
                        label: '已放币给买方'
                    },
                    {
                        value: 2,
                        label: '已解冻CNYT'
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
                submitLoading: false,
                imgUrl: '',
                visible: false,
                pageNum: 1,
                pageSize: 20,
                total: 0, // 总页数
                sizeOpts: [10, 20, 50, 100]
            };
        },
        watch: {
        },
        computed: {
            // 买家凭证
            picfilename () {
                let value = this.appealList.appealUserId == this.appealList.buyUserId ? this.appealList.picfilename : this.appealList.picture;
                return value ? value.split(',') : [];
            },
            // 卖家凭证
            picture () {
                let value = this.appealList.appealUserId == this.appealList.sellUserId ? this.appealList.picfilename : this.appealList.picture;
                return value ? value.split(',') : [];
            }
        },
        methods: {
            handleSubmit () {
                this.$refs.formItem.validate((valid) => {
                    if (valid) {
                        this.submitRequest();
                    }
                });
            },
            handleReset () {
                this.$refs.formItem.resetFields();

                this.appealList = '';
                this.orderList = '';

                this.modalStatus = false;
            },
            findData () {
                // 重置页码
                this.pageNum = 1;
                this.total = 0;

                this.getListData();
            },
            getListData () {
                let params = {
                    startDate: this.startDate,
                    endDate: this.endDate,
                    orderNo: this.orderNo,
                    appealUserName: this.appealUserName,
                    // fundsType: this.fundsName,
                    appealStautus: this.orderStatus === 'all' ? '' : this.orderStatus,
                    pageIndex: this.pageNum,
                    pageSize: this.pageSize
                }
                api.appealManageList(params).then((res) => {
                    if (res.data.code == 1) {
                        this.tableData = res.data.data.appealList || [];
                        this.total = res.data.data.count;
                    }
                });
            },
            getAppealDetail () {
                let params = {
                    orderNo: this.currentRow.orderNo
                }
                api.appealDetails(params).then((res) => {
                    if (res.data.code == 1) {
                        this.appealList = res.data.data.appealList[0] || {};
                        this.orderList = res.data.data.orderList[0] || {};
                    }
                });
            },
            submitRequest () {
                let params = {
                    id: this.currentRow.id,
                    adminName: Cookies.get('user')
                }

                let obj = Object.assign(params, this.formItem);

                this.submitLoading = true;
                api.doArbitration(obj).then((res) => {
                    this.submitLoading = false;
                    if (res.data.code == 1) {
                        this.$Message.success('提交成功！');
                        this.handleReset();
                        // 提交成功重新获取
                        this.getListData();
                    }
                });
            },
            viewAppealDetails (row, type) {
                this.currentRow = row;
                this.operateType = type;
                this.modalTitle = '申诉详情';

                this.getAppealDetail();

                this.modalStatus = true;
            },
            arbitrationAppeal (row, type) {
                this.currentRow = row;
                this.operateType = type;
                this.modalTitle = '仲裁';

                this.getAppealDetail();

                this.modalStatus = true;
            },
            handleView (imgUrl) {
                this.imgUrl = imgUrl;
                this.visible = true;
            },
            getAppealStatus (val) {
                for (let i = 0; i < this.appealStatusList.length; i++) {
                    if (this.appealStatusList[i].value == val) {
                        return this.appealStatusList[i].label;
                    }
                }
                return '-';
            },
            getOrderStatus (val) {
                for (let i = 0; i < this.orderStatusList.length; i++) {
                    if (this.orderStatusList[i].value == val) {
                        return this.orderStatusList[i].label;
                    }
                }
                return '-';
            },
            getAppealReason (val) {
                for (let i = 0; i < this.appealReasonList.length; i++) {
                    if (this.appealReasonList[i].value == val) {
                        return this.appealReasonList[i].label;
                    }
                }
                return '-';
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
