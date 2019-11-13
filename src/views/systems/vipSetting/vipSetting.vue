<template>
    <div class="vip-setting">
        <Row>
            <Col style="height: 50px; position:relative">
            <Button class="btn-pos" type="info" @click="addBtn" v-if="g_perm('add')">新增</Button>
            </Col>
        </Row>
        <Table border :columns="tHeaderData" :data="vipListData" style="margin-top:10px"></Table>

        <!-- 弹框 -->
        <Modal title="新增VIP等级" v-model="showAddModal" :mask-closable="false" @on-cancel="modalCancel">
            <Form :model="modalFormData" :label-width="180" ref="modalForm" :rules="ruleValidate">
                <FormItem label="VIP等级：" prop="vipRate">
                    <Input style="width:200px" number :maxlength="3" v-model="modalFormData.vipRate"
                           placeholder="请输入VIP等级"></Input>
                </FormItem>
                <FormItem label="积分：" prop="jifen">
                    <Input style="width:200px" number :maxlength="8" v-model="modalFormData.jifen"
                           placeholder="请输入积分"></Input>
                </FormItem>
                <FormItem label="备注：" prop="memo">
                    <Input style="width:200px" v-model="modalFormData.memo" placeholder="请输入备注"></Input>
                </FormItem>
            </Form>
            <div class="footer-btn" slot="footer">
                <Button type="primary" @click="save">保存</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import api from '@/api/systems.js'

    export default {
        data() {
            // vip 等级验证
            const validateVipRate = (rule, value, callback) => {
                if (value === '') {
                    return callback(new Error('VIP等级不能为空'))
                } else if (!Number.isInteger(value)) {
                    return callback(new Error('VIP等级只能为正整数或0'))
                } else {
                    callback()
                }
            }
            const validateJifen = (rule, value, callback) => {
                if (value === '') {
                    return callback(new Error('积分不能为空'))
                } else if (!Number.isInteger(value)) {
                    return callback(new Error('积分只能为正整数或0'))
                } else {
                    callback()
                }
            }
            return {
                tHeaderData: [
                    {
                        title: 'VIP等级', key: 'vipRate',
                        render: (h, params) => {
                            return h('span', 'VIP' + params.row.vipRate)
                        }
                    },
                    {title: '积分', key: 'jifen'},
                    {title: '备注', key: 'memo'},
                    {
                        title: '操作', key: 'operation',
                        render: (h, params) => {
                            return h('div', [
                                this.g_perm('edit') ? h('Button', {
                                    props: {
                                        type: 'primary',
                                        size: 'small'
                                    },
                                    on: {
                                        click: () => {
                                            this.updateVipRate(params)
                                        }
                                    }
                                }, '编辑') : '',
                                this.g_perm('delete') ? h('Button', {
                                    props: {
                                        type: 'error',
                                        size: 'small'
                                    },
                                    style: {
                                        marginLeft: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.delVipRate(params)
                                        }
                                    }
                                }, '删除') : ''
                            ])
                        }
                    }
                ],
                vipListData: [], // vip 等级数据
                showAddModal: false, // 显示弹框
                isEdit: false, // 是否为编辑
                modalFormData: {
                    vipRate: '',
                    jifen: '',
                    memo: ''
                },

                // 表单验证规则
                ruleValidate: {
                    vipRate: [
                        {required: true, validator: validateVipRate, trigger: 'blur'}
                    ],
                    jifen: [
                        {required: true, validator: validateJifen, trigger: 'blur'}
                    ],
                    memo: [
                        {
                            required: true, trigger: 'blur', validator: (rule, value, callback) => {
                                if (value.replace(/\s/g, '') === '') {
                                    callback(new Error('备注不能为空'))
                                } else {
                                    callback()
                                }
                            }
                        }
                    ],
                }
            }
        },

        methods: {
            // 新增按钮事件
            addBtn() {
                this.showAddModal = true
                this.isEdit = false
            },
            // 编辑
            updateVipRate(params) {
                this.showAddModal = true
                this.isEdit = true
                for (let item in this.modalFormData) {
                    this.modalFormData[item] = params.row[item]
                    this.modalFormData._id = params.row._id // 更新需要传递ID
                }
            },
            // 删除
            delVipRate(params) {
                console.log(params)
                let _id = params.row._id,
                    index = params.index,
                    args = {_id}
                api.delVipRate(args).then(res => {
                    if (res.data.code === 1) {
                        this.vipListData.splice(index, 1)
                        this.$Message.success(res.data.msg)
                    }
                })
            },
            // 弹框保存按钮事件
            save() {
                this.$refs.modalForm.validate(valid => {
                    // 把备注的空格都去除掉
                    if (valid) {
                        let {vipRate, jifen, memo} = this.modalFormData,
                            args = {vipRate, jifen, memo}
                        if (this.isEdit) { // 编辑
                            args._id = this.modalFormData._id // 更新需要传递ID
                            api.updateVipRate(args).then(res => {
                                if (res.data.code === 1) {
                                    this.getVipRate()
                                    this.showAddModal = false
                                    this.$Message.success(res.data.msg)
                                }
                            })
                        } else { // 新增
                            api.addVipRate(args).then(res => {
                                if (res.data.code === 1) {
                                    this.getVipRate()
                                    this.showAddModal = false
                                    this.$Message.success(res.data.msg)
                                }
                            })
                        }
                        this.modalCancel()
                    }
                })
            },
            // 弹框取消事件
            modalCancel() {
                this.$refs.modalForm.resetFields()
            },
            // 获取数据
            getVipRate() {
                api.getVipRate().then(res => {
                    if (res.data.code === 1) {
                        this.vipListData = res.data.data || []
                    }
                })
            }
        },
        created() {
            this.getVipRate()
        }
    }
</script>

<style lang="less" scoped>
    .btn-pos {
        position: absolute;
        right: 0;
        bottom: 0;
    }
</style>


