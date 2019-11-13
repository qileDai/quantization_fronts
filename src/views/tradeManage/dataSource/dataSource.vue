<style lang="less" scoped>
    @import '../../../styles/common.less';
    @import 'dataSource.less';
</style>

<template>
    <div class="content">
        <Row class="et-row">
            <Col>
                <Button type="info" class="add_account" icon="plus-round" @click="showEditModal(null, 0)" v-if="g_perm('add')">新增</Button>
            </Col>
        </Row>
        <Table border :columns="tableColumns" :data="tableData"></Table>
        <Modal v-model="modalStatus" :title="modalTitle" width="500" @on-cancel="handleReset">
            <Form ref="formItem" :model="formItem" :label-width="90" :rules="ruleValidate">
                <FormItem label="数据源名称" prop="name">
                    <Input v-model="formItem.name" placeholder="请输入数据源名称" style="width: 200px;"></Input>
                </FormItem>
                <FormItem label="包含市场" prop="marketAreas" placeholder="请选择包含市场">
                    <Select v-model="formItem.marketAreas" multiple style="width:200px" :disabled="editType === 1">
                        <Option v-for="item in marketList" :value="item" :key="item">{{ item }}</Option>
                    </Select>
                </FormItem>
                <FormItem label="内网IP" prop="intranet">
                    <Input v-model="formItem.intranet" placeholder="请输入内网IP" style="width: 200px;" :readonly="editType === 1"></Input>
                </FormItem>
                <FormItem label="外网IP" prop="extranet">
                    <Input v-model="formItem.extranet" placeholder="请输入外网IP" style="width: 200px;"></Input>
                </FormItem>
                <FormItem label="用户名" prop="userName">
                    <Input v-model="formItem.userName" placeholder="请输入用户名" style="width: 200px;"></Input>
                </FormItem>
                <FormItem label="密码" prop="intranetPwd">
                    <Input v-model="formItem.intranetPwd" placeholder="请输入密码" type="password" style="width: 200px;"></Input>
                </FormItem>
                <FormItem label="检测连通的数据库名称" prop="dataSourceName">
                    <Input v-model="formItem.dataSourceName" placeholder="请输入检测连通的数据库名称" style="width: 200px;"></Input>
                    <Button type="warning" style="margin-left: 15px;" @click="checkDataSource">检测连通</Button>
                </FormItem>
                <span style="padding-left: 90px" v-if="linkStatus">连通状态：{{linkStatus}}</span>
            </Form>
            <div slot="footer">
                <Button type="text" size="large" @click="handleReset">取消</Button>
                <Button type="primary" size="large" @click="handleSubmit">确定</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import api from '@/api/autoMarkets'
    import axios from '@/axios/config'

    export default {
        name: 'dataSource',
        data () {
            return {
                req_url: axios.defaults.baseURL,
                tableColumns: [
                    {
                        title: '数据源名称',
                        key: 'name'
                    },
                    {
                        title: '包含市场',
                        key: 'marketAreas'
                    },
                    {
                        title: '内网IP',
                        key: 'intranet'
                    },
                    {
                        title: '外网IP',
                        key: 'extranet'
                    },
                    {
                        title: '用户名',
                        key: 'userName'
                    },
                    {
                        title: '检测连通的数据库名称',
                        key: 'dataSourceName'
                    },
                    {
                        title: '操作',
                        render: (h, params) => {
                            return h('div', {
                                style: {
                                    paddingBottom: '5px'
                                }
                            }, [
                                this.g_perm('checkDataSourceById') ? h('Button', {
                                    props: {
                                        type: 'warning',
                                        size: 'small'
                                    },
                                    style: {
                                        marginTop: '5px',
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.linkTestById(params.row);
                                        }
                                    }
                                }, '连接测试') : '',
                                this.g_perm('update') ? h('Button', {
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
                                }, '修改') : ''
                            ]);
                        }
                    }
                ],
                tableData: [],
                modalStatus: false,
                modalTitle: '添加',
                formItem: {
                    id: '',
                    name: '',
                    marketAreas: [],
                    intranet: '',
                    extranet: '',
                    userName: '',
                    intranetPwd: '',
                    dataSourceName: ''
                },
                ruleValidate: {
                    name: [
                        {required: true, message: '请输入数据源名称', trigger: 'blur'}
                    ],
                    marketAreas: [
                        {required: true, type: 'array', message: '请选择包含市场', trigger: 'change'}
                    ],
                    intranet: [
                        {required: true, message: '请输入内网IP', trigger: 'blur'}
                    ],
                    extranet: [
                        {required: true, message: '请输入外网IP', trigger: 'blur'}
                    ],
                    userName: [
                        {required: true, message: '请输入用户名', trigger: 'blur'}
                    ],
                    intranetPwd: [
                        {required: true, message: '请输入密码', trigger: 'blur'}
                    ],
                    dataSourceName: [
                        {required: true, message: '请输入检测连通的数据库名称', trigger: 'blur'}
                    ]
                },
                linkStatus: '',
                marketList: [],
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
                        this.submitRequest();
                    }
                });
            },
            handleReset () {
                this.formItem.id = '';
                this.linkStatus = '';
                this.$refs.formItem.resetFields();
                this.modalStatus = false;
            },
            submitRequest () {
                let params = {
                }

                let obj = Object.assign(params, this.formItem);
                obj.marketAreas = obj.marketAreas.join(',');

                if (this.editType == 0) {
                    api.addDataSource(obj).then((res) => {
                        if (res.data.code == 1) {
                            this.$Message.success('新增成功！');
                            this.handleReset();
                            // 提交成功重新获取
                            this.getListData();
                        }
                    });
                } else if (this.editType == 1) {
                    api.editDataSource(obj).then((res) => {
                        if (res.data.code == 1) {
                            this.$Message.success('修改成功！');
                            this.handleReset();
                            // 提交成功重新获取
                            this.getListData();
                        }
                    });
                }
            },
            getListData () {
                api.getDataSource().then((res) => {
                    if (res.data.code == 1) {
                        this.tableData = res.data.data;
                    }
                });
            },
            showEditModal (currRow, type) {
                this.editType = type;
                if (type == 0) {
                    this.modalTitle = '新增数据源服务器';

                    // 添加
                    this.setFormItem();
                } else if (type == 1) {
                    this.modalTitle = '修改数据源服务器';

                    // 赋值表单
                    this.setFormItem(currRow);
                }
                this.modalStatus = true;
            },
            linkTest (row) {
                let params = {
                    url: row.intranet,
                    userName: row.userName,
                    pwd: row.intranetPwd,
                    dataSourceName: row.dataSourceName
                }
                api.testDataSource(params).then((res) => {
                    if (res.data.code == 1) {
                        if (this.modalStatus) {
                            this.linkStatus = res.data.data ? '连接成功 ✅' : '连接失败 ❌';
                        } else {
                            res.data.data ? this.$Message.success('连接成功！') : this.$Message.error('连接失败！');
                        }
                    }
                });
            },
            linkTestById (row) {
                let params = {
                    id: row.id
                }
                api.testDataSourceById(params).then((res) => {
                    if (res.data.code == 1) {
                        res.data.data ? this.$Message.success('连接成功！') : this.$Message.error('连接失败！');
                    }
                });
            },
            checkDataSource () {
                this.$refs.formItem.validate((valid) => {
                    if (valid) {
                        this.linkTest(this.formItem);
                    }
                });
            },
            setFormItem (row) {
                if (row) {
                    this.formItem.id = row.id;
                    this.formItem.name = row.name;
                    this.formItem.marketAreas = row.marketAreas.split(',');
                    this.formItem.intranet = row.intranet;
                    this.formItem.extranet = row.extranet;
                    this.formItem.userName = row.userName;
                    this.formItem.intranetPwd = row.intranetPwd;
                    this.formItem.dataSourceName = row.dataSourceName;
                }
            },
                //获取对应市场
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
            this.getListData();
            this.getmarketList();
        },
        mounted () {
        }
    };
</script>
