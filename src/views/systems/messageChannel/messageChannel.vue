<style lang="less" scoped>
    @import '../../../styles/common.less';
    @import 'messageChannel.less';
</style>

<template>
    <div class="content">
        <Row class="et-row">
            <Col>
                <span>请选择类型：</span>
                <div class="search-out">
                    <Select v-model="channelValue" @on-change="getListData">
                        <Option v-for="item in channels" :value="item.value" :key="item.value">{{ item.label }}</Option>
                    </Select>
                </div>
                <Button type="primary" icon="ios-search" style="margin-left: 5px;" @click="getListData">查询</Button>
                <Alert class="alert-com" type="success">当前{{getChannelName(this.channelValue)}}：{{currChannelName}}</Alert>
                <Button type="info" class="add_account" icon="plus-round" @click="showEditModal(null, 0)" v-if="g_perm('add')">添加通道</Button>
            </Col>
        </Row>
        <Table border :columns="tableColumns" :data="tableData"></Table>
        <Modal v-model="modalStatus" :title="modalTitle" width="500" @on-cancel="handleReset">
            <Form ref="formItem" :model="formItem" :label-width="90" :rules="ruleValidate">
                <FormItem label="通道类型" prop="msgType">
                    <Select v-model="formItem.msgType" :disabled="editType === 1" style="width: 200px;">
                        <Option v-for="item in channels" :value="item.value" :key="item.value">{{ item.label }}</Option>
                    </Select>
                </FormItem>
                <FormItem label="通道名称" prop="msgName">
                    <Input v-model.trim="formItem.msgName" style="width: 200px;" placeholder="请输入通道名称"></Input>
                </FormItem>
                <FormItem label="通道编码" prop="qdCode">
                    <Input v-model.trim="formItem.qdCode" style="width: 200px;" placeholder="请输入通道编码"></Input>
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
        name: 'messageChannel',
        data () {
            return {
                req_url: axios.defaults.baseURL,
                tableColumns: [
                    {
                        title: '通道名称',
                        key: 'msgName'
                    },
                    {
                        title: '通道编码',
                        key: 'qdCode'
                    },
                    {
                        title: '通道状态',
                        key: 'isActive',
                        render: (h, params) => {
                            return h('span', params.row.isActive === 0 ? '未启用' : '启用中');
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
                                this.g_perm('switch') ? h('Button', {
                                    props: {
                                        type: 'success',
                                        size: 'small',
                                        disabled: params.row.isActive === 1
                                    },
                                    style: {
                                        marginTop: '5px',
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.setChannelTip(params.row);
                                        }
                                    }
                                }, '切换到该通道') : ''
                            ]);
                        }
                    }
                ],
                tableData: [],
                modalStatus: false,
                modalTitle: '添加',
                formItem: {
                    id: '',
                    msgType: 1,
                    msgName: '',
                    qdCode: ''
                },
                ruleValidate: {
                    msgName: [
                        {required: true, message: '请输入通道名称', trigger: 'blur'}
                    ],
                    qdCode: [
                        {required: true, message: '请输入通道编码', trigger: 'blur'}
                    ]
                },
                channelValue: 1, // 默认短信通道
                currChannelName: '', // 当前通道名称
                channels: [
                    {
                        value: 1,
                        label: '短信通道'
                    },
                    {
                        value: 2,
                        label: '邮箱通道'
                    }
                ],
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
                this.$refs.formItem.resetFields();
                this.formItem.id = '';
                this.formItem.msgType = 1;

                this.modalStatus = false;
            },
            submitRequest () {
                let params = {
                    isActive: 0 // 默认不开启
                }
                let obj = Object.assign(params, this.formItem);

                if (this.editType == 0) {
                    api.addChannel(obj).then((res) => {
                        if (res.data.code == 1) {
                            this.$Message.success('添加成功！');
                            this.handleReset();
                            // 提交成功重新获取
                            this.getListData();
                        }
                    });
                } else if (this.editType == 1) {
                    api.updateChannel(obj).then((res) => {
                        if (res.data.code == 1) {
                            this.$Message.success('编辑成功！');
                            this.handleReset();
                            // 提交成功重新获取
                            this.getListData();
                        }
                    });
                }
            },
            getListData () {
                api.getChannelList().then((res) => {
                    if (res.data.code == 1) {
                        // 前端根据通道类型过滤
                        let result = res.data.data;
                        this.tableData = result.filter((item) => {
                            return item.msgType === this.channelValue;
                        });

                        // 获取当前通道
                        for (let i = 0; i < this.tableData.length; i++) {
                            if (this.tableData[i].isActive === 1) {
                                this.currChannelName = this.tableData[i].msgName;
                                break;
                            }
                        }
                    }
                });
            },
            showEditModal (currRow, type) {
                this.editType = type;
                if (type == 0) {
                    this.modalTitle = '添加通道';

                    // 添加
                    this.setFormItem();
                } else if (type == 1) {
                    this.modalTitle = '编辑通道';

                    // 赋值表单
                    this.setFormItem(currRow);
                }
                this.modalStatus = true;
            },
            setChannelTip (item) {
                this.$Modal.confirm({
                    title: '提示',
                    content: '确认切换到 ' + item.msgName + ' 通道？',
                    onOk: () => {
                        this.setCurrChannel(item);
                    }
                });
            },
            setCurrChannel (currRow) {
                // 赋值表单
                this.setFormItem(currRow);

                // 提交修改
                let params = {
                }
                let obj = Object.assign(params, this.formItem);
                obj.isActive = 1;

                api.cutChannel(obj).then((res) => {
                    if (res.data.code == 1) {
                        this.$Message.success('已切换到 ' + currRow.msgName);
                        this.handleReset();
                        // 提交成功重新获取
                        this.getListData();
                    }
                });
            },
            setFormItem (row) {
                if (row) {
                    this.formItem.id = row.id;
                    this.formItem.msgType = row.msgType;
                    this.formItem.msgName = row.msgName;
                    this.formItem.qdCode = row.qdCode;
                }
            },
            getChannelName (value) {
                for (let i = 0; i < this.channels.length; i++) {
                    if (this.channels[i].value === value) {
                        return this.channels[i].label;
                    }
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
