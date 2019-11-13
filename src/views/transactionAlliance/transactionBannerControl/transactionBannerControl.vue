<template>
    <div class="trans-banner-contr">
        <Row style="padding: 15px 10px">
            <Col>
            <span>用户名：</span>
            <Input style="width:200px" placeholder="使用用户名查找" v-model="userName"></Input>
            <span class="left-space">Banner状态：</span>
            <Select style="width: 100px" v-model="isEnable" @on-change="selectLang">
                <Option value="">全部</Option>
                <Option value="0">下架</Option>
                <Option value="1">上架</Option>
            </Select>
            <span class="left-space">语言：</span>
            <Select style="width: 100px" v-model="languageType" @on-change="selectLang">
                <Option value="">全部</Option>
                <Option value="1">简体中文</Option>
                <Option value="2">英文</Option>
            </Select>
            <div style="display: inline-block" v-if="$isCustomize()">
                <span class="left-space">来源：</span>
                <Select style="width: 100px" v-model="from" placeholder="全部" @on-change="selectLang">
                    <Option value="">全部</Option>
                    <Option :value="item.stationName" v-for="(item, index) in froms" :key="index">{{ item.stationName }}</Option>
                </Select>
            </div>
            <Button class="left-space" type="primary" @click="reload">刷新</Button>
            <Input style="width:200px; margin-left:20px" placeholder="搜索活动名称" v-model="name"></Input>
            <Button type="primary" class="left-space" @click="search">搜索</Button>
            </Col>
            <Button type="info" class="add-banner" @click="addBaner" v-if="g_perm('save') && !$isCustomize()">新增广告位</Button>
        </Row>
        <Table border :columns="tHeaderData" :data="tableData"></Table>
        <div style="position: relative">
            <Page class="pages" show-sizer show-elevator :total="totalCount" :page-size-opts="pageSizeOpts"
                  :page-size="pageSize" @on-page-size-change="changePageSize" @on-change="changePage" :current="pageIndex"></Page>
        </div>

        <!-- 编辑Modal -->
        <Modal v-model="showModal" :mask-closable="false" :title="modalTitle" @on-cancel="modalCancel">
            <Form :model="modalForm" :label-width="180" :rules="ruleValidate" ref="modalForm">
                <FormItem label="序号" prop="sort">
                    <Input style="width:50%" placeholder="请输入序号" v-model="modalForm.sort"></Input>
                </FormItem>
                <FormItem label="上架时间" prop="upTime">
                    <DatePicker type="datetime" show-week-numbers placeholder="请选择上架时间" :value="modalForm.upTime"
                                @on-change="val=>modalForm.upTime=val"></DatePicker>
                </FormItem>
                <FormItem label="活动名称" prop="name">
                    <Input style="width:80%" placeholder="请输入活动名称" v-model="modalForm.name"></Input>
                </FormItem>
                <FormItem label="语言" prop="languageType">
                  <Select v-model="modalForm.languageType" style="width:50%" placeholder="请选择语言">
                    <Option :value="1">简体中文</Option>
                    <Option :value="2">英文</Option>
                  </Select>
                </FormItem>
                <FormItem label="背景图" required>
                    <div class="bg-img" v-if="modalForm.backImg !== ''">
                        <template>
                            <img :src="modalForm.backImg">
                            <div class="bg-img-cover">
                                <Icon type="ios-eye-outline" @click.native="modalLookBgImg"></Icon>
                                <Icon type="ios-trash-outline" @click.native="modalDelBgImg"></Icon>
                            </div>
                        </template>
                    </div>
                    <Upload
                            v-else
                            ref="upload"
                            :show-upload-list="false"
                            :on-success="handleSuccess"
                            :format="['jpg','jpeg','png']"
                            :max-size="2048"
                            :on-format-error="handleFormatError"
                            :on-exceeded-size="handleMaxSize"
                            type="drag"
                            :action="req_url + 'fileUpload'"
                            style="display: inline-block;width:100px;">
                        <div style="width: 100px;height:100px;line-height: 120px;">
                            <Icon type="camera" size="40"></Icon>
                        </div>
                    </Upload>

                </FormItem>
                <FormItem label="链接地址" prop="url">
                    <Input style="width:80%" placeholder="请输入链接地址" v-model="modalForm.url"></Input>
                    <p style="color:#aaa">跳转链接请以 “ // ” 开头</p>
                </FormItem>
                <FormItem label="链接打开方式" prop="openMode">
                    <RadioGroup v-model="modalForm.openMode">
                        <Radio label="1"><span>新页面</span></Radio>
                        <Radio label="2"><span>当前页</span></Radio>
                    </RadioGroup>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button @click="modalCancel">取消</Button>
                <Button type="primary" @click="modalConfirm">确定</Button>
            </div>
        </Modal>
        <!-- 查看大图 -->
        <Modal title="查看大图" v-model="modalImgVisible">
            <!-- <img src="http://t2.hddhhn.com/uploads/tu/201610/198/rycq0w4v0dr.jpg" v-if="modalImgVisible" style="width: 100%"> -->
            <img :src="modalForm.backImg" v-if="modalImgVisible" style="width: 100%">
        </Modal>
    </div>
</template>

<script>
    import api from '@/api/transactionAlliance/transBannerContr.js'
    import axios from 'axios'
    import commonApi from '@/api/commonApi/commonApi.js'

    export default {
        data() {
            return {
                req_url: axios.defaults.baseURL, // 文件上传地址
                pageIndex: 1, // 页码
                pageSize: 20, // 每页显示的数据量
                userName: '', // 用户名
                isEnable: '', // banner 状态
                languageType: '', // 语言
                name: '', // 活动名称
                from: '', // 来源
                froms: null, // 所有来源
                modalTitle: '', // modal的标题
                // 表头
                tHeaderData: [
                    {title: '序号', key: 'sort'},
                    {title: '用户名', key: 'userName'},
                    // {title: '站点名称', key: 'stationName'},
                    // {title: '来源', key: 'stationName'},
                    {title: '站点地址', key: 'domainName'},
                    // {
                    //     title: 'Banner状态', key: 'isEnable',
                    //     render: (h, params) => {
                    //         return h('span', params.row.isEnable ? '上架' : '下架')
                    //     }
                    // },
                    {title: '上架时间', key: 'upTime'},
                    {title: '语言', key: 'languageType',
                        render: (h, params) => {
                            return h('span', params.row.languageType === 1 ? '简体中文' : '英文') // 1 简体中文 2 英文
                        }
                    },
                    {title: '活动名称', key: 'name'},
                    {
                        title: '背景图', key: 'backImg', align: 'center',
                        render: (h, params) => {
                            return h('img', {
                                attrs: {
                                    src: params.row.backImg,
                                    width: '80',
                                    height: '80'
                                },
                                style: {
                                    padding: '4px'
                                }
                            })
                        }
                    },
                    // {title: '内容图', key: 'userName'},
                    {title: '链接地址', key: 'url'},
                    {
                        title: '链接打开方式', key: 'openMode',
                        render: (h, params) => {
                            return h('span', params.row.openMode === 1 ? '新页面' : '当前页') // 1 新页面；2 当前页
                        }
                    },
                    {title: '创建时间', key: 'createTime'},
                    {title: '修改时间', key: 'updateTime'},
                    {
                        title: '操作', key: 'operations',
                        render: (h, params) => {
                            return h('div', [
                                this.g_perm('edit') ? h('Button', {
                                    props: {
                                        type: 'primary',
                                        size: 'small'
                                    },
                                    style: {
                                        margin: '2px'
                                    },
                                    on: {
                                        click: () => {
                                            this.editModal(params)
                                        }
                                    }
                                }, '编辑') : '',
                                this.g_perm('up') ? h('Button', {
                                    props: {
                                        type: 'primary',
                                        size: 'small',
                                        disabled: params.row.isEnable === 1 ? true : false // isEnable 为 1 只能下架
                                    },
                                    style: {
                                        margin: '2px'
                                    },
                                    on: {
                                        click: () => {
                                            this.upOrDown(params)
                                        }
                                    }
                                }, '上架') : '',
                                this.g_perm('down') ? h('Button', {
                                    props: {
                                        type: 'warning',
                                        size: 'small',
                                        disabled: params.row.isEnable === 1 ? false : true // isEnable 为 1 只能下架
                                    },
                                    style: {
                                        margin: '2px'
                                    },
                                    on: {
                                        click: () => {
                                            this.upOrDown(params)
                                        }
                                    }
                                }, '下架') : '',
                                this.g_perm('delete') ? h('Button', {
                                    props: {
                                        type: 'error',
                                        size: 'small'
                                    },
                                    style: {
                                        margin: '2px'
                                    },
                                    on: {
                                        click: () => {
                                            this.delHandle(params)
                                        }
                                    }
                                }, '删除') : '',
                            ])
                        }
                    },
                ],
                // 表格数据
                tableData: [],
                totalCount: 0, // 当前条件下数据总量
                pageSizeOpts: [10, 20, 50, 100],
                showModal: false, // 显示编辑弹窗
                modalImgVisible: false, // 弹框图片查看大图
                modalForm: {
                    sort: '', // 序号
                    upTime: '', // 上架时间
                    name: '', // 活动名称
                    backImg: '', // 背景图
                    languageType: '', // 语言
                    url: '', // 链接地址
                    openMode: 1 // 打开方式，1 新页面，2当前页
                },
                // 表单验证规则
                ruleValidate: {
                    sort: [{
                        required: true, trigger: 'blur', validator: (rule, value, callback) => {
                            value = value.toString() // 一开始值是数值类型，转为string再判断
                            if (value.replace(/\s/g, '') === '') {
                                callback(new Error('序号不能为空'))
                            } else if (/\D|\./g.test(value)) {
                                callback(new Error('序号只能是正整数'))
                            } else {
                                callback()
                            }
                        }
                    }],
                    upTime: [{required: true, message: '时间不能为空', trigger: 'change'}],
                    name: [{
                        required: true, trigger: 'blur', validator: (rule, value, callback) => {
                            if (value.replace(/\s/g, '') === '') {
                                callback(new Error('活动名称'))
                            } else {
                                callback()
                            }
                        }
                    }],
                    // backImg: [{required: true, message: '背景图不能为空', trigger: 'change' }],
                    url: [{
                        required: true, trigger: 'blur', validator: (rule, value, callback) => {
                            if (value.replace(/\s/g, '') === '') {
                                callback(new Error('链接地址不能为空'))
                            } else {
                                callback()
                            }
                        }
                    }],
                    languageType: [{
                        required: true, trigger: 'change', validator: (rule, value, callback) => {
                            if (!value) {
                                callback(new Error('请选择语言'))
                            } else {
                                callback()
                            }
                        }
                    }],
                    openMode: [{
                        required: true, trigger: 'change', validator: (rule, value, callback) => {
                            value = value.toString() // 一开始值是数值类型，转为string再判断
                            if (value === '') {
                                callback(new Error('链接地址请选择链接打开方式不能为空'))
                            } else {
                                callback()
                            }
                        }
                    }]
                },
                isAdd: false
            }
        },
        methods: {
            // 新增广告位
            addBaner() {
                this.modalTitle = "新增广告位"
                this.showModal = true
                this.isAdd = true
            },
            // 切换每页显示条数
            changePageSize(size) {
                this.pageSize = size
                if (this.pageIndex === 1) {
                    this.getData()
                }
            },
            // 页数改变时
            changePage(page) {
                this.pageIndex = page
                this.getData()
            },
            // 选择语言事件
            selectLang() {
                this.pageIndex = 1
                this.pageSize = 20
                this.getData()
            },
            // 刷新
            reload() {
                this.pageIndex = 1 // 页码
                this.pageSize = 20 // 每页显示的数据量
                this.userName = '' // 用户名
                this.isEnable = '' // banner 状态
                this.languageType = '' // 语言
                this.name = '' // 活动名称
                this.totalCount = 1
                this.getData()
            },
            // 搜索
            search() {
                this.pageIndex = 1 // 重置页码
                this.totalCount = 1 // 重置数据总数量
                this.getData()
            },
            // 上下架
            upOrDown(params) {
                let {id, isEnable} = params.row,
                    index = params.index,
                    args = {id, isEnable: isEnable === 1 ? 0 : 1}
                api.upOrDownTransBanner(args).then(res => {
                    if (res.data.code === 1) {
                        this.tableData[index].isEnable = res.data.data
                        this.$Message.success(res.data.msg)
                    }
                })
            },
            // 删除
            delHandle(params) {
                let {id} = params.row,
                    index = params.index,
                    args = {id}
                api.deleteTransBanner(args).then(res => {
                    if (res.data.code === 1) {
                        this.tableData.splice(index, 1) // 删除
                        this.$Message.success(res.data.msg)
                    }
                })
            },
            // 编辑
            editModal(params) {
                this.showModal = true
                this.isAdd = false
                this.modalTitle = "编辑信息"
                for (let item in this.modalForm) {
                    this.modalForm[item] = params.row[item]
                }
                this.modalForm.id = params.row.id
            },
            // 弹框查看图片
            modalLookBgImg() {
                this.modalImgVisible = true
            },
            // 弹框删除图片
            modalDelBgImg() {
                this.modalForm.backImg = ''
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
                    desc: '文件：' + file.name + ' 过大，不能超过 2M'
                });
            },
            // 上传成功
            handleSuccess(file) {
                this.modalForm.backImg = file.data
            },
            // 弹框取消
            modalCancel() {
                this.$refs['modalForm'].resetFields();
                this.modalForm.backImg = ''
                this.showModal = false
            },
            // 弹框确定
            modalConfirm() {
                if (!this.modalForm.backImg) {
                    this.$Message.error('背景图不能为空')
                    return
                }
                this.$refs.modalForm.validate(valid => {
                    if (valid) {
                        if(this.isAdd) {
                            let {id, ...arr} = this.modalForm
                            arr.upTime = new Date(arr.upTime)
                            api.addBanner(arr).then(res => {
                                if (res.data.code === 1) {
                                    this.$Message.success(res.data.msg)
                                    this.getData()
                                    this.showModal = false
                                }
                            })
                        } else {
                            api.updateTransBanner(this.modalForm).then(res => {
                                if (res.data.code === 1) {
                                    this.$Message.success(res.data.msg)
                                    this.getData()
                                    this.showModal = false
                                }
                            })
                        }
                    }
                })
            },
            // 获取数据
            getData() {
                this.userName = this.userName.trim()
                this.name = this.name.trim()
                let {pageIndex, pageSize, userName, isEnable, languageType, name, from} = this,
                    args = {pageIndex, pageSize, userName, isEnable, languageType, name, stationName: from}
                api.getTransBanner(args).then(res => {
                    if (res.data.code === 1) {
                        this.tableData = res.data.data.obj
                        this.totalCount = res.data.data.totalCount || 1
                    }
                })
            },
            // 获取所有来源
            async getFroms() {
                const { data } = await commonApi.getForm()
                if (data.code === 1) {
                    this.froms = data.data
                }
            }
        },
        created() {
            this.getFroms()
            this.getData()
            // 如果是定制交易所
            if(this.$isCustomize()) {
                this.tHeaderData.splice(1, 0,
                    {title: '站点名称', key: 'stationName'}
                )
            }
        }
    }
</script>

<style lang="less" scoped>
    .add-banner {
        position: absolute;
        bottom: 15px;
        right: 10px;
    }
    .left-space {
        margin-left: 15px;
    }

    .bg-img {
        display: inline-block;
        width: 100px;
        height: 100px;
        text-align: center;
        line-height: 115px;
        border: 1px solid transparent;
        border-radius: 4px;
        overflow: hidden;
        background: #fff;
        position: relative;
        box-shadow: 0 1px 1px rgba(0, 0, 0, .2);
        margin-right: 4px;
    }

    .bg-img img {
        width: 100%;
        height: 100%;
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
        font-size: 30px;
        margin: 0 6px;
        cursor: pointer;
    }

    .bg-img:hover .bg-img-cover {
        display: block;
    }

    .upload-btn {
        height: 100px;
        border: 1px dashed #dddee1;
        vertical-align: top;
        box-sizing: border-box;
    }

    .upload-btn-icon {
        display: block;
        width: 100px;
        height: 100px;
        text-align: center;
    }

    .upload-btn-icon i {
        margin-top: 20px;
    }

    .upload-btn-icon span {
        display: block;
    }
</style>

