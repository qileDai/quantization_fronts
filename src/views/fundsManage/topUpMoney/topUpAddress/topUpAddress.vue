<template>
    <!-- 充币地址 -->
    <div>
        <Row style="padding:20px 0">
            <Col>
            <span>充币地址：</span>
            <Input style="width:150px" v-model="topUpAddress" placeholder="请输入充币地址"></Input>
            <span class="left-space">币种：</span>
            <Select style="width:150px" placeholder="全部" filterable clearable v-model="coinName">
                <Option v-for="(item, index) in allCoins" :key="index" :value="item">{{item}}</Option>
            </Select>
            <span class="left-space">充币地址状态：</span>
            <Select style="width:150px" placeholder="全部" v-model="addressStatus">
                <Option v-for="status in addressStatusData" :key="status.key" :value="status.key">{{status.text}}
                </Option>
            </Select>
            <Input style="width: 150px; margin-left:20px" v-model="userId" placeholder="使用用户ID搜索"></Input>
            <Input style="width: 150px; margin-left:20px" v-model="userName" placeholder="使用用户名搜索"></Input>
            <Button type="primary" style="margin-left:20px" @click="search">查询</Button>
            <Button type="error" @click="reset">重置</Button>
            </Col>
        </Row>
        <Table border :columns="tHeaderData" :data="topUpAddressData"></Table>
        <div style="position:relative">
            <Page class="pages" :page-size-opts="sizeOpts" :page-size="pageSize" show-sizer show-elevator
                  :total="totalCount" @on-page-size-change="changePageSize" @on-change="changePage"></Page>
        </div>
        <!-- google验证码 -->
        <Modal v-model="showModal" title="标记">
            <Form :label-width="180" :model="modalFormData" :rules="ruleValidate" ref="modalForm">
                <FormItem label="google验证码" prop="googleCode">
                    <Input style="width: 200px" v-model="modalFormData.googleCode"></Input>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button @click="cancel">取消</Button>
                <Button type="primary" @click="confirm">标记</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import api from '@/api/funds.js'
    import {getCoins} from '../../common.js' // 封装的获取 所有币种 Promise 函数
    export default {
        data() {
            return {
                pageNum: 1,
                pageSize: 20,
                topUpAddress: '', // 充币地址
                coinName: '', // 币种
                addressStatus: '', // 充币地址状态
                userId: '', // 用户ID
                userName: '', // 用户名
                // 充币地址状态
                addressStatusData: [
                    {text: '全部', key: ''},
                    {text: '已分配', key: '1'},
                    {text: '已充值', key: '2'},
                    {text: '未充值', key: '3'},
                    {text: '未分配', key: '4'}
                ],
                // 表头
                tHeaderData: [
                    {
                        title: '编号/钱包名称', key: 'wallet',
                        render: (h, params) => {
                            return h('span', params.row.keyId + '/' + params.row.wallet)
                        }
                    },
                    {title: '用户ID', key: 'userId'},
                    {title: '用户名', key: 'userName'},
                    // { title: '币种', key: 'coinName' },
                    {
                        title: '充币地址', key: 'keyPre',
                        render: (h, params) => {
                            return h('div', [
                                h('span', {
                                    on: {
                                        click: () => {
                                            this.copyAddress(params.row.keyPre)
                                        }
                                    }
                                }, params.row.keyPre)
                            ])
                        }
                    },
                    {title: '充币次数', key: 'usedTimes'},
                    {title: '创建时间', key: 'createTime'},
                    {
                        title: '操作', key: 'operation',
                        render: (h, params) => {
                            if (params.row.tag === 0) {
                                return h('div', [
                                    this.g_perm('mark') ? h('Button', {
                                        props: {
                                            type: 'primary',
                                            size: 'small'
                                        },
                                        on: {
                                            click: () => {
                                                this.keyId = params.row.keyId
                                                this.showModal = true
                                            }
                                        }
                                    }, '标记') : ''
                                ])
                            } else {
                                return h('div', [
                                    h('Button', {
                                        props: {
                                            size: 'small',
                                            disabled: true
                                        }
                                    }, '已标记')
                                ])
                            }
                        }
                    },
                ],
                sizeOpts: [10, 20, 50, 100], // 选择每页显示多少条数据
                // 表单数据
                topUpAddressData: [],
                totalCount: 0, // 当前币种所有数据量
                allCoins: [], // 所有币种
                showModal: false, // 显示弹框
                keyId: 0, // 标记接口需要传递的keyId
                modalFormData: {
                    googleCode: ''
                },
                ruleValidate: {
                    googleCode: [
                        {required: true, max: 6, min: 6, message: '请输入6位数字的谷歌验证码', trigger: 'blur'}
                    ]
                }
            }
        },
        methods: {
            // 查询
            search() {
                this.pageNum = 1 // 重置页码
                this.totalCount = 1 // 重置数据总数量
                // userId 为纯数字时才让请求
                if (this.userId === '' || !/\D/g.test(this.userId.trim())) {
                    this.getListData()
                } else {
                    this.$Message.warning({content: '用户ID不能包含空格或非数字', duration: 2})
                }
            },
            // 重置
            reset() {
                this.pageNum = 1,
                    this.pageSize = 20,
                    this.topUpAddress = ''
                this.coinName = this.allCoins[0]
                this.addressStatus = ''
                this.userId = ''
                this.userName = ''
                this.getListData()
            },
            // 改变每页显示多少条数据
            changePageSize(size) {
                this.pageSize = size
                if (this.pageNum === 1) {
                    this.getListData()
                }
            },
            // 页码发生改变时
            changePage(page) {
                this.pageNum = page
                this.getListData()
            },
            // 弹框取消
            cancel() {
                this.showModal = false
                this.$refs.modalForm.resetFields()
            },
            // 弹框确认
            confirm() {
                this.$refs.modalForm.validate(valid => {
                    if (valid) {
                        let {keyId, coinName} = this,
                            googleCode = this.modalFormData.googleCode,
                            args = {keyId, coinName, googleCode}
                        api.mark(args).then(res => {
                            if (res.data.code === 1) {
                                this.$Message.success(res.data.msg || '标记成功')
                                this.cancel()
                                this.getListData()
                            }
                        })
                    }
                })
            },
            // 点击复制地址
            copyAddress(addr) {
                this.$copyText(addr).then(res => {
                    this.$Message.success('充币地址复制成功')
                })
            },
            // 获取表格数据
            getListData() {
                let {pageNum, pageSize, topUpAddress, coinName, userId, userName, addressStatus} = this,
                    args = {
                        pageNum,
                        pageSize,
                        coinName,
                        userName: userName.trim(),
                        userId: userId.trim(),
                        keyPre: topUpAddress.trim(),
                        status: addressStatus
                    }
                api.topUpAddress(args).then(res => {
                    if (res.data.code === 1) {
                        this.topUpAddressData = res.data.data.obj || []
                        this.totalCount = res.data.data.totalCount || 1
                    }
                })
            }
        },
        created() {
            // 第一次进来加载的数据，必须传递币种，使用封装的 加载所有币种 Promise
            getCoins().then(res => {
                this.allCoins = res
                this.coinName = this.allCoins[0]
                this.getListData()
            })
        }
    }
</script>

<style lang="less" scoped>
    .left-space {
        margin-left: 20px;
    }
</style>

