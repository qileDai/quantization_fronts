<style lang="less" scoped>
    @import '../../../../styles/common.less';
    @import 'configsModal.less';
</style>

<template>
    <div class="content">
        <Modal v-model="modalStatus" :title="modalTitle" width="1000" @on-cancel="handleReset" :mask-closable="false" :closable="false" :styles="{overflow: 'auto'}">
            <p class="close-icon" @click="handleReset"><Icon type="ios-close-empty" size="30"></Icon></p>
            <Form ref="formItem" class="inlineform" :model="formItem" :label-width="120" :rules="ruleValidate">
                <div class="formtop">
                    <div class="formblock">
                        <h3 class="formitem-title">全局配置信息</h3>
                        <!--<FormItem label="币种ID" prop="fundsType" v-if="row.fundsType != null">
                            <Input v-model="formItem.fundsType" disabled placeholder="请输入币种ID" number style="width: 300px;"></Input>
                        </FormItem>-->
                        <FormItem label="币种名称" prop="keyEn">
                            <Input v-model="formItem.keyEn" placeholder="请输入币种名称" style="width: 300px; color: #495060;"></Input>
                        </FormItem>
                        <FormItem label="币种符号" prop="propTag">
                            <Input v-model="formItem.propTag" placeholder="请输入币种符号" style="width: 300px;"></Input>
                        </FormItem>
                        <FormItem label="钱包回调币种名称" prop="walletBackName">
                            <Input v-model="formItem.walletBackName" placeholder="请输入钱包回调币种名称" style="width: 300px;"></Input>
                        </FormItem>
                        <FormItem label="使用新旧地址的币种名称" prop="compatibleCoins">
                            <Input v-model="formItem.compatibleCoins" placeholder="请输入使用新旧地址的币种名称" style="width: 300px;"></Input>
                        </FormItem>
                        <FormItem label="归属代币" prop="tokenName">
                            <Input v-model="formItem.tokenName" placeholder="请输入归属代币" style="width: 300px;"></Input>
                        </FormItem>
                        <FormItem label="交易查询地址" prop="tradeUrl">
                            <Input v-model="formItem.tradeUrl" placeholder="请输入交易查询地址" style="width: 300px;"></Input>
                        </FormItem>
                        <FormItem label="区块查询地址" prop="blockChianUrl">
                            <Input v-model="formItem.blockChianUrl" placeholder="请输入区块查询地址" style="width: 300px;"></Input>
                        </FormItem>
                        <FormItem label="是否开启充币">
                            <RadioGroup v-model="formItem.isPayIn">
                                <Radio label="1" style="margin-right: 15px;">是</Radio>
                                <Radio label="0">否</Radio>
                            </RadioGroup>
                        </FormItem>
                        <FormItem label="是否开启提币">
                            <RadioGroup v-model="formItem.isPayOut">
                                <Radio label="1" style="margin-right: 15px;">是</Radio>
                                <Radio label="0">否</Radio>
                            </RadioGroup>
                        </FormItem>
                        <FormItem label="是否开启划账">
                            <RadioGroup v-model="formItem.isDoInOut">
                                <Radio label="1" style="margin-right: 15px;">是</Radio>
                                <Radio label="0">否</Radio>
                            </RadioGroup>
                        </FormItem>
                        <FormItem label="是否开启获取地址">
                            <RadioGroup v-model="formItem.needAddress">
                                <Radio label="1" style="margin-right: 15px;">是</Radio>
                                <Radio label="0">否</Radio>
                            </RadioGroup>
                        </FormItem>
                        <FormItem label="是否带有Memo">
                            <RadioGroup v-model="formItem.isMemo">
                                <Radio label="1" style="margin-right: 15px;">带</Radio>
                                <Radio label="0">不带</Radio>
                            </RadioGroup>
                        </FormItem>

                        <FormItem label="钱包商户类型">
                            <RadioGroup v-model="formItem.walletType">
                                <Radio label="1" style="margin-right: 15px;">bitbank</Radio>
                                <Radio label="2">战狼coinlink</Radio>
                            </RadioGroup>
                        </FormItem>

                        <div class="uploads">
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
                                        <span class="up-tip" v-if="this.formItem.iconUrl">更新币种logo</span>
                                        <span class="up-tip" v-else>请上传币种logo</span>
                                    </div>
                                </Upload>
                            </div>

                            <FormItem label="钱包商户类型">
                                <RadioGroup v-model="formItem.walletType">
                                    <Radio label="1" style="margin-right: 15px;">bitbank</Radio>
                                    <Radio label="2">战狼coinlink</Radio>
                                </RadioGroup>
                            </FormItem>
                        </div>
                    </div>
                    <div class="formblock" style="margin-left: 40px;">
                        <h3 class="formitem-title">充提币配置信息</h3>
                        <FormItem label="最小费率" prop="minFees">
                            <Input v-model="formItem.minFees" placeholder="请输入最小费率" style="width: 300px;"></Input>
                        </FormItem>
                        <FormItem label="最小费率百分比" prop="minFeesRate">
                            <Input v-model="formItem.minFeesRate" placeholder="请输入最小费率百分比" style="width: 300px;"></Input>
                        </FormItem>
                        <FormItem label="次提现额度" prop="timesCash">
                            <Input v-model="formItem.timesCash" placeholder="请输入次提现额度" style="width: 300px;"></Input>
                        </FormItem>
                        <FormItem label="日提现额度" prop="dayCash">
                            <Input v-model="formItem.dayCash" placeholder="请输入日提现额度" style="width: 300px;"></Input>
                        </FormItem>
                        <FormItem label="日免审额度" prop="dayFreetrial">
                            <Input v-model="formItem.dayFreetrial" placeholder="请输入日免审额度" style="width: 300px;"></Input>
                        </FormItem>
                        <FormItem label="时免审额度" prop="hourFreetrial">
                            <Input v-model="formItem.hourFreetrial" placeholder="请输入时免审额度" style="width: 300px;"></Input>
                        </FormItem>
                        <FormItem label="单次免审额度" prop="timesFreetrial">
                            <Input v-model="formItem.timesFreetrial" placeholder="请输入单次免审额度" style="width: 300px;"></Input>
                        </FormItem>
                        <FormItem label="最少提现数量" prop="minCash">
                            <Input v-model="formItem.minCash" placeholder="请输入最少提现数量" style="width: 300px;"></Input>
                        </FormItem>
                        <FormItem label="提现最少确认数" prop="outConfigTimes">
                            <Input v-model="formItem.outConfigTimes" placeholder="请输入提现最少确认数" style="width: 300px;"></Input>
                        </FormItem>
                        <FormItem label="充值最小确认数" prop="inConfigTimes">
                            <Input v-model="formItem.inConfigTimes" placeholder="请输入充值最小确认数" style="width: 300px;"></Input>
                        </FormItem>
                        <FormItem label="提币精度控制(小数位数)" prop="dwDecimal">
                            <Input v-model="formItem.dwDecimal" placeholder="请输入提币精度(小数位数)" style="width: 300px;"></Input>
                        </FormItem>
                    </div>
                </div>
                <h3 class="formitem-title">币种前端展示</h3>
                <FormItem label="快捷交易" class="inline-item">
                    <RadioGroup v-model="formItem.isShowFastTransaction">
                        <Radio label="1" style="margin-right: 15px;">是</Radio>
                        <Radio label="0">否</Radio>
                    </RadioGroup>
                </FormItem>
                <FormItem label="资金列表" class="inline-item">
                    <RadioGroup v-model="formItem.isShowFunds">
                        <Radio label="1" style="margin-right: 15px;">是</Radio>
                        <Radio label="0">否</Radio>
                    </RadioGroup>
                </FormItem>
                <br>
                <FormItem label="免费上币" class="inline-item">
                    <RadioGroup v-model="formItem.isShowFeeMoney">
                        <Radio label="1" style="margin-right: 15px;">是</Radio>
                        <Radio label="0">否</Radio>
                    </RadioGroup>
                </FormItem>
                <FormItem label="费率表" class="inline-item">
                    <RadioGroup v-model="formItem.isShowSchedulRates">
                        <Radio label="1" style="margin-right: 15px;">是</Radio>
                        <Radio label="0">否</Radio>
                    </RadioGroup>
                </FormItem>
                <br>
                <FormItem label="帮助中心" class="inline-item">
                    <RadioGroup v-model="formItem.isShowHelpCenter">
                        <Radio label="1" style="margin-right: 15px;">是</Radio>
                        <Radio label="0">否</Radio>
                    </RadioGroup>
                </FormItem>
                <FormItem label="充币" class="inline-item">
                    <RadioGroup v-model="formItem.isShowPayIn">
                        <Radio label="1" style="margin-right: 15px;">是</Radio>
                        <Radio label="0">否</Radio>
                    </RadioGroup>
                </FormItem>
                <br>
                <FormItem label="提币" class="inline-item">
                    <RadioGroup v-model="formItem.isShowPayOut">
                        <Radio label="1" style="margin-right: 15px;">是</Radio>
                        <Radio label="0">否</Radio>
                    </RadioGroup>
                </FormItem>
                <FormItem label="币种分组" prop="currencyGroup">
                    <Select v-model="formItem.currencyGroup" style="width: 200px;" placeholder="请选择币种分组">
                        <Option v-for="item in currencyGroupList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                    </Select>
                </FormItem>
                 <FormItem label="谷歌验证码" prop="googleCode">
                    <Input v-model="formItem.googleCode" placeholder="请输入谷歌验证码" :maxlength="6" style="width: 200px;"></Input>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button type="text" size="large" @click="handleReset">取消</Button>
                <Button type="primary" size="large" @click="handleSubmit">保存配置信息</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import api from '@/api/coins'
    import axios from '@/axios/config'

    export default {
        name: 'configsModal',
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
            const number = (rule, value, callback) => {
                if (isNaN(value) || value < 0) {
                    callback(new Error('格式不正确，必须为大于等于0的数字'));
                }
                callback();
            };
            const numberInt = (rule, value, callback) => {
                if (isNaN(value) || value < 0 || (value && value.indexOf('.') >= 0)) {
                    callback(new Error('格式不正确，必须为大于等于0的整数'));
                }
                callback();
            };
            const googleCode = (rule, value, callback) => {
                if (isNaN(value)) {
                    callback(new Error('格式不正确，必须为数字'));
                }
                callback();
            };
            const len10 = (rule, value, callback) => {
                if (value && value.length > 10) {
                    callback(new Error('长度过长，不超过10个字符'));
                }
                callback();
            };
            const len100 = (rule, value, callback) => {
                if (value && value.length > 100) {
                    callback(new Error('长度过长，不超过100个字符'));
                }
                callback();
            };
            return {
                req_url: axios.defaults.baseURL,
                modalTitle: '币种配置',
                coinOptions: {}, // 币种配置信息
                formItem: {
                    id: '', // 币种列表的id
                    fundsType: '', // 币种id
                    keyEn: '',
                    propTag: '',
                    walletBackName: '',
                    compatibleCoins: '',
                    tokenName: '',
                    tradeUrl: '',
                    blockChianUrl: '',
                    isPayIn: 0, // 0否 1是
                    isPayOut: 0, // 0否 1是
                    isDoInOut: 0, // 0否 1是
                    needAddress: 0, // 0否 1是
                    isMemo: 0, // 0 不带；1 带
                    iconUrl: '', // 币种图标icon
                    minFees: null,
                    minFeesRate: null,
                    timesCash: null,
                    dayCash: null,
                    dayFreetrial: null,
                    hourFreetrial: null,
                    timesFreetrial: null,
                    minCash: null,
                    outConfigTimes: null,
                    inConfigTimes: null,
                    dwDecimal: null,
                    // 币种显示位置
                    isShowFastTransaction: 0,
                    isShowFunds: 0,
                    isShowFeeMoney: 0,
                    isShowSchedulRates: 0,
                    isShowHelpCenter: 0,
                    isShowPayIn: 0,
                    isShowPayOut: 0,
                    // 谷歌验证码
                    googleCode: '',
                    currencyGroup: '' ,// 币种分组

                    walletType: 2 // 1 bitbank 2 战狼coinlink
                },
                ruleValidate: {
                    keyEn: [
                        {required: true, message: '请输入币种名称', trigger: 'blur'}
                    ],
                    propTag: [
                        {required: true, message: '请输入币种符号', trigger: 'blur'}
                    ],
                    walletBackName: [
                        {required: false, trigger: 'blur'},
                        {validator: len100, trigger: 'blur'}
                    ],
                    compatibleCoins: [
                        {required: false, trigger: 'blur'},
                        {validator: len100, trigger: 'blur'}
                    ],
                    tokenName: [
                        {required: false, trigger: 'blur'},
                        {validator: len10, trigger: 'blur'}
                    ],
                    minFees: [
                        {required: false, message: '最小费率格式不正确', trigger: 'blur'},
                        {validator: number, trigger: 'blur'}
                    ],
                    minFeesRate: [
                        {required: false, message: '最小费率百分比格式不正确', trigger: 'blur'},
                        {validator: number, trigger: 'blur'}
                    ],
                    timesCash: [
                        {required: false, message: '次提现额度格式不正确', trigger: 'blur'},
                        {validator: number, trigger: 'blur'}
                    ],
                    dayCash: [
                        {required: false, message: '日提现额度格式不正确', trigger: 'blur'},
                        {validator: number, trigger: 'blur'}
                    ],
                    dayFreetrial: [
                        {required: false, message: '日免审额度格式不正确', trigger: 'blur'},
                        {validator: number, trigger: 'blur'}
                    ],
                    hourFreetrial: [
                        {required: false, message: '时免审额度格式不正确', trigger: 'blur'},
                        {validator: number, trigger: 'blur'}
                    ],
                    timesFreetrial: [
                        {required: false, message: '单次免审额度格式不正确', trigger: 'blur'},
                        {validator: number, trigger: 'blur'}
                    ],
                    minCash: [
                        {required: false, message: '最少提现数量格式不正确', trigger: 'blur'},
                        {validator: number, trigger: 'blur'}
                    ],
                    outConfigTimes: [
                        {required: false, message: '提现最少确认数格式不正确', trigger: 'blur'},
                        {validator: numberInt, trigger: 'blur'}
                    ],
                    inConfigTimes: [
                        {required: false, message: '充值最小确认数格式不正确', trigger: 'blur'},
                        {validator: numberInt, trigger: 'blur'}
                    ],
                    dwDecimal: [
                        {required: false, message: '提币精度格式不正确', trigger: 'blur'},
                        {validator: numberInt, trigger: 'blur'}
                    ],
                    // 谷歌验证码
                    googleCode: [
                        {required: true, len: 6, message: '请输入6位数字的谷歌验证码', trigger: 'blur'},
                        {validator: googleCode, trigger: 'blur'}
                    ],
                    currencyGroup: [
                        {required: true, type: 'number', message: '请选择币种分组', trigger: 'change'}
                    ],
                    walletType: [
                        {required: true, message: '请选择钱包商户类型', trigger: 'change'}
                    ]
                },
                currencyGroupList: [
                    {
                        value: 1,
                        label: '主流币种'
                    },
                    {
                        value: 2,
                        label: '创新币种'
                    }
                ],
                editType: 0, // 编辑类型 0添加 1修改
                uploadList2: []
            };
        },
        watch: {
            modalStatus (val, oldVal) {
                if (val) {
                    // 将币种列表的id传过去
                    this.formItem.id = this.row.id;
                    this.formItem.fundsType = this.row.fundsType || '';
                    this.formItem.keyEn = this.row.coinName;

                    if (this.row.fundsType) {
                        this.getListData();
                    } else {
                        // 新增
                        this.editType = 0;
                    }
                }
            }
        },
        computed: {
        },
        methods: {
            handleSubmit () {
                this.$refs.formItem.validate((valid) => {
                    if (valid) {
                        if (!this.formItem.iconUrl) {
                            this.$Message.warning('请上传币种logo！');
                            return;
                        }
                        this.dialogTip();
                    }
                });
            },
            handleReset () {
                this.$refs.formItem.resetFields();

                this.formItem.id = '';
                this.formItem.iconUrl = '';

                this.formItem.isPayIn = 0;
                this.formItem.isPayOut = 0;
                this.formItem.isDoInOut = 0;
                this.formItem.needAddress = 0;
                this.formItem.isMemo = 0;
                this.formItem.isShowFastTransaction = 0;
                this.formItem.isShowFeeMoney = 0;
                this.formItem.isShowHelpCenter = 0;
                this.formItem.isShowPayOut = 0;
                this.formItem.isShowFunds = 0;
                this.formItem.isShowSchedulRates = 0;
                this.formItem.isShowPayIn = 0;

                this.$refs.upload2.fileList.splice(0, 1);

                this.$emit('closeModal');

                this.formItem.walletType = 2;
            },
            dialogTip () {
                this.$Modal.confirm({
                    title: '提示',
                    content: '随意更改币种配置信息可能会导致币种充提币功能无法使用！',
                    cancelText: '暂不修改',
                    okText: '确认修改',
                    onOk: () => {
                        this.submitRequest();
                    }
                });
            },
            submitRequest () {
                let params = {
                }
                this.formItem.walletType = Number(this.formItem.walletType)
                let obj = Object.assign(params, this.formItem);
                if (this.editType == 0) {
                    api.addCoinOptions(obj).then((res) => {
                        if (res.data.code == 1) {
                            this.$Message.success('配置添加成功！');
                            this.handleReset();
                            // 提交成功重新获取
                            this.$parent.getListData();
                        }
                    });
                } else if (this.editType == 1) {
                    api.updateCoinOptions(obj).then((res) => {
                        if (res.data.code == 1) {
                            this.$Message.success('配置编辑成功！');
                            this.handleReset();
                            // 提交成功重新获取
                            this.$parent.getListData();
                        }
                    });
                }
            },
            getListData () {
                let params = {
                    fundsType: this.row.fundsType
                }
                api.getCoinOptions(params).then((res) => {
                    if (res.data.code == 1) {
                        this.coinOptions = res.data.data;
                        this.setFormItem(this.coinOptions);
                    }
                });
            },
            setFormItem (currRow) {
                if (currRow) {
                    this.editType = 1;
                    Object.keys(this.formItem).forEach((key, index) => {
                        if (currRow.hasOwnProperty(key)) {
                            if (key === 'googleCode') {
                                // 排除谷歌字段
                                this.formItem.googleCode = '';
                            } else if (key === 'minFees' ||
                                key === 'minFeesRate' ||
                                key === 'timesCash' ||
                                key === 'dayCash' ||
                                key === 'dayFreetrial' ||
                                key === 'hourFreetrial' ||
                                key === 'timesFreetrial' ||
                                key === 'minCash' ||
                                key === 'outConfigTimes' ||
                                key === 'inConfigTimes' ||
                                key === 'dwDecimal') {
                                this.formItem[key] = currRow[key] === null ? '' : currRow[key] + '';
                            } else {
                                this.formItem[key] = currRow[key];
                            }
                        }
                    })
                } else {
                    // 新增
                    this.editType = 0;
                }
            },
            // 上传图片相关
            handleRemove1 (file) {
                // this.formItem.projectExcel = '';
            },
            handleRemove2 (file) {
                this.formItem.iconUrl = '';
            },
            handleSuccess1 (res, file) {
                // this.formItem.projectExcel = res.data;
            },
            handleSuccess2 (res, file) {
                this.formItem.iconUrl = res.data;
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
            }
        },
        created () {
        },
        mounted () {
            this.uploadList2 = this.$refs.upload2.fileList;
        }
    };
</script>
