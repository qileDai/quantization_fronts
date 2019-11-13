<style lang="less" scoped>
    @import '../../../styles/common.less';
    @import 'transferFile.less';
</style>

<template>
    <div class="content">
        <Row class="et-row">
            <Col>
                <span>输入文件名查询：</span>
                <div class="search-out" @keydown.enter="searchData">
                    <Input v-model.trim="searchVal" placeholder="请输入文件名查询" clearable></Input>
                </div>
                <Button type="primary" icon="ios-search" @click="searchData">查询</Button>
                <Button type="info" class="add_account" icon="plus-round" @click="showEditModal(null, 0)" v-if="g_perm('up')">上传文件</Button>
                <a class="downfile"
                   href="https://exx-img-test.oss-cn-shenzhen.aliyuncs.com/adminserver/85e5fa3340a84598aa2484719ea2e585-转账上传文件模版.xlsx"
                   target="_blank" v-if="g_perm('download')">下载文件模板</a>
            </Col>
        </Row>
        <Table border :columns="tableColumns" :data="tableData"></Table>
        <div style="position: relative;">
            <Page class="pages" :current="pageNum" :total="total" show-elevator show-sizer :page-size="pageSize" :page-size-opts="sizeOpts" @on-change="changePageNum" @on-page-size-change="changePageSize"></Page>
        </div>
        <Modal v-model="modalStatus" :title="modalTitle" width="500" @on-cancel="handleReset">
            <Form ref="formItem" :model="formItem" :label-width="90" :rules="ruleValidate">
                <FormItem label="文件名称" prop="fileName">
                    <Input v-model="formItem.fileName" placeholder="请输入文件名" style="width: 300px;"></Input>
                </FormItem>
                <div class="uploads">
                    <!--上传文件-->
                    <div class="uploadblock">
                        <label class="upload-label" style="width: 90px;">文件上传</label>
                        <Upload ref="upload1"
                                :show-upload-list="true"
                                :on-remove="handleRemove1"
                                :on-success="handleSuccess1"
                                :format="['xlsx']"
                                :max-size="20480"
                                :on-format-error="handleFormatError1"
                                :on-exceeded-size="handleMaxSize"
                                :before-upload="handleBeforeUpload1"
                                type="drag"
                                :action="req_url + 'fileUpload'"
                                style="display: inline-block;width:100px;">
                            <div style="height:58px; padding: 10px 0;">
                                <Icon type="android-upload" size="20"></Icon>
                                <span class="up-tip">请上传文件</span>
                            </div>
                        </Upload>
                    </div>
                </div>
                <FormItem label="备注" prop="remark">
                    <Input v-model="formItem.remark" type="textarea" :autosize="{minRows: 5,maxRows: 10}" placeholder="请输入文件备注信息" style="width: 300px;"></Input>
                </FormItem>
                <FormItem label="谷歌验证码" prop="googleCode">
                    <Input v-model="formItem.googleCode" placeholder="请输入谷歌验证码" :maxlength="6" style="width: 200px;"></Input>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button type="text" size="large" @click="handleReset">取消</Button>
                <Button type="primary" size="large" @click="handleSubmit">确定</Button>
            </div>
        </Modal>
        <transfer-multiple :modal-status="viewStatus" :row="currRow" @closeModal="setCloseModal"></transfer-multiple>
    </div>
</template>

<script>
    import api from '@/api/funds'
    import axios from '@/axios/config'
    import transferMultiple from '../transferMultiple/transferMultiple'

    export default {
        name: 'transferFile',
        components: {
            transferMultiple
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
                tableColumns: [
                    {
                        title: '文件名称',
                        key: 'fileName'
                    },
                    {
                        title: '文件地址',
                        key: 'url',
                        render: (h, params) => {
                            if (params.row.url && this.g_perm('view')) {
                                return h('a', {
                                    attrs: {
                                        'href': params.row.url,
                                        'target': '_blank'
                                    }
                                }, '查看文件');
                            } else {
                                return h('span', '-');
                            }
                        }
                    },
                    {
                        title: '备注',
                        key: 'remark'
                    },
                    {
                        title: '创建时间',
                        key: 'createTime',
                        render: (h, params) => {
                            return h('span', params.row.createTime ? params.row.createTime.split('.')[0] : '');
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
                                this.g_perm('batch') ? h('Button', {
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
                                            this.viewFileData(params.row);
                                        }
                                    }
                                }, '批量转账') : ''
                            ]);
                        }
                    }
                ],
                // startDateObj: '',
                // endDateObj: '',
                // startDate: '', // 开始时间
                // endDate: '', // 结束时间
                currRow: {},
                tableData: [],
                searchVal: '',
                modalStatus: false,
                viewStatus: false, // 查看弹窗状态
                modalTitle: '添加',
                formItem: {
                    // id: '',
                    fileName: '',
                    url: '',
                    remark: '',
                    googleCode: ''
                },
                ruleValidate: {
                    fileName: [
                        {required: true, message: '请输入文件名', trigger: 'blur'}
                    ],
                    remark: [
                        {required: true, message: '请输入文件备注信息', trigger: 'blur'}
                    ],
                    googleCode: [
                        {required: true, len: 6, message: '请输入6位数字的谷歌验证码', trigger: 'blur'},
                        {validator: number, trigger: 'blur'}
                    ]
                },
                // optionsStart: {
                //     disabledDate: (date) => {
                //         let end = this.endDateObj.valueOf();
                //         if (end) {
                //             return date && date.valueOf() > end;
                //         } else {
                //             return false;
                //         }
                //     }
                // },
                // optionsEnd: {
                //     disabledDate: (date) => {
                //         let start = this.startDateObj.valueOf();
                //         if (start) {
                //             return date && date.valueOf() < start;
                //         } else {
                //             return false;
                //         }
                //     }
                // },
                uploadList2: [],
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
            handleSubmit () {
                this.$refs.formItem.validate((valid) => {
                    if (valid) {
                        if (!this.formItem.url) {
                            this.$Message.warning('请先上传文件！');
                            return;
                        }
                        this.submitRequest();
                    }
                });
            },
            handleReset () {
                this.formItem.url = '';
                this.$refs.formItem.resetFields();
                this.$refs.upload1.fileList.splice(0, 1);

                this.modalStatus = false;
            },
            setCloseModal () {
                // 关闭弹窗
                this.viewStatus = false;
            },
            submitRequest () {
                let params = {
                }

                let obj = Object.assign(params, this.formItem);

                if (this.editType == 0) {
                    api.transferFileUpload(obj).then((res) => {
                        if (res.data.code == 1) {
                            this.$Message.success('添加成功！');
                            this.handleReset();
                            // 提交成功重新获取
                            this.getListData();
                        } else if (res.data.code == -1) {
                            this.$Message.error(res.data.msg);
                        }
                    });
                } else if (this.editType == 1) {
                    //
                }
            },
            searchData () {
                // 重置页码
                this.pageNum = 1;
                this.total = 0;

                this.getListData();
            },
            getListData () {
                let params = {
                    fileName: this.searchVal,
                    pageNum: this.pageNum,
                    pageSize: this.pageSize
                }
                api.getFundsFiles(params).then((res) => {
                    if (res.data.code == 1) {
                        this.tableData = res.data.data ? res.data.data.obj : [];
                        this.total = res.data.data ? res.data.data.totalCount : 0;
                    }
                });
            },
            showEditModal (currRow, type) {
                this.editType = type;
                if (type == 0) {
                    this.modalTitle = '添加文件';
                } else if (type == 1) {
                    //
                }
                this.modalStatus = true;
            },
            viewFileData (row) {
                this.currRow = row || {};
                this.viewStatus = true;
            },
            // 日期相关
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
            },
            // 上传图片相关
            handleRemove1 (file) {
                this.formItem.url = '';
            },
            handleSuccess1 (res, file) {
                this.formItem.url = res.data;
            },
            handleFormatError1 (file) {
                this.$Notice.warning({
                    title: '文件格式不正确',
                    desc: '文件 ' + file.name + ' 格式不正确，请选择 xlsx 格式。'
                });
            },
            handleMaxSize (file) {
                this.$Notice.warning({
                    title: '超出文件大小限制',
                    desc: '文件：' + file.name + ' 过大，不能超过 20M'
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
            }
        },
        created () {
            this.getListData();
        },
        mounted () {
            this.uploadList1 = this.$refs.upload1.fileList;
        }
    };
</script>
