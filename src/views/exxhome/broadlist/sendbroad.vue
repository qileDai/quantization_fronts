<style lang="less">
    @import '../../../styles/loading.less';
    @import '../../../styles/common.less';
    @import 'sendbroad.less';
</style>

<template>
    <div id="sendbroad">
        <!--<Card shadow>-->
         <div>
            <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="80">

                <FormItem label="新闻分类:" prop="newstype">
                    <Select v-model="formValidate.newstype" placeholder="选择分类">
                        <Option value="0">新闻1</Option>
                        <Option value="1">新闻2</Option>
                        <Option value="2">新闻3</Option>
                    </Select>
                </FormItem>
                <FormItem label="选择子类:" prop="childrentype">
                    <Select v-model="formValidate.childrentype" placeholder="选择子类">
                        <Option value="0">新闻1</Option>
                        <Option value="1">新闻2</Option>
                        <Option value="2">新闻3</Option>
                    </Select>
                </FormItem>
                <FormItem label="语言:" prop="language">
                    <Select v-model="formValidate.language" placeholder="选择语言">
                        <Option value="0">新闻1</Option>
                        <Option value="1">新闻2</Option>
                        <Option value="2">新闻3</Option>
                    </Select>
                </FormItem>
                <FormItem label="标题:" prop="title">
                    <Input v-model="formValidate.title" placeholder="请输入标题"></Input>
                </FormItem>
                <FormItem label="是否置顶:" prop="istop">
                    <RadioGroup v-model="formValidate.istop">
                        <Radio label="0">是</Radio>
                        <Radio label="1">否</Radio>
                    </RadioGroup>
                </FormItem>
                <FormItem label="摘要:" prop="primary">
                    <Input v-model="formValidate.primary" placeholder="请输入摘要信息"></Input>
                </FormItem>

                <FormItem label="正文:">
                    <textarea class='tinymce-textarea'  id="tinymceEditer"></textarea>
                </FormItem>

                <FormItem label="排序:" prop="sort">
                    <Input v-model="formValidate.sort" placeholder="序号(请填写大于0的整数)"></Input>
                </FormItem>

                <FormItem label="发布时间:" prop="time">
                    <DatePicker v-model="formValidate.time" :editable="false" type="datetime" placeholder="请选择发布时间" style="width: 200px"></DatePicker>
                </FormItem>

                <FormItem label="封面图片:">
                    <div class="demo-upload-list" v-for="item in uploadList">
                        <template v-if="item.status === 'finished'">
                            <img :src="item.url">
                            <div class="demo-upload-list-cover">
                                <Icon type="ios-eye-outline" @click.native="handleView(item.url)"></Icon>
                                <Icon type="ios-trash-outline" @click.native="handleRemove(item)"></Icon>
                            </div>
                        </template>
                        <template v-else>
                            <Progress v-if="item.showProgress" :percent="item.percentage" hide-info></Progress>
                        </template>
                    </div>
                    <Upload
                            v-show="uploadList.length===0"
                            ref="upload"
                            :show-upload-list="false"
                            :default-file-list="defaultList"
                            :on-success="handleSuccess"
                            :format="['jpg','jpeg','png']"
                            :max-size="2048"
                            :on-format-error="handleFormatError"
                            :on-exceeded-size="handleMaxSize"
                            :before-upload="handleBeforeUpload"
                            type="drag"
                            :action="req_url + 'fileUpload'"
                            style="display: inline-block;width:58px;">
                        <div style="width: 58px;height:58px;line-height: 58px;">
                            <Icon type="camera" size="20"></Icon>
                        </div>
                    </Upload>
                    <Modal title="View Image" v-model="visible">
                        <img :src="imgName" v-if="visible" style="width: 100%">
                    </Modal>
                </FormItem>

                <FormItem>
                    <Button type="primary" size="large" style="width: 100px;" @click="handleSubmit('formValidate')">发布</Button>
                </FormItem>
                <Button @click="goHome" size="large" style="width: 200px;margin:20px 0 0 350px" type="primary">返回主页</Button>
            </Form>
         </div>
        <!--</Card>-->
        <Spin fix v-if="spinShow">
            <Icon type="load-c" size=18 class="demo-spin-icon-load"></Icon>
            <div>加载组件中...</div>
        </Spin>

    </div>
</template>

<script>
    import util from '@/libs/util'
    import axios from '@/axios/config'
    import moment from 'moment'
    import tinymce from 'tinymce'


export default {
    name: 'sendbroad',
    data () {
        return {
            spinShow: true,
            DefaultConfig: {
                // GLOBAL
                theme: 'modern',
                menubar: false,
                paste_data_images: true,                  // 粘贴的同时能把内容里的图片自动上传，非常强力的功能
                height: 200,
                language: 'zh_CN.GB2312',
                toolbar: `styleselect | fontselect | formatselect | fontsizeselect | forecolor backcolor | bold italic underline strikethrough | image  media | table | alignleft aligncenter alignright alignjustify | outdent indent | numlist bullist | preview removeformat  hr | paste code  link | undo redo | fullscreen `,
                plugins: `
                    paste
                    importcss
                    image
                    code
                    table
                    advlist
                    fullscreen
                    link
                    media
                    lists
                    textcolor
                    colorpicker
                    hr
                    preview
                  `,


                // CONFIG

                forced_root_block: 'p',
                force_p_newlines: true,
                importcss_append: true,

                // CONFIG: ContentStyle 这块很重要， 在最后呈现的页面也要写入这个基本样式保证前后一致， `table`和`img`的问题基本就靠这个来填坑了
                content_style: `
                    *                         { padding:0; margin:0; }
                    html, body                { height:100%; }
                    img                       { max-width:100%; display:block;height:auto; }
                    a                         { text-decoration: none; }
                    iframe                    { width: 100%; }
                    p                         { line-height:1.6; margin: 0px; }
                    table                     { word-wrap:break-word; word-break:break-all; max-width:100%; border:none; border-color:#999; }
                    .mce-object-iframe        { width:100%; box-sizing:border-box; margin:0; padding:0; }
                    ul,ol                     { list-style-position:inside; }
                `,

                insert_button_items: 'image link | inserttable',

                // CONFIG: Paste
                paste_retain_style_properties: 'all',
                paste_word_valid_elements: '*[*]',        // word需要它
                paste_data_images: true,                  // 粘贴的同时能把内容里的图片自动上传，非常强力的功能
                paste_convert_word_fake_lists: false,     // 插入word文档需要该属性
                paste_webkit_styles: 'all',
                paste_merge_formats: true,
                nonbreaking_force_tab: false,
                paste_auto_cleanup_on_paste: false,

                // CONFIG: Font
                fontsize_formats: '10px 11px 12px 14px 16px 18px 20px 24px',


                // Tab
                tabfocus_elements: ':prev,:next',
                object_resizing: true,

                // Image
                imagetools_toolbar: 'rotateleft rotateright | flipv fliph | editimage imageoptions',
                url: axios.defaults.baseURL+'fileUpload',
                withCredentials: false,
                images_upload_url: 'fileUpload',
            },
            req_url: axios.defaults.baseURL,
            textdata:'',
            formValidate: {
                newstype:'',
                childrentype: '',
                language:'',
                title: '',
                istop: '0',
                primary: '',
                sort: '',
                time: '',
            },
            ruleValidate: {
                newstype: [
                    { required: true, message: '新闻类型不能为空', trigger: 'change' }
                ],
                childrentype: [
                    { required: true, message: '子类不能为空', trigger: 'change' }
                ],
                language: [
                    { required: true, message: '语言不能为空', trigger: 'change' }
                ],
                istop: [
                    { required: true, message: '请选择是否置顶', trigger: 'change' }
                ],
                title: [
                    { required: true, message: '请填写文章标题', trigger: 'blur' }
                ],
                primary: [
                    { required: true, message: '请填写摘要信息', trigger: 'blur' }
                ],
                sort: [
                    { required: true, message: '请填写序号(大于0的整数)', trigger: 'blur' }
                ],
                time: [
                    { required: true,type:'date', message: '请选择发布时间', trigger: 'change' }
                ]
            },
            defaultList: [
                {
                    'name': 'a42bdcc1178e62b4694c830f028db5c0',
                    'url': 'https://o5wwk8baw.qnssl.com/a42bdcc1178e62b4694c830f028db5c0/avatar'
                }
            ],
            imgName: '',
            visible: false,
            uploadList: []
        };
    },
    methods: {
        goHome () {
            util.goHome(this);
        },
        handleView (name) {
            this.imgName = name;
            this.visible = true;
        },
        handleRemove (file) {
            const fileList = this.$refs.upload.fileList;
            this.$refs.upload.fileList.splice(fileList.indexOf(file), 1);
        },
        handleSuccess (res, file) {
            // file.url = 'https://o5wwk8baw.qnssl.com/7eb99afb9d5f317c912f08b5212fd69a/avatar';
            // file.name = '7eb99afb9d5f317c912f08b5212fd69a';
            file.url = res.data;
            file.name='dddd'
            var arr= [
                {
                    'name': 'a42bdcc1178e62b4694c830f028db5c0',
                    'url': res.data
                }
            ]
            localStorage.setItem('imgurl',JSON.stringify(arr))
        },
        handleFormatError (file) {
            this.$Notice.warning({
                title: 'The file format is incorrect',
                desc: 'File format of ' + file.name + ' is incorrect, please select jpg or png.'
            });
        },
        handleMaxSize (file) {
            this.$Notice.warning({
                title: 'Exceeding file size limit',
                desc: 'File  ' + file.name + ' is too large, no more than 2M.'
            });
        },
        handleBeforeUpload () {
            const check = this.uploadList.length < 2;
            if (!check) {
                this.$Notice.warning({
                    title: 'Up to five pictures can be uploaded.'
                });
            }
            return check;
        },
        handleSubmit (name) {
            console.log('txt',this.textdata)
            console.log('--------------------')
            console.log(moment(this.formValidate.time).format('YYYY-MM-DD HH:mm:ss'))
            this.$refs[name].validate((valid) => {
                if (valid) {
                    this.$Message.success('Success!');
                } else {
                    this.$Message.error('Fail!');
                }
            })
        },
        handleReset (name) {
            this.$refs[name].resetFields();
        },
        init (callback) {
            this.$nextTick(() => {
                let vm = this;
                tinymce.init({
                    selector: '#tinymceEditer',
                    ...vm.DefaultConfig,
                    setup: function (editor) {
                        editor.on('init', function (e) {
                            vm.spinShow = false;
                            if (localStorage.editorContent) {
                                tinymce.get('tinymceEditer').setContent(localStorage.editorContent);
                            }

                            callback&&callback(tinymce.get('tinymceEditer').getContent())
                        });
                        editor.on('keydown', function (e) {
                            localStorage.editorContent = tinymce.get('tinymceEditer').getContent();
                            callback&&callback(tinymce.get('tinymceEditer').getContent())
                        });
                        editor.on('change', function(e) {
                            localStorage.editorContent = tinymce.get('tinymceEditer').getContent();
                            callback&&callback(tinymce.get('tinymceEditer').getContent())
                        });
                    },

                    // 图片上传三个参数，图片数据，成功时的回调函数，失败时的回调函数
                    images_upload_handler: function (blobInfo, success, failure){
                        let maxSize=2097152
                        let accept="image/jpeg,image/jpg,image/png"

                        if (blobInfo.blob().size > maxSize) {
                            failure('文件体积过大')
                        }
                        if (accept.indexOf(blobInfo.blob().type) >= 0) {
                            uploadPic()
                        } else {

                            failure('图片格式错误')
                        }
                        function uploadPic () {
                            let formData = new FormData()
                            // 服务端接收文件的参数名，文件数据，文件名
                            formData.append('file', blobInfo.blob(), blobInfo.filename())
                            axios({
                                method: 'POST',
                                // 这里是你的上传地址
                                url: 'fileUpload',
                                data: formData,
                            })
                                .then((res) => {
                                    // 这里返回的是你图片的地址
                                    success(res.data.data)
                                    vm.$Message.success('图片上传成功')
                                })
                                .catch(() => {
                                    failure('上传失败')
                                })
                        }
                    }
                });
            });
        }
    },
    created(){

        if(localStorage.imgurl)
        {
            this.defaultList=JSON.parse(localStorage.imgurl)
        }

    },
    mounted () {
        this.uploadList = this.$refs.upload.fileList;
        this.init((res)=>{
           this.textdata=res
        });
    },
    destroyed () {
        tinymce.get('tinymceEditer').destroy();
    }
};
</script>

<style>

</style>
