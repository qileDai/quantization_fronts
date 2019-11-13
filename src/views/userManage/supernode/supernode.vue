<style lang="less" scoped>
    @import '../../../styles/common.less';
    @import 'supernode.less';
</style>
<style>
    /*隐藏表格全选*/
    .cointable .ivu-table-header .ivu-checkbox-wrapper{
        visibility: hidden;
    }
</style>

<template>
    <div class="content">
        <Row class="et-row">
            <Col>
                <span>提交日期：</span>
                <span class="option-text">从</span>
                <DatePicker v-model="startDateObj" format="yyyy-MM-dd" :options="optionsStart" :editable="false" @on-change="setStartDateVal" type="date" placeholder="请选择开始日期" style="width: 180px"></DatePicker>
                <span class="option-text">到</span>
                <DatePicker v-model="endDateObj" format="yyyy-MM-dd" :options="optionsEnd" :editable="false" @on-change="setEndDateVal" type="date" placeholder="请选择结束日期" style="width: 180px"></DatePicker>
                <span style="margin-left: 15px;">超级节点名称：</span>
                <div class="search-out" @keydown.enter="searchData">
                    <Input v-model="nodename" placeholder="请输入超级节点名称" clearable></Input>
                </div>
                <Button type="primary" icon="ios-search" @click="searchData">查询</Button>
                <Button type="info" class="add_account" icon="plus-round" @click="showEditModal(null, 0)" v-if="g_perm('add')">新增超级节点</Button>
            </Col>
        </Row>
        <Table border :columns="tableColumns" :data="tableData"></Table>
        <div style="position: relative;">
            <Page class="pages" :current="pageNum" :total="total" show-elevator show-sizer :page-size="pageSize" :page-size-opts="sizeOpts" @on-change="changePageNum" @on-page-size-change="changePageSize"></Page>
        </div>
        <Modal v-model="modalStatus" :title="modalTitle" width="1000" @on-cancel="handleReset" :mask-closable="false">
            <Form ref="formItem" :model="formItem" :label-width="120" :rules="ruleValidate">
                <!--节点logo-->
                <div class="uploadblock" style="margin-bottom: 15px;">
                    <label class="upload-label" style="width: 120px;">节点logo</label>
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
                            <span class="up-tip">请上传节点logo</span>
                        </div>
                    </Upload>
                </div>
                <FormItem label="序号" prop="sortNum" class="inline-item">
                    <Input v-model="formItem.sortNum" style="width:200px" placeholder="请输入序号（数字）"></Input>
                </FormItem>
                <FormItem label="节点名称" prop="name">
                    <Input v-model.trim="formItem.name" style="width:200px" placeholder="请输入节点名称"></Input>
                </FormItem>
                <FormItem label="节点名称(英文)" prop="nameEn">
                    <Input v-model.trim="formItem.nameEn" style="width:200px" placeholder="请输入节点名称(英文)"></Input>
                </FormItem>
                <FormItem label="节点评级" prop="nodeLevel">
                    <Select v-model="formItem.nodeLevel" style="width:200px" placeholder="请选择节点评级">
                        <Option v-for="item in levelList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                    </Select>
                </FormItem>
                <FormItem label="节点简介" prop="nodeInfo">
                    <Input v-model="formItem.nodeInfo" type="textarea" :rows="3" placeholder="请输入节点简介(1000字以内)" style="width:400px"></Input>
                </FormItem>
                <FormItem label="节点简介(英文)" prop="nodeInfoEn">
                    <Input v-model="formItem.nodeInfoEn" type="textarea" :rows="3" placeholder="请输入节点简介(英文)(1000字以内)" style="width:400px"></Input>
                </FormItem>
                <!--团队照片-->
                <div class="uploadblock" style="margin-bottom: 15px;">
                    <label class="upload-label" style="width: 120px;">团队照片</label>
                    <Upload v-show="uploadList2.length < 4"
                            ref="upload2"
                            multiple
                            :show-upload-list="false"
                            :on-success="handleSuccess2"
                            :format="['jpg','jpeg','png']"
                            :max-size="2048"
                            :on-format-error="handleFormatError"
                            :on-exceeded-size="handleMaxSize"
                            :before-upload="handleBeforeUpload2"
                            type="drag"
                            :action="req_url + 'fileUpload'"
                            style="display: inline-block;width:100px;">
                        <div style="height:58px; padding: 10px 0;">
                            <Icon type="camera" size="20"></Icon>
                            <span class="up-tip">添加团队照片</span>
                        </div>
                    </Upload>
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
                    <p class="imgtip">最多可添加 4 张图片（至少添加 1 张）</p>
                </div>
                <FormItem label="已推荐项目" prop="projects">
                    <span style="margin-right: 15px;" v-if="recommendedProject.length === 0">暂无推荐项目</span>
                    <Tag v-for="item in recommendedProject" :key="item.coinName" :name="item.coinName" :fade="false" closable @on-close="handleClosePro">{{item.coinName + ' ' + applyState[item.applyState]}}</Tag>
                    <Button icon="ios-plus-empty" type="info" size="small" @click="handleAdd">添加推荐项目</Button>
                </FormItem>
                <h3 class="formitem-title">联系人信息</h3>
                <FormItem label="项目联系人" prop="projectContact">
                    <Input v-model="formItem.projectContact" placeholder="请输入项目联系人" style="width: 300px;"></Input>
                </FormItem>
                <p class="formtip" style="margin-left: 120px;">联系方式 <span>（以下两种联系方式至少填写其中一种）</span></p>
                <FormItem label="手机号码" prop="phone">
                    <Input v-model="formItem.phone" ref="phone" placeholder="请输入联系电话" style="width: 300px;"></Input>
                </FormItem>
                <FormItem label="SKYPE" prop="skype">
                    <Input v-model="formItem.skype" ref="skype" placeholder="请输入联系Skype" style="width: 300px;"></Input>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button type="text" size="large" @click="handleReset">取消</Button>
                <Button type="primary" size="large" @click="handleSubmit">确定</Button>
            </div>
        </Modal>
        <!--预览图片-->
        <Modal title="预览" width="800" v-model="visible" class="viewimg">
            <img :src="imgUrl" v-if="visible" style="max-width: 100%;">
        </Modal>
        <!--添加推荐项目-->
        <Modal v-model="modalStatusPro" title="添加推荐项目" width="600" @on-cancel="handleResetPro" :mask-closable="false">
            <Row class="et-row">
                <Col>
                    <span>币种简称：</span>
                    <div class="search-out" style="margin-left: 0; margin-right: 5px;" @keydown.enter="searchDataPro">
                        <Input v-model="searchValPro" placeholder="搜索币种简称" clearable></Input>
                    </div>
                    <Button type="primary" icon="ios-search" @click="searchDataPro">查询</Button>
                </Col>
            </Row>
            <Table class="cointable" border :columns="tableColumnsPro" :data="tableDataPro" @on-selection-change="setSelectedItemsPro" @on-select-cancel="setCancelItemsPro"></Table>
            <div style="position: relative;" v-if="modalStatusPro">
                <Page class="pages" :total="totalPro" :page-size="pageSizePro" @on-change="changePageNumPro"></Page>
            </div>
            <div slot="footer">
                <Button type="text" size="large" @click="handleResetPro">取消</Button>
                <Button type="primary" size="large" @click="handleSubmitPro">确认添加</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import api from '@/api/users'
    import coinApi from '@/api/coins'
    import axios from '@/axios/config'

    export default {
        name: 'supernode',
        data () {
            const numberSort = (rule, value, callback) => {
                if (isNaN(value) || value < 0) {
                    callback(new Error('序号必须为大于等于0数字'));
                }
                callback();
            };
            return {
                req_url: axios.defaults.baseURL,
                tableColumns: [
                    {
                        width: 80,
                        title: '序号',
                        key: 'sortNum'
                    },
                    {
                        title: '节点logo',
                        key: 'nodeLogo',
                        width: 90,
                        render: (h, params) => {
                            return h('img', {
                                attrs: {
                                    'src': params.row.nodeLogo,
                                    'width': 50,
                                    'height': 50
                                }
                            });
                        }
                    },
                    {
                        title: '节点名称',
                        key: 'name'
                    },
                    {
                        title: '节点名称(英文)',
                        key: 'nameEn'
                    },
                    {
                        title: '节点简介',
                        key: 'nodeInfo',
                        render: (h, params) => {
                            return h('span', (params.row.nodeInfo && params.row.nodeInfo.length > 50) ? params.row.nodeInfo.substring(0, 50) + '…' : params.row.nodeInfo);
                        }
                    },
                    {
                        title: '节点简介(英文)',
                        key: 'nodeInfoEn',
                        render: (h, params) => {
                            return h('span', (params.row.nodeInfoEn && params.row.nodeInfoEn.length > 50) ? params.row.nodeInfoEn.substring(0, 50) + '…' : params.row.nodeInfoEn);
                        }
                    },
                    {
                        title: '已推荐项目',
                        render: (h, params) => {
                            return h('span', this.getProjects(params.row.projectVOS));
                        }
                    },
                    {
                        title: '联系人',
                        width: 100,
                        key: 'projectContact'
                    },
                    {
                        title: '手机号码',
                        width: 120,
                        key: 'phone'
                    },
                    {
                        title: 'SKYPE',
                        key: 'skype'
                    },
                    {
                        title: '提交时间',
                        key: 'createtime',
                        render: (h, params) => {
                            return h('span', params.row.createtime ? params.row.createtime.split('.')[0] : '');
                        }
                    },
                    {
                        title: '更新时间',
                        key: 'updatetime',
                        render: (h, params) => {
                            return h('span', params.row.updatetime ? params.row.updatetime.split('.')[0] : '');
                        }
                    },
                    {
                        title: '评级',
                        key: 'nodeLevel',
                        width: 220,
                        render: (h, params) => {
                            return h('Rate', {
                                props: {
                                    value: params.row.nodeLevel,
                                    disabled: true,
                                    showText: true
                                }
                            });
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
                                            this.deleteTip(params.row);
                                        }
                                    }
                                }, '删除') : ''
                            ]);
                        }
                    }
                ],
                tableColumnsPro: [
                    {
                        type: 'selection',
                        width: 60,
                        align: 'center'
                    },
                    {
                        title: '币种简称',
                        key: 'coinName'
                    },
                    // 用户上币申请状态 1:审核中 2:未通过 3:已通过代缴费 4:调试中 5:已上线
                    {
                        title: '状态',
                        key: 'applyState',
                        render: (h, params) => {
                            return h('span', this.applyState[params.row.applyState]);
                        }
                    }
                ],
                levelList: [
                    {
                        value: '1',
                        label: '1星'
                    },
                    {
                        value: '2',
                        label: '2星'
                    },
                    {
                        value: '3',
                        label: '3星'
                    },
                    {
                        value: '4',
                        label: '4星'
                    },
                    {
                        value: '5',
                        label: '5星'
                    }
                ],
                applyState: ['-', '审核中', '未通过', '已通过', '调试中', '已上线'], // 用户上币申请状态 1:审核中 2:未通过 3:已通过代缴费 4:调试中 5:已上线  0是老数据
                startDateObj: '',
                endDateObj: '',
                nodeStart: '',
                nodeEnd: '',
                nodename: '',
                // loading: false,
                modalTitle: '添加',
                modalStatus: false,
                tableData: [],
                modalStatusPro: false,
                tableDataPro: [],
                searchValPro: '',
                selectionsPro: [], // 已选中集合
                formItem: {
                    id: '',
                    nodeLogo: '',
                    sortNum: '',
                    name: '',
                    nameEn: '',
                    nodeLevel: '',
                    nodeInfo: '',
                    nodeInfoEn: '',
                    projectContact: '',
                    phone: '',
                    skype: '',
                    // teamPhoto: '',
                    // recommendedProject: ''
                },
                // 需要处理的字段
                teamPhoto: [],
                recommendedProject: [],
                ruleValidate: {
                    sortNum: [
                        {required: true, message: '请输入序号（数字）', trigger: 'blur'},
                        {validator: numberSort, trigger: 'blur'}
                    ],
                    name: [
                        {required: true, message: '请输入节点名称', trigger: 'blur'}
                    ],
                    nodeLevel: [
                        {required: true, message: '请选择节点评级', trigger: 'change'}
                    ],
                    nodeInfo: [
                        {required: true, max: 1000, message: '请输入节点简介(1000字以内)', trigger: 'blur'}
                    ],
                    nodeInfoEn: [
                        {required: false, max: 1000, message: '请输入节点简介(英文)(1000字以内)', trigger: 'blur'}
                    ],
                    projectContact: [
                        {required: true, message: '请输入项目联系人', trigger: 'blur'}
                    ]
                },
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
                pageNum: 1,
                pageSize: 20,
                total: 0, // 总页数
                sizeOpts: [10, 20, 50, 100],
                pageNumPro: 1,
                pageSizePro: 10,
                totalPro: 0, // 总页数
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
                        if (!this.formItem.nodeLogo) {
                            this.$Message.warning('请上传节点logo！');
                            return;
                        }
                        if (this.teamPhoto.length === 0) {
                            this.$Message.warning('请至少上传1张团队照片！');
                            return;
                        }
                        if (this.formItem.phone === '' && this.formItem.skype === '') {
                            this.$Message.warning('手机号码 和 SKYPE 请至少填写其中一种！');
                            this.$refs.phone.focus();
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

                this.teamPhoto = [];
                this.recommendedProject = [];

                this.$refs.formItem.resetFields();

                this.modalStatus = false;

                this.$refs.upload1.fileList.splice(0, 1);
                this.$refs.upload2.fileList.splice(0);
            },
            handleSubmitPro () {
                if (this.selectionsPro.length === 0) {
                    this.$Message.warning('未选中任何记录！');
                    return;
                }

                // 赋值
                this.recommendedProject = this.selectionsPro.concat();

                this.handleResetPro();
            },
            handleResetPro () {
                this.pageNumPro = 1;
                this.totalPro = 0;
                this.tableDataPro = [];
                this.searchValPro = '';
                this.selectionsPro = [];

                this.modalStatusPro = false;
            },
            submitRequest () {
                let params = {
                }
                let obj = Object.assign(params, this.formItem);

                // 处理特殊字段
                let recommendedArr = [];
                this.recommendedProject.forEach((item, index) => {
                    recommendedArr.push(item.id);
                });
                obj.recommendedProject = recommendedArr.join(',');

                obj.teamPhoto = this.teamPhoto.join(',');

                if (this.editType == 0) {
                    api.addSuperNode(obj).then((res) => {
                        if (res.data.code == 1) {
                            this.$Message.success('添加成功！');
                            this.handleReset();
                            // 提交成功重新获取
                            this.getListData();
                        }
                    });
                } else if (this.editType == 1) {
                    api.updateSuperNode(obj).then((res) => {
                        if (res.data.code == 1) {
                            this.$Message.success('修改成功！');
                            this.handleReset();
                            // 提交成功重新获取
                            this.getListData();
                        }
                    });
                }
            },
            deleteTip (item) {
                this.$Modal.confirm({
                    title: '提示',
                    content: '确认删除 ' + item.name + ' ？',
                    onOk: () => {
                        this.deleteRequest(item);
                    }
                });
            },
            deleteRequest (item) {
                let params = {
                    id: item.id
                }
                api.deleteSuperNode(params).then((res) => {
                    if (res.data.code == 1) {
                        this.$Message.success('删除成功!');
                        // 提交成功重新获取
                        this.getListData();
                    }
                });
            },
            showEditModal (currRow, type) {
                this.editType = type;
                if (type == 0) {
                    this.modalTitle = '新增超级节点';

                    // 添加
                    this.setFormItem();
                } else if (type == 1) {
                    this.modalTitle = '编辑超级节点';

                    // 赋值表单
                    this.setFormItem(currRow);
                }

                this.modalStatus = true;
            },
            setFormItem (row) {
                if (row) {
                    this.formItem.id = row.id;
                    this.formItem.nodeLogo = row.nodeLogo;
                    this.formItem.sortNum = row.sortNum + '';
                    this.formItem.name = row.name;
                    this.formItem.nameEn = row.nameEn;
                    this.formItem.nodeLevel = row.nodeLevel + '';
                    this.formItem.nodeInfo = row.nodeInfo;
                    this.formItem.nodeInfoEn = row.nodeInfoEn;
                    this.formItem.projectContact = row.projectContact;
                    this.formItem.phone = row.phone;
                    this.formItem.skype = row.skype;

                    this.teamPhoto = row.teamPhoto.split(',');

                    // 处理coinId
                    row.projectVOS.forEach((item, index) => {
                        item.id = item.coinId;
                    });
                    this.recommendedProject = row.projectVOS.concat();

                    // 显示已上传图片
                    let obj1 = {};
                    obj1.status = 'finished';
                    obj1.url = this.formItem.nodeLogo;
                    this.uploadList1[0] = obj1;

                    this.teamPhoto.forEach((item, index) => {
                        let obj2 = {};
                        obj2.status = 'finished';
                        obj2.url = item;
                        this.uploadList2.push(obj2);
                    });
                }
            },
            // selection-Array 已选中的所有项 row-当前项
            // 取消选中时，删除该项
            setCancelItemsPro (selection, row) {
                this.selectionsPro.forEach((item, index) => {
                    if (item.id === row.id) {
                        this.selectionsPro.splice(index, 1);
                    }
                });
            },
            // 选中项变化时，判断是否已经存在，不存在就插入
            setSelectedItemsPro (selection) {
                selection.forEach((item, index) => {
                    let flag = true;
                    for (let i = 0; i < this.selectionsPro.length; i++) {
                        if (this.selectionsPro[i].id === item.id) {
                            flag = false;
                            break;
                        }
                    }
                    if (flag) {
                        this.selectionsPro.push(item);
                    }
                });
            },
            getProjects (projectVOS) {
                let result = [];
                projectVOS.forEach((item, index) => {
                    result.push(item.coinName);
                });
                return result.join(', ');
            },
            searchData () {
                // 重置页码
                this.pageNum = 1;
                this.total = 0;

                this.getListData();
            },
            getListData () {
                let params = {
                    startTime: this.nodeStart,
                    endTime: this.nodeEnd,
                    name: this.nodename,
                    pageIndex: this.pageNum,
                    pageSize: this.pageSize
                }
                api.getSuperNodeList(params).then((res) => {
                    if (res.data.code == 1) {
                        this.tableData = res.data.data.obj || [];
                        this.total = res.data.data.totalCount;
                    }
                });
            },
            searchDataPro () {
                // 重置页码
                this.pageNumPro = 1;
                this.totalPro = 0;

                this.getCoinProjects();
            },
            getCoinProjects () {
                let params = {
                    coinName: this.searchValPro,
                    currentPage: this.pageNumPro,
                    pageSize: this.pageSizePro
                }
                coinApi.getCoinsList(params).then((res) => {
                    if (res.data.code == 1) {
                        let result = res.data.data.obj || [];
                        this.selectionsPro.forEach((item, index) => {
                            for (let i = 0; i < result.length; i++) {
                                if (result[i].id === item.id) {
                                    result[i]._checked = true;
                                    break;
                                }
                            }
                        });

                        this.tableDataPro = result;
                        this.totalPro = res.data.data.totalCount;
                    }
                });
            },
            // tag
            handleAdd () {
                // 将已选中的赋值过去
                this.selectionsPro = this.recommendedProject.concat();

                // 获取币种信息
                this.getCoinProjects();

                this.modalStatusPro = true;
            },
            handleClosePro (event, name) {
                let idx = -1;
                this.recommendedProject.forEach((item, index) => {
                    if (item.coinName === name) {
                        idx = index;
                    }
                });

                this.recommendedProject.splice(idx, 1);
            },
            // 日期相关
            setStartDateVal (formatDate) {
                this.nodeStart = formatDate;
            },
            setEndDateVal (formatDate) {
                this.nodeEnd = formatDate;
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
            changePageNumPro (pageNum) {
                this.pageNumPro = pageNum;
                this.getCoinProjects();
            },
            // 上传图片相关
            handleView (imgUrl) {
                this.imgUrl = imgUrl;
                this.visible = true;
            },
            handleRemove1 (file) {
                const fileList = this.$refs.upload1.fileList;
                this.$refs.upload1.fileList.splice(fileList.indexOf(file), 1);
                this.formItem.nodeLogo = '';
            },
            handleRemove2 (file) {
                const fileList = this.$refs.upload2.fileList;
                this.$refs.upload2.fileList.splice(fileList.indexOf(file), 1);
                const teamphotes = this.teamPhoto;
                this.teamPhoto.splice(teamphotes.indexOf(file.url), 1);
            },
            handleSuccess1 (res, file) {
                file.url = res.data;
                this.formItem.nodeLogo = res.data;
            },
            handleSuccess2 (res, file) {
                file.url = res.data;
                this.teamPhoto.push(res.data);
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
                    desc: '文件：' + file.name + ' 过大，不能超过 2M'
                });
            },
            handleBeforeUpload1 (file) {
                const check = this.uploadList1.length < 1;
                if (!check) {
                    this.$Notice.warning({
                        title: '最多可以上传1张照片。'
                    });
                    return check;
                } else {
                    return this.checkImageSize(file, 127, 127);
                }
            },
            handleBeforeUpload2 (file) {
                const check = this.uploadList2.length < 4;
                if (!check) {
                    this.$Notice.warning({
                        title: '最多可以上传4张照片。'
                    });
                    return check;
                } else {
                    return this.checkImageSize(file, 232, 174);
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
        },
        mounted () {
            this.uploadList1 = this.$refs.upload1.fileList;
            this.uploadList2 = this.$refs.upload2.fileList;
        }
    };
</script>
