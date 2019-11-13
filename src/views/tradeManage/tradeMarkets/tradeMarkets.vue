<style lang="less" scoped>
    @import '../../../styles/common.less';
    @import 'tradeMarkets.less';
</style>

<template>
    <div class="content">
        <Row class="et-row">
            <Col>
                <span>开盘时间：</span>
                <span class="option-text">从</span>
                <DatePicker v-model="startDateObj" format="yyyy-MM-dd HH:mm:ss" :options="optionsStart" :editable="false" @on-change="setStartDateVal" type="datetime" placeholder="请选择开始日期" style="width: 160px"></DatePicker>
                <span class="option-text">到</span>
                <DatePicker v-model="endDateObj" format="yyyy-MM-dd HH:mm:ss" :options="optionsEnd" :editable="false" @on-change="setEndDateVal" type="datetime" placeholder="请选择结束日期" style="width: 160px"></DatePicker>
                <span style="margin-left: 15px;">交易对：</span>
                <div class="search-out" style="width: 120px;">
                    <Input v-model="markets" placeholder="请输入交易对"></Input>
                </div>
                <span style="margin-left: 15px;">市场：</span>
                <div class="search-out" style="width: 100px;">
                    <Select v-model="marketsArea" clearable>
                        <Option v-for="item in marketList" :value="item" :key="item">{{ item.toUpperCase() }}</Option>
                    </Select>
                </div>
                <span style="margin-left: 15px;">是否热门：</span>
                <div class="search-out" style="width: 80px;">
                    <Select v-model="isHot">
                        <Option v-for="item in hotList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                    </Select>
                </div>
                <span style="margin-left: 15px;">是否运行：</span>
                <div class="search-out" style="width: 80px;">
                <Select v-model="isRunning">
                    <Option v-for="item in hotList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                </Select>
            </div>
                <Button type="primary" icon="ios-search" style="margin-left: 5px;" @click="searchMarket">查询</Button>
                <Button type="info" class="add_account" icon="plus-round" @click="showEditModal(null, 0)" v-if="g_perm('add')">新增</Button>
            </Col>
        </Row>
        <Table border :columns="tableColumns" :data="tableData"></Table>
        <div style="position: relative;"><Page class="pages" :current="pageNum" :total="total" show-elevator show-sizer :page-size="pageSize" :page-size-opts="sizeOpts" @on-change="changePageNum" @on-page-size-change="changePageSize"></Page></div>
        <Modal v-model="modalStatus" :title="modalTitle" width="800" @on-cancel="handleReset">
            <div style="padding: 10px 0 30px;" v-if="editType === 0">
                <Steps :current="currentStep">
                    <Step title="建立数据库"></Step>
                    <Step title="选择服务器"></Step>
                    <Step title="配置盘口信息"></Step>
                    <Step title="启动新盘口"></Step>
                </Steps>
            </div>
            <Form ref="formItem" :model="formItem" :label-width="90" :rules="ruleValidate" v-show="currentStep === 0 && editType === 0">
                <FormItem label="交易币种" prop="transCoin" placeholder="请选择交易币种">
                    <Select v-model="formItem.transCoin" filterable style="width:200px" @on-change="setDataBaseName">
                        <Option v-for="item in coinList" :value="item.keyEn.toLowerCase()" :key="item.keyEn">{{ item.keyEn.toUpperCase() }}</Option>
                    </Select>
                </FormItem>
                <FormItem label="市场" prop="marketArea" placeholder="请选择市场">
                    <Select v-model="formItem.marketArea" style="width:200px"  @on-change="setDataBaseName">
                        <Option v-for="item in marketList" :value="item" :key="item">{{ item.toUpperCase() }}</Option>
                    </Select>
                </FormItem>
                <div style="padding: 0 20px; margin-bottom: 25px;">
                    <Table highlight-row :columns="columnsDataSource" :data="tableDataSource" @on-current-change="setCheckDataSource"></Table>
                </div>
                <FormItem label="数据库名称" prop="databases">
                    <Input v-model="formItem.databases" readonly placeholder="请先选择交易币种和市场" style="width: 200px;"></Input>
                </FormItem>
                <FormItem label="数据源服务器IP:端口" prop="dbIpPort">
                    <Input v-model="formItem.dbIpPort" readonly placeholder="请先选择数据源" style="width: 200px;"></Input>
                </FormItem>
            </Form>
            <Form ref="formItem1" :model="formItem1" :label-width="90" :rules="ruleValidate1" v-show="currentStep === 1 && editType === 0">
                <div style="padding: 0 20px; margin-bottom: 25px;">
                    <Table highlight-row :columns="columnsDishServer" :data="tableDishServer" @on-current-change="setCheckDishServer"></Table>
                </div>
                <FormItem label="盘口内网IP" prop="intranet">
                    <Input v-model="formItem1.intranet" readonly placeholder="请输入盘口内网IP" style="width: 200px;"></Input>
                </FormItem>
                <FormItem label="盘口内网IP" prop="extranet">
                    <Input v-model="formItem1.extranet" readonly placeholder="请输入盘口内网IP" style="width: 200px;"></Input>
                </FormItem>
                <h3 style="padding: 0 10px 15px 10px;">Tomcat和对应的交易对</h3>
                <div style="padding: 0 20px; margin-bottom: 25px;">
                    <Table highlight-row :columns="columnsTomcats" :data="tableTomcats" @on-current-change="setCheckTomcats"></Table>
                </div>
                <FormItem label="盘口指向Port" prop="port">
                    <Input v-model="formItem1.port" readonly placeholder="请输入盘口指向Port" style="width: 200px;"></Input>
                </FormItem>
            </Form>
            <Form ref="formItem2" :model="formItem2" :label-width="100" :rules="ruleValidate2" v-show="currentStep === 2 || editType === 1">
                <FormItem label="交易币种">
                    <span>{{formItem.transCoin.toUpperCase()}}</span>
                </FormItem>
                <FormItem label="市场">
                    <span>{{formItem.marketArea.toUpperCase()}}</span>
                </FormItem>
                <FormItem label="买卖价格小数位数" prop="coinsBuyPoint">
                    <Input v-model="formItem2.coinsBuyPoint" number placeholder="请输入买卖价格小数位" style="width: 200px;"></Input>
                </FormItem>
                <FormItem label="买卖数量小数位数" prop="coinsSellPoint">
                    <Input v-model="formItem2.coinsSellPoint" number placeholder="请输入买卖数量小数位" style="width: 200px;"></Input>
                </FormItem>
                <FormItem label="开盘时间" prop="openTime">
                    <DatePicker v-model="openTimeObj" format="yyyy-MM-dd HH:mm:ss" :editable="false" @on-change="setOpenTime" type="datetime" placeholder="请选择开盘时间" style="width: 180px;"></DatePicker>
                </FormItem>
                <FormItem label="最小成交金额" prop="minAmount">
                    <Input v-model="formItem2.minAmount" number placeholder="请输入最小成交金额" style="width: 200px;"></Input>
                </FormItem>
                <FormItem label="最大委托数量" prop="maxEntrustCoin">
                    <Input v-model="formItem2.maxEntrustCoin" number placeholder="请输入最大委托数量" style="width: 200px;"></Input>
                </FormItem>
                <FormItem label="最大交易价格" prop="maxPrice">
                    <Input v-model="formItem2.maxPrice" number placeholder="请输入最大交易价格" style="width: 200px;"></Input>
                </FormItem>
                <FormItem label="交易额小数位" prop="maxPrice">
                    <Input v-model="formItem2.amountDecimal" number placeholder="请输入交易额小数位" style="width: 200px;"></Input>
                </FormItem>
                <FormItem label="价格偏离提醒" prop="priceProtect">
                    <Input v-model="formItem2.priceProtect" number placeholder="请输入价格偏离提醒(如1.01)" style="width: 200px;"></Input>
                </FormItem>
                <FormItem label="交易对排序" prop="orderNum">
                    <Input v-model="formItem2.orderNum" number placeholder="请输入交易对排序" style="width: 200px;"></Input>
                </FormItem>
                <FormItem label="是否运行">
                    <RadioGroup v-model="formItem2.isRunning">
                        <Radio label="1" style="margin-right: 15px;">是</Radio>
                        <Radio label="0">否</Radio>
                    </RadioGroup>
                </FormItem>
                <FormItem label="是否热门交易对">
                    <RadioGroup v-model="formItem2.isHot">
                        <Radio label="1" style="margin-right: 15px;">是</Radio>
                        <Radio label="0">否</Radio>
                    </RadioGroup>
                </FormItem>
                <FormItem label="是否显示">
                    <RadioGroup v-model="formItem2.isShow">
                        <Radio label="1" style="margin-right: 15px;">是</Radio>
                        <Radio label="0">否</Radio>
                    </RadioGroup>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button type="text" size="large" @click="handleReset" v-if="currentStep === 0">取消</Button>
                <Button type="primary" size="large" @click="previousStep" v-if="currentStep > 0 && editType === 0">上一步</Button>
                <Button type="primary" size="large" @click="nextStep" v-if="currentStep !== 2 && editType === 0">下一步</Button>
                <Button type="primary" size="large" @click="handleSubmit" v-if="currentStep === 2 || editType === 1" :loading="submitLoading">保存</Button>
            </div>
        </Modal>
        <Modal v-model="modalStatusDataSource" title="修改数据源" width="800" @on-cancel="handleResetDataSource">
            <div style="padding: 0 20px; margin-bottom: 25px;">
                <Table highlight-row :columns="columnsDataSource" :data="tableDataSource" @on-current-change="setCheckDataSource"></Table>
            </div>
            <div slot="footer">
                <Button type="text" size="large" @click="handleResetDataSource">取消</Button>
                <Button type="primary" size="large" @click="handleSubmitDataSource">确定</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import api from '@/api/autoMarkets'
    import commonApi from '@/api/commonApi/commonApi'
    import axios from '@/axios/config'

    export default {
        name: 'tradeMarkets',
        data () {
            return {
                req_url: axios.defaults.baseURL,
                disabled:false,
                tableColumns: [
                    {
                        title: '排序',
                        key: 'orderNum',
                        render: (h, params) => {
                            return h('span', params.row.orderNum || '-');
                        }
                    },
                    {
                        title: '交易对',
                        key: 'marketName'
                    },
                    {
                        title: '交易币种',
                        key: 'transCoins'
                    },
                    {
                        title: '市场',
                        key: 'marketCoins'
                    },
                    {
                        title: '最小成交金额',
                        key: 'minAmount'
                    },
                    {
                        title: '交易最大价格',
                        key: 'maxPrice'
                    },
                    {
                        title: '最大委托数量',
                        key: 'maxEntrustCoin'
                    },
                    {
                        title: '价格偏离提醒',
                        key: 'priceProtect'
                    },
                    {
                        title: '交易额小数位',
                        key: 'amountDecimal'
                    },
                    // {
                    //     title: '交易量倍数',
                    //     key: 'transMultiples'
                    // },
                    {
                        title: '开盘时间',
                        key: 'openTime'
                    },
                    {
                        title: '是否热门',
                        key: 'isHot',
                        render: (h, params) => {
                            return h('span', params.row.isHot == 1 ? '是' : '否');
                        }
                    },
                    {
                        title: '是否运行',
                        key: 'isRunning',
                        render: (h, params) => {
                            return h('span', params.row.isRunning == 1 ? '是' : '否');
                        }
                    },
                    {
                        title: '数据源名称',
                        key: 'dataSourceName'
                    },
                    {
                        title: 'tomcat名称',
                        key: 'tomcatName'
                    },
                    {
                        title: '异常数量',
                        key: 'faildCount'
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
                                }, '修改配置') : '',
                                this.g_perm('editDateSource') ? h('Button', {
                                    props: {
                                        type: 'warning',
                                        size: 'small',
                                        disabled: params.row.datasourceId !== null
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
                                }, '修改数据源') : '',
                                this.g_perm('cancelEntrust') ? h('Button', {
                                    props: {
                                        type: 'warning',
                                        size: 'small',
                                    },
                                    style: {
                                        marginTop: '5px',
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.cancelEntrust(params.row);
                                        }
                                    }
                                }, '取消盘口委托单') : '',
                               params.row.faildCount>0?(this.g_perm('processTrans') ? h('Button', {
                                    props: {
                                        type: 'warning',
                                        size: 'small',
                                        disabled:this.disabled
                                    },
                                    style: {
                                        marginTop: '5px',
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                         this.disabled=true;
                                         this.dealAbnormal(params.row)
                                        }
                                    }
                                }, '处理成交异常') : ''):"",
                                this.g_perm('syncEntrust') ? h('Button', {
                                    props: {
                                        type: 'warning',
                                        size: 'small',
                                    },
                                    style: {
                                        marginTop: '5px',
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.syncEntrust(params.row);
                                        }
                                    }
                                }, '同步当前委托') : '',
                            ]);
                        }
                    }
                ],
                tableDataSource: [],
                tableDishServer: [],
                tableTomcats: [],
                columnsDataSource: [
                    {
                        title: '选择',
                        width: 60,
                        render: (h, params) => {
                            return h('div', {
                                style: {
                                    paddingBottom: '5px'
                                }
                            }, [
                                h('Radio', {
                                    props: {
                                        value: params.row.id === this.currCheckDataSource.id
                                    },
                                    style: {
                                        marginTop: '5px',
                                        marginRight: '5px'
                                    }
                                })
                            ]);
                        }
                    },
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
                    }
                ],
                columnsDishServer: [
                    {
                        title: '选择',
                        width: 60,
                        render: (h, params) => {
                            return h('div', {
                                style: {
                                    paddingBottom: '5px'
                                }
                            }, [
                                h('Radio', {
                                    props: {
                                        value: params.row.id === this.currCheckDishServer.id
                                    },
                                    style: {
                                        marginTop: '5px',
                                        marginRight: '5px'
                                    }
                                })
                            ]);
                        }
                    },
                    {
                        title: '服务器名称',
                        key: 'name'
                    },
                    {
                        title: '对应市场',
                        key: 'marketArea'
                    },
                    {
                        title: '交易对数量',
                        key: 'marketCount'
                    },
                    {
                        title: '服务器内网IP',
                        key: 'intranetIp'
                    },
                    {
                        title: '服务器外网IP',
                        key: 'extranetIp'
                    }
                ],
                columnsTomcats: [
                    {
                        title: '选择',
                        width: 60,
                        render: (h, params) => {
                            return h('div', {
                                style: {
                                    paddingBottom: '5px'
                                }
                            }, [
                                h('Radio', {
                                    props: {
                                        value: params.row.name === this.currCheckTomcats.name
                                    },
                                    style: {
                                        marginTop: '5px',
                                        marginRight: '5px'
                                    }
                                })
                            ]);
                        }
                    },
                    {
                        title: 'tomcat名称',
                        key: 'name'
                    },
                    {
                        title: '包含交易对',
                        key: 'markets'
                    },
                    {
                        title: '盘口指向Port',
                        key: 'port'
                    }
                ],
                tableData: [],
                modalStatus: false,
                modalStatusDataSource: false,
                submitLoading: false,
                modalTitle: '添加',
                currentStep: 0,
                currCheckDataSource: {},
                currCheckDishServer: {},
                currCheckTomcats: {},
                formItem: {
                    transCoin: '',
                    marketArea: '',
                    dataSourceId: '',
                    databases: '',
                    dbIpPort: ''
                },
                ruleValidate: {
                    transCoin: [
                        {required: true, message: '请选择交易币种', trigger: 'change'}
                    ],
                    marketArea: [
                        {required: true, message: '请选择市场', trigger: 'change'}
                    ],
                    databases: [
                        {required: true, message: '请输入数据库名称', trigger: 'blur'}
                    ],
                    dbIpPort: [
                        {required: true, message: '请先选择数据源', trigger: 'change'}
                    ]
                },
                formItem1: {
                    tomcatId: '',
                    intranet: '',
                    extranet: '',
                    port: ''
                },
                ruleValidate1: {
                    intranet: [
                        {required: true, message: '请先选择盘口服务器', trigger: 'change'}
                    ],
                    extranet: [
                        {required: true, message: '请先选择盘口服务器', trigger: 'change'}
                    ],
                    port: [
                        {required: true, type: 'number', message: '请先选择Tomcat', trigger: 'change'}
                    ]
                },
                formItem2: {
                    id: '',
                    coinsBuyPoint: 6,
                    coinsSellPoint: 2,
                    openTime: '',
                    minAmount: 0.000001,
                    maxEntrustCoin: 1000000,
                    maxPrice: 4000000,
                    amountDecimal: 8,
                    priceProtect: 1.01,
                    orderNum: 100,
                    isRunning: 1,
                    isHot: 0,
                    isShow: 1
                },
                ruleValidate2: {
                    coinsBuyPoint: [
                        {required: true, type: 'number', message: '请输入买卖价格小数位', trigger: 'blur'}
                    ],
                    coinsSellPoint: [
                        {required: true, type: 'number', message: '请输入买卖数量小数位', trigger: 'blur'}
                    ],
                    openTime: [
                        {required: true, message: '请选择开盘时间', trigger: 'change'}
                    ],
                    minAmount: [
                        {required: true, type: 'number', message: '请输入最小成交金额', trigger: 'blur'}
                    ],
                    maxEntrustCoin: [
                        {required: true, type: 'number', message: '请输入最大委托数量', trigger: 'blur'}
                    ],
                    maxPrice: [
                        {required: true, type: 'number', message: '请输入最大交易价格', trigger: 'blur'}
                    ],
                    amountDecimal: [
                        {required: true, type: 'number', message: '请输入交易额小数位', trigger: 'blur'}
                    ],
                    priceProtect: [
                        {required: true, type: 'number', message: '请输入价格偏离提醒(如1.01)', trigger: 'blur'}
                    ],
                    orderNum: [
                        {required: true, type: 'number', message: '请输入交易对排序(数字越小越靠前,1-∞)', trigger: 'blur'}
                    ]
                },
                openTimeObj: '',
                optionsStart: {
                    disabledDate: (date) => {
                        let end = this.endDateObj.valueOf();
                        if (end) {
                            return date && date.valueOf() > end;
                        } else {
                            return false;
                        }
                    }
                },
                optionsEnd: {
                    disabledDate: (date) => {
                        let start = this.startDateObj.valueOf();
                        if (start) {
                            return date && date.valueOf() < start;
                        } else {
                            return false;
                        }
                    }
                },
                coinList: [],
                // 1：热门， 0:不热门，2：全部 (是否运行也适用)
                hotList: [
                    {
                        value: 2,
                        label: '全部'
                    },
                    {
                        value: 1,
                        label: '是'
                    },
                    {
                        value: 0,
                        label: '否'
                    }
                ],
                marketList: [],
                startDateObj: '',
                endDateObj: '',
                startDate: '', // 开始时间
                endDate: '', // 结束时间
                markets: '',
                marketsArea: '',
                isHot: 2,
                isRunning: 2,
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
        },
        methods: {
            // 取消盘口委托单
            cancelEntrust(row) {
                this.$Modal.confirm({
                    title: '确认取消？',
                    content: `<p>确定要取消<span style="color:#f00; font-weight:600">${row.marketName}</span>交易对下的所有委托单？</p>`,
                    loading: true,
                    onOk: () => {
                        setTimeout(() => {
                            this.$Modal.remove();
                            api.cancelEntrust({marketId: row.id}).then(res => {
                                if(res.data.code === 1) {
                                    this.$Message.success(res.data.msg)
                                }
                            })
                        });
                    }
                });
            },
            // 处理异常
            dealAbnormal(row) {
                api.dealAbnormal({marketId: row.id}).then(res => {
                    if(res.data.code === 1) {
                        this.$Message.success(res.data.msg)
                         this.getListData();
                         this.disabled=false;
                    }
                })
            },
            syncEntrust(row){
                api.syncEntrust({marketId: row.id}).then(res => {
                    if(res.data.code === 1) {
                        this.$Message.success(res.data.msg)
                         this.getListData();
                         this.disabled=false;
                    }
                })   
            },
            handleSubmit () {
                this.$refs.formItem2.validate((valid) => {
                    if (valid) {
                        this.submitRequest();
                    }
                });
            },
            handleReset () {
                this.currentStep = 0;
                
                this.formItem2.id = '';
                this.formItem2.coinsBuyPoint = 6;
                this.formItem2.coinsSellPoint = 2;
                this.openTimeObj = '';
                this.formItem2.minAmount = 0.000001;
                this.formItem2.maxEntrustCoin = 1000000;
                this.formItem2.maxPrice = 4000000;
                this.formItem2.amountDecimal = 8;
                this.formItem2.priceProtect = 1.01;
                this.formItem2.orderNum = 100;
                this.formItem2.isRunning = 1;
                this.formItem2.isHot = 0;
                this.formItem2.isShow = 1;

                this.currCheckDataSource = {};
                this.currCheckDishServer = {};
                this.currCheckTomcats = {};

                this.$refs.formItem.resetFields();
                this.$refs.formItem1.resetFields();

                this.modalStatus = false;
            },
            // 提交修改数据源
            handleSubmitDataSource () {
                if (!this.formItem.dataSourceId) {
                    this.$Message.warning('请先选择数据源！');
                    return;
                }

                let params = {
                    dataSourceId: this.formItem.dataSourceId,
                    marketId: this.formItem2.id
                }
                api.editMarketDataSource(params).then((res) => {
                    if (res.data.code == 1) {
                        this.$Message.success('修改成功！');
                        this.handleResetDataSource();
                        // 提交成功重新获取
                        this.getListData();
                    }
                });
            },
            handleResetDataSource () {
                this.currCheckDataSource = {};
                this.formItem.dataSourceId = '';
                this.formItem2.id = '';

                this.modalStatusDataSource = false;
            },
            previousStep () {
                this.currentStep--;
            },
            nextStep () {
                if (this.currentStep === 0) {
                    this.$refs.formItem.validate((valid) => {
                        if (valid) {
                            this.currentStep++;

                            this.getDishServerList();
                        }
                    });
                } else if (this.currentStep === 1) {
                    this.$refs.formItem1.validate((valid) => {
                        if (valid) {
                            this.currentStep++;
                        }
                    });
                }
            },
            submitRequest () {
                this.submitLoading = true;
                if (this.editType == 0) {
                    let obj = Object.assign({}, this.formItem, this.formItem1, this.formItem2);

                    api.addTradeMarket(obj).then((res) => {
                        this.submitLoading = false;
                        if (res.data.code == 1) {
                            this.$Message.success('新增成功！');
                            this.handleReset();
                            // 提交成功重新获取
                            this.getListData();
                        }
                    });
                } else if (this.editType == 1) {
                    let obj = Object.assign({}, this.formItem2);

                    api.editTradeMarket(obj).then((res) => {
                        this.submitLoading = false;
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
                    startTime: this.startDate,
                    endTime: this.endDate,
                    markets: this.markets,
                    marketsArea: this.marketsArea,
                    isHot: this.isHot,
                    isRunning: this.isRunning,
                    pageIndex: this.pageNum,
                    pageSize: this.pageSize
                }
                api.getTradeLists(params).then((res) => {
                    if (res.data.code == 1) {
                        this.tableData = res.data.data.obj || [];
                        this.total = res.data.data.totalCount;
                    }
                });
            },
            showEditModal (currRow, type) {
                this.editType = type;
                if (type == 0) {
                    this.modalTitle = '新增交易对';

                    // 添加
                    this.setFormItem();

                    // 获取数据源
                    this.getDataSourceList();
                    // 获取所有币种
                    this.getCoinsList();

                    this.modalStatus = true;
                } else if (type == 1) {
                    this.modalTitle = '修改交易对';

                    // 赋值表单
                    this.setFormItem(currRow);

                    this.modalStatus = true;
                } else if (type == 2) {
                    // 获取数据源
                    this.getDataSourceList();

                    this.formItem2.id = currRow.id;

                    this.modalStatusDataSource = true;
                }
            },
            getCoinsList () {
                commonApi.getAllCoins().then((res) => {
                    if (res.data.code == 1) {
                        this.coinList = res.data.data;
                    }
                });
            },
            // 获取数据源
            getDataSourceList () {
                api.getDataSource().then((res) => {
                    if (res.data.code == 1) {
                        this.tableDataSource = res.data.data;
                    }
                });
            },
            // 获取数据源
            getDishServerList () {
                let params = {
                    marketArea: this.formItem.marketArea,
                    pageIndex: 1,
                    pageSize: 9999
                }
                api.getDishServer(params).then((res) => {
                    if (res.data.code == 1) {
                        this.tableDishServer = res.data.data.obj || [];
                    }
                });
            },
            // 根据服务器id获取Tomcat
            getTomcatsByServerId (row) {
                let params = {
                    serverId: row.id
                }
                api.getTomcatByServerId(params).then((res) => {
                    if (res.data.code == 1) {
                        let result = res.data.data;
                        let dataArr = [];
                        // 处理Tomcat数据
                        Object.keys(result).forEach((item, index) => {
                            let dataobj = {};
                            dataobj.name = item;
                            let markets = [];
                            result[item].forEach((market, number) => {
                                markets.push(market.marketName);
                            });
                            dataobj.markets = markets.join(',');
                            dataobj.port = result[item][0].port;
                            dataobj.id = result[item][0].tomcatId;

                            dataArr.push(dataobj);
                        });

                        this.tableTomcats = dataArr;
                    }
                });
            },
            setDataBaseName () {
                if (this.formItem.transCoin && this.formItem.marketArea) {
                    this.formItem.databases = `exx_${this.formItem.transCoin}${this.formItem.marketArea}entrust`;
                }
            },
            setCheckDataSource (currentRow, oldCurrentRow) {
                this.currCheckDataSource = currentRow;
                this.formItem.dataSourceId = currentRow.id;

                // 填充数据
                this.formItem.dbIpPort = currentRow.intranet;
            },
            setCheckDishServer (currentRow, oldCurrentRow) {
                this.currCheckDishServer = currentRow;

                // 填充数据
                this.formItem1.extranet = currentRow.extranetIp;
                this.formItem1.intranet = currentRow.intranetIp;

                // 获取Tomcat列表
                this.getTomcatsByServerId(currentRow);
            },
            setCheckTomcats (currentRow, oldCurrentRow) {
                this.currCheckTomcats = currentRow;
                this.formItem1.tomcatId = currentRow.id;

                // 填充数据
                this.formItem1.port = currentRow.port;
            },
            setFormItem (row) {
                if (row) {
                    this.formItem2.id = row.id;
                    this.formItem2.coinsBuyPoint = row.coinsBuyPoint;
                    this.formItem2.coinsSellPoint = row.coinsSellPoint;
                    this.formItem2.openTime = row.openTime;
                    this.openTimeObj = row.openTime;
                    this.formItem2.minAmount = row.minAmount;
                    this.formItem2.maxEntrustCoin = row.maxEntrustCoin;
                    this.formItem2.maxPrice = row.maxPrice;
                    this.formItem2.amountDecimal = row.amountDecimal;
                    this.formItem2.priceProtect = row.priceProtect;
                    this.formItem2.orderNum = row.orderNum;
                    this.formItem2.isRunning = row.isRunning;
                    this.formItem2.isHot = row.isHot;
                    this.formItem2.isShow = row.isShow;

                    this.formItem.transCoin = row.transCoins;
                    this.formItem.marketArea = row.marketCoins;
                }
            },
            setOpenTime (formatDate) {
                this.formItem2.openTime = formatDate;
            },
            setStartDateVal (formatDate) {
                this.startDate = formatDate;
            },
            setEndDateVal (formatDate) {
                this.endDate = formatDate;
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
