<style lang="less" scoped>
    @import '../../../../styles/common.less';
    @import 'rewardList.less';
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
        <div style="position: relative;"><Page class="pages" :current="pageNum" :total="total" show-elevator show-sizer :page-size="pageSize" :page-size-opts="sizeOpts" @on-change="changePageNum" @on-page-size-change="changePageSize"></Page></div>
        <Modal v-model="modalStatus" :title="modalTitle" width="600" @on-cancel="handleReset" :mask-closable="false" :styles="{top: '80px', bottom: '100px', overflow: 'auto'}">
            <Form ref="formItem" :model="formItem" :label-width="120" :rules="ruleValidate">
                <FormItem label="活动名称" prop="activityName">
                    <Input v-model.trim="formItem.activityName" style="width:200px" placeholder="请输入活动名称"></Input>
                </FormItem>
                <FormItem label="发奖账号" prop="outAccount">
                    <Input v-model.trim="formItem.outAccount" style="width:200px" placeholder="请输入发奖账号"></Input>
                </FormItem>
                <FormItem label="赠送币种" prop="fundsType">
                    <Select v-model="formItem.fundsType" filterable label-in-value @on-change="setCheckedFunds" style="width:200px" placeholder="请选择赠送币种">
                        <Option v-for="item in fundsList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                    </Select>
                </FormItem>
                <FormItem label="最大限制" prop="maximumLimit">
                    <Input v-model="formItem.maximumLimit" style="width: 200px; margin-right: 10px;" placeholder="请输入最大限制" number></Input>
                    <Checkbox v-model="formItem.everydayAstrict" :true-value="2" :false-value="1">使用每日限制</Checkbox>
                </FormItem>
                <FormItem label="奖励条件">
                    <RadioGroup v-model="formItem.awardCondition">
                        <Radio label="1" style="margin-right: 15px;">每日首次登录可抽</Radio>
                        <Radio label="2">仅第一次登录可抽</Radio>
                    </RadioGroup>
                </FormItem>
                <FormItem label="活动投放">
                    <CheckboxGroup v-model="formItem.activityRelease">
                        <Checkbox label="1" disabled>APP</Checkbox>
                        <Checkbox label="2" disabled>WEB</Checkbox>
                    </CheckboxGroup>
                </FormItem>
                <!--红包图标-->
                <div class="uploadblock" style="margin-bottom: 15px;">
                    <label class="upload-label" style="width: 120px;">红包图标</label>
                    <div class="demo-upload-list" v-for="item in uploadList2">
                        <template v-if="item.status === 'finished'">
                            <img :src="item.url">
                            <div class="demo-upload-list-cover">
                                <Icon type="ios-eye-outline" @click.native="handleView(item.url)"></Icon>
                                <Icon type="ios-trash-outline" @click.native="handleRemove2(item)"></Icon>
                            </div>
                        </template>
                        <template v-else>
                            <Progress v-if="item.showProgress" :percent="item.percentage" hide-info></Progress>
                        </template>
                    </div>
                    <Upload v-show="uploadList2.length === 0"
                            ref="upload2"
                            :show-upload-list="false"
                            :on-success="handleSuccess2"
                            :format="['jpg','jpeg','png']"
                            :max-size="100"
                            :on-format-error="handleFormatError"
                            :on-exceeded-size="handleMaxSize"
                            :before-upload="handleBeforeUpload2"
                            type="drag"
                            :action="req_url + 'fileUpload'"
                            style="display: inline-block;width:100px;">
                        <div style="height:58px; padding: 10px 0;">
                            <Icon type="camera" size="20"></Icon>
                            <span class="up-tip">请上传红包图标</span>
                        </div>
                    </Upload>
                </div>
                <!--分享图标-->
                <div class="uploadblock" style="margin-bottom: 15px;">
                    <label class="upload-label" style="width: 120px;">分享图标</label>
                    <div class="demo-upload-list" v-for="item in uploadList1">
                        <template v-if="item.status === 'finished'">
                            <img :src="item.url">
                            <div class="demo-upload-list-cover">
                                <Icon type="ios-eye-outline" @click.native="handleView(item.url)"></Icon>
                                <Icon type="ios-trash-outline" @click.native="handleRemove1(item)"></Icon>
                            </div>
                        </template>
                        <template v-else>
                            <Progress v-if="item.showProgress" :percent="item.percentage" hide-info></Progress>
                        </template>
                    </div>
                    <Upload v-show="uploadList1.length === 0"
                            ref="upload1"
                            :show-upload-list="false"
                            :on-success="handleSuccess1"
                            :format="['jpg','jpeg','png']"
                            :max-size="50"
                            :on-format-error="handleFormatError"
                            :on-exceeded-size="handleMaxSize"
                            :before-upload="handleBeforeUpload1"
                            type="drag"
                            :action="req_url + 'fileUpload'"
                            style="display: inline-block;width:100px;">
                        <div style="height:58px; padding: 10px 0;">
                            <Icon type="camera" size="20"></Icon>
                            <span class="up-tip">请上传分享图标</span>
                        </div>
                    </Upload>
                </div>
                <FormItem label="分享标题" prop="appShareTitle">
                    <Input v-model="formItem.appShareTitle" style="width:200px" placeholder="请输入分享标题"></Input>
                </FormItem>
                <FormItem label="分享内容" prop="appShareBody">
                    <Input v-model="formItem.appShareBody" type="textarea" :rows="4" placeholder="请输入分享内容" style="width:300px"></Input>
                </FormItem>
                <FormItem label="红包金额">
                    <Input v-model="redbag" style="width:150px" placeholder="请输入红包金额"></Input>
                    <Button icon="ios-plus-empty" type="info" size="small" @click="handleBagAdd">添加红包金额</Button>
                    <p class="p-tip">添加多个红包时多个红包将随机发放</p>
                    <div style="padding: 0 10px 10px 0;">
                        <span v-if="formItem.envelopeAmount.length === 0">暂未添加金额</span>
                        <Tag v-for="(item,index) in formItem.envelopeAmount" color="red" :key="item" :name="item" :fade="false" closable @on-close="handleBagClose">红包{{index + 1}}：{{item}} {{currFundName}}</Tag>
                    </div>
                </FormItem>
                <FormItem label="奖励类型" prop="awardType">
                    <Select v-model="formItem.awardType" style="width:200px" placeholder="请选择奖励类型">
                        <Option v-for="item in awardTypeList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                    </Select>
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
            </Form>
            <div slot="footer">
                <Button type="text" size="large" @click="handleReset">取消</Button>
                <Button type="primary" size="large" :loading="loading" @click="handleSubmit">确定</Button>
            </div>
        </Modal>
        <!--预览图片-->
        <Modal title="预览" width="800" v-model="visible" class="viewimg">
            <img :src="imgUrl" v-if="visible" style="max-width: 100%;">
        </Modal>
    </div>
</template>

<script>
    import api from '@/api/activity'
    import axios from '@/axios/config'

    export default {
        name: 'rewardList',
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
                        title: '发奖账号',
                        key: 'outAccount'
                    },
                    {
                        title: '赠送币种',
                        key: 'keyEn'
                    },
                    {
                        title: '最大限制',
                        key: 'maximumLimit'
                    },
                    {
                        title: '奖励条件',
                        key: 'awardCondition',
                        render: (h, params) => {
                            return h('span', params.row.awardCondition == '1' ? '每日首次登录可抽' : '仅第一次登录可抽');
                        }
                    },
                    {
                        title: '活动投放',
                        key: 'activityRelease',
                        render: (h, params) => {
                            return h('span', params.row.activityRelease == '1' ? 'APP' : 'WEB');
                        }
                    },
                    {
                        title: '红包图标',
                        key: 'envelopeImg',
                        width: 90,
                        render: (h, params) => {
                            return h('img', {
                                attrs: {
                                    'src': params.row.envelopeImg,
                                    'width': 50,
                                    'height': 50
                                }
                            });
                        }
                    },
                    {
                        title: '分享图标',
                        key: 'appShareIcon',
                        width: 90,
                        render: (h, params) => {
                            return h('img', {
                                attrs: {
                                    'src': params.row.appShareIcon,
                                    'width': 50,
                                    'height': 50
                                }
                            });
                        }
                    },
                    {
                        title: '分享标题',
                        key: 'appShareTitle'
                    },
                    {
                        title: '分享内容',
                        key: 'appShareBody'
                    },
                    {
                        title: '红包金额',
                        key: 'envelopeAmount'
                    },
                    {
                        title: '奖励类型',
                        key: 'awardType',
                        render: (h, params) => {
                            return h('span', params.row.awardType == 1 ? '可用' : (params.row.awardType == 2 ? '冻结' : '半冻结半可用'));
                        }
                    },
                    {
                        title: '状态',
                        key: 'isOpen',
                        render: (h, params) => {
                            return h('span', params.row.isOpen === 1 ? '上架中' : '已下架');
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
                awardTypeList: [
                    {
                        value: 1,
                        label: '可用'
                    },
                    // {
                    //     value: 2,
                    //     label: '冻结'
                    // },
                    // {
                    //     value: 3,
                    //     label: '半冻结半可用'
                    // }
                ],
                activitiesStatus: -1,
                activitiesName: '',
                fundsList: [], // 所有可赠送币种
                redbag: '', // 红包金额
                currFundName: '', // 当前选中币种名称
                formItem: {
                    id: '',
                    activityName: '',
                    outAccount: '',
                    fundsType: '',
                    maximumLimit: '',
                    everydayAstrict: 1,
                    awardCondition: '1', // 奖励条件默认 1
                    activityRelease: ['1'], // 活动投放平台 1:app, 2:web
                    envelopeImg: '',
                    appShareIcon: '',
                    appShareTitle: '',
                    appShareBody: '',
                    envelopeAmount: [], // 红包金额，处理成逗号拼接
                    awardType: 1,
                    isOpen: 1,
                    startTime: '',
                    endTime: ''
                },
                ruleValidate: {
                    activityName: [
                        {required: true, message: '请输入活动名称', trigger: 'blur'}
                    ],
                    outAccount: [
                        {required: true, message: '请输入发奖账号', trigger: 'blur'}
                    ],
                    fundsType: [
                        {required: true, type: 'number', message: '请选择赠送币种', trigger: 'change'}
                    ],
                    maximumLimit: [
                        {required: true, type: 'number', message: '请输入最大限制', trigger: 'blur'},
                        {validator: numberPositive, trigger: 'blur'}
                    ],
                    appShareTitle: [
                        {required: true, max: 50, message: '请输入50字以内的分享标题', trigger: 'blur'}
                    ],
                    appShareBody: [
                        {required: true, max: 100, message: '请输入100字以内的分享内容', trigger: 'blur'}
                    ],
                    awardType: [
                        {required: true, type: 'number', message: '请选择奖励类型', trigger: 'change'}
                    ],
                    startTime: [
                        {required: true, message: '请选择开始时间', trigger: 'change'}
                    ],
                    endTime: [
                        {required: true, message: '请选择结束时间', trigger: 'change'}
                    ]
                },
                loading: false,
                editType: 0, // 编辑类型 0添加 1编辑
                pageNum: 1,
                pageSize: 10,
                total: 0, // 总页数
                sizeOpts: [10, 20, 50, 100],
                // 上传图片
                imgUrl: '',
                visible: false,
                uploadList1: [],
                uploadList2: []
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
                        if (!this.formItem.envelopeImg) {
                            this.$Message.warning('请上传红包图标！');
                            return;
                        }
                        if (!this.formItem.appShareIcon) {
                            this.$Message.warning('请上传分享图标！');
                            return;
                        }
                        if (this.formItem.envelopeAmount.length === 0) {
                            this.$Message.warning('请添加红包金额！');
                            return;
                        }
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
                this.formItem.envelopeAmount = [];
                this.formItem.awardCondition = '1';
                this.formItem.activityRelease = ['1'];
                this.formItem.isOpen = 1;

                this.$refs.formItem.resetFields();

                this.modalStatus = false;

                this.formItem.appShareIcon = '';
                this.$refs.upload1.fileList.splice(0, 1);
                this.$refs.upload2.fileList.splice(0, 1);
            },
            submitRequest () {
                let params = {
                    activityType: this.activityType
                }
                let obj = Object.assign(params, this.formItem);
                obj.activityRelease = obj.activityRelease.join(',');
                obj.envelopeAmount = obj.envelopeAmount.join(',');

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
                    this.modalTitle = '新增红包活动';

                    // 添加
                    this.setFormItem();
                } else if (type == 1) {
                    this.modalTitle = '编辑红包活动';

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
                    this.formItem.outAccount = row.outAccount;
                    this.formItem.fundsType = row.fundsType;
                    this.formItem.maximumLimit = row.maximumLimit;
                    this.formItem.everydayAstrict = parseInt(row.everydayAstrict);
                    this.formItem.awardCondition = row.awardCondition + '';
                    this.formItem.activityRelease = row.activityRelease.toString().split(',');
                    this.formItem.envelopeImg = row.envelopeImg;
                    this.formItem.appShareIcon = row.appShareIcon;
                    this.formItem.appShareTitle = row.appShareTitle;
                    this.formItem.appShareBody = row.appShareBody;
                    this.formItem.envelopeAmount = row.envelopeAmount ? row.envelopeAmount.toString().split(',') : [];
                    this.formItem.awardType = row.awardType;
                    this.formItem.isOpen = row.isOpen;

                    this.formItem.startTime = row.startTime.split('.')[0];
                    this.startDateObj = row.startTime.split('.')[0];

                    this.formItem.endTime = row.endTime.split('.')[0];
                    this.endDateObj = row.endTime.split('.')[0];

                    // 显示已上传图片
                    let obj1 = {};
                    obj1.status = 'finished';
                    obj1.url = this.formItem.appShareIcon;
                    this.uploadList1[0] = obj1;

                    let obj2 = {};
                    obj2.status = 'finished';
                    obj2.url = this.formItem.envelopeImg;
                    this.uploadList2[0] = obj2;
                }
            },
            // 下拉选择
            setCheckedFunds (item) {
                this.currFundName = item.label;
            },
            // 添加红包
            handleBagAdd () {
                if (!isNaN(this.redbag) && this.redbag > 0) {
                    this.formItem.envelopeAmount.push(this.redbag);
                    this.redbag = '';
                } else {
                    this.$Message.warning('红包金额不正确！');
                }
            },
            // 删除红包金额
            handleBagClose (event, name) {
                let index = this.formItem.envelopeAmount.indexOf(name);
                this.formItem.envelopeAmount.splice(index, 1);
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
            },
            // 上传图片相关
            handleView (imgUrl) {
                this.imgUrl = imgUrl;
                this.visible = true;
            },
            handleRemove1 (file) {
                const fileList = this.$refs.upload1.fileList;
                this.$refs.upload1.fileList.splice(fileList.indexOf(file), 1);
                this.formItem.appShareIcon = '';
            },
            handleRemove2 (file) {
                const fileList = this.$refs.upload2.fileList;
                this.$refs.upload2.fileList.splice(fileList.indexOf(file), 1);
                this.formItem.envelopeImg = '';
            },
            handleSuccess1 (res, file) {
                file.url = res.data;
                this.formItem.appShareIcon = res.data;
            },
            handleSuccess2 (res, file) {
                file.url = res.data;
                this.formItem.envelopeImg = res.data;
            },
            handleFormatError (file) {
                this.$Notice.warning({
                    title: '文件格式不正确',
                    desc: '文件 ' + file.name + ' 格式不正确，请选择 jpg 或者 png 格式。'
                });
            },
            handleMaxSize (file) {
                this.$Notice.warning({
                    title: '超出文件大小限制',
                    desc: '文件：' + file.name + ' 过大，红包图标不能超过 100kb，分享图标不能超过 50kb'
                });
            },
            handleBeforeUpload1 () {
                const check = this.uploadList1.length < 1;
                if (!check) {
                    this.$Notice.warning({
                        title: '最多可以上传1张照片。'
                    });
                }
                return check;
            },
            handleBeforeUpload2 (file) {
                const check = this.uploadList2.length < 1;
                if (!check) {
                    this.$Notice.warning({
                        title: '最多可以上传1张照片。'
                    });
                    return check;
                } else {
                    return this.checkImageSize(file, 166, 166);
                }
            },
            // 校验图片尺寸大小(返回promise)
            checkImageSize (file, width, height) {
                return new Promise((resolve, reject) => {
                    let filereader = new FileReader();
                    filereader.readAsDataURL(file);
                    filereader.onload = ev => {
                        // console.log(ev)
                        let src = ev.target.result;
                        const image = new Image();
                        image.src = src;
                        image.onerror = reject;
                        image.onload = ev2 => {
                            // console.log(ev2)
                            if (width && image.width !== width) {
                                this.$Notice.warning({
                                    title: '请上传尺寸为' + width + 'x' + height + '的图片'
                                });
                                reject();
                            } else if (height && image.height !== height) {
                                this.$Notice.warning({
                                    title: '请上传尺寸为' + width + 'x' + height + '的图片'
                                });
                                reject();
                            } else {
                                resolve();
                            }
                        };
                    };
                });
            }
        },
        created () {
            this.getListData();
            // 获取币种列表
            this.getFundsList();
        },
        mounted () {
            this.uploadList1 = this.$refs.upload1.fileList;
            this.uploadList2 = this.$refs.upload2.fileList;
        }
    };
</script>
