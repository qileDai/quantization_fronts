<style lang="less" scoped>
    @import '../../../styles/common.less';
    @import 'verified.less';
</style>

<template>
    <div class="content">
        <Row class="et-row">
            <Col>
                <span>提交日期：</span>
                <span class="option-text">从</span>
                <DatePicker v-model="startDateObj" format="yyyy-MM-dd" :options="optionsStart" :editable="false" @on-change="setStartDateVal" type="date" placeholder="请选择开始日期" style="width: 150px"></DatePicker>
                <span class="option-text">到</span>
                <DatePicker v-model="endDateObj" format="yyyy-MM-dd" :options="optionsEnd" :editable="false" @on-change="setEndDateVal" type="date" placeholder="请选择结束日期" style="width: 150px"></DatePicker>
                <span style="margin-left: 15px;">用户名：</span>
                <div class="search-out">
                    <Input v-model="userName" placeholder="搜索用户名" clearable></Input>
                </div>
                <span style="margin-left: 15px;">真实姓名：</span>
                <div class="search-out">
                    <Input v-model="realName" placeholder="搜索真实姓名" clearable></Input>
                </div>
                <span style="margin-left: 15px;">证件号码：</span>
                <div class="search-out" style="width: 180px;">
                    <Input v-model="cardNumber" placeholder="搜索证件号码" clearable></Input>
                </div>
                <span style="margin-left: 15px;">认证地区：</span>
                <div class="search-out" style="width: 100px;">
                    <Select v-model="area">
                        <Option v-for="item in areaList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                    </Select>
                </div>
                <Button type="primary" icon="ios-search" @click="searchData">查询</Button>
                <Button type="info" @click="switchVerifiedType(1)" v-if="currVerifiedType == 2" style="float: right;" v-cloak>切换为人工审核</Button>
                <Button type="info" @click="switchVerifiedType(2)" v-if="currVerifiedType == 1" style="float: right;" v-cloak>切换为人脸识别</Button>
            </Col>
        </Row>
        <Row class="et-row" style="padding-bottom: 30px;" v-cloak>
            <Col>
                <RadioGroup v-model="filterStatus" type="button" @on-change="searchData">
                    <Radio :label="item.value" v-for="(item, index) in listStatus" :key="index">{{item.label}}</Radio>
                </RadioGroup>
            </Col>
        </Row>
        <Table border :columns="tableColumns" :data="tableData"></Table>
        <div style="position: relative;">
            <Page class="pages" :current="pageNum" :total="total" show-elevator show-sizer :page-size="pageSize" :page-size-opts="sizeOpts" @on-change="changePageNum" @on-page-size-change="changePageSize"></Page>
        </div>
        <!--认证历史-->
        <Modal v-model="historyStatus" title="认证审核历史" width="800">
            <p class="history-title">认证次数：{{failAuthTimes}}</p>
            <div class="verified-content" v-for="(item, index) in historyData" :key="index" v-if="historyData.length > 0">
                <div class="verified-head">
                    <p>认证时间：<span>{{item.submitTime}}</span></p>
                    <p>审核人：<span>{{item.adminName}}</span></p>
                </div>
                <div class="verified-imgs">
                    <img :src="item.frontalImg" alt="身份证正面" title="身份证正面" @click="handleView(item.frontalImg)">
                    <img :src="item.backImg" alt="身份证反面" title="身份证反面" @click="handleView(item.backImg)">
                    <img :src="item.loadImg" alt="手持身份证" title="手持身份证" @click="handleView(item.loadImg)">
                    <img :src="item.proofAddressImg" alt="住址证明" title="住址证明" @click="handleView(item.proofAddressImg)">
                </div>
                <div class="verified-result">
                    <p>{{item.status == 1 ? '待审核' : (item.status == 2 ? '审核通过' : '审核不通过')}}<span>：{{item.reason || '-'}}</span></p>
                </div>
            </div>
            <div slot="footer">
                <Button type="primary" size="large" @click="handleClear">认证次数清零</Button>
                <Button type="text" size="large" @click="handleClosed">关闭</Button>
            </div>
        </Modal>
        <!--查看详情-->
        <Modal v-model="viewStatus" title="查看资料" width="800" @on-cancel="handleResetView">
            <div class="user-infos">
                <p>用户名：{{currentRow.userName}}</p>
                <p>认证地区：{{getAreaName(currentRow.areaInfo)}}</p>
            </div>
            <div class="user-infos">
                <p>真实姓名：{{currentRow.realName}}</p>
                <p>证件号码：{{currentRow.cardId}}</p>
            </div>
            <div class="user-photos" v-if="Object.keys(verifiedDetails).length > 0">
                <p>
                    <span>身份证正面</span>
                    <img :src="verifiedDetails.frontalImg" alt="身份证正面" @click="handleView(verifiedDetails.frontalImg)">
                </p>
                <p>
                    <span>身份证反面</span>
                    <img :src="verifiedDetails.backImg" alt="身份证反面" @click="handleView(verifiedDetails.backImg)">
                </p>
                <br>
                <p>
                    <span>手持身份证</span>
                    <img :src="verifiedDetails.loadImg" alt="手持身份证" @click="handleView(verifiedDetails.loadImg)">
                </p>
                <p>
                    <span>住址证明</span>
                    <img :src="verifiedDetails.proofAddressImg" alt="住址证明" @click="handleView(verifiedDetails.proofAddressImg)">
                </p>
                <br>
                <p class="backphoto" v-if="verifiedDetails.photo !== ''">
                    <span>返照</span>
                    <img :src="verifiedDetails.photo" alt="返照" @click="handleView(verifiedDetails.photo)">
                </p>
            </div>
            <div slot="footer">
                <Button type="primary" size="large" @click="handlePassed(null)" :disabled="currentRow.status == 2 || currentRow.authenicationType == 2" v-if="g_perm('by')">通过</Button>
                <Button type="error" size="large" @click="handleFailed(null)" :disabled="currentRow.status == 3 || currentRow.authenicationType == 2" v-if="g_perm('fail')">不通过</Button>
            </div>
        </Modal>
        <!--审核不通过-->
        <Modal v-model="modalStatus" title="审核不通过" width="600" @on-cancel="handleReset">
            <Form ref="formItem" :model="formItem" :label-width="100" :rules="ruleValidate">
                <FormItem label="附加理由" prop="reasonType">
                    <Select v-model="formItem.reasonType">
                        <Option v-for="item in reasonList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                    </Select>
                </FormItem>
                <FormItem label="其它理由" prop="reason" v-if="formItem.reasonType === 4">
                    <Input v-model="formItem.reason" type="textarea" :autosize="{minRows: 3,maxRows: 5}" placeholder="请输入其它理由"></Input>
                </FormItem>
                <FormItem label="已通过的项目">
                    <Checkbox v-model="formItem.infoPass" true-value="1" false-value="0">基本信息</Checkbox>
                    <Checkbox v-model="formItem.idImgPass" true-value="1" false-value="0">身份证照片</Checkbox>
                    <Checkbox v-model="formItem.proofAddressPass" true-value="1" false-value="0">住址证明</Checkbox>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button type="text" size="large" @click="handleReset">取消</Button>
                <Button type="primary" size="large" @click="handleSubmit">确定</Button>
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
    import Cookies from 'js-cookie';

    export default {
        name: 'verified',
        data () {
            return {
                req_url: axios.defaults.baseURL,
                tableColumns: [
                    {
                        width: 90,
                        title: '编号',
                        key: '_id'
                    },
                    {
                        title: '用户名',
                        key: 'userName'
                    },
                    {
                        title: '认证地区',
                        key: 'areaInfo',
                        render: (h, params) => {
                            return h('span', this.getAreaName(params.row.areaInfo));
                        }
                    },
                    {
                        width: 300,
                        title: '认证信息',
                        render: (h, params) => {
                            return h('div', {
                                style: {
                                    paddingBottom: '5px'
                                }
                            }, [
                                /* h('img', {
                                    attrs: {
                                        'src': params.row.loadImg,
                                        'class': 'imgblock',
                                        'width': 88,
                                        'height': 88
                                    },
                                    style: {
                                        marginTop: '5px',
                                        marginRight: '5px',
                                        borderWidth: '1px',
                                        borderStyle: 'solid',
                                        borderColor: '#e9eaec'
                                    }
                                }), */
                                h('div', {
                                    style: {
                                        display: 'inline-block',
                                        verticalAlign: 'top'
                                    }
                                }, [
                                    h('p', {
                                        style: {
                                            marginTop: '10px',
                                            marginLeft: '7px'
                                        }
                                    }, params.row.realName),
                                    h('p', {
                                        style: {
                                            marginTop: '5px',
                                            marginLeft: '7px',
                                            marginBottom: '10px'
                                        }
                                    }, params.row.cardId),
                                    this.g_perm('view') ? h('Button', {
                                        props: {
                                            type: 'text',
                                            size: 'small'
                                        },
                                        style: {
                                            marginTop: '5px',
                                            marginRight: '5px',
                                            color: '#ed3f14'
                                        },
                                        on: {
                                            click: () => {
                                                this.viewDetails(params.row);
                                            }
                                        }
                                    }, '查看详情') : '',
                                    this.g_perm('history') ? h('Button', {
                                        props: {
                                            type: 'text',
                                            size: 'small'
                                        },
                                        style: {
                                            marginTop: '5px',
                                            marginRight: '5px',
                                            color: '#19be6b'
                                        },
                                        on: {
                                            click: () => {
                                                this.getHistories(params.row);
                                            }
                                        }
                                    }, '认证历史') : ''
                                ])
                            ]);
                        }
                    },
                    /* {
                        title: '证件类型',
                        key: 'cardType',
                        render: (h, params) => {
                            return h('span', params.row.cardType || '身份证');
                        }
                    }, */
                    // 1: 高级认证-待审核 2:高级认证-通过 3:高级认证-不通过
                    {
                        title: '状态',
                        key: 'status',
                        render: (h, params) => {
                            return h('span', params.row.status === 1 ? '待审核' : (params.row.status === 2 ? '审核通过' : '审核不通过'));
                        }
                    },
                    {
                        title: '提交时间',
                        key: 'submitTime',
                        render: (h, params) => {
                            return h('span', params.row.submitTime ? params.row.submitTime.split('.')[0] : '');
                        }
                    },
                    {
                        title: '审核时间',
                        key: 'checkTime',
                        render: (h, params) => {
                            return h('span', params.row.checkTime ? params.row.checkTime.split('.')[0] : '');
                        }
                    },
                    {
                        title: '通道',
                        key: 'authenicationType',
                        render: (h, params) => {
                            return h('span', params.row.authenicationType === 1 ? '人工审核' : (params.row.authenicationType === 2 ? '人脸识别' : '-'));
                        }
                    },
                    // {
                    //     title: '管理员ID',
                    //     key: 'adminId'
                    // },
                    {
                        title: '操作',
                        render: (h, params) => {
                            return h('div', {
                                style: {
                                    paddingBottom: '5px'
                                }
                            }, [
                                this.g_perm('by') ? h('Button', {
                                    props: {
                                        type: 'primary',
                                        size: 'small',
                                        disabled: params.row.status == 2 || params.row.authenicationType == 2
                                    },
                                    style: {
                                        marginTop: '5px',
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.handlePassed(params.row);
                                        }
                                    }
                                }, '通过') : '',
                                this.g_perm('fail') ? h('Button', {
                                    props: {
                                        type: 'error',
                                        size: 'small',
                                        disabled: params.row.status == 3 || params.row.authenicationType == 2
                                    },
                                    style: {
                                        marginTop: '5px',
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.handleFailed(params.row);
                                        }
                                    }
                                }, '不通过') : ''
                            ]);
                        }
                    }
                ],
                tableData: [],
                currentRow: '', // 当前编辑项
                verifiedDetails: {}, // 查看认证详情
                historyData: [], // 历史认证信息
                failAuthTimes: 0, // 历史认证次数
                startDateObj: '',
                endDateObj: '',
                startTime: '',
                endTime: '',
                userName: '',
                realName: '',
                cardNumber: '',
                area: '',
                areaList: [
                    {
                        value: 'all',
                        label: '全部'
                    },
                    {
                        value: 1,
                        label: '大陆地区'
                    },
                    {
                        value: 2,
                        label: '港澳地区'
                    },
                    {
                        value: 3,
                        label: '台湾地区'
                    },
                    {
                        value: 4,
                        label: '海外地区'
                    }
                ],
                filterStatus: 1, // 默认待审核
                listStatus: [
                    {
                        value: 1,
                        label: '待审核'
                    },
                    {
                        value: 2,
                        label: '审核通过'
                    },
                    {
                        value: 3,
                        label: '审核不通过'
                    },
                    {
                        value: 'all',
                        label: '所有记录'
                    }
                ],
                verifieds: [], // 认证方式数组
                currVerifiedType: '',
                modalStatus: false,
                historyStatus: false,
                viewStatus: false,
                // modalTitle: '添加',
                formItem: {
                    reasonType: 1, // 用于选择理由，不做传参用

                    reason: '',
                    infoPass: '0',
                    idImgPass: '0',
                    proofAddressPass: '0'
                },
                ruleValidate: {
                    reasonType: [
                        {required: true, type: 'number', message: '请选择附加理由', trigger: 'change'}
                    ],
                    reason: [
                        {required: true, message: '请输入其它理由', trigger: 'blur'}
                    ]
                },
                reasonList: [
                    {
                        value: 1,
                        label: '身份证信息模糊'
                    },
                    {
                        value: 2,
                        label: '未按平台要求拍摄并上传'
                    },
                    {
                        value: 3,
                        label: '手持身份证照片，遮挡到或信息内容不完整'
                    },
                    {
                        value: 4,
                        label: '其他'
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
                // 上传图片
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
        },
        methods: {
            handleSubmit () {
                this.$refs.formItem.validate((valid) => {
                    if (valid) {
                        this.unPassVerified();
                    }
                });
            },
            handleReset () {
                this.$refs.formItem.resetFields();

                this.formItem.infoPass = '0';
                this.formItem.idImgPass = '0';
                this.formItem.proofAddressPass = '0';

                this.verifiedDetails = {};

                this.modalStatus = false;
            },
            handleClosed () {
                this.historyStatus = false;

                this.historyData = [];
            },
            handleResetView () {
                this.viewStatus = false;

                this.verifiedDetails = {};
                this.currentRow = '';
            },
            handleClear () {
                let params = {
                    userId: this.currentRow.userId
                }
                api.clearVerifiedTimes(params).then((res) => {
                    if (res.data.code == 1) {
                        this.failAuthTimes = 0;
                        this.$Message.success('已清零！');
                    }
                });
            },
            handlePassed (row) {
                if (row) {
                    this.currentRow = row;
                }
                this.$Modal.confirm({
                    title: '提示',
                    content: '确定要通过用户提交的实名认证审核吗？',
                    onOk: () => {
                        this.passVerified();
                    }
                });
            },
            handleFailed (row) {
                if (row) {
                    this.currentRow = row;
                }

                this.modalStatus = true;
            },
            passVerified () {
                let params = {
                    // adminId: Cookies.get('userId'),
                    adminName: Cookies.get('user'),
                    userId: this.currentRow.userId,
                    status: 2
                }
                api.pass(params).then((res) => {
                    if (res.data.code == 1) {
                        this.$Message.success('已通过！');
                        this.viewStatus = false;
                        this.handleReset();
                        // 提交成功重新获取
                        this.getListData();
                    }
                });
            },
            unPassVerified () {
                console.log(12)
                let params = {
                    // adminId: Cookies.get('userId'),
                    adminName: Cookies.get('user'),
                    userId: this.currentRow.userId,
                    status: 3
                }

                let obj = Object.assign(params, this.formItem);
                // 判断附加理由
                if (obj.reasonType != 4) {
                    for (let i = 0; i < this.reasonList.length; i++) {
                        if (this.reasonList[i].value == obj.reasonType) {
                            obj.reason = this.reasonList[i].label;
                            break;
                        }
                    }
                }

                api.notpass(obj).then((res) => {
                    if (res.data.code == 1) {
                        this.$Message.success('操作成功！');
                        this.viewStatus = false;
                        this.handleReset();
                        // 提交成功重新获取
                        this.getListData();
                    }
                });
            },
            searchData () {
                // 重置页码
                this.pageNum = 1;
                this.total = 0;

                this.getListData();
            },
            getListData () {
                let params = {
                    startTime: this.startTime,
                    endTime: this.endTime,
                    userName: this.userName,
                    realName: this.realName,
                    cardId: this.cardNumber,
                    areaInfo: this.area,
                    status: this.filterStatus, // 筛选类型
                    pageIndex: this.pageNum,
                    pageSize: this.pageSize
                }
                let obj = Object.assign(params, {});
                if (obj.status === 'all') {
                    obj.status = '';
                }
                if (obj.areaInfo === 'all') {
                    obj.areaInfo = '';
                }
                api.getVerifiedList(obj).then((res) => {
                    if (res.data.code == 1) {
                        // 处理图片地址问题
                        let result = res.data.data.data;
                        result.forEach((item, index) => {
                            if (item.loadImg && item.loadImg.indexOf('base64') >= 0) {
                                item.loadImg = item.loadImg.split('aliyuncs.com/')[1];
                            }
                        });
                        this.tableData = result;
                        this.total = res.data.data.count;
                    }
                });
            },
            getVerifiedType () {
                api.getVerifiedWays().then((res) => {
                    if (res.data.code == 1) {
                        this.verifieds = res.data.data;

                        // 过滤当前使用的方式
                        this.verifieds.forEach((item, index) => {
                            if (item.open == 1) {
                                this.currVerifiedType = item.type;
                            }
                        });
                    }
                });
            },
            // 认证方式 1:人工识别 2:face++
            switchVerifiedType (type) {
                let params = {
                    id: type,
                    open: 1
                }
                api.switchVerifiedWay(params).then((res) => {
                    if (res.data.code == 1) {
                        this.$Message.success('切换成功！');
                        // 重新获取认证方式
                        this.getVerifiedType();
                    }
                });
            },
            getHistories (row) {
                this.currentRow = row;
                let params = {
                    userId: row.userId,
                    pageIndex: 1,
                    pageSize: 9999
                }
                let obj = Object.assign(params, {});
                api.getVerifiedHistory(obj).then((res) => {
                    if (res.data.code == 1) {
                        let result = res.data.data.history || [];
                        result.forEach((item, index) => {
                            if (item.backImg && item.backImg.indexOf('base64') >= 0) {
                                item.backImg = item.backImg.split('aliyuncs.com/')[1];
                            }
                            if (item.frontalImg && item.frontalImg.indexOf('base64') >= 0) {
                                item.frontalImg = item.frontalImg.split('aliyuncs.com/')[1];
                            }
                        });
                        this.historyData = result;
                        this.failAuthTimes = res.data.data.failAuthTimes;

                        this.historyStatus = true;
                    }
                });
            },
            viewDetails (currRow) {
                this.currentRow = currRow;

                let params = {
                    userId: currRow.userId
                }
                api.viewVerifiedDetail(params).then((res) => {
                    if (res.data.code == 1) {
                        let result = res.data.data;
                        Object.keys(result).forEach((item, index) => {
                            if (result[item] && result[item].indexOf('base64') >= 0) {
                                result[item] = result[item].split('aliyuncs.com/')[1];
                            }
                        });
                        this.verifiedDetails = result;
                    }
                });

                this.viewStatus = true;
            },
            handleView (imgUrl) {
                this.imgUrl = imgUrl;
                this.visible = true;
            },
            getAreaName (areaValue) {
                for (let i = 0; i < this.areaList.length; i++) {
                    if (this.areaList[i].value === areaValue) {
                        return this.areaList[i].label;
                    }
                }
            },
            setStartDateVal (formatDate) {
                this.startTime = formatDate;
            },
            setEndDateVal (formatDate) {
                this.endTime = formatDate;
            },
            // 分页相关
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

            // 获取当前认证方式
            this.getVerifiedType();
        },
        mounted () {
        }
    };
</script>
