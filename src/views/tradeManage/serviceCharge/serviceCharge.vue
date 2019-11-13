<template>
    <div class="service-charge">
        <div class="fillter">
            <span>交易对：</span>
            <Select style="width:150px" v-model="marketType" clearable filterable placeholder="全部">
                <Option value="">全部</Option>
                <Option v-for="(item, index) in allMarketType" :key="index" :value="item">{{item}}</Option>
            </Select>
            <span class="left-space">VIP等级：</span>
            <Select style="width: 100px" placeholder="全部" v-model="vipRate">
                <Option value="">全部</Option>
                <Option v-for="(vip, index) in vipRates" :key="index" :value="vip">VIP{{vip}}</Option>
            </Select>
            <span class="left-space">活动是否生效：</span>
            <Select style="width:100px" placeholder="全部" v-model="isInActivityTime">
                <Option value="">全部</Option>
                <Option value="是">是</Option>
                <Option value="否">否</Option>
            </Select>
            <Button type="primary" style="margin-left:10px" @click="search">查询</Button>
            <Button type="error" style="margin-left:10px" @click="reset">重置</Button>
            <Button type="primary" @click="addHandle" class="add-btn" v-if="g_perm('add')">新增</Button>
        </div>
        <Table :loading="tableLoading" border :columns="tHeaderData" :data="serviceChargeData"
               style="margin-top:20px"></Table>
        <div style="position:relative">
            <Page class="pages" :page-size-opts="pageSizeOpts" :page-size="pageSize" show-sizer show-elevator
                  :total="totalCount" @on-page-size-change="changePageSize" @on-change="changePage"></Page>
        </div>
        <!-- 弹框 -->
        <Modal
                title="添加/编辑交易手续费率管理"
                v-model="showModal"
                class-name="modal-center"
                :mask-closable="false"
                @on-cancel="modalCancel"
                @on-ok="modalConfirm"
                ok-text="保存"
                :closable="false"
        >
            <Form :label-width="200" :model="modalFormData" :rules="ruleValidate" ref="modalForm">
                <FormItem label="vip等级：" prop="vipRate">
                    <Select v-model="modalFormData.vipRate" style="width:200px">
                        <Option v-for="(vip, index) in vipRates" :key="index" :value="vip.toString()">VIP{{vip}}
                        </Option>
                    </Select>
                </FormItem>
                <FormItem label="交易对：" prop="marketType">
                    <Select v-model="modalFormData.marketType" clearable filterable style="width:200px">
                        <Option v-for="item in allMarketType" :key="item" :value="item">{{item}}</Option>
                    </Select>
                </FormItem>
                <FormItem label="maker手续费率：" prop="makerFee">
                    <Input style="width:200px" v-model="modalFormData.makerFee"></Input>%
                </FormItem>
                <FormItem label="taker手续费率：" prop="takerFee">
                    <Input style="width:200px" v-model="modalFormData.takerFee"></Input>%
                </FormItem>
                <FormItem label="活动开始时间：">
                    <!-- <DatePicker type="datetime" style="width:200px" placeholder="请选择开始时间" :options="optionsStart" v-model="modalFormData.activityStartTime" :value= "modalFormData.activityStartTime" @on-change="val=> modalFormData.activityStartTime=val"></DatePicker> -->
                    <!-- <DatePicker type="datetime" style="width:200px" placeholder="请选择开始时间" :options="optionsStart" v-model="modalFormData.activityStartTime" @on-change="val=> modalFormData.activityStartTime=val"></DatePicker> -->
                    <DatePicker type="datetime" style="width:200px" placeholder="请选择开始时间" :options="optionsStart"
                                :value="modalFormData.activityStartTime"
                                @on-change="val=> modalFormData.activityStartTime=val"></DatePicker>
                </FormItem>
                <FormItem label="活动结束时间：">
                    <!-- <DatePicker type="datetime" style="width:200px" placeholder="请选择结束时间" :options="optionsEnd" v-model="modalFormData.activityEndTime" :value= "modalFormData.activityEndTime" @on-change="val=> modalFormData.activityEndTime=val"></DatePicker> -->
                    <!-- <DatePicker type="datetime" style="width:200px" placeholder="请选择结束时间" format="yyyy-MM-dd HH:mm:ss" :options="optionsEnd" v-model="modalFormData.activityEndTime" @on-change="val=> modalFormData.activityEndTime=val"></DatePicker> -->
                    <DatePicker type="datetime" style="width:200px" placeholder="请选择结束时间" :options="optionsEnd"
                                :value="modalFormData.activityEndTime"
                                @on-change="val=> modalFormData.activityEndTime=val"></DatePicker>
                </FormItem>
                <FormItem label="maker活动期间手续费率：" prop="makerFee4Activity">
                    <Input style="width:200px" v-model="modalFormData.makerFee4Activity"></Input>%
                </FormItem>
                <FormItem label="taker活动期间手续费率：" prop="takerFee4Activity">
                    <Input style="width:200px" v-model="modalFormData.takerFee4Activity"></Input>%
                </FormItem>
            </Form>
            <div slot="footer">
                <Button @click="modalCancel">取消</Button>
                <Button type="primary" @click="modalConfirm">保存</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import api from '@/api/serviceCharge.js';

    export default {
        data () {
            return {
                optionsEnd: {
                    disabledDate: function (date) {
                        return date && date.valueOf() < (new Date(this.modalFormData.activityStartTime).valueOf() - 8639000);
                    }.bind(this)
                },
                optionsStart: {
                    disabledDate: function (date) {
                        return date && date.valueOf() > new Date(this.modalFormData.activityEndTime).valueOf();
                    }.bind(this)
                },
                tableLoading: true,
                pageNum: 1,
                pageSize: 20,
                marketType: '', // 交易对
                vipRate: '', // vip等级
                isInActivityTime: '', // 活动是否生效
                totalCount: 0, // 数据总条数（与分页无关）
                // 表头
                tHeaderData: [
                    {title: '交易对', key: 'marketType'},
                    {title: 'VIP等级', key: 'vipRate'},
                    {
                        title: 'maker手续费率',
                        key: 'makerFee',
                        render: (h, params) => {
                            return h('span', typeof params.row.makerFee !== 'undefined' ? params.row.makerFee + '%' : params.row.makerFee);
                        }
                    },
                    {
                        title: 'taker手续费率',
                        key: 'takerFee',
                        render: (h, params) => {
                            return h('span', typeof params.row.takerFee !== 'undefined' ? params.row.takerFee + '%' : params.row.takerFee);
                        }
                    },
                    {title: '活动开始时间', key: 'activityStartTime'},
                    {title: '活动结束时间', key: 'activityEndTime'},
                    {
                        title: 'maker活动期间手续费率',
                        key: 'makerFee4Activity',
                        render: (h, params) => {
                            return h('span', typeof params.row.makerFee4Activity !== 'undefined' ? params.row.makerFee4Activity + '%' : params.row.makerFee4Activity);
                        }
                    },
                    {
                        title: 'taker活动期间手续费率',
                        key: 'takerFee4Activity',
                        render: (h, params) => {
                            return h('span', typeof params.row.takerFee4Activity !== 'undefined' ? params.row.takerFee4Activity + '%' : params.row.takerFee4Activity);
                        }
                    },
                    {title: '活动是否生效', key: 'isInActivityTime'},
                    {
                        title: '操作',
                        key: 'opration',
                        render: (h, params) => {
                            return h('div', [
                                this.g_perm('edit') ? h('Button',
                                    {
                                        props: {
                                            type: 'primary',
                                            size: 'small'
                                        },
                                        style: {
                                            marginRight: '5px'
                                        },
                                        on: {
                                            click: () => {
                                                this.editServiceCharge(params);
                                            }
                                        }
                                    }, '编辑') : '',
                                this.g_perm('delete') ? h('Button',
                                    {
                                        props: {
                                            type: 'error',
                                            size: 'small'
                                        },
                                        on: {
                                            click: () => {
                                                this.delServiceCharge(params);
                                            }
                                        }
                                    }, '删除') : ''
                            ]);
                        }
                    }
                ],
                //   表格数据
                serviceChargeData: [],
                allMarketType: [], // 所有交易对
                showModal: false, // 点击添加显示modal框
                isEdit: false, // 是否是编辑，编辑和新增调用的的接口不同
                vipRates: [], // 所有VIP等级
                pageSizeOpts: [10, 20, 50, 100], // 显示条数
                // modal框表单数据
                modalFormData: {
                    vipRate: '',
                    marketType: '',
                    makerFee: '',
                    takerFee: '',
                    activityStartTime: '',
                    activityEndTime: '',
                    makerFee4Activity: '',
                    takerFee4Activity: ''
                },
                // 表单验证规则
                ruleValidate: {
                    vipRate: [{required: true, message: 'VIP等级不能为空', trigger: 'change'}],
                    marketType: [{required: true, message: '交易对不能为空', trigger: 'change'}],
                    makerFee: [{
                        required: true,
                        trigger: 'blur',
                        validator: (rule, value, callback) => {
                            if (value.replace(/\s/g, '') === '') {
                                callback(new Error('maker手续费率不能为空'));
                            } else {
                                callback();
                            }
                        }
                    }],
                    takerFee: [{
                        required: true,
                        trigger: 'blur',
                        validator: (rule, value, callback) => {
                            if (value.replace(/\s/g, '') === '') {
                                callback(new Error('taker手续费率不能为空'));
                            } else {
                                callback();
                            }
                        }
                    }],
                    makerFee4Activity: [{
                        required: true,
                        trigger: 'blur',
                        validator: (rule, value, callback) => {
                            if (value.replace(/\s/g, '') === '') {
                                callback(new Error('maker活动期间手续费率不能为空'));
                            } else {
                                callback();
                            }
                        }
                    }],
                    takerFee4Activity: [{
                        required: true,
                        trigger: 'blur',
                        validator: (rule, value, callback) => {
                            if (value.replace(/\s/g, '') === '') {
                                callback(new Error('taker活动期间手续费率不能为空'));
                            } else {
                                callback();
                            }
                        }
                    }]
                }
            };
        },
        methods: {
            // 查询
            search () {
                this.pageNum = 1; // 重置页码
                this.totalCount = 1; // 重置数据总数量
                this.getData();
            },
            // 重置
            reset () {
                this.pageNum = 1;
                this.pageSize = 20;
                this.marketType = '';
                this.vipRate = '';
                this.isInActivityTime = '';
                this.getData();
            },
            // 新增
            addHandle () {
                this.showModal = true;
                this.isEdit = false;
            },
            // 编辑
            editServiceCharge (params) {
                this.showModal = true;
                this.isEdit = true;
                for (let item in this.modalFormData) {
                    // vipRate(vip等级) 后台数据是Number类型
                    if (typeof params.row[item] === 'number') {
                        this.modalFormData[item] = params.row[item].toString();
                        continue;
                    }
                    this.modalFormData[item] = params.row[item];
                }
                this.modalFormData._id = params.row._id;
            },
            // 删除
            delServiceCharge (params) {
                let index = params.index,
                    _id = params.row._id;
                api.delServiceCharge({_id}).then(res => {
                    if (res.data.code === 1) {
                        this.$Message.success(res.data.data || '删除成功');
                        this.serviceChargeData.splice(index, 1);
                    }
                });
            },
            // modal框取消事件，清空数据
            modalCancel () {
                this.showModal = false;
                this.modalFormData.activityStartTime = '';
                this.modalFormData.activityEndTime = '';
                this.$refs.modalForm.resetFields();
            },

            // modal框确认添加事件
            modalConfirm (name) {
                // 校验
                this.$refs.modalForm.validate(valid => {
                    // 先把表单的值都去除所有空格再验证 （时间不能处理，处理了就会被阻止）
                    if (valid) {
                        let vipRateNumber = Number.parseInt(this.modalFormData.vipRate);
                        let {vipRate, ...args} = this.modalFormData;
                        args.vipRate = vipRateNumber;
                        if (this.isEdit) {
                            api.updateServiceCharge(args).then(res => {
                                if (res.data.code === 1) {
                                    this.showModal = false;
                                    this.$Message.success(res.data.msg || '保存成功');
                                    this.getData();
                                }
                            });
                        } else {
                            api.addServiceCharge(args).then(res => {
                                if (res.data.code === 1) {
                                    this.showModal = false;
                                    this.$Message.success(res.data.msg || '保存成功');
                                    this.getData();
                                }
                            });
                        }
                        this.modalCancel(); // 清空数据
                    }
                });
            },
            // 切换每页显示条数
            changePageSize (size) {
                this.pageSize = size;
                if (this.pageNum === 1) {
                    this.getData();
                }
            },
            // 页数改变时
            changePage (page) {
                this.pageNum = page;
                this.getData();
            },
            // 获取表格数据
            getData () {
                this.tableLoading = true;
                let {pageNum, pageSize, marketType, vipRate, isInActivityTime} = this;
                let params = {pageNum, pageSize, marketType, vipRate, isInActivityTime};
                api.getServiceChargeList(params).then(res => {
                    if (res.data.code === 1) {
                        this.serviceChargeData = res.data.data.obj || [];
                        this.totalCount = res.data.data.totalCount || 1;
                        this.tableLoading = false;
                    }
                });
            },
            // 获取交易对
            getMarketType () {
                api.searchMarketType().then(res => {
                    this.allMarketType = res.data.data || [];
                });
            },
            // 获取VIP等级
            getVipRate () {
                api.getVipRate().then(res => {
                    this.vipRates = res.data.data || [];
                });
            }
        },
        created () {
            this.getMarketType();
            this.getVipRate();
            this.getData();
        }
    };
</script>

<style lang="less" scoped>
    .service-charge {
        padding: 15px 10px;
    }

    .left-space {
        margin-left: 20px;
    }

    .fillter {
        position: relative;
    }

    .add-btn {
        position: absolute;
        bottom: -15px;
        right: 0;
    }
</style>
