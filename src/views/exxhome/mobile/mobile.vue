<style lang="less" scoped>
    @import '../../../styles/common.less';
    @import 'mobile.less';
</style>
<style >
.ivu-form .ivu-form-item-label {
  padding: 10px 8px 10px 0;
}
</style>
<template>
    <div class="content">
        <Row class="topBar">
            <Col>
            <span>平台：</span>
            <div class="form-out">
                <Select size="small" v-model="appType">
                    <Option v-for="item in platformList" :value="item.type" :key="item.type">{{ item.label }}</Option>
                </Select>
            </div>
            <Button type="primary" size="small" icon="refresh" @click="refreshList">刷新</Button>
            <Button type="info" size="small" icon="plus-round" @click="showEditModal(null, 0)" v-if="g_perm('add')">发布新版</Button>
            <div class="search-out">
                <Input v-model="internalWebName" size="small" placeholder="搜索站点名称" clearable></Input>
            </div>
            <div class="search-out">
                <Input v-model="searchVal" size="small" placeholder="搜索版本号" clearable></Input>
            </div>
            <Button type="primary" size="small" icon="ios-search">搜索</Button>
            </Col>
        </Row>
        <Table border :columns="tableColumns" :data="filterList"></Table>
        <Modal v-model="modalStatus" :title="modalTitle" width="800" @on-cancel="handleReset" :mask-closable="false">
            <Form ref="formItem" :model="formItem" :label-width="90" :rules="ruleValidate">
                <FormItem label="版本号" prop="versionNumber">
                    <Input v-model="formItem.versionNumber" placeholder="请输入版本号" style="width: 300px;"></Input>
                </FormItem>
                <FormItem label="内部版本号" prop="internalVerNumber">
                    <Input v-model="formItem.internalVerNumber" placeholder="请输入内部版本号" style="width: 300px;"></Input>
                </FormItem>

                <!--上传apk-->
                <div class="uploadblock" v-if="appType == '1'">
                    <label class="upload-label" style="width: 90px;">APK安装文件</label>
                    <Upload ref="upload2"
                            :show-upload-list="true"
                            :on-remove="handleRemove2"
                            :on-success="handleSuccess2"
                            :format="['apk']"
                            :max-size="204800"
                            :on-format-error="handleFormatError"
                            :on-exceeded-size="handleMaxSize"
                            :before-upload="handleBeforeUpload2"
                            type="drag"
                            :action="req_url + 'fileUpload/forAndroid'"
                            style="display: inline-block;width:100px;">
                        <div style="height:58px; padding: 10px 0;">
                            <Icon type="android-upload" size="20"></Icon>
                            <span class="up-tip">请上传安装文件</span>
                        </div>
                    </Upload>
                </div>
                <FormItem label="下载地址" prop="downloadUrl">
                    <Input v-model="formItem.downloadUrl" placeholder="请输入下载地址" :readonly="appType == '1'"></Input>
                </FormItem>
                <FormItem label="二维码" v-if="appType == '1'">
                    <div class="qrcode">
                        <img :src="formItem.qrCodeImage" v-if="formItem.qrCodeImage" alt="二维码">
                    </div>
                </FormItem>
                <div class="uploadblock" v-else>
                    <label class="upload-label" style="width: 90px;">二维码</label>
                    <!--背景图-->
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
                            :max-size="2048"
                            :on-format-error="handleFormatError"
                            :on-exceeded-size="handleMaxSize"
                            :before-upload="handleBeforeUpload1"
                            type="drag"
                            :action="req_url + 'fileUpload'"
                            style="display: inline-block;width:100px;">
                        <div style="height:58px; padding: 10px 0;">
                            <Icon type="camera" size="20"></Icon>
                            <span class="up-tip">请上传二维码</span>
                        </div>
                    </Upload>
                    <!--预览图片-->
                    <Modal title="预览" width="800" v-model="visible" class="viewimg">
                        <img :src="imgUrl" v-if="visible" style="max-width: 100%;">
                    </Modal>
                    <input type="hidden" v-model="formItem.qrCodeImage">
                </div>
                <FormItem label="强制更新" prop="reUpdate">
                    <RadioGroup v-model="formItem.reUpdate">
                        <Radio label="1">否</Radio>
                        <Radio label="2">是</Radio>
                    </RadioGroup>
                </FormItem>
                <FormItem label="更新日志" prop="remark">
                    <Input v-model="formItem.remark" type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="请输入更新日志"></Input>
                </FormItem>
                <FormItem label="更新日志英文" prop="enRemark" >
                    <Input v-model="formItem.enRemark" type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="请输入英文更新日志" ></Input>
                </FormItem>
                <FormItem label="更新日志韩文" prop="krRemark">
                    <Input v-model="formItem.krRemark" type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="请输入韩文更新日志"></Input>
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
    import api from '@/api/mobile'
    import axios from '@/axios/config'
    import moment from 'moment'

    export default {
        name: 'mobile',
        data () {
            return {
                req_url: axios.defaults.baseURL,
                appType: 1, // 默认安卓
                modalStatus: false,
                modalTitle: '发布新版',
                searchVal: '',
                internalWebName:'',
                platformList: [
                    {
                        type: 1,
                        label: 'android'
                    },
                    {
                        type: 2,
                        label: 'ios'
                    }
                ],
                tableColumns: [
                    {
                        title: '版本号',
                        key: 'versionNumber'
                    },
                    {
                        title: '内部版本号',
                        key: 'internalVerNumber'
                    },
                    {
                        title: '下载地址',
                        key: 'downloadUrl'
                    },
                    {
                        title: '二维码',
                        key: 'qrCodeImage',
                        render: (h, params) => {
                            return h('img', {
                                attrs: {
                                    'src': params.row.qrCodeImage,
                                    'class': 'imgblock',
                                    'width': 100,
                                    'height': 100
                                }
                            });
                        }
                    },
                    {
                        title: '是否强制更新',
                        key: 'reUpdate',
                        render: (h, params) => {
                            return h('span', params.row.reUpdate == 1 ? '否' : '是');
                        }
                    },
                    {
                        title: '更新日志',
                        key: 'remark'
                    },
                    {
                        title: '更新日志英文',
                        key: 'enRemark'
                    },
                    {
                        title: '更新日志韩文',
                        key: 'krRemark'
                    },
                    {
                        title: '站点名称',
                        key: 'stationName'
                    },
                    {
                        title: '创建时间',
                        key: 'creatTime',
                        render: (h, params) => {
                            return h('span', params.row.creatTime ? params.row.creatTime.split('.')[0] : '');
                        }
                    },
                    {
                        title: '修改时间',
                        key: 'updateTime',
                        render: (h, params) => {
                            return h('span', params.row.updateTime ? params.row.updateTime.split('.')[0] : '');
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
                                        size: 'small'
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
                                this.g_perm('delete') ? h('Button', {
                                    props: {
                                        type: 'error',
                                        size: 'small'
                                    },
                                    style: {
                                        marginTop: '5px',
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.deleteAppTip(params.row);
                                        }
                                    }
                                }, '删除') : ''
                            ]);
                        }
                    }
                ],
                tableData: [],
                formItem: {
                    id: '',
                    versionNumber: '',
                    internalVerNumber: '',
                    downloadUrl: '',
                    qrCodeImage: '',
                    reUpdate: 1, // 默认不强制更新
                    remark: '',
                    enRemark: '',
                    krRemark: ''
                },
                ruleValidate: {
                    versionNumber: [
                        {required: true, message: '请输入版本号', trigger: 'blur'}
                    ],
                    internalVerNumber: [
                        {required: true, message: '请输入内部版本号', trigger: 'blur'}
                    ],
                    downloadUrl: [
                        {required: true, message: '请输入下载地址或上传安装文件自动生成下载地址', trigger: 'blur'}
                    ],
                    remark: [
                        {required: true, message: '请输入更新日志', trigger: 'blur'}
                    ],
                    enRemark: [
                        {required: true, message: '请输入英文更新日志', trigger: 'blur'}
                    ],
                    krRemark: [
                        {required: true, message: '请输入韩文更新日志', trigger: 'blur'}
                    ]
                },
                editType: 0, // 编辑类型 0添加 1编辑
                // 上传图片
                imgUrl: '',
                visible: false,
                uploadList1: [],
                uploadList2: []
            };
        },
        watch: {
            // 语言分类
            appType () {
                this.getApp();

                // 切换后重新初始化
                this.$nextTick(() => {
                    if (this.$refs.upload1) {
                        this.uploadList1 = this.$refs.upload1.fileList;
                    }
                    if (this.$refs.upload2) {
                        this.uploadList2 = this.$refs.upload2.fileList;
                    }
                })
            }
        },
        computed: {
            // 已过滤的数据
            filterList () {
                let value = this.searchVal;
                let webname = this.internalWebName;
                // if (value) {
                //     return this.tableData.filter((item) => {
                //         // 大小写都匹配
                //         return item.versionNumber.indexOf(value) !== -1;
                //     });
                // } else {
                //     return this.tableData;
                // }

                    return this.tableData.filter((item) => {
                        // 大小写都匹配
                        return item.versionNumber.indexOf(value) !== -1&&item.stationName.indexOf(webname) !== -1;
                    });
            }
        },
        methods: {
            handleSubmit () {
                this.$refs.formItem.validate((valid) => {
                    if (valid) {
                        this.submitApp();
                    }
                });
            },
            handleReset () {
                // 充值表单
                this.$refs.formItem.resetFields();
                this.formItem.qrCodeImage = '';
                this.formItem.downloadUrl = '';

                console.log('cancel')
                // 移出上传记录
                if (this.$refs.upload1) {
                    this.$refs.upload1.fileList.splice(0, 1);
                }
                if (this.$refs.upload2) {
                    this.$refs.upload2.fileList.splice(0, 1);
                }

                this.modalStatus = false;
            },
            submitApp () {
                if (this.formItem.qrCodeImage == '') {
                    this.$Message.warning('请上传二维码');
                    return;
                }
                let params = {
                    appType: this.appType
                }
                let obj = Object.assign(params, this.formItem);

                if (this.editType == 0) {
                    api.addApp(obj).then((res) => {
                        if (res.data.code == 1) {
                            // 移出上传记录
                            console.log(res.data)
                            if (this.$refs.upload1) {
                                this.$refs.upload1.fileList.splice(0, 1);
                            }
                            if (this.$refs.upload2) {
                                this.$refs.upload2.fileList.splice(0, 1);
                            }

                            this.$Message.success('发布成功');
                            this.modalStatus = false;
                            // 提交成功重新获取
                            this.getApp();
                        }
                    });
                } else if (this.editType == 1) {
                    api.editApp(obj).then((res) => {
                        if (res.data.code == 1) {
                            // 移出上传记录
                            if (this.$refs.upload1) {
                                this.$refs.upload1.fileList.splice(0, 1);
                            }
                            if (this.$refs.upload2) {
                                this.$refs.upload2.fileList.splice(0, 1);
                            }

                            this.$Message.success('编辑成功');
                            this.modalStatus = false;
                            // 提交成功重新获取
                            this.getApp();
                        }
                    });
                }
            },
            getApp () {
                let params = {
                    appType: this.appType
                }
                api.getApps(params).then((res) => {
                    if (res.data.code == 1) {
                        // this.tableData = res.data.data;
                        // 前端过滤平台类型
                        this.tableData = res.data.data.filter((item) => {
                            return item.appType == this.appType
                        });
                    }
                });
            },
            deleteAppTip (item) {
                this.$Modal.confirm({
                    title: '提示',
                    content: '确认删除 ' + item.versionNumber + ' 版本？',
                    onOk: () => {
                        this.deleteAppHandle(item);
                    }
                });
            },
            deleteAppHandle (item) {
                let params = {
                    id: item.id
                }
                api.deleteApp(params).then((res) => {
                    if (res.data.code == 1) {
                        this.$Message.success('删除成功');
                        // 提交成功重新获取
                        this.getApp();
                    }
                });
            },
            showEditModal (currRow, type) {
                this.editType = type;
                if (type == 0) {
                    this.modalTitle = '发布';

                    // 添加
                    this.formItem.id = '';
                    this.formItem.versionNumber = '';
                    this.formItem.internalVerNumber = '';
                    this.formItem.downloadUrl = '';
                    this.formItem.qrCodeImage = '';
                    this.formItem.reUpdate = 1;
                    this.formItem.remark = '';
                    this.formItem.enRemark = '';
                    this.formItem.krRemark = '';

                    if (this.$refs.upload1) {
                        console.log('add')
                        this.$refs.upload1.fileList.splice(0, 1);
                    }
                    if (this.$refs.upload2) {
                        this.$refs.upload2.fileList.splice(0, 1);
                    }
                } else if (type == 1) {
                    this.modalTitle = '编辑';

                    // 赋值表单
                    this.formItem.id = currRow.id;

                    this.formItem.versionNumber = currRow.versionNumber;
                    this.formItem.internalVerNumber = currRow.internalVerNumber;
                    this.formItem.downloadUrl = currRow.downloadUrl;
                    this.formItem.qrCodeImage = currRow.qrCodeImage;
                    this.formItem.reUpdate = currRow.reUpdate;
                    this.formItem.remark = currRow.remark;
                    this.formItem.enRemark = currRow.enRemark;
                    this.formItem.krRemark = currRow.krRemark;

                    // ios 显示已上传图片
                    if (this.appType == '2') {
                        let obj1 = {};
                        if (this.formItem.qrCodeImage) {
                            obj1.status = 'finished';
                            obj1.url = this.formItem.qrCodeImage;
                            this.uploadList1[0] = obj1;
                        }
                    }
                }
                this.modalStatus = true;
            },
            refreshList () {
                this.getApp();
            },
            // 上传图片
            handleView (imgUrl) {
                this.imgUrl = imgUrl;
                this.visible = true;
            },
            handleRemove1 (file) {
                const fileList = this.$refs.upload1.fileList;
                this.$refs.upload1.fileList.splice(fileList.indexOf(file), 1);
                this.formItem.qrCodeImage = '';
            },
            handleRemove2 (file) {
                const fileList = this.$refs.upload2.fileList;
                this.$refs.upload2.fileList.splice(fileList.indexOf(file), 1);
                this.formItem.downloadUrl = '';
                this.formItem.qrCodeImage = '';
            },
            handleSuccess1 (res, file) {
                file.url = res.data;
                this.formItem.qrCodeImage = res.data;
            },
            handleSuccess2 (res, file) {
                file.url = res.data;
                this.formItem.downloadUrl = res.data.url;
                this.formItem.qrCodeImage = res.data.qrUrl;
            },
            handleFormatError (file) {
                this.$Notice.warning({
                    title: '文件格式不正确',
                    desc: '文件 ' + file.name + ' 格式不正确，请选择 apk 格式。'
                });
            },
            handleMaxSize (file) {
                this.$Notice.warning({
                    title: '超出文件大小限制',
                    desc: '文件：' + file.name + ' 过大，不能超过 2M'
                });
            },
            handleBeforeUpload1 () {
                const check = this.uploadList1.length < 5;
                if (!check) {
                    this.$Notice.warning({
                        title: '最多可以上传5张照片。'
                    });
                }
                return check;
            },
            handleBeforeUpload2 () {
                const check = this.uploadList2.length < 1;
                if (!check) {
                    this.$Notice.warning({
                        title: '最多可以上传1个文件。'
                    });
                }
                return check;
            }
        },
        created () {
            this.getApp();
        },
        mounted () {
            if (this.$refs.upload1) {
                this.uploadList1 = this.$refs.upload1.fileList;
            }
            if (this.$refs.upload2) {
                this.uploadList2 = this.$refs.upload2.fileList;
            }
        }
    };
</script>
