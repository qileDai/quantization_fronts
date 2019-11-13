<style lang="less" scoped>
    @import '../../../../styles/common.less';
    @import 'walletTestModal.less';
</style>

<template>
    <div class="content">
        <Modal v-model="modalStatus" :title="modalTitle" width="1000" @on-cancel="handleReset" :mask-closable="false" :closable="false">
            <p class="close-icon" @click="handleReset"><Icon type="ios-close-empty" size="30"></Icon></p>
            <Form ref="formItem" :model="formItem" :label-width="120" :rules="ruleValidate">
                <h3 class="formitem-title">{{row.coinName ? row.coinName.toUpperCase() : ''}} 充币测试</h3>
                <FormItem label="测试账号" prop="userName">
                    <Input v-model="formItem.userName" placeholder="请输入测试账号" style="width: 200px;"></Input>
                    <Button type="info" size="small" @click="handleSubmit" style="margin-left: 10px;">生成充币测试地址</Button>
                </FormItem>
                <h3 class="formitem-title" style="margin-top: 60px;">{{row.coinName ? row.coinName.toUpperCase() : ''}} 充币测试地址</h3>
                <FormItem label="测试地址">
                    <!--<Input v-model="testAddress" placeholder="暂无测试地址" readonly style="width: 300px;"></Input>-->
                    <span style="margin: 0 5px;">{{testAddress || '暂无测试地址'}}</span>
                    <Button type="warning" v-if="testAddress" size="small" @click="clickCopy(0)" style="margin-left: 10px;">复制地址</Button>
                    <div class="qrcode-box" v-if="testAddress">
                        <img :src="qrcodeUrl" alt="" width="150" height="150" style="display: block;">
                    </div>
                </FormItem>
                <FormItem label="新的测试地址" v-if="testAddressNew">
                    <!--<Input v-model="testAddressNew" placeholder="暂无新的测试地址" readonly style="width: 300px;"></Input>-->
                    <span style="margin: 0 5px;">{{testAddressNew || '暂无新的测试地址'}}</span>
                    <Button type="warning" size="small" @click="clickCopy(1)" style="margin-left: 10px;">复制地址</Button>
                    <div class="qrcode-box">
                        <img :src="qrcodeUrlNew" alt="" width="150" height="150" style="display: block;">
                    </div>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button type="text" size="large" @click="handleReset">取消</Button>
                <Button type="primary" size="large" @click="pulishConfirm">测试通过，确认上线</Button>
            </div>
        </Modal>
        <Modal v-model="modalStatusGoogle" title="谷歌验证" width="500" @on-cancel="handleResetGoogle" :mask-closable="false">
            <Form ref="formItemGoogle" :model="formItemGoogle" :label-width="90" :rules="ruleValidateGoogle" @keydown.native.enter.prevent>
                <FormItem label="谷歌验证码" prop="googleCode">
                    <Input v-model="formItemGoogle.googleCode" :maxlength="6" placeholder="请输入谷歌验证码"></Input>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button type="text" size="large" @click="handleResetGoogle">取消</Button>
                <Button type="primary" size="large" @click="handleSubmitGoogle" :loading="loadingGoogle">确定</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import api from '@/api/coins'
    import axios from '@/axios/config'
    import QRCode from 'qrcode'

    export default {
        name: 'walletTestModal',
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
                if (isNaN(value)) {
                    callback(new Error('格式不正确，必须为数字'));
                }
                callback();
            };
            return {
                req_url: axios.defaults.baseURL,
                modalTitle: '谷歌验证',
                modalStatusGoogle: false,
                loadingGoogle: false,
                testAddress: '',
                testAddressNew: '',
                qrcodeUrl: '', // 二维码链接
                qrcodeUrlNew: '', // 新的二维码链接
                formItem: {
                    userName: ''
                },
                ruleValidate: {
                    userName: [
                        {required: true, message: '请输入测试账号', trigger: 'blur'}
                    ]
                },
                // 谷歌验证码
                formItemGoogle: {
                    googleCode: ''
                },
                ruleValidateGoogle: {
                    googleCode: [
                        {required: true, len: 6, message: '请输入6位数字的谷歌验证码', trigger: 'blur'},
                        {validator: number, trigger: 'blur'}
                    ]
                }
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
                        // 生成测试地址
                        this.generateTestAddress();
                    }
                });
            },
            handleReset () {
                this.$refs.formItem.resetFields();

                this.testAddress = '';
                this.qrcodeUrl = '';
                this.testAddressNew = '';
                this.qrcodeUrlNew = '';

                this.$emit('closeModal');
            },
            handleSubmitGoogle () {
                this.$refs.formItemGoogle.validate((valid) => {
                    if (valid) {
                        // 上线
                        this.pulishOnline();
                    }
                });
            },
            handleResetGoogle () {
                this.$refs.formItemGoogle.resetFields();
                this.modalStatusGoogle = false;
            },
            generateTestAddress () {
                let params = {
                }
                let obj = Object.assign(params, this.formItem);
                obj.coinsName = this.row.coinName.toLowerCase();

                api.generateAddr(obj).then((res) => {
                    if (res.data.code == 1) {
                        this.$Message.success('生成成功！');

                        const result = JSON.parse(res.data.data);
                        this.testAddress = result.address || '';
                        this.testAddressNew = result.address_new || '';

                        // 生成二维码
                        if (this.testAddress) {
                            this.generateQrCode(this.testAddress, 0);
                        }
                        if (this.testAddressNew) {
                            this.generateQrCode(this.testAddressNew, 1);
                        }
                    }
                });
            },
            generateQrCode (text, type) {
                QRCode.toDataURL(text).then(url => {
                    // console.log(url);
                    if (type === 0) {
                        this.qrcodeUrl = url;
                    } else {
                        this.qrcodeUrlNew = url;
                    }
                }).catch(err => {
                    console.error(err);
                    if (type === 0) {
                        this.qrcodeUrl = '';
                    } else {
                        this.qrcodeUrlNew = '';
                    }
                });
            },
            pulishConfirm () {
                this.modalStatusGoogle = true;
            },
            // 用户上币申请状态 1:审核中 2:未通过 3:已通过代缴费 4:调试中 5:已上线
            pulishOnline () {
                let params = {
                }
                let obj = Object.assign(params, this.row);
                obj.applyState = 5;
                obj.googleCode = this.formItemGoogle.googleCode;

                this.loadingGoogle = true;
                api.updateCoinInfo(obj).then((res) => {
                    this.loadingGoogle = false;
                    if (res.data.code == 1) {
                        this.$Message.success('上线成功！');
                        this.handleResetGoogle();
                        this.handleReset();

                        // 提交成功重新获取
                        this.$parent.getListData();
                    }
                });
            },
            // 点击复制
            clickCopy (type) {
                let text = type === 0 ? this.testAddress : this.testAddressNew;
                this.$copyText(text).then((e) => {
                    this.$Message.info('已复制！');
                    // console.log(e)
                }, (error) => {
                    console.log(error)
                })
            }
        },
        created () {
        },
        mounted () {
        }
    };
</script>
