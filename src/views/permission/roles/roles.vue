<style lang="less" scoped>
    @import '../../../styles/common.less';
    @import 'roles.less';
</style>

<template>
    <div class="content">
        <Row class="et-row">
            <Col>
            <div class="search-out">
                <Input v-model="searchVal" size="small" placeholder="搜索角色名称" clearable></Input>
            </div>
            <Button type="primary" size="small" icon="ios-search" @click="getListData" v-if="g_perm('search')">搜索</Button>
            <Button type="info" size="small" class="add_account" icon="plus-round" @click="showEditModal(null, 0)" v-if="g_perm('add')">添加角色</Button>
            </Col>
        </Row>
        <Table border :columns="tableColumns" :data="tableData"></Table>
        <Modal v-model="modalStatus" :title="modalTitle" width="500" @on-cancel="handleReset">
            <Form ref="formItem" :model="formItem" :label-width="90" :rules="ruleValidate">
                <FormItem label="角色名称" prop="rolename">
                    <Input v-model="formItem.rolename" placeholder="请输入角色名称"></Input>
                </FormItem>
                <FormItem label="角色描述" prop="description">
                    <Input v-model="formItem.description" type="textarea" :rows="4" placeholder="请输入角色描述"></Input>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button type="text" size="large" @click="handleReset">取消</Button>
                <Button type="primary" size="large" @click="handleSubmit">确定</Button>
            </div>
        </Modal>
        <Modal v-model="modalStatusRole" title="分配权限" width="800" @on-cancel="handleResetRole">
            <Tree :data="menusData" show-checkbox @on-check-change="setCheckedMenu"></Tree>
            <div slot="footer">
                <Button type="text" size="large" @click="handleResetRole">取消</Button>
                <Button type="primary" size="large" @click="handleSubmitRole">确定</Button>
            </div>
        </Modal>
        <Col>
        <Page 
        class="pages"
        show-sizer 
        show-elevator
        show-total
        :total="totalCount" 
        :page-size-opts="pageSizeOpts"
        :page-size="pageSize" 
        :current="pageIndex"
        @on-page-size-change="changePageSize"
        @on-change="changePage"></Page>
      </Col>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import api from '@/api/permission'
    import menuApi from '@/api/systems'
    import axios from '@/axios/config'

    export default {
        name: 'roles',
        data () {
            return {
                req_url: axios.defaults.baseURL,
                tableColumns: [
                    {
                        title: '角色名称',
                        key: 'rolename'
                    },
                    {
                        title: '角色描述',
                        key: 'description'
                    },
                    {
                        title: '创建时间',
                        key: 'create_time',
                        // render: (h, params) => {
                        //     return h('span', params.row.createTime ? params.row.createTime.split('.')[0] : '');
                        // }
                    },
                    {
                        title: '操作',
                        render: (h, params) => {
                            return h('div', {
                                style: {
                                    paddingBottom: '5px'
                                }
                            }, [
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
                                            this.deleteTip(params.row, 1);
                                        }
                                    }
                                }, '删除') : '',
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
                                this.g_perm('allot_permission') ? h('Button', {
                                    props: {
                                        type: 'success',
                                        size: 'small'
                                    },
                                    style: {
                                        marginTop: '5px',
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.showEditModal(params.row, 2);
                                        }
                                    }
                                }, '分配权限') : ''
                            ]);
                        }
                    }
                ],
                tableData: [],
                searchVal: '',
                modalStatus: false,
                modalTitle: '添加',
                confirmPassword: '',
                formItem: {
                    id: '',
                    rolename: '',
                    description: ''
                },
                ruleValidate: {
                    rolename: [
                        {required: true, message: '请输入角色名称', trigger: 'blur'}
                    ],
                    description: [
                        {required: true, message: '请输入角色描述', trigger: 'blur'},
                        {max: 100, message: '长度不能超过100个字符', trigger: 'blur'}
                    ]
                },
                editType: 0, // 编辑类型 0添加 1编辑
                modalStatusRole: false,
                // 树形控件模拟数据
                data2: [
                    {
                        title: 'parent 1',
                        expand: true,
                        children: [
                            {
                                title: 'parent 1',
                                expand: true,
                                children: [
                                    {
                                        title: 'parent 1-1',
                                        expand: true,
                                        children: [
                                            {
                                                title: 'leaf 1-1-1'
                                            },
                                            {
                                                title: 'leaf 1-1-2'
                                            }
                                        ]
                                    },
                                    {
                                        title: 'parent 1-2',
                                        expand: true,
                                        children: [
                                            {
                                                title: 'leaf 1-2-1'
                                            },
                                            {
                                                title: 'leaf 1-2-1'
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ],
                originMenuData: [], // 所有菜单列表原始数据
                menusData: [],
                checkedMenus: [],
                // 分页数据
                totalCount: 0, // 数据总数
                pageSizeOpts: [10, 20, 50, 100], //选择每页数量
                pageSize: 20, // 每页显示数量
                pageIndex: 1, // 页码
            };
        },
        watch: {
        },
        computed: {
            // 过滤数据
            // filterData () {
            //     let value = this.searchVal;
            //     if (value) {
            //         return this.tableData.filter((item) => {
            //             // 大小写都匹配
            //             return item.rolename.indexOf(value) > -1;
            //         });
            //     } else {
            //         return this.tableData;
            //     }
            // }
        },
        methods: {
            // 分页方法
            // 切换每页显示条数
            changePageSize(size) {
                this.pageSize = size
                if (this.pageIndex === 1) {
                this.getListData()
                }
            },
            // 页数改变时
            changePage(page) {
                this.pageIndex = page
                this.getListData()
            },
            handleSubmit () {
                this.$refs.formItem.validate((valid) => {
                    if (valid) {
                        this.submitRequest();
                    }
                });
            },
            handleReset () {
                this.$refs.formItem.resetFields();
                this.modalStatus = false;
            },
            submitRequest () {
                let params = {
                }
                let obj = Object.assign(params, this.formItem);

                if (this.editType == 0) {
                    api.addRoles(obj).then((res) => {
                        if (res.data.code == 200) {
                            this.$Message.success('添加成功');
                            this.modalStatus = false;
                            this.$refs.formItem.resetFields();
                            // 提交成功重新获取
                            this.getListData();
                        }
                    });
                } else if (this.editType == 1) {
                    api.editRoles(obj).then((res) => {
                        if (res.data.code == 200) {
                            this.$Message.success('编辑成功');
                            this.modalStatus = false;
                            this.$refs.formItem.resetFields();
                            // 提交成功重新获取
                            this.getListData();
                        }
                    });
                } else {
                    // 修改权限
                    let val = {
                        menuIdList: this.checkedMenus
                    }
                    let obj = Object.assign(val, this.formItem);
                    api.editRoles(obj).then((res) => {
                        if (res.data.code == 200) {
                            this.$Message.success('权限分配成功！');
                            this.modalStatusRole = false;

                            this.checkedMenus = [];
                            this.$refs.formItem.resetFields();
                            // 提交成功重新获取
                            this.getListData();
                        }
                    });
                }
            },
            getListData () {
                let params = {
                    // rolename  pegeIndex   pageSize
                    rolename: this.searchVal,
                    pegeIndex: this.pageIndex,
                    pageSize: this.pageSize
                }
                api.getRoles(params).then((res) => {
                    if (res.data.code == 200) {
                        this.tableData = res.data.data.result;
                        this.totalCount = res.data.data.totalCount                        
                    }
                });
            },
            deleteTip (item) {
                this.$Modal.confirm({
                    title: '提示',
                    content: '确认删除 ' + item.rolename + ' ？',
                    onOk: () => {
                        this.deleteRequest(item);
                    }
                });
            },
            deleteRequest (item) {
                let params = {
                    id: item.id
                }
                api.deleteRoles(params).then((res) => {
                    if (res.data.code == 200) {
                        this.$Message.success('删除成功');
                        // 提交成功重新获取
                        this.getListData();
                    }
                });
            },
            showEditModal (currRow, type) {
                this.editType = type;
                if (type == 0) {
                    this.modalTitle = '添加角色';

                    // 添加
                    this.setFormItem();

                    this.modalStatus = true;
                } else if (type == 1) {
                    this.modalTitle = '编辑角色';

                    // 赋值表单
                    this.setFormItem(currRow);

                    this.modalStatus = true;
                } else {
                    // 编辑权限
                    // 赋值表单
                    this.getListData()
                    this.setFormItemRole(currRow);

                    // 获取原有菜单权限展示
                    this.getAllMenus(currRow);

                    this.modalStatusRole = true;
                }
            },
            setFormItem (row) {
                if (row) {
                    this.formItem.id = row.id;
                    this.formItem.rolename = row.rolename;
                    this.formItem.description = row.description;
                }
            },
            setFormItemRole (row) {
                if (row) {
                    this.formItem.id = row.id;
                    // this.checkedMenus = row.menuIdList;
                    this.formItem.rolename = row.rolename;
                    this.formItem.description = row.description;
                }
            },
            handleSubmitRole () {
                // 提交权限修改，同编辑接口
                // this.submitRequest();

                // let args = this.formItem
                let args = {
                    role_id: this.formItem.id
                }
                args.menu_list = this.checkedMenus
                api.distribution(args).then(res => {
                    if(res.data.code === 200) {
                        this.modalStatusRole = false;
                        this.$Message.success(res.data.message)
                        // this.getListData()
                        history.go(0)
                    }
                })
            },
            handleResetRole () {
                this.menusData = [];
                this.modalStatusRole = false;
            },
            // 获取菜单列表
            getAllMenus (row) {
                api.getMenuList().then((res) => {
                    if (res.data.code == 200) {
                        this.originMenuData = res.data.data;
                        let arrs = [];
                        // 处理一级菜单
                        this.originMenuData.forEach((item, index) => {
                            if (item.parentid === null) {
                                let obj = {};
                                obj.id = item.id;
                                obj.roleId = row.id;

                                obj.title = item.name;
                                // 默认展开
                                // obj.expand = true;

                                // 父级不用选中，子集会自动判断父级是否选中
                                // obj.checked = row.menuIdList.indexOf(item.id) > -1;

                                // 处理二级菜单
                                obj.children = [];
                                this.originMenuData.forEach((child, rank) => {
                                    if (child.parentid === item.id) {
                                        let childObj = {};
                                        childObj.id = child.id;
                                        childObj.roleId = row.id;

                                        childObj.title = child.name;
                                        // childObj.checked = row.menuIdList.indexOf(child.id) > -1;

                                        // 处理三级权限菜单
                                        childObj.children = [];
                                        this.originMenuData.forEach((third, num) => {
                                            if (third.parentid === child.id) {
                                                let thirdObj = {};
                                                thirdObj.id = third.id;
                                                thirdObj.roleId = row.id;

                                                thirdObj.title = third.name;
                                                thirdObj.checked = row.menuIdList.indexOf(third.id) > -1;

                                                // thirdObj.children = [];

                                                childObj.children.push(thirdObj);
                                            }
                                        })
                                        obj.children.push(childObj);
                                    }
                                })
                                arrs.push(obj);
                            }
                        })
                        this.menusData = arrs;
                    }
                });
            },
            setCheckedMenu (menus) {
                // 处理树形中的已选择菜单
                let arrs = [];
                menus.forEach((item, index) => {
                    arrs.push(item.id);
                })
                // 二级子菜单选中，父级菜单id也要加进去
                this.menusData.forEach((item, index) => {
                    item.children.forEach((menu, rank) => {
                        if (arrs.indexOf(menu.id) >= 0 && arrs.indexOf(item.id) === -1) {
                            arrs.push(item.id);
                        }
                    })
                })

                // 三级子菜单选中，二级菜单和一级菜单id都要加进去
                this.menusData.forEach((item, index) => {
                    item.children.forEach((menu, rank) => {
                        menu.children.forEach((third, num) => {
                            // 二级菜单id
                            if (arrs.indexOf(third.id) >= 0 && arrs.indexOf(menu.id) === -1) {
                                arrs.push(menu.id);
                            }
                            // 一级菜单id
                            if (arrs.indexOf(third.id) >= 0 && arrs.indexOf(item.id) === -1) {
                                arrs.push(item.id);
                            }
                        })
                    })
                })

                this.checkedMenus = arrs;
            }
        },
        created () {
            this.getListData();
        },
        mounted () {
        }
    };
</script>
