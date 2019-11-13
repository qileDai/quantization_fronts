<style lang="less" scoped>
    @import '../../../styles/common.less';
    @import 'dishServerManage.less';
</style>

<template>
    <div class="content">
        <Row class="et-row">
            <Col>
                <span>服务器IP：</span>
                <div class="search-out">
                    <Input v-model="serverIp" placeholder="请输入服务器IP"></Input>
                </div>
                <span style="margin-left: 15px;">对应市场：</span>
                <div class="search-out">
                    <Select v-model="marketArea" clearable>
                        <Option v-for="item in marketList" :value="item" :key="item">{{ item.toUpperCase() }}</Option>
                    </Select>
                </div>
                <Button type="primary" icon="ios-search" style="margin-left: 5px;" @click="searchMarket">查询</Button>
                <Button type="info" class="add_account" icon="plus-round" @click="showEditModal(null, 0)" v-if="g_perm('add')">新增</Button>
            </Col>
        </Row>
        <Table border :columns="tableColumns" :data="tableData"></Table>
        <div style="position: relative;"><Page class="pages" :current="pageNum" :total="total" show-elevator show-sizer :page-size="pageSize" :page-size-opts="sizeOpts" @on-change="changePageNum" @on-page-size-change="changePageSize"></Page></div>
        <Modal v-model="modalStatus" :title="modalTitle" width="500" @on-cancel="handleReset">
            <Form ref="formItem" :model="formItem" :label-width="100" :rules="ruleValidate">
                <FormItem label="服务器名称" prop="name">
                    <Input v-model="formItem.name" placeholder="请输入服务器名称" style="width: 200px;"></Input>
                </FormItem>
                <FormItem label="对应市场" prop="marketArea" placeholder="请选择对应市场">
                    <Select v-model="formItem.marketArea" style="width:200px">
                        <Option v-for="item in marketList" :value="item" :key="item">{{ item.toUpperCase() }}</Option>
                    </Select>
                </FormItem>
                <FormItem label="服务器内网IP" prop="intranetIp">
                    <Input v-model="formItem.intranetIp" placeholder="请输入服务器内网IP" style="width: 200px;"></Input>
                </FormItem>
                <FormItem label="服务器外网IP" prop="extranetIp">
                    <Input v-model="formItem.extranetIp" placeholder="请输入服务器外网IP" style="width: 200px;"></Input>
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
    import api from '@/api/autoMarkets'
    import axios from '@/axios/config'

    export default {
        name: 'dishServerManage',
        data () {
            return {
                req_url: axios.defaults.baseURL,
                tableColumns: [
                    {
                        title: '服务器名称',
                        key: 'name'
                    },
                    {
                        title: '包含Tomcat',
                        key: 'tomcats'
                    },
                    {
                        title: '对应市场',
                        key: 'marketArea'
                    },
                    {
                        title: '服务器内网IP',
                        key: 'intranetIp'
                    },
                    {
                        title: '服务器外网IP',
                        key: 'extranetIp'
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
                                }, '修改') : '',
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
                tableData: [],
                modalStatus: false,
                modalTitle: '添加',
                formItem: {
                    id: '',
                    name: '',
                    marketArea: '',
                    extranetIp: '',
                    intranetIp: '',
                },
                ruleValidate: {
                    name: [
                        {required: true, message: '请输入服务器名称', trigger: 'blur'}
                    ],
                    marketArea: [
                        {required: true, message: '请选择对应市场', trigger: 'change'}
                    ],
                    extranetIp: [
                        {required: true, message: '请输入服务器外网IP', trigger: 'blur'}
                    ],
                    intranetIp: [
                        {required: true, message: '请输入服务器内网IP', trigger: 'blur'}
                    ]
                },
                serverIp: '',
                marketArea: '',
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
                this.$refs.formItem.resetFields();
                this.modalStatus = false;
            },
            submitRequest () {
                let params = {
                }
                let obj = Object.assign(params, this.formItem);

                if (this.editType == 0) {
                    api.addDishServer(obj).then((res) => {
                        if (res.data.code == 1) {
                            this.$Message.success('新增成功！');
                            this.handleReset();
                            // 提交成功重新获取
                            this.getListData();
                        }
                    });
                } else if (this.editType == 1) {
                    api.editDishServer(obj).then((res) => {
                        if (res.data.code == 1) {
                            this.$Message.success('修改成功！');
                            this.handleReset();
                            // 提交成功重新获取
                            this.getListData();
                        }
                    });
                }
            },
            searchMarket () {
                // 重置页码
                this.pageNum = 1;
                this.total = 0;

                this.getListData();
            },
            getListData () {
                let params = {
                    serverIp: this.serverIp,
                    marketArea: this.marketArea,
                    pageIndex: this.pageNum,
                    pageSize: this.pageSize
                }
                api.getDishServer(params).then((res) => {
                    if (res.data.code == 1) {
                        this.tableData = res.data.data.obj || [];
                        this.total = res.data.data.totalCount;
                    }
                });
            },
            showEditModal (currRow, type) {
                this.editType = type;
                if (type == 0) {
                    this.modalTitle = '新增盘口服务器';

                    // 添加
                    this.setFormItem();
                } else if (type == 1) {
                    this.modalTitle = '编辑盘口服务器';

                    // 赋值表单
                    this.setFormItem(currRow);
                }
                this.modalStatus = true;
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
                api.deleteDishServer(params).then((res) => {
                    if (res.data.code == 1) {
                        this.$Message.success('删除成功!');
                        // 提交成功重新获取
                        this.getListData();
                    }
                });
            },
            setFormItem (row) {
                if (row) {
                    this.formItem.id = row.id;
                    this.formItem.name = row.name;
                    this.formItem.marketArea = row.marketArea;
                    this.formItem.extranetIp = row.extranetIp;
                    this.formItem.intranetIp = row.intranetIp;
                }
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
