<style lang="less" scoped>
    @import '../../../styles/common.less';
    @import 'emails.less';
</style>

<template>
    <div class="content">
        <Row class="et-row">
            <Col>
                <div class="search-out">
                    <Input v-model="searchVal" placeholder="搜索邮箱" clearable></Input>
                </div>
                <Button type="primary" icon="ios-search">搜索</Button>
                <Button type="info" class="add_account" icon="plus-round" @click="showEditModal(null, 0)" v-if="g_perm('add')">新增邮箱</Button>
            </Col>
        </Row>
        <Table border :columns="tableColumns" :data="filterData"></Table>
        <Modal v-model="modalStatus" :title="modalTitle" width="500" @on-cancel="handleReset">
            <Form ref="formItem" :model="formItem" :label-width="90" :rules="ruleValidate">
                <FormItem label="邮箱后缀" prop="email_suffix">
                    <Input v-model="formItem.email_suffix" placeholder="请输入邮箱后缀，例如@yahoo.com"></Input>
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

    export default {
        name: 'emails',
        data () {
            return {
                req_url: axios.defaults.baseURL,
                tableColumns: [
                    {
                        title: '邮箱后缀',
                        key: 'email_suffix'
                    },
                    // 1: 可用 0: 不可用
                    {
                        title: '状态',
                        key: 'status',
                        render: (h, params) => {
                            return h('span', params.row.status == '1' ? '可用' : '不可用');
                        }
                    },
                    {
                        title: '创建时间',
                        key: 'createTime',
                        render: (h, params) => {
                            return h('span', params.row.createTime ? params.row.createTime.split('.')[0] : '');
                        }
                    },
                    {
                        title: '更新时间',
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
                                this.g_perm('disable') ? h('Button', {
                                    props: {
                                        type: 'error',
                                        size: 'small',
                                        disabled: params.row.status == 0
                                    },
                                    style: {
                                        marginTop: '5px',
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.setMailStatus(params.row, 0);
                                        }
                                    }
                                }, '禁用') : '',
                                this.g_perm('enable') ? h('Button', {
                                    props: {
                                        type: 'success',
                                        size: 'small',
                                        disabled: params.row.status == 1
                                    },
                                    style: {
                                        marginTop: '5px',
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.setMailStatus(params.row, 1);
                                        }
                                    }
                                }, '启用') : ''
                            ]);
                        }
                    }
                ],
                tableData: [],
                searchVal: '',
                modalStatus: false,
                modalTitle: '添加',
                formItem: {
                    id: '',
                    email_suffix: ''
                },
                ruleValidate: {
                    email_suffix: [
                        {required: true, message: '请输入邮箱后缀，例如@yahoo.com', trigger: 'blur'}
                    ]
                },
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
                    return this.tableData.filter((item) => {
                        // 大小写都匹配
                        return item.email_suffix.indexOf(value) > -1;
                    });
                } else {
                    return this.tableData;
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
                }

                let obj = Object.assign(params, this.formItem);

                if (this.editType == 0) {
                    api.addEmails(obj).then((res) => {
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
                    api.updateEmails(obj).then((res) => {
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
                api.getMailsList().then((res) => {
                    if (res.data.code == 1) {
                        this.tableData = res.data.data;
                    }
                });
            },
            setMailStatus (item, val) {
                item.status = val;
                if(val) {
                    api.undisableEmail(item).then((res) => {
                        if (res.data.code == 1) {
                            this.$Message.success('启用成功')
                            // 提交成功重新获取
                            this.getListData();
                        }
                    });
                } else {
                    api.disabledEmail(item).then((res) => {
                        if (res.data.code == 1) {
                            this.$Message.success('禁用成功')

                            // 提交成功重新获取
                            this.getListData();
                        }
                    });

                }
            },
            showEditModal (currRow, type) {
                this.editType = type;
                if (type == 0) {
                    this.modalTitle = '添加邮箱';

                    // 添加
                    this.setFormItem();
                } else if (type == 1) {
                    this.modalTitle = '编辑邮箱';

                    // 赋值表单
                    this.setFormItem(currRow);
                }
                this.modalStatus = true;
            },
            setFormItem (row) {
                if (row) {
                    this.formItem.id = row.id;
                    this.formItem.email_suffix = row.email_suffix;
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
