<style lang="less">
    @import '../../../styles/common.less';
    @import 'broadlist.less';
</style>
<template>
    <div id="broadlist">
        <div class="action">
            <span>标题:</span>
            <Input v-model="title" placeholder="请输入内容" style="width: 300px"></Input>
            <span>分类:</span>
            <Select v-model="model1" style="width:200px">
                <Option v-for="item in cityList" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
            <Button type="primary" icon="ios-search">查找</Button>
            <Button type="error" @click="reset">重置</Button>
            <Button type="primary" @click="typemodal=true">分类管理</Button>
            <Button type="primary" @click="typedirectorymodal=true">分类目录管理</Button>
            <Button type="primary" @click="sendbroad">发布</Button>
        </div>
        <div class="content_wrap" style="margin-top:20px">
            <Table :columns="columns1" :border="true" :data="data1"></Table>
            <Page class="page" @on-change="changepage" :pageSize='pagesize' :current="pageNum" :total="total" show-elevator></Page>
        </div>
        <!--分类管理-->
        <Modal
                width="800"
                title="分类管理"
                v-model="typemodal"
                :mask-closable="false">
            <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="80" label-position="left" class="modalfrom">
                <FormItem label="唯一码:" prop="code">
                    <Input v-model="formValidate.code" placeholder="请输入唯一码"></Input>
                </FormItem>
                <FormItem label="名称:" prop="name">
                    <Input v-model="formValidate.name" placeholder="请输入中文名称"></Input>
                </FormItem>
                <FormItem label="英文名称:" prop="name_en">
                    <Input v-model="formValidate.name_en" placeholder="请输入英文名称"></Input>
                </FormItem>
                <FormItem label="排序:" prop="sort">
                    <Input v-model="formValidate.sort"  placeholder="序号" number></Input>
                </FormItem>
                <FormItem>
                    <Button type="primary" @click="handleSubmit('formValidate')">添加</Button>
                </FormItem>
            </Form>
            <Table height="200" :border="true" :columns="columns_type" :data="data_type"></Table>
        </Modal>
        <!--分类目录管理-->
        <Modal
                width="900"
                title="分类目录管理"
                v-model="typedirectorymodal"
                :mask-closable="false">
            <Form ref="formValidate_dirctory" :model="formValidate_dirctory" :rules="ruleValidate_dirctory" :label-width="90" label-position="left" class="modalfrom">
                <FormItem label="请输入分类:" prop="type">
                    <Select v-model="formValidate_dirctory.type" placeholder="请选择分类">
                        <Option value="0">分类1</Option>
                        <Option value="1">分类2</Option>
                        <Option value="2">分类3</Option>
                    </Select>
                </FormItem>
                <FormItem label="唯一码:" prop="code">
                    <Input v-model="formValidate_dirctory.code" placeholder="请输入唯一码"></Input>
                </FormItem>
                <FormItem label="名称:" prop="name">
                    <Input v-model="formValidate_dirctory.name" placeholder="请输入中文名称"></Input>
                </FormItem>
                <FormItem label="英文名称:" prop="name_en">
                    <Input v-model="formValidate_dirctory.name_en" placeholder="请输入英文名称"></Input>
                </FormItem>
                <FormItem label="排序:" prop="sort">
                    <Input v-model="formValidate_dirctory.sort"  placeholder="序号" number></Input>
                </FormItem>
                <FormItem>
                    <Button type="primary" @click="handleSubmit('formValidate_dirctory')">添加</Button>
                </FormItem>
            </Form>
            <Table height="200" :border="true" :columns="columns_type_dirctory" :data="data_type_dirctory"></Table>
        </Modal>
    </div>
</template>

<script>
    export default {
        name: 'broadlist',
        data(){
            const validatetitle = (rule, value, callback) => {
                if (!value) {
                    return callback(new Error('中文名称不能为空'));
                }
                callback();
            };
            const validateEntitle = (rule, value, callback) => {
                if (!value) {
                    return callback(new Error('英文名称不能为空'));
                }
                callback();
            };
            const validatecode = (rule, value, callback) => {
                if (!value) {
                    return callback(new Error('唯一码不能为空'));
                }
                callback();
            };
            const validatetype = (rule, value, callback) => {
                if (!value) {
                    return callback(new Error('分类不能为空'));
                }
                callback();
            };

            const validatesort = (rule, value, callback) => {
                if (!value) {
                    return callback(new Error('序号不能为空'));
                }
                // 模拟异步验证效果
                setTimeout(() => {
                    if (!Number.isInteger(value)) {
                        callback(new Error('序号必须为整数'));
                    } else {
                        if (value < 0) {
                            callback(new Error('序号不能为负数'));
                        } else {
                            callback();
                        }
                    }
                }, 1000);
            };
            return {
                title:'',
                pagesize:2,//每页显示条数
                total:30,//数据总数
                typemodal:false,
                typedirectorymodal:false,
                cityList: [
                    {
                        value: 'New York',
                        label: 'New York'
                    },
                    {
                        value: 'London',
                        label: 'London'
                    },
                    {
                        value: 'Sydney',
                        label: 'Sydney'
                    },
                    {
                        value: 'Ottawa',
                        label: 'Ottawa'
                    },
                    {
                        value: 'Paris',
                        label: 'Paris'
                    },
                    {
                        value: 'Canberra',
                        label: 'Canberra'
                    }
                ],
                model1: '',
                columns1: [
                    {
                        title: '标题',
                        key: 'title'
                    },
                    {
                        title: '所属分类',
                        key: 'type'
                    },
                    {
                        title: '分类目录',
                        key: 'typedirectory'
                    },
                    {
                        title: '操作',
                        key: 'action',
                        width: 150,
                        align: 'center',
                        render: (h, params) => {
                            return h('div', [
                                h('Button', {
                                    props: {
                                        type: 'primary',
                                        size: 'small'
                                    },
                                    style: {
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.show(params.index)
                                        }
                                    }
                                }, '修改'),
                                h('Button', {
                                    props: {
                                        type: 'error',
                                        size: 'small'
                                    },
                                    on: {
                                        click: () => {
                                            this.remove(params.index)
                                        }
                                    }
                                }, '删除')
                            ]);
                        }
                    }
                ],
                data1: [
                    {
                        title: '测试标题',
                        type: '新闻公告',
                        typedirectory: '公告'
                    },
                    {
                        title: '测试标题',
                        type: '新闻公告',
                        typedirectory: '公告'
                    },
                    {
                        title: '测试标题',
                        type: '新闻公告',
                        typedirectory: '公告'
                    },
                    {
                        title: '测试标题',
                        type: '新闻公告',
                        typedirectory: '公告'
                    }


                ],
                columns_type: [
                    {
                        title: '唯一码',
                        key: 'code'
                    },
                    {
                        title: '名称',
                        key: 'name'
                    },
                    {
                        title: '排序',
                        key: 'sort'
                    },
                    {
                        title: '操作',
                        key: 'action',
                        width: 80,
                        align: 'center',
                        render: (h, params) => {
                            return h('div', [
                                h('Button', {
                                    props: {
                                        type: 'error',
                                        size: 'small'
                                    },
                                    on: {
                                        click: () => {
                                            this.$Message.success('删除成功')
                                        }
                                    }
                                }, '删除')
                            ]);
                        }
                    }
                ],
                data_type: [
                    {
                        code: '11',
                        name: '中文名称',
                        sort: '1'
                    },
                    {
                        code: '11',
                        name: '中文名称',
                        sort: '2'
                    },
                    {
                        code: '11',
                        name: '中文名称',
                        sort: '3'
                    },
                    {
                        code: '11',
                        name: '中文名称',
                        sort: '1'
                    },
                    {
                        code: '11',
                        name: '中文名称',
                        sort: '2'
                    },
                    {
                        code: '11',
                        name: '中文名称',
                        sort: '3'
                    },
                    {
                        code: '11',
                        name: '中文名称',
                        sort: '1'
                    },
                    {
                        code: '11',
                        name: '中文名称',
                        sort: '2'
                    },
                    {
                        code: '11',
                        name: '中文名称',
                        sort: '3'
                    },
                ],
                columns_type_dirctory: [
                    {
                        title: '唯一码',
                        key: 'code'
                    },
                    {
                        title: '归类',
                        key: 'type'
                    },
                    {
                        title: '名称',
                        key: 'name'
                    },
                    {
                        title: '排序',
                        key: 'sort'
                    },
                    {
                        title: '操作',
                        key: 'action',
                        width: 80,
                        align: 'center',
                        render: (h, params) => {
                            return h('div', [
                                h('Button', {
                                    props: {
                                        type: 'error',
                                        size: 'small'
                                    },
                                    on: {
                                        click: () => {
                                            this.$Message.success('删除成功')
                                        }
                                    }
                                }, '删除')
                            ]);
                        }
                    }
                ],
                data_type_dirctory: [
                    {
                        code: '11',
                        name: '中文名称',
                        type:'类别1',
                        sort: '1'
                    },
                    {
                        code: '11',
                        name: '中文名称',
                        type:'类别2',
                        sort: '2'
                    },
                    {
                        code: '11',
                        name: '中文名称',
                        type:'类别3',
                        sort: '3'
                    },
                    {
                        code: '11',
                        name: '中文名称',
                        type:'类别1',
                        sort: '1'
                    },
                    {
                        code: '11',
                        name: '中文名称',
                        type:'类别2',
                        sort: '2'
                    },
                    {
                        code: '11',
                        name: '中文名称',
                        type:'类别3',
                        sort: '3'
                    },
                    {
                        code: '11',
                        name: '中文名称',
                        type:'类别1',
                        sort: '1'
                    },
                    {
                        code: '11',
                        name: '中文名称',
                        type:'类别2',
                        sort: '2'
                    },
                    {
                        code: '11',
                        name: '中文名称',
                        type:'类别3',
                        sort: '3'
                    }
                ],
                formValidate: {
                    code: '',
                    name: '',
                    name_en: '',
                    sort:''
                },
                ruleValidate: {
                    code: [
                        { validator:validatecode, trigger: 'blur' }
                    ],
                    name: [
                        { validator:validatetitle, trigger: 'blur' }
                    ],
                    name_en: [
                        { validator:validateEntitle, trigger: 'blur' }
                    ],
                    sort: [
                        { validator:validatesort, trigger: 'blur' }
                    ]
                },
                formValidate_dirctory: {
                    code: '',
                    name: '',
                    name_en: '',
                    sort:'',
                    type:''
                },
                ruleValidate_dirctory: {
                    code: [
                        { validator:validatecode, trigger: 'blur' }
                    ],
                    type: [
                        { validator:validatetype, trigger: 'change' }
                    ],
                    name: [
                        { validator:validatetitle, trigger: 'blur' }
                    ],
                    name_en: [
                        { validator:validateEntitle, trigger: 'blur' }
                    ],
                    sort: [
                        { validator:validatesort, trigger: 'blur' }
                    ]
                }
            }
        },
        methods: {
            show (index) {
                this.$Modal.info({
                    title: 'User Info',
                    content: `1`
                })
            },
            handleSubmit (name) {
                this.$refs[name].validate((valid) => {
                    if (valid) {
                        this.$Message.success('分类添加成功!');
                    } else {
                        this.$Message.error('信息提交有误!');
                    }
                })
            },
            reset(){
                this.title=''
            },
            sendbroad(){
                // this.$router.push({name:'sendbroad',params: { id: 123 }})
                let routeData = this.$router.resolve({ name: 'sendbroad',params: { id: 123 }});
                window.open(routeData.href, '_blank');
            },
            remove (index) {
                this.data1.splice(index, 1);
            },
            changepage(index){
                console.log(index)
            }
        }
    };
</script>


