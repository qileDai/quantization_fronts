<template>
    <div class="set-control">
        <Row style="padding:15px 10px">
            <Col>
            <span>用户名</span>
            <Input style="width:150px" v-model="userName" placeholder="使用用户名搜索"></Input>
            <span class="left-space">交易所名称</span>
            <Input style="width:150px" v-model="bourseName" placeholder="使用交易所名称搜索"></Input>
            <span class="left-space">交易所地址</span>
            <Input style="width:150px" v-model="bourseAddr" placeholder="使用交易所地址搜索"></Input>
            <span class="left-space">手续费状态</span>
            <Select style="width: 100px" placeholder="全部" v-model="chargeStatus" @on-change="optionChange">
                <Option value="">全部</Option>
                <Option value="1">已锁定</Option>
                <Option value="2">已收取</Option>
                <Option value="3">已释放</Option>
            </Select>
            <span class="left-space">站点配置</span>
            <Select style="width: 100px" placeholder="全部" v-model="siteSetting" @on-change="optionChange">
                <Option value="">全部</Option>
                <Option value="1">已配置</Option>
                <Option value="0">未配置</Option>
            </Select>
            <span class="left-space">站点状态</span>
            <Select style="width: 100px" placeholder="全部" v-model="siteStatus" @on-change="optionChange">
                <Option value="">全部</Option>
                <Option value="0">禁用</Option>
                <Option value="1">启用</Option>
            </Select>
            <span class="left-space">站长类型</span>
            <Select style="width: 100px" placeholder="全部" v-model="isCustomize" @on-change="optionChange">
                <Option :value="-1">全部</Option>
                <Option :value="0">站长</Option>
                <Option :value="1">高级站长</Option>
            </Select>
            <Button class="left-space" type="primary" @click="search">查询</Button>
            <Button class="left-space" type="info" @click="customModal = true" v-if="g_perm('addCustomize')">新增定制交易所</Button>
            </Col>
        </Row>
        <Table border :columns="tHeaderText" :data="tableData"></Table>
        <div style="position: relative">
            <Page 
                class="pages" 
                show-sizer show-elevator 
                :total="totalCount" 
                :page-size-opts="pageSizeOpts"
                :page-size="pageSize" 
                @on-page-size-change="changePageSize" 
                @on-change="changePage"
                :current="pageIndex"
                ></Page>
        </div>
        <!-- 编辑弹框 -->
        <Modal title="编辑交易所" v-model="showModal" :mask-closable="false">
            <Form :label-width="130" :model="modalFormData" :rules="ruleValidate" ref="modalForm">
                <FormItem label="交易所名称" prop="bourseName">
                    <Input style="width: 65%" v-model="modalFormData.bourseName" :maxlength="16"
                           placeholder="请输入中文/英文交易所名称"></Input>（限16个字符）
                </FormItem>
                <FormItem label="交易所logo" required>
                    <div class="bg-img">
                        <template>
                            <img :src="modalFormData.logoUrl" style="width: 55px; height:55px"
                                 v-if="modalFormData.logoUrl !== ''">
                            <div class="bg-img-cover" v-if="modalFormData.logoUrl !== ''">
                                <Icon type="ios-eye-outline" @click.native="modalLookBgImg"></Icon>
                                <Icon type="ios-trash-outline" @click.native="modalDelBgImg"></Icon>
                            </div>
                        </template>
                    </div>
                    <p style="color: #f90">提示：存储容量<=100KB支持png、jpg格式55*55px</p>
                    <Upload
                            :action="req_url + 'fileUpload'"
                            :show-upload-list="false"
                            :max-size="100"
                            :on-success="handleSuccess"
                            :on-format-error="handleFormatError"
                            :on-exceeded-size="handleMaxSize"
                            :format="['jpg','jpeg','png']"
                    >
                        <Button type="primary" icon="ios-cloud-upload-outline">上传logo</Button>
                    </Upload>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button @click="editCancal">取消</Button>
                <Button type="primary" @click="editSave">保存</Button>
            </div>
        </Modal>
        <!-- 查看大图 -->
        <Modal title="查看大图" v-model="modalImgVisible">
            <img :src="modalFormData.logoUrl" alt="" style="width: 100%; height:100%">
        </Modal>
        <Modal title="释放手续费" v-model="releaseVisible">
            <Form :model="releaseForm" :rules="releaseValidate" :label-width="100" ref="relaeseForm">
                <FormItem label="google验证码" prop="googleCode">
                    <Input type="text" style="width:80%" placeholder="请输入6位数google验证码" v-model="releaseForm.googleCode"
                           :maxlength="6"></Input>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button @click="releaseCancel">取消</Button>
                <Button type="primary" @click="releaseConfirm">确定</Button>
            </div>
        </Modal>
        <!-- 新增交易所 customization -->
        <Modal title="编辑交易所" v-model="customModal" :mask-closable="false">
            <Form :label-width="130" :model="custom" :rules="customValidate" ref="customForm">
                <FormItem label="交易所名称" prop="customName">
                    <Input style="width: 65%" v-model="custom.customName"
                           placeholder="请输入中文/英文交易所名称"></Input>
                </FormItem>
                <FormItem label="域名" prop="customDomain">
                    <Input style="width: 65%" v-model="custom.customDomain"
                           placeholder="请输入域名"></Input>
                </FormItem>
                <FormItem label="设置EXX账号" prop="customAccount">
                    <Input style="width: 65%" v-model="custom.customAccount"
                           placeholder="请输入EXX账号"></Input>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button @click="customCancal">取消</Button>
                <Button type="primary" @click="customSave">保存</Button>
            </div>
        </Modal>
        <!-- 定制交易所编辑 -->
        <Modal title="编辑定制交易所" v-model="customEditModal" :mask-closable="false">
            <Form :label-width="130" :model="customEdit" :rules="customValidate" ref="customEditForm">
                <FormItem label="交易所名称" prop="customName">
                    <Input style="width: 65%" v-model="customEdit.customName" :maxlength="16"
                           placeholder="请输入中文/英文交易所名称"></Input>
                </FormItem>
                <FormItem label="域名" prop="customDomain">
                    <Input style="width: 65%" v-model="customEdit.customDomain" :maxlength="16"
                           placeholder="请输入域名"></Input>
                </FormItem>
                <FormItem label="EXX账号" prop="customAccount">
                    <Input style="width: 65%" v-model="customEdit.customAccount" :maxlength="16"
                           placeholder="请输入EXX账号" disabled></Input>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button @click="customEditModal = false">取消</Button>
                <Button type="primary" @click="customEditSave">保存</Button>
            </div>
        </Modal>
    </div>
</template>


<script>
    import axios from 'axios'
    import Api from '@/api/transactionAlliance/siteControl'

    export default {
        data() {
            return {
                pageIndex: 1, // 页码
                pageSize: 20, // 每页显示的数据量
                userName: '', // 用户名
                bourseName: '', // 交易所名称
                bourseAddr: '', // 交易所地址
                chargeStatus: '', // 手续费状态
                siteSetting: '', // 站点配置
                siteStatus: '', // 站点状态
                isCustomize: -1, // 站长类型
                req_url: axios.defaults.baseURL, // 文件上传地址
                tHeaderText: [
                    {title: '用户', key: 'userName'},
                    {title: '用户标识', key: 'userType'},
                    {title: '交易所名称', key: 'name'},
                    {title: '交易所地址', key: 'domainName'},
                    {title: '交易对数量', key: 'marketCount'},
                    {
                        title: '手续费状态', key: 'feeStatus',
                        render: (h, params) => {
                            return h('span', this.transStatusText(params.row.feeStatus))
                        }
                    },
                    {title: '手续费金额', key: 'feeAmount'},
                    {
                        title: '站点是否配置', key: 'status',
                        render: (h, params) => {
                            return h('span', params.row.status ? '已配置' : '未配置')
                        }
                    },
                    {title: '站点开通时间', key: 'createTime'},
                    {title: '站点最后登录时间', key: 'lastOperateTime'},
                    {
                        title: '站点状态', key: 'isEnable',
                        render: (h, params) => {
                            return h('span', params.row.isEnable ? '启用' : '禁用')
                        }
                    },
                    {
                        title: '操作', key: 'operations',
                        render: (h, params) => {
                            return h('div', [
                                this.g_perm('freed') ? h('Button', {
                                    props: {
                                        type: 'primary',
                                        size: 'small',
                                        disabled: params.row.feeStatus === 2 || params.row.feeStatus === 3,
                                    },
                                    style: {
                                        margin: '2px'
                                    },
                                    on: {
                                        click: () => {
                                            this.id = params.row.id
                                            this.releaseVisible = true
                                        }
                                    }
                                }, '释放手续费') : '',
                                this.g_perm('disable') ? h('Button', {
                                    props: {
                                        type: 'error',
                                        size: 'small',
                                        disabled: params.row.isEnable === 0,
                                    },
                                    style: {
                                        margin: '2px'
                                    },
                                    on: {
                                        click: () => {
                                            this.ableOrDisable(params)
                                        }
                                    }
                                }, '禁用') : '',
                                this.g_perm('enable') ? h('Button', {
                                    props: {
                                        type: 'primary',
                                        size: 'small',
                                        disabled: params.row.isEnable === 1
                                    },
                                    style: {
                                        margin: '2px'
                                    },
                                    on: {
                                        click: () => {
                                            this.ableOrDisable(params)
                                        }
                                    }
                                }, '启用') : '',
                                this.g_perm('edit') ? h('Button', {
                                    props: {
                                        type: 'info',
                                        size: 'small'
                                    },
                                    style: {
                                        margin: '2px'
                                    },
                                    on: {
                                        click: () => {
                                            this.edit(params)
                                            
                                        }
                                    }
                                }, '编辑') : '',
                            ])
                        }
                    },
                ],
                tableData: [], // 表格数据
                pageSizeOpts: [10, 20, 50, 100],
                totalCount: 0, // 当前条件下数据总量
                showModal: false, // 编辑显示编辑弹框
                modalImgVisible: false, // 查看大图
                releaseVisible: false, // 释放手续费
                id: '', // 数据id
                // 编辑弹框数据
                modalFormData: {
                    bourseName: '',
                    logoUrl: ''
                },
                ruleValidate: {
                    bourseName: [{
                        required: true, trigger: 'blur', validator: (rule, value, callback) => {
                            if (value.replace(/\s/g, '') === '') {
                                callback(new Error('交易所名称不能为空'))
                            } else if (!/^[\u4e00-\u9fa5a-zA-Z]+$/.test(value)) {
                                callback(new Error('交易所名称只能是中文或英文'))
                            } else {
                                callback()
                            }
                        }
                    }],
                    logoUrl: [{
                        required: true, trigger: 'change', validator: (rule, value, callback) => {
                            if (value.replace(/\s/g, '') === '') {
                                callback(new Error('交易所logo不能为空'))
                            } else {
                                callback()
                            }
                        }
                    }]
                },
                customModal: false, // 定制交易所弹框显示控制
                // 定制交易所弹框表单
                custom: {
                    customName: '',
                    customDomain: '',
                    customAccount: ''
                },
                // 定制交易所 表单验证
                customValidate: {
                    customName: [{
                        required: true, trigger: 'blur', validator: (rule, value, callback) => {
                            if (value.replace(/\s/g, '') === '') {
                                callback(new Error('交易所名称不能为空'))
                            } else if (!/^[\u4e00-\u9fa5a-zA-Z]+$/.test(value)) {
                                callback(new Error('交易所名称只能是中文或英文'))
                            } else {
                                callback()
                            }
                        }
                    }],
                    customDomain: [{
                        required: true, trigger: 'blur', validator: (rule, value, callback) => {
                            if (value.replace(/\s/g, '') === '') {
                                callback(new Error('域名不能为空'))
                            } else {
                                callback()
                            }
                        }
                    }],
                    customAccount: [{
                        required: true, trigger: 'blur', validator: (rule, value, callback) => {
                            if (value.replace(/\s/g, '') === '') {
                                callback(new Error('账号不能为空'))
                            } else {
                                callback()
                            }
                        }
                    }]
                },
                customEditModal: false, // 编辑定制交易所显示控制
                customEdit: {
                    customName: '',
                    customDomain: '',
                    customAccount: ''
                },
                // 释放手续费弹框
                releaseForm: {
                    googleCode: '',
                },
                // 释放手续费表单验证码
                releaseValidate: {
                    googleCode: [{required: true, message: '请输入6位数google验证码', max: 6, min: 6, trigger: 'blur'}]
                }
            }
        },
        methods: {
            // 查询
            search() {
                this.pageIndex = 1 // 重置页码
                this.totalCount = 1 // 重置数据总数量
                this.findData()
            },
            // 切换每页显示条数
            changePageSize(size) {
                this.pageSize = size
                if (this.pageIndex === 1) {
                    this.findData()
                }
            },
            // 页数改变时
            changePage(page) {
                this.pageIndex = page
                this.findData()
            },
            // 弹框查看图片
            modalLookBgImg() {
                this.modalImgVisible = true
            },
            // 弹框删除图片
            modalDelBgImg() {
                this.modalFormData.logoUrl = ''
            },
            // 上传失败
            handleFormatError(file) {
                this.$Notice.warning({
                    title: '文件格式不正确',
                    desc: '文件 ' + file.name + ' 格式不正确，请选择 jpg 或者 png 格式。'
                });
            },
            // 超出限制大小
            handleMaxSize(file) {
                this.$Notice.warning({
                    title: '超出文件大小限制',
                    desc: '文件：' + file.name + ' 过大，不能超过 100kb'
                });
            },
            // 上传成功
            handleSuccess(file) {
                this.modalFormData.logoUrl = file.data
            },
            optionChange() {
                this.pageIndex = 1
                this.pageSize = 20
                this.findData()
            },
            // 编辑
            edit(params) {
                console.log(params)
                this.id = params.row.id
                if(params.row.isCustomize) {
                    this.customEdit.customName = params.row.name || ''
                    this.customEdit.customDomain = params.row.domainName || ''
                    this.customEdit.customAccount = params.row.userName
                    this.customEditModal = true
                } else {
                    this.modalFormData.bourseName = params.row.name || ''
                    this.modalFormData.logoUrl = params.row.logo || ''
                    this.showModal = true
                }
            },

            // 定制交易所弹框取消
            customCancal() {
                this.customModal = false
                this.$refs.customForm.resetFields()
            },
            // 定制交易所弹框保存
            customSave() {
                this.$refs.customForm.validate(valid => {
                    if (valid) {
                        let args = {
                            name: this.custom.customName,
                            domainName: this.custom.customDomain,
                            exxUserName: this.custom.customAccount
                        }
                        Api.customSave(args).then(res => {
                            if (res.data.code === 1) {
                                this.$Message.success(res.data.msg)
                                // this.customModal = false
                                this.customCancal()
                                this.findData()
                            }
                        })
                    }
                })
            },
            // 定制交易所编辑保存
            customEditSave() {
                let { customAccount, ...params} = this.customEdit
                let args = {
                    stationId: this.id,
                    name: params.customName,
                    domainName: params.customDomain
                }
                Api.customEditSave(args).then(res => {
                    if(res.data.code === 1) {
                        this.$Message.success(res.data.msg)
                        this.findData()
                        this.customEditModal = false
                    }
                })
            },
            // 弹框保存
            editSave() {
                // 图片是否上传图片
                if (!this.modalFormData.logoUrl) {
                    this.$Message.error({content: '请上传交易所logo', duration: 2})
                    return
                }
                this.$refs.modalForm.validate(valid => {
                    if (valid) {
                        let args = {
                            id: this.id,
                            name: this.modalFormData.bourseName,
                            logo: this.modalFormData.logoUrl
                        }
                        Api.update(args).then(res => {
                            if (res.data.code === 1) {
                                this.$Message.success(res.data.msg)
                                // this.showModal = false
                                this.customCancal()
                                this.findData()
                            }
                        })
                    }
                })
            },
            // 编辑弹框保存
            editCancal() {
                this.showModal = false
                this.$refs.modalForm.resetFields()
            },
            // 表格手续费状态转换为文字
            transStatusText(status) {
                switch (status) {
                    // 1:已锁定,2:已收取,3:已释放
                    case 1:
                        return '已锁定'
                    case 2:
                        return '已收取'
                    case 3:
                        return '已释放'
                    default:
                        return ''
                }
            },
            // 释放手续费确认操作
            releaseConfirm() {
                this.$refs.relaeseForm.validate(valid => {
                    if (valid) {
                        let args = {
                            id: this.id,
                            googleCode: this.releaseForm.googleCode
                        }
                        Api.release(args).then(res => {
                            if (res.data.code === 1) {
                                this.$Message.success(res.data.msg)
                                this.releaseVisible = false
                                this.findData()
                            }
                        })
                    }
                })
            },
            // 释放手续费取消操作
            releaseCancel() {
                this.$refs.relaeseForm.resetFields()
                this.releaseVisible = false
            },
            // 启用禁用
            ableOrDisable(params) {
                let {id, isEnable} = params.row,
                    index = params.index,
                    args = {id, isEnable: isEnable ? 0 : 1}
                Api.ableOrDisable(args).then(res => {
                    // this.findData()
                    this.$Message.success(res.data.msg)
                    this.tableData[index].isEnable = res.data.data.isEnable
                })
            },
            // 查询数据
            findData() {
                /**
                 * @params { pageIndex } 页码
                 * @params { pageSize } 每页显示的数据量
                 * @params { userName } 用户名
                 * @params { bourseName } 交易所名称
                 * @params { bourseAddr } 交易所地址
                 * @params { chargeStatus } 手续费状态
                 * @params { siteSetting } 站点配置
                 * @params { siteStatus } 站点状态
                 */
                // 去除前后空格
                this.userName = this.userName.trim()
                this.bourseAddr = this.bourseAddr.trim()
                this.bourseName = this.bourseName.trim()
                let {pageIndex, pageSize, userName, bourseName, bourseAddr, chargeStatus, siteSetting, siteStatus, isCustomize} = this,
                    args = {
                        domainName: bourseAddr,
                        feeStatus: chargeStatus,
                        isEnable: siteStatus,
                        name: bourseName,
                        pageIndex,
                        pageSize,
                        status: siteSetting,
                        userName: userName,
                        isCustomize
                    }
                Api.find(args).then(res => {
                    this.tableData = res.data.data.obj || [],
                        this.totalCount = res.data.data.totalCount || 1
                })
            }
        },
        created() {
            this.findData()
        }
    }
</script>

<style lang="less" scoped>
    .bg-img {
        display: inline-block;
        width: 55px;
        height: 55px;
        text-align: center;
        line-height: 55px;
        border: 1px solid transparent;
        border-radius: 4px;
        overflow: hidden;
        background: #fff;
        position: relative;
        box-shadow: 0 1px 1px rgba(0, 0, 0, .2);
        margin-right: 4px;
    }

    .bg-img-cover {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, .6);
        display: none;
    }

    .bg-img-cover i {
        color: #fff;
        font-size: 15px;
        margin: 0 6px;
        cursor: pointer;
    }

    .bg-img:hover .bg-img-cover {
        display: block;
    }
</style>

