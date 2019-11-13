<style lang="less" scoped>
    @import '../../../../styles/common.less';
    @import 'registerList.less';
</style>

<template>
    <div class="content">
        <Row class="et-row">
            <Col>
                <span>活动名称：</span>
                <div class="search-out">
                    <Input v-model.trim="activitiesName" placeholder="请输入活动名称" clearable></Input>
                </div>
                <span style="margin-left: 15px;">活动状态：</span>
                <div class="search-out">
                    <Select v-model="activitiesStatus">
                        <Option v-for="item in statusList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                    </Select>
                </div>
                <Button type="primary" icon="ios-search" style="margin-left: 5px;" @click="findData">查询</Button>
                <Button type="info" class="add_account" icon="plus-round" @click="showEditModal(null, 0)" v-if="g_perm('add')">新增活动</Button>
            </Col>
        </Row>
        <Table border :columns="tableColumns" :data="tableData"></Table>
        <div style="position: relative;">
            <Page class="pages" :current="pageNum" :total="total" show-elevator show-sizer :page-size="pageSize" :page-size-opts="sizeOpts" @on-change="changePageNum" @on-page-size-change="changePageSize"></Page>
        </div>
        <Modal v-model="modalStatus" :title="modalTitle" width="600" @on-cancel="handleReset" :mask-closable="false">
            <Form ref="formItem" :model="formItem" :label-width="120" :rules="ruleValidate">
                <FormItem label="活动名称" prop="activityName">
                    <Input v-model.trim="formItem.activityName" style="width:200px" placeholder="请输入活动名称"></Input>
                </FormItem>
                <FormItem label="赠送币种" prop="fundsType">
                    <Select v-model="formItem.fundsType" filterable style="width:200px" placeholder="请选择赠送币种">
                        <Option v-for="item in fundsList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                    </Select>
                </FormItem>
                <FormItem label="出账人账户" prop="outAccount">
                    <Input v-model.trim="formItem.outAccount" style="width:200px" placeholder="请输入出账人账户"></Input>
                </FormItem>
                <FormItem label="最大限制" prop="maximumLimit">
                    <Input v-model="formItem.maximumLimit" style="width: 200px; margin-right: 10px;" placeholder="请输入最大限制" number></Input>
                    <Checkbox v-model="formItem.everydayAstrict" :true-value="2" :false-value="1">使用每日限制</Checkbox>
                </FormItem>
                <FormItem label="注册奖励" prop="registReward">
                    <Input v-model="formItem.registReward" style="width:200px" placeholder="请输入注册奖励" number></Input>
                </FormItem>
                <FormItem label="邀请奖励" prop="inviteReward">
                    <Input v-model="formItem.inviteReward" style="width:200px" placeholder="请输入邀请奖励"></Input>
                </FormItem>
                <FormItem label="是否需要实名认证" prop="needCertification">
                    <Checkbox v-model="formItem.needCertification" :true-value="2" :false-value="1">需要实名认证</Checkbox>
                </FormItem>
                <FormItem label="用户最大邀请人数" prop="maxInviteReward">
                    <Input v-model="formItem.maxInviteReward" style="width:200px" placeholder="请输入每个用户最大邀请人数"></Input>
                </FormItem>
                <FormItem label="开启状态" prop="isOpen">
                    <i-switch size="large" v-model="formItem.isOpen" :true-value="1" :false-value="0">
                        <span slot="open">上架</span>
                        <span slot="close">下架</span>
                    </i-switch>
                </FormItem>
                <FormItem label="活动开始时间" prop="startTime">
                    <DatePicker v-model="startDateObj" format="yyyy-MM-dd HH:mm:ss" placement="top-start" :editable="false" @on-change="setStartDateVal" type="datetime" placeholder="请选择开始时间" style="width: 180px"></DatePicker>
                </FormItem>
                <FormItem label="活动结束时间" prop="endTime">
                    <DatePicker v-model="endDateObj" format="yyyy-MM-dd HH:mm:ss" placement="top-start" :editable="false" @on-change="setEndDateVal" type="datetime" placeholder="请选择结束时间" style="width: 180px"></DatePicker>
                </FormItem>
                <FormItem label="备注" prop="remark">
                    <Input v-model="formItem.remark" type="textarea" :rows="4" placeholder="请输入备注信息" style="width:300px"></Input>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button type="text" size="large" @click="handleReset">取消</Button>
                <Button type="primary" size="large" :loading="loading" @click="handleSubmit">确定</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import api from '@/api/activity'
    import axios from '@/axios/config'

    export default {
        name: 'registerList',
        props: {
            activityType: {
                required: true,
                type: Number
            }
        },
        data () {
            const number = (rule, value, callback) => {
                if (isNaN(value) || value < 0) {
                    callback(new Error('格式不正确，必须为大于等于0的数字'));
                }
                callback();
            };
            const numberPositive = (rule, value, callback) => {
                if (value < 0) {
                    callback(new Error('格式不正确，必须大于等于0'));
                }
                callback();
            };
            return {
                req_url: axios.defaults.baseURL,
                tableColumns: [
                    {
                        title: '活动类型',
                        key: 'activityType',
                        render: (h, params) => {
                            return h('span', this.activitiesArr[params.row.activityType - 1]);
                        }
                    },
                    {
                        title: '活动名称',
                        key: 'activityName'
                    },
                    {
                        title: '赠送币种',
                        key: 'keyEn'
                    },
                    {
                        title: '出账人账户',
                        key: 'outAccount'
                    },
                    {
                        title: '活动最大限制',
                        key: 'maximumLimit'
                    },
                    {
                        title: '注册奖励',
                        key: 'registReward'
                    },
                    {
                        title: '邀请奖励',
                        key: 'inviteReward'
                    },
                    {
                        title: '用户最大邀请人数',
                        key: 'maxInviteReward'
                    },
                    {
                        title: '状态',
                        key: 'isOpen',
                        render: (h, params) => {
                            return h('span', params.row.isOpen === 0 ? '已下架' : '上架中');
                        }
                    },
                    {
                        title: '活动开始时间',
                        key: 'startTime',
                        render: (h, params) => {
                            return h('span', params.row.startTime ? params.row.startTime.split('.')[0] : '-');
                        }
                    },
                    {
                        title: '活动结束时间',
                        key: 'endTime',
                        render: (h, params) => {
                            return h('span', params.row.endTime ? params.row.endTime.split('.')[0] : '-');
                        }
                    },
                    {
                        title: '备注',
                        key: 'remark'
                    },
                    {
                        title: '操作',
                        render: (h, params) => {
                            return h('div', {
                                style: {
                                    paddingBottom: '5px'
                                }
                            }, [
                                this.g_perm('edit') ? h('Button', {
                                    props: {
                                        type: 'primary',
                                        size: 'small',
                                        disabled: params.row.isOpen === 1
                                    },
                                    style: {
                                        marginTop: '5px',
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.showEditModal(params.row, 1);
                                        }
                                    }
                                }, '编辑') : '',
                                this.g_perm('up') ? h('Button', {
                                    props: {
                                        type: 'success',
                                        size: 'small',
                                        disabled: params.row.isOpen === 1
                                    },
                                    style: {
                                        marginTop: '5px',
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.setOpenStatus(params.row, 1);
                                        }
                                    }
                                }, '上架') : '',
                                this.g_perm('down') ? h('Button', {
                                    props: {
                                        type: 'error',
                                        size: 'small',
                                        disabled: params.row.isOpen === 0
                                    },
                                    style: {
                                        marginTop: '5px',
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.setOpenStatus(params.row, 0);
                                        }
                                    }
                                }, '下架') : ''
                            ]);
                        }
                    }
                ],
                tableData: [],
                modalStatus: false,
                modalTitle: '添加',
                startDateObj: '',
                endDateObj: '',
                activitiesArr: ['注册', '充值', '红包', '交易'],
                statusList: [
                    {
                        value: -1,
                        label: '全部'
                    },
                    {
                        value: 1,
                        label: '上架中'
                    },
                    {
                        value: 0,
                        label: '已下架'
                    }
                ],
                activitiesStatus: -1,
                activitiesName: '',
                fundsList: [], // 所有可赠送币种
                formItem: {
                    id: '',
                    activityName: '',
                    fundsType: '',
                    outAccount: '',
                    maximumLimit: '',
                    everydayAstrict: 1, // 默认不需要
                    registReward: '',
                    inviteReward: '',
                    maxInviteReward: '',
                    needCertification: 1,
                    isOpen: 1,
                    startTime: '',
                    endTime: '',
                    remark: ''
                },
                ruleValidate: {
                    activityName: [
                        {required: true, message: '请输入活动名称', trigger: 'blur'}
                    ],
                    fundsType: [
                        {required: true, type: 'number', message: '请选择赠送币种', trigger: 'change'}
                    ],
                    outAccount: [
                        {required: true, message: '请输入出账人账户', trigger: 'blur'}
                    ],
                    maximumLimit: [
                        {required: true, type: 'number', message: '请输入最大限制', trigger: 'blur'},
                        {validator: numberPositive, trigger: 'blur'}
                    ],
                    registReward: [
                        {required: true, type: 'number', message: '请输入注册奖励', trigger: 'blur'},
                        {validator: numberPositive, trigger: 'blur'}
                    ],
                    inviteReward: [
                        {required: false, message: '请输入邀请奖励', trigger: 'blur'},
                        {validator: number, trigger: 'blur'}
                    ],
                    maxInviteReward: [
                        {required: false, message: '请输入每个用户最大邀请人数', trigger: 'blur'},
                        {validator: number, trigger: 'blur'}
                    ],
                    startTime: [
                        {required: true, message: '请选择开始时间', trigger: 'change'}
                    ],
                    endTime: [
                        {required: true, message: '请选择结束时间', trigger: 'change'}
                    ],
                    remark: [
                        {required: true, message: '请输入备注信息', trigger: 'blur'}
                    ]
                },
                loading: false,
                editType: 0, // 编辑类型 0添加 1编辑
                pageNum: 1,
                pageSize: 10,
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
                        if (this.startDateObj.valueOf() >= this.endDateObj.valueOf()) {
                            this.$Message.warning('活动结束时间必须大于开始时间！');
                            return;
                        }

                        this.submitRequest();
                    }
                });
            },
            handleReset () {
                this.startDateObj = '';
                this.endDateObj = '';

                this.formItem.id = '';
                this.formItem.isOpen = 1;

                this.$refs.formItem.resetFields();

                this.modalStatus = false;
            },
            submitRequest () {
                let params = {
                    activityType: this.activityType
                }
                let obj = Object.assign(params, this.formItem);

                if (this.editType == 0) {
                    this.loading = true;
                    api.addActivities(obj).then((res) => {
                        this.loading = false;
                        if (res.data.code == 1) {
                            this.$Message.success('新增成功！');
                            this.handleReset();
                            // 提交成功重新获取
                            this.getListData();
                        }
                    });
                } else if (this.editType == 1) {
                    this.loading = true;
                    api.updateActivities(obj).then((res) => {
                        this.loading = false;
                        if (res.data.code == 1) {
                            this.$Message.success('编辑成功！');
                            this.handleReset();
                            // 提交成功重新获取
                            this.getListData();
                        }
                    });
                }
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
            findData () {
                // 重置页码
                this.pageNum = 1;
                this.total = 0;

                this.getListData();
            },
            getListData () {
                let params = {
                    activityType: this.activityType,
                    activityName: this.activitiesName,
                    isOpen: this.activitiesStatus === -1 ? '' : this.activitiesStatus,
                    pageIndex: this.pageNum,
                    pageSize: this.pageSize
                }
                api.filterActivitiesList(params).then((res) => {
                    if (res.data.code == 1) {
                        this.tableData = res.data.data.datas;
                        this.total = res.data.data.total;
                    }
                });
            },
            showEditModal (currRow, type) {
                this.editType = type;
                if (type == 0) {
                    this.modalTitle = '新增注册活动';

                    // 添加
                    this.setFormItem();
                } else if (type == 1) {
                    this.modalTitle = '编辑注册活动';

                    // 赋值表单
                    this.setFormItem(currRow);
                }

                this.modalStatus = true;
            },
            setOpenStatus (currRow, status) {
                // 赋值表单
                // this.setFormItem(currRow);
                // this.formItem.isOpen = status;

                // 提交修改
                let params = {
                    activityType: this.activityType,
                    id: currRow.id,
                    isOpen: status
                }
                let obj = Object.assign(params, {});
                api.operateActivities(obj).then((res) => {
                    if (res.data.code == 1) {
                        if (status === 1) {
                            this.$Message.success('已上架！');
                        } else {
                            this.$Message.success('已下架！');
                        }
                        // this.formItem.id = '';
                        // this.$refs.formItem.resetFields();
                        // 提交成功重新获取
                        this.getListData();
                    }
                });
            },
            setFormItem (row) {
                if (row) {
                    this.formItem.id = row.id;
                    this.formItem.activityName = row.activityName;
                    this.formItem.fundsType = row.fundsType;
                    this.formItem.outAccount = row.outAccount;
                    this.formItem.maximumLimit = row.maximumLimit;
                    this.formItem.everydayAstrict = parseInt(row.everydayAstrict);
                    this.formItem.registReward = row.registReward;
                    this.formItem.needCertification = parseInt(row.needCertification);
                    this.formItem.inviteReward = row.inviteReward === null ? '' : row.inviteReward + '';
                    this.formItem.maxInviteReward = row.maxInviteReward === null ? '' : row.maxInviteReward + '';
                    this.formItem.isOpen = row.isOpen;
                    this.formItem.remark = row.remark;

                    this.formItem.startTime = row.startTime.split('.')[0];
                    this.startDateObj = row.startTime.split('.')[0];

                    this.formItem.endTime = row.endTime.split('.')[0];
                    this.endDateObj = row.endTime.split('.')[0];
                }
            },
            setStartDateVal (formatDate) {
                this.formItem.startTime = formatDate;
            },
            setEndDateVal (formatDate) {
                this.formItem.endTime = formatDate;
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
            // 获取币种列表
            this.getFundsList();
        },
        mounted () {
        }
    };
</script>
