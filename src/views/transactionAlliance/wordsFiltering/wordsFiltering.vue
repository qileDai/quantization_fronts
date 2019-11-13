<style lang="less" scoped>
    @import '../../../styles/common.less';
    @import 'wordsFiltering.less';
</style>

<template>
    <div class="content">
        <Row class="et-row">
            <Col>
                <span>类型：</span>
                <div class="search-out" style="width: 180px;">
                    <Select v-model="wordType" @on-change="doSearch">
                        <Option v-for="item in wordTypeList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                    </Select>
                </div>
                <span style="margin-left: 15px;">词语：</span>
                <div class="search-out">
                    <Input v-model="filterName" placeholder="搜索词语" clearable></Input>
                </div>
                <Button type="primary" icon="ios-search" style="margin-left: 10px;" @click="doSearch">搜索</Button>
                <Button type="info" class="add_account" icon="plus-round" @click="showEditModal" v-if="g_perm('add')">添加词语</Button>
            </Col>
        </Row>
        <Table border :columns="tableColumns" :data="tableData"></Table>
        <div style="position: relative;">
            <Page class="pages" :current="pageNum" :total="total" show-elevator show-sizer :page-size="pageSize" :page-size-opts="sizeOpts" @on-change="changePageNum" @on-page-size-change="changePageSize"></Page>
        </div>
        <Modal v-model="modalStatus" :title="modalTitle" width="500" @on-cancel="handleReset">
            <Form ref="formItem" :model="formItem" :label-width="90" :rules="ruleValidate">
                <FormItem label="敏感词" prop="filterName">
                    <Input v-model="formItem.filterName" placeholder="请输入敏感词" :maxlength="wordType === 1 ? 18 : 17"></Input>
                </FormItem>
                <FormItem v-if="wordType == 1">
                    <span style="display: inline-block; line-height: 20px;">备注：2-18位，数字、字母任意组合，添加后意味中这个词不能被用户申请为站点域名</span>
                </FormItem>
                <FormItem v-if="wordType == 2">
                    <span style="display: inline-block; line-height: 20px;">备注：1-17位，数字、字母任意组合，添加后意味着不能以这个词（包含这个词）开头被用户申请为站点域名</span>
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
    import api from '@/api/transactionAlliance/wordsFiltering'
    import axios from '@/axios/config'

    export default {
        name: 'wordsFiltering',
        data () {
            const stringWord = (rule, value, callback) => {
                const regx = /^[A-Za-z0-9]+$/;
                if (this.wordType === 1) {
                    // 包含
                    if (value.length < 2 || value.length > 18 || !regx.test(value)) {
                        callback(new Error('敏感词格式不正确'));
                    }
                } else {
                    // 前缀
                    if (value.length < 1 || value.length > 17 || !regx.test(value)) {
                        callback(new Error('敏感词格式不正确'));
                    }
                }
                callback();
            };
            return {
                req_url: axios.defaults.baseURL,
                tableColumns: [
                    {
                        title: 'ID',
                        key: 'id',
                        // type: 'index',
                        width: 100,
                        align: 'center'
                    },
                    {
                        title: '词语',
                        render: (h, params) => {
                            return h('span', this.getWord(params.row));
                        }
                    },
                    {
                        title: '添加时间',
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
                                this.g_perm('delete') ? h('Button', {
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
                                            this.deleteWordTip(params.row);
                                        }
                                    }
                                }, '删除') : ''
                            ]);
                        }
                    }
                ],
                wordTypeList: [
                    {
                        value: 1,
                        label: '不能包含这类敏感词'
                    },
                    {
                        value: 2,
                        label: '不能以这类敏感词开头'
                    }
                ],
                tableData: [],
                wordType: 1,
                filterName: '',
                modalStatus: false,
                modalTitle: '添加词语',
                formItem: {
                    filterName: ''
                },
                ruleValidate: {
                    filterName: [
                        {required: true, message: '请输入敏感词', trigger: 'blur'},
                        {validator: stringWord, trigger: 'blur'}
                    ]
                },
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
                        this.submitRequest();
                    }
                });
            },
            handleReset () {
                this.$refs.formItem.resetFields();
                this.modalStatus = false;
            },
            submitRequest () {
                if (this.wordType === 1) {
                    let params = {
                        filterName: this.formItem.filterName
                    }
                    api.doAddWord(params).then((res) => {
                        if (res.data.code == 1) {
                            this.$Message.success('添加成功！');
                            this.handleReset();
                            // 提交成功重新获取
                            this.getListData();
                        }
                    });
                } else {
                    let params = {
                        containsName: this.formItem.filterName
                    }
                    api.doAddWordPrefix(params).then((res) => {
                        if (res.data.code == 1) {
                            this.$Message.success('添加成功！');
                            this.handleReset();
                            // 提交成功重新获取
                            this.getListData();
                        }
                    });
                }
            },
            doSearch () {
                // 重置页码
                this.pageNum = 1;
                this.total = 0;

                this.getListData();
            },
            getListData () {
                if (this.wordType === 1) {
                    let params = {
                        filterName: this.filterName,
                        pageNum: this.pageNum,
                        pageSize: this.pageSize
                    }
                    api.getWordsList(params).then((res) => {
                        if (res.data.code == 1) {
                            this.tableData = res.data.data.obj || [];
                            this.total = res.data.data.totalCount;
                        }
                    });
                } else {
                    let params = {
                        containsName: this.filterName,
                        pageNum: this.pageNum,
                        pageSize: this.pageSize
                    }
                    api.getWordsListPrefix(params).then((res) => {
                        if (res.data.code == 1) {
                            this.tableData = res.data.data.obj || [];
                            this.total = res.data.data.totalCount;
                        }
                    });
                }
            },
            showEditModal () {
                this.modalStatus = true;
            },
            getWord (row) {
                return row.filterName || row.containsName;
            },
            deleteWordTip (item) {
                this.$Modal.confirm({
                    title: '提示',
                    content: '确认删除 ' + (item.filterName || item.containsName) + ' ？',
                    onOk: () => {
                        this.deleteWord(item);
                    }
                });
            },
            deleteWord (item) {
                let params = {
                    id: item.id
                }
                if (this.wordType === 1) {
                    api.doDeleteWord(params).then((res) => {
                        if (res.data.code == 1) {
                            this.$Message.success('已删除！');
                            // 提交成功重新获取
                            this.getListData();
                        }
                    });
                } else {
                    api.doDeleteWordPrefix(params).then((res) => {
                        if (res.data.code == 1) {
                            this.$Message.success('已删除！');
                            // 提交成功重新获取
                            this.getListData();
                        }
                    });
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
            }
        },
        created () {
            this.getListData();
        },
        mounted () {
        }
    };
</script>
