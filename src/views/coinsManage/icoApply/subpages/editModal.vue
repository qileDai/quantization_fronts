<style lang="less" scoped>
    @import '../../../../styles/common.less';
    @import 'editModal.less';
</style>

<template>
    <div class="content">
        <Modal v-model="modalStatus" :title="modalTitle" width="1000" @on-cancel="handleReset" :mask-closable="false" :closable="false">
            <p class="close-icon" @click="handleReset"><Icon type="ios-close-empty" size="30"></Icon></p>
            <Form ref="formItem" class="inlineform" :model="formItem" :label-width="120" :rules="ruleValidate">
                <h3 class="formitem-title">项目方基本信息</h3>
                <FormItem label="序号" prop="sort" class="inline-item">
                    <Input v-model="formItem.sort" placeholder="请输入序号（数字）"></Input>
                </FormItem>
                <br>
                <FormItem label="币种全称" prop="coinFullName" class="inline-item">
                    <Input v-model="formItem.coinFullName" placeholder="请输入在首页显示的项目名称"></Input>
                </FormItem>
                <FormItem label="币种简称" prop="coinName" class="inline-item">
                    <Input v-model="formItem.coinName" placeholder="请输入币种名称（字母）"></Input>
                </FormItem>
                <br>
                <FormItem label="核心算法" prop="coreAlgorithm" class="inline-item">
                    <Input v-model="formItem.coreAlgorithm" placeholder="请输入项目核心算法"></Input>
                </FormItem>
                <FormItem label="发布日期" prop="releasseDate" class="inline-item">
                    <DatePicker v-model="release_time" format="yyyy-MM-dd" :editable="false" @on-change="setReleaseDate" type="date" placeholder="请选择发布日期" style="width: 180px"></DatePicker>
                </FormItem>
                <br>
                <FormItem label="官网地址" prop="website" class="inline-item">
                    <Input v-model.trim="formItem.website" placeholder="请输入项目官网地址"></Input>
                </FormItem>
                <FormItem label="白皮书地址" prop="whiteBook" class="inline-item">
                    <Input v-model.trim="formItem.whiteBook" placeholder="请输入白皮书地址"></Input>
                </FormItem>
                <br>
                <FormItem label="区块查询地址" prop="blockSearch" class="inline-item">
                    <Input v-model.trim="formItem.blockSearch" placeholder="请输入区块查询地址"></Input>
                </FormItem>
                <FormItem label="项目链" prop="projectChain" class="inline-item">
                    <Input v-model="formItem.projectChain" placeholder="例如ERC20/公链/?"></Input>
                </FormItem>
                <br>
                <FormItem label="发行总量" prop="totalNumber" class="inline-item">
                    <Input v-model="formItem.totalNumber" placeholder="请输入项目的发行总量"></Input>
                </FormItem>
                <FormItem label="流通总量" prop="publishNumber" class="inline-item">
                    <Input v-model="formItem.publishNumber" placeholder="请输入项目的流通总量"></Input>
                </FormItem>
                <br>
                <FormItem label="发行市值" prop="marketValue" class="inline-item">
                    <Input v-model="formItem.marketValue" number placeholder="请输入开放交易时计划的定价"></Input>
                </FormItem>
                <FormItem label="区块时间" prop="blockTime" class="inline-item">
                    <Input v-model="formItem.blockTime" placeholder="挖出一个区块所需时间"></Input>
                </FormItem>
                <br>
                <FormItem label="持币用户数" prop="hasUser" class="inline-item">
                    <Input v-model="formItem.hasUser" placeholder="请输入持币用户数"></Input>
                </FormItem>
                <FormItem label="区块奖励" prop="blockRewards" class="inline-item">
                    <Input v-model="formItem.blockRewards" placeholder="每个区块被挖出后可获得的奖励"></Input>
                </FormItem>
                <br>
                <FormItem label="募集资金总额" prop="placement" class="inline-item">
                    <Input v-model="formItem.placement" placeholder="请输入项目募集资金总额"></Input>
                </FormItem>
                <FormItem label="是否Github开源">
                    <RadioGroup v-model="formItem.isGitHub">
                        <Radio label="1" style="margin-right: 15px;">是</Radio>
                        <Radio label="0">否</Radio>
                    </RadioGroup>
                </FormItem>
                <FormItem label="是否首发">
                    <RadioGroup v-model="formItem.isFirstPub">
                        <Radio label="1" style="margin-right: 15px;">是</Radio>
                        <Radio label="0">否</Radio>
                    </RadioGroup>
                </FormItem>

                <FormItem label="钱包商户类型">
                    <RadioGroup v-model="formItem.walletType">
                        <Radio label="1" style="margin-right: 15px;">bitbank</Radio>
                        <Radio label="2">战狼coinlink</Radio>
                    </RadioGroup>
                </FormItem>

                <FormItem label="筹码分布比例" prop="cyq">
                    <Input v-model="formItem.cyq" type="textarea" :autosize="{minRows: 3,maxRows: 5}" placeholder="例如：团队：30%，私募：10%，公募：50%，基金：10%" style="width: 510px;"></Input>
                </FormItem>
                <FormItem label="社群及人数" prop="community">
                    <Input v-model="formItem.community" type="textarea" :autosize="{minRows: 3,maxRows: 5}" placeholder="填写格式：telegram：人数，QQ群：人数，微信群：人数" style="width: 510px;"></Input>
                </FormItem>
                <FormItem label="项目简介" prop="coinDes">
                    <Input v-model="formItem.coinDes" type="textarea" :autosize="{minRows: 3,maxRows: 5}" placeholder="请输入2000字以内的项目简介" style="width: 510px;"></Input>
                </FormItem>
                <FormItem label="计划开放交易对">
                    <CheckboxGroup v-model="formItem.planCoins">
                        <Checkbox :label="item" v-for="item in marketList">{{formItem.coinName ? formItem.coinName.toUpperCase() : '-'}}/{{item}}</Checkbox>
                        <!-- <Checkbox label="ETH">{{formItem.coinName ? formItem.coinName.toUpperCase() : '-'}}/ETH</Checkbox>
                        <Checkbox label="BTC">{{formItem.coinName ? formItem.coinName.toUpperCase() : '-'}}/BTC</Checkbox>
                        <Checkbox label="CNYT">{{formItem.coinName ? formItem.coinName.toUpperCase() : '-'}}/CNYT</Checkbox>
                        <Checkbox label="USDT">{{formItem.coinName ? formItem.coinName.toUpperCase() : '-'}}/USDT</Checkbox> -->
                    </CheckboxGroup>
                </FormItem>
                <FormItem label="计划上线时间" prop="planTime">
                    <RadioGroup v-model="onlineTimeRadio">
                        <Radio label="0" style="margin-right: 30px;">未确定</Radio>
                        <Radio label="1">已确定</Radio>
                    </RadioGroup>
                    <span style="margin-left: 15px;" v-if="onlineTimeRadio == 1">上线日期：</span>
                    <DatePicker v-model="plan_time" v-if="onlineTimeRadio == 1" format="yyyy-MM-dd" :editable="false" @on-change="setDateVal" type="date" placeholder="请选择上线日期" style="width: 180px;"></DatePicker>
                </FormItem>
                <h3 class="formitem-title">联系人信息</h3>
                <FormItem label="项目联系人" prop="userName">
                    <Input v-model="formItem.userName" placeholder="请输入项目联系人" style="width: 300px;"></Input>
                </FormItem>
                <p class="formtip">联系方式 <span>（以下两种联系方式至少填写其中一种）</span></p>
                <FormItem label="手机号码" prop="userTel">
                    <Input v-model="formItem.userTel" ref="userTel" placeholder="请输入联系电话" style="width: 300px;"></Input>
                </FormItem>
                <FormItem label="SKYPE" prop="userSkype">
                    <Input v-model="formItem.userSkype" ref="userSkype" placeholder="请输入联系Skype" style="width: 300px;"></Input>
                </FormItem>
                <h3 class="formitem-title">项目文档</h3>
                <div class="uploads">
                    <!--上传上币申请表-->
                    <!--<div class="uploadblock">
                        <label class="upload-label" style="width: 90px;">上币申请表</label>
                        <Upload ref="upload1"
                                :show-upload-list="true"
                                :on-remove="handleRemove1"
                                :on-success="handleSuccess1"
                                :format="['xlsx']"
                                :max-size="2048"
                                :on-format-error="handleFormatError1"
                                :on-exceeded-size="handleMaxSize"
                                :before-upload="handleBeforeUpload1"
                                type="drag"
                                :action="req_url + 'fileUpload'"
                                style="display: inline-block;width:100px;">
                            <div style="height:58px; padding: 10px 0;">
                                <Icon type="android-upload" size="20"></Icon>
                                <span class="up-tip" v-if="this.formItem.projectExcel">更新上币申请表</span>
                                <span class="up-tip" v-else>请上传上币申请表</span>
                            </div>
                        </Upload>
                    </div>-->
                    <!--上传logo-->
                    <div class="uploadblock">
                        <label class="upload-label" style="width: 90px;">币种logo</label>
                        <Upload ref="upload2"
                                :show-upload-list="true"
                                :on-remove="handleRemove2"
                                :on-success="handleSuccess2"
                                :format="['jpg','jpeg','png']"
                                :max-size="2048"
                                :on-format-error="handleFormatError2"
                                :on-exceeded-size="handleMaxSize"
                                :before-upload="handleBeforeUpload2"
                                type="drag"
                                :action="req_url + 'fileUpload'"
                                style="display: inline-block;width:100px;">
                            <div style="height:58px; padding: 10px 0;">
                                <Icon type="android-upload" size="20"></Icon>
                                <span class="up-tip" v-if="this.formItem.projectLogo">更新项目logo</span>
                                <span class="up-tip" v-else>请上传项目logo</span>
                            </div>
                        </Upload>
                    </div>
                </div>
                <FormItem label="谷歌验证码" prop="googleCode">
                    <Input v-model="formItem.googleCode" placeholder="请输入谷歌验证码" :maxlength="6" style="width: 200px;"></Input>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button type="text" size="large" @click="handleReset">取消</Button>
                <Button type="primary" size="large" @click="handleSubmit">确定</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import api from '@/api/coins'
    import axios from '@/axios/config'

    export default {
        name: 'editModal',
        props: {
            modalStatus: {
                required: true,
                type: Boolean,
                default: false
            },
            row: {
                required: true,
                type: Object,
                default: {}
            }
        },
        data () {
            const number1 = (rule, value, callback) => {
                if (this.formItem.totalNumber <= 0) {
                    callback(new Error('发行总量必须大于0'));
                }
                callback();
            };
            const number2 = (rule, value, callback) => {
                if (this.formItem.publishNumber <= 0) {
                    callback(new Error('流通总量必须大于0'));
                }
                callback();
            };
            const number3 = (rule, value, callback) => {
                if (this.formItem.marketValue <= 0) {
                    callback(new Error('发行市值必须大于0'));
                }
                callback();
            };
            const numberSort = (rule, value, callback) => {
                if (isNaN(value) || value < 0) {
                    callback(new Error('序号必须为大于等于0数字'));
                }
                callback();
            };
            const validator1 = (rule, value, callback) => {
                if (this.onlineTimeRadio == 1 && this.formItem.planTime == '') {
                    callback(new Error('请选择上线时间'));
                }
                callback();
            };
            const validator2 = (rule, value, callback) => {
                if (this.formItem.userTel == '' && this.formItem.userSkype == '') {
                    callback(new Error('请输入手机号码'));
                }
                callback();
            };
            const validator3 = (rule, value, callback) => {
                if (this.formItem.userTel == '' && this.formItem.userSkype == '') {
                    callback(new Error('请输入Skype'));
                }
                callback();
            };
            const number = (rule, value, callback) => {
                if (isNaN(value)) {
                    callback(new Error('格式不正确，必须为数字'));
                }
                callback();
            };
            const lens = (rule, value, callback) => {
                if (value.length > 2000) {
                    callback(new Error('长度过长，不超过2000个字'));
                }
                callback();
            };
            return {
                req_url: axios.defaults.baseURL,
                formItem: {
                    id: '',
                    sort: '', // 新增排序
                    coinFullName: '',
                    coreAlgorithm: '',
                    blockSearch: '',
                    releasseDate: '',
                    blockTime: '',
                    totalNumber: '',
                    publishNumber: '',
                    blockRewards: '',
                    coinDes: '',
                    whiteBook: '',
                    coinName: '',
                    planTime: '',
                    userName: '',
                    userTel: '',
                    userSkype: '',
                    planCoins: [], // 计划上线交易对 数组
                    projectExcel: '',
                    projectLogo: '',
                    // 谷歌验证码
                    googleCode: '',
                    // 新增字段
                    website: '',
                    isFirstPub: 0,
                    marketValue: '',
                    hasUser: '',
                    cyq: '',
                    placement: '',
                    projectChain: '',
                    isGitHub: 0,
                    community: '',

                    walletType: 2
                },
                plan_time: '',
                onlineTimeRadio: 0, // 计划上线时间 0不确定 1确定
                release_time: '',
                
                ruleValidate: {
                    sort: [
                        {required: true, message: '请输入序号（数字）', trigger: 'blur'},
                        {validator: numberSort, trigger: 'blur'}
                    ],
                    coinFullName: [
                        {required: true, message: '请输入在首页显示的项目名称', trigger: 'blur'}
                    ],
                    coinName: [
                        {required: true, message: '请输入币种名称(字母)', trigger: 'blur'}
                    ],
                    totalNumber: [
                        {required: true, message: '请输入项目的发行总量', trigger: 'blur'}
                    ],
                    publishNumber: [
                        {required: true, message: '请输入项目的流通总量', trigger: 'blur'}
                    ],
                    website: [
                        {required: true, type: 'url', message: '请输入项目官网地址', trigger: 'blur'}
                    ],
                    whiteBook: [
                        {required: true, type: 'url', message: '请输入白皮书地址', trigger: 'blur'}
                    ],
                    marketValue: [
                        {required: true, type: 'number', message: '请输入开放交易时计划的定价', trigger: 'blur'},
                        {validator: number3, trigger: 'blur'}
                    ],
                    projectChain: [
                        {required: true, message: '例如ERC20/公链/?', trigger: 'blur'}
                    ],
                    blockSearch: [
                        {required: true, type: 'url', message: '请输入区块查询地址', trigger: 'blur'}
                    ],
                    isGitHub: [
                        {required: true, message: '请选择是否Github开源', trigger: 'change'}
                    ],
                    isFirstPub: [
                        {required: true, message: '请选择是否首发', trigger: 'change'}
                    ],
                    coinDes: [
                        {required: true, message: '请输入项目简介', trigger: 'blur'},
                        {validator: lens, trigger: 'blur'}
                    ],
                    walletType: [
                        {required: true, message: '请选择钱包商户类型', trigger: 'change'}
                    ],
                    // planTime: [
                    //     {validator: validator1, trigger: 'change'}
                    // ],
                    userName: [
                        {required: true, message: '请输入项目联系人', trigger: 'blur'}
                    ],
                    // userTel: [
                    //     {validator: validator2, trigger: 'blur'}
                    // ],
                    // userSkype: [
                    //     {validator: validator3, trigger: 'blur'}
                    // ],
                    googleCode: [
                        {required: true, len: 6, message: '请输入6位数字的谷歌验证码', trigger: 'blur'},
                        {validator: number, trigger: 'blur'}
                    ]
                },
                editType: 0, // 编辑类型 0添加 1编辑
                // uploadList1: [],
                uploadList2: [],
                marketList:[]
            };
        },
        watch: {
            modalStatus (val, oldVal) {
                if (val) {
                    this.setFormItem(this.row);
                }
            }
        },
        computed: {
            modalTitle () {
                return this.row.coinName ? '编辑项目信息' : '新增项目信息';
            }
        },
        methods: {
            handleSubmit () {
                this.$refs.formItem.validate((valid) => {
                    if (valid) {
                        if (this.formItem.userTel === '' && this.formItem.userSkype === '') {
                            this.$Message.error('手机号码 和 SKYPE 请至少填写其中一种！');
                            this.$refs.userTel.focus();
                            return;
                        }
                        this.submitRequest();
                    }
                });
            },
            handleReset () {
                this.release_time = '';
                this.formItem.releasseDate = '';
                this.formItem.planCoins = [];
                this.plan_time = '';
                this.formItem.planTime = '';
                this.onlineTimeRadio = 0;

                this.formItem.id = '';
                this.formItem.projectExcel = '';
                this.formItem.projectLogo = '';
                
                this.$refs.formItem.resetFields();
                this.$emit('closeModal');
            },
            submitRequest () {
                let params = {
                }
                this.formItem.walletType = Number(this.formItem.walletType)
                let obj = Object.assign(params, this.formItem);
                // 计划开发交易对
                obj.planCoins = obj.planCoins.join(',');
                if (this.onlineTimeRadio == '0') {
                    obj.planTime = null;
                }
                if (this.editType == 0) {
                    api.addCoinProject(obj).then((res) => {
                        if (res.data.code == 1) {
                            this.$Message.success('新增成功');
                            this.handleReset();
                            // 提交成功重新获取
                            this.$parent.getListData();
                        }
                    });
                } else if (this.editType == 1) {
                    api.updateCoinInfo(obj).then((res) => {
                        if (res.data.code == 1) {
                            this.$Message.success('编辑成功');
                            this.handleReset();
                            // 提交成功重新获取
                            this.$parent.getListData();
                        }
                    });
                }
            },
            setFormItem (row) {
                if (row.hasOwnProperty('coinName')) {
                    this.editType = 1;
                    Object.keys(this.formItem).forEach((key, index) => {
                        if (row.hasOwnProperty(key)) {
                            if (key === 'releasseDate') {
                                this.release_time = row.releasseDate;
                                this.formItem.releasseDate = row.releasseDate;
                            } else if (key === 'planCoins') {
                                this.formItem.planCoins = row.planCoins ? row.planCoins.split(',') : [];
                            } else if (key === 'planTime') {
                                if (row.planTime) {
                                    this.plan_time = row.planTime.split('.')[0];
                                    this.formItem.planTime = row.planTime.split('.')[0];
                                    this.onlineTimeRadio = 1;
                                }
                            } else if (key === 'googleCode') {
                                // 排除谷歌字段
                                this.formItem.googleCode = '';
                            } else if (key === 'sort') {
                                // 转为字符串
                                this.formItem.sort = row.sort + '';
                            } else {
                                this.formItem[key] = row[key];
                            }
                        }
                    })
                } else {
                    this.editType = 0;
                }
            },
            setDateVal (formatDate) {
                this.formItem.planTime = formatDate;
            },
            setReleaseDate (formatDate) {
                this.formItem.releasseDate = formatDate;
            },
            // 上传图片相关
            handleRemove1 (file) {
                this.formItem.projectExcel = '';
            },
            handleRemove2 (file) {
                this.formItem.projectLogo = '';
            },
            handleSuccess1 (res, file) {
                this.formItem.projectExcel = res.data;
            },
            handleSuccess2 (res, file) {
                this.formItem.projectLogo = res.data;
            },
            handleFormatError1 (file) {
                this.$Notice.warning({
                    title: '文件格式不正确',
                    desc: '文件 ' + file.name + ' 格式不正确，请选择 xlsx 格式。'
                });
            },
            handleFormatError2 (file) {
                this.$Notice.warning({
                    title: '文件格式不正确',
                    desc: '文件 ' + file.name + ' 格式不正确，请选择 jpg 或者 png 格式。'
                });
            },
            handleMaxSize (file) {
                this.$Notice.warning({
                    title: '超出文件大小限制',
                    desc: '文件：' + file.name + ' 过大，不能超过 2M'
                });
            },
            handleBeforeUpload1 () {
                const check = this.uploadList1.length < 1;
                if (!check) {
                    this.$Notice.warning({
                        title: '最多可以上传 1 个文件。'
                    });
                }
                return check;
            },
            handleBeforeUpload2 () {
                const check = this.uploadList2.length < 1;
                if (!check) {
                    this.$Notice.warning({
                        title: '最多可以上传 1 张图片。'
                    });
                }
                return check;
            },
            //获取对应的市场
            getmarketList(){
                 api.getmarketList().then((res) => {
                    if (res.data.code == 1) {
                        for(let i=0 ;i<res.data.data.length; i++){ 
                            this.marketList.push(res.data.data[i].area)
                        }
                    }
                });
            }
        },
        created () {
            this.getmarketList();
        },
        mounted () {
            // this.uploadList1 = this.$refs.upload1.fileList;
            this.uploadList2 = this.$refs.upload2.fileList;
        }
    };
</script>
