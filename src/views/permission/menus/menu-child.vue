<style lang="less">
    @import '../../../styles/common.less';
    @import 'menus.less';
</style>

<template>
    <div class="content">
        <Row style="padding-bottom: 20px;">
            <Col>
                <!-- <Button type="info" size="small" class="add_account" icon="plus-round" @click="showEditModal(null, 0)" style="margin-left: 0;">添加二级菜单</Button> -->
            </Col>
        </Row>
        <Table border :columns="tableColumns" :data="filterData"></Table>
        <Modal v-model="modalStatus" :title="modalTitle" width="500" @on-cancel="handleReset">
            <Form ref="formItem" :model="formItem" :label-width="120" :rules="ruleValidate">
                <FormItem label="二级菜单序号" prop="orderNum">
                    <Input v-model="formItem.orderNum" placeholder="请输入二级菜单序号" @on-keyup="setRankValue"></Input>
                </FormItem>
                <FormItem label="二级菜单名称" prop="name">
                    <Input v-model="formItem.name" placeholder="请输入二级菜单名称"></Input>
                </FormItem>
                <FormItem label="二级菜单路由" prop="url">
                    <Input v-model="formItem.url" placeholder="请输入二级菜单路由"></Input>
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
    import api from '@/api/systems'
    import axios from '@/axios/config'
    import moment from 'moment'
    import menuThird from './menu-third'

    export default {
        name: 'menu-child',
        components: {
            menuThird
        },
        props: {
            row: Object
        },
        data () {
            return {
                req_url: axios.defaults.baseURL,
                tableColumns: [
                    {
                        type: 'expand',
                        width: 50,
                        render: (h, params) => {
                            return h(menuThird, {
                                props: {
                                    row: params.row
                                }
                            })
                        }
                    },
                    {
                        title: '序号',
                        key: 'orderNum'
                    },
                    {
                        title: '二级菜单名称',
                        key: 'name'
                    },
                    {
                        title: '二级菜单路由',
                        key: 'url'
                    },
                    // {
                    //     title: '操作',
                    //     render: (h, params) => {
                    //         return h('div', {
                    //             style: {
                    //                 paddingBottom: '5px'
                    //             }
                    //         }, [
                    //             this.g_perm('edit') ? h('Button', {
                    //                 props: {
                    //                     type: 'primary',
                    //                     size: 'small'
                    //                 },
                    //                 style: {
                    //                     marginTop: '5px',
                    //                     marginRight: '5px'
                    //                 },
                    //                 on: {
                    //                     click: () => {
                    //                         this.showEditModal(params.row, 1);
                    //                     }
                    //                 }
                    //             }, '编辑') : '',
                    //             this.g_perm('delete') ? h('Button', {
                    //                 props: {
                    //                     type: 'error',
                    //                     size: 'small'
                    //                 },
                    //                 style: {
                    //                     marginTop: '5px',
                    //                     marginRight: '5px'
                    //                 },
                    //                 on: {
                    //                     click: () => {
                    //                         this.deleteTip(params.row);
                    //                     }
                    //                 }
                    //             }, '删除') : ''
                            // ]);
                        // }
                    // }
                ],
                tableData: [], // 所有菜单数据
                topLevelData: [], // 二级菜单数据
                searchVal: '',
                modalStatus: false,
                modalTitle: '添加',
                // confirmPassword: '',
                formItem: {
                    id: '',
                    orderNum: '',
                    name: '',
                    url: ''
                },
                ruleValidate: {
                    orderNum: [
                        {required: true, type: 'number', message: '请输入二级菜单序号', trigger: 'blur'}
                    ],
                    name: [
                        {required: true, message: '请输入二级菜单名称', trigger: 'blur'}
                    ],
                    url: [
                        {required: false, message: '请输入二级菜单路由', trigger: 'blur'}
                    ]
                },
                selectList: [],
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
            // 过滤数据
            filterData () {
                let value = this.searchVal;
                if (value) {
                    return this.topLevelData.filter((item) => {
                        // 大小写都匹配
                        return item.name.indexOf(value) > -1;
                    });
                } else {
                    return this.topLevelData;
                }
            }
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
                    parentId: this.row.id,
                    type: 1
                }

                let obj = Object.assign(params, this.formItem);

                if (this.editType == 0) {
                    api.addMenus(obj).then((res) => {
                        if (res.data.code == 1) {
                            this.$Message.success('添加成功');
                            this.modalStatus = false;
                            this.formItem.id = '';
                            this.$refs.formItem.resetFields();
                            // 提交成功重新获取
                            this.getListData();
                        }
                    });
                } else if (this.editType == 1) {
                    api.editMenus(obj).then((res) => {
                        if (res.data.code == 1) {
                            this.$Message.success('编辑成功');
                            this.modalStatus = false;
                            this.formItem.id = '';
                            this.$refs.formItem.resetFields();
                            // 提交成功重新获取
                            this.getListData();
                        }
                    });
                }
            },
            getListData () {
                api.getMenuList().then((res) => {
                    if (res.data.code == 200) {
                        this.tableData = res.data.data;
                        this.topLevelData = res.data.data.filter((item) => {
                            // 父级id
                            return item.parentid === this.row.id;
                        });

                        // this.total = 1;
                    }
                });
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
                api.deleteMenus(params).then((res) => {
                    if (res.data.code == 1) {
                        this.$Message.success('删除成功');
                        // 提交成功重新获取
                        this.getListData();
                    }
                });
            },
            showEditModal (currRow, type) {
                this.editType = type;
                if (type == 0) {
                    this.modalTitle = '添加二级菜单';

                    // 添加
                    this.setFormItem();
                } else if (type == 1) {
                    this.modalTitle = '编辑二级菜单';

                    // 赋值表单
                    this.setFormItem(currRow);
                }
                this.modalStatus = true;
            },
            setFormItem (row) {
                if (row) {
                    this.formItem.id = row.id;
                    this.formItem.orderNum = row.orderNum;
                    this.formItem.name = row.name;
                    this.formItem.url = row.url;
                }
            },
            setRankValue (event) {
                if (this.formItem.orderNum != '' && this.formItem.orderNum > 0 && parseInt(this.formItem.orderNum)) {
                    this.formItem.orderNum = parseInt(this.formItem.orderNum);
                }
            }
        },
        created () {
            this.getListData();
        },
        mounted () {
        }
    };
</script>
