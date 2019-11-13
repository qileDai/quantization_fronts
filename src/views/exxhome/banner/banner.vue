<style lang="less" scoped>
    @import '../../../styles/common.less';
    @import 'banner.less';
</style>

<template>
    <div class="content">
        <Row class="topBar">
            <Col>
                <span>平台：</span>
                <div class="form-out">
                    <Select size="small" v-model="platform">
                        <Option v-for="item in platforms" :value="item.type" :key="item.type">{{ item.label }}</Option>
                    </Select>
                </div>
                <span>语言：</span>
                <div class="form-out">
                    <Select size="small" v-model="type">
                        <Option v-for="item in lanList" :value="item.type" :key="item.type">{{ item.label }}</Option>
                    </Select>
                </div>
                <Button type="primary" size="small" icon="refresh" @click="refreshList">刷新</Button>
                <Button type="info" size="small" icon="plus-round" @click="showEditModal(null, 0)" v-if="g_perm('add')">添加</Button>
                <div class="search-out">
                    <Input v-model="searchVal" size="small" placeholder="搜索活动名称" clearable></Input>
                </div>
                <Button type="primary" size="small" icon="ios-search">搜索</Button>
            </Col>
        </Row>
        <Table border :columns="tableColumns" :data="filterList" v-if="platform === 1"></Table>
        <Table border :columns="tableColumnsMobile" :data="filterList" v-if="platform === 2"></Table>
        <Modal v-model="modalStatus" :title="modalTitle" width="800" @on-cancel="handleReset">
            <Form ref="formItem" :model="formItem" :label-width="100" :rules="ruleValidate">
                <FormItem label="序号" prop="rank">
                    <Input v-model="formItem.rank" placeholder="请输入排列序号" @on-keyup="setRankValue" style="width: 200px;"></Input>
                </FormItem>
                <FormItem label="上架时间" prop="shelvesTime">
                    <DatePicker type="datetime" v-model="formItem.shelvesTime" placeholder="请选择上架时间" style="width: 200px;"></DatePicker>
                </FormItem>
                <FormItem label="活动名称" prop="bannerName">
                    <Input v-model="formItem.bannerName" placeholder="请输入活动名称" style="width: 300px;"></Input>
                </FormItem>
                <div class="uploadblock">
                    <label class="upload-label" style="width: 100px;">图片</label>
                    <!--背景图-->
                    <div class="demo-upload-list" v-for="item in uploadList1">
                        <template v-if="item.status === 'finished'">
                            <img :src="item.url">
                            <div class="demo-upload-list-cover">
                                <Icon type="ios-eye-outline" @click.native="handleView(item.url)"></Icon>
                                <Icon type="ios-trash-outline" @click.native="handleRemove1(item)"></Icon>
                            </div>
                        </template>
                        <template v-else>
                            <Progress v-if="item.showProgress" :percent="item.percentage" hide-info></Progress>
                        </template>
                    </div>
                    <Upload v-show="uploadList1.length === 0"
                        ref="upload1"
                        :show-upload-list="false"
                        :on-success="handleSuccess1"
                        :format="['jpg','jpeg','png']"
                        :max-size="2048"
                        :on-format-error="handleFormatError"
                        :on-exceeded-size="handleMaxSize"
                        :before-upload="handleBeforeUpload1"
                        type="drag"
                        :action="req_url + 'fileUpload'"
                        style="display: inline-block;width:100px;">
                        <div style="height:58px; padding: 10px 0;">
                            <Icon type="camera" size="20"></Icon>
                            <span class="up-tip">请上传背景图</span>
                        </div>
                    </Upload>
                    <!--文本图-->
                    <div class="demo-upload-list" v-for="(item, index) in uploadList2" v-show="platform === 1" :key="index">
                        <template v-if="item.status === 'finished'">
                            <img :src="item.url">
                            <div class="demo-upload-list-cover">
                                <Icon type="ios-eye-outline" @click.native="handleView(item.url)"></Icon>
                                <Icon type="ios-trash-outline" @click.native="handleRemove2(item)"></Icon>
                            </div>
                        </template>
                        <template v-else>
                            <Progress v-if="item.showProgress" :percent="item.percentage" hide-info></Progress>
                        </template>
                    </div>
                    <Upload v-show="uploadList2.length === 0 && platform === 1"
                            ref="upload2"
                            :show-upload-list="false"
                            :on-success="handleSuccess2"
                            :format="['jpg','jpeg','png']"
                            :max-size="2048"
                            :on-format-error="handleFormatError"
                            :on-exceeded-size="handleMaxSize"
                            :before-upload="handleBeforeUpload2"
                            type="drag"
                            :action="req_url + 'fileUpload'"
                            style="display: inline-block;width:100px;">
                        <div style="height:58px; padding: 10px 0;">
                            <Icon type="camera" size="20"></Icon>
                            <span class="up-tip">请上传内容图</span>
                        </div>
                    </Upload>
                    <input type="hidden" v-model="formItem.baseImage">
                    <input type="hidden" v-model="formItem.textImage">
                    <div :style="platform==1?'padding-left:228px;':'padding-left:121px;'">{{platform==1?'380*166':'1035*360'}}</div>
                </div>
                
                <template v-if="platform === 1">
                    <FormItem label="链接" prop="url">
                        <Input v-model="formItem.url" placeholder="请输入跳转链接" style="width: 300px;"></Input>
                    </FormItem>
                    <FormItem label="链接打开方式" prop="jumpWay">
                        <RadioGroup v-model="formItem.jumpWay">
                            <Radio label="1">新页面</Radio>
                            <Radio label="2">当前页</Radio>
                        </RadioGroup>
                    </FormItem>
                </template>
                <template v-if="platform === 2">
                    <FormItem label="交互方式" prop="interactWay">
                        <Select v-model="formItem.interactWay" style="width: 200px;">
                            <Option v-for="item in operateList" :value="item.interactWay" :key="item.interactWay">{{ item.interactWayName }}</Option>
                        </Select>
                    </FormItem>
                    <FormItem label="链接" prop="url" v-if="formItem.interactWay === 1">
                        <Input v-model="formItem.url" placeholder="请输入跳转链接" style="width: 300px;"></Input>
                    </FormItem>
                    <FormItem label="交易对" prop="marketType" v-if="formItem.interactWay === 2 || formItem.interactWay === 3">
                        <Select v-model="formItem.marketType" filterable style="width: 200px;">
                            <Option v-for="item in marketList" :value="item" :key="item">{{ item }}</Option>
                        </Select>
                    </FormItem>
                    <template v-if="formItem.interactWay === 4">
                        <FormItem label="法币币种" prop="legalTenderCurrency">
                            <Select v-model="formItem.legalTenderCurrency" style="width: 200px;">
                                <Option v-for="item in currencyList" :value="item.legalTenderCurrency" :key="item.legalTenderCurrency">{{ item.legalTenderCurrencyName }}</Option>
                            </Select>
                        </FormItem>
                        <FormItem label="法币买卖" prop="legalTenderType">
                            <Select v-model="formItem.legalTenderType" style="width: 200px;">
                                <Option v-for="item in tradeTypeList" :value="item.legalTenderType" :key="item.legalTenderType">{{ item.legalTenderTypeName }}</Option>
                            </Select>
                        </FormItem>
                    </template>
                </template>
                <FormItem label="关联活动" prop="activityId">
                    <Select v-model="formItem.activityId" style="width: 200px;" filterable>
                        <Option v-for="item in selecActivity" :value="item.id" :key="item.id">{{ item.activityName }}</Option>
                    </Select>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button type="text" size="large" @click="handleReset">取消</Button>
                <Button type="primary" size="large" @click="handleSubmit">确定</Button>
            </div>
        </Modal>
        
        <!--预览图片-->
        <Modal title="预览" width="800" v-model="visible" class="viewimg">
            <img :src="imgUrl" v-if="visible" style="max-width: 100%;">
        </Modal>

        <!-- 净买入量活动配置 -->
        <Modal title="净买入活动配置" width="800" v-model="activityConfig" @on-cancel="handleResetActivity">
            <Form ref="formItemActivity" :model="formItemActivity" :label-width="130" :rules="ruleValidateActivity">
                <FormItem label="购买交易对" prop="marketName">
                    <Select style="width:150px" v-model="formItemActivity.marketName" @on-change="setCurrencyMarket" clearable filterable placeholder="全部">
                        <Option value="">全部</Option>
                        <Option v-for="(item, index) in allMarketType" :key="index" :value="item.marketName">{{item.marketName}}</Option>
                    </Select>
                </FormItem>
                <FormItem label="活动页面标题" prop="activityPageTitle">
                    <Input v-model="formItemActivity.activityPageTitle" placeholder="活动页面标题" style="width: 300px;"></Input>
                </FormItem>
                <FormItem label="注册分享url标题" prop="registerUrlTitle">
                    <Input v-model="formItemActivity.registerUrlTitle" placeholder="注册分享url标题" style="width: 300px;"></Input>
                </FormItem>
                <FormItem label="全局背景色" prop="globalBgColor">
                    <Input v-model="formItemActivity.globalBgColor" placeholder="全局背景色" style="width: 300px;"></Input>
                </FormItem>
                <FormItem label="模块背景色" prop="moduleBgColor">
                    <Input v-model="formItemActivity.moduleBgColor" placeholder="模块背景色" style="width: 300px;"></Input>
                </FormItem>
                <FormItem label="按钮颜色" prop="buttonColor">
                    <Input v-model="formItemActivity.buttonColor" placeholder="按钮颜色" style="width: 300px;"></Input>
                </FormItem>
                <FormItem label="活动开始时间" prop="startTime">
                    <DatePicker type="datetime" format="yyyy-MM-dd HH:mm:ss" :options="optionsStart" v-model="formItemActivity.startTime" placeholder="请选择活动开始时间" style="width: 200px;"></DatePicker>
                </FormItem>
                <FormItem label="活动结束时间" prop="endTime">
                    <DatePicker type="datetime" format="yyyy-MM-dd HH:mm:ss"  :options="optionsEnd" v-model="formItemActivity.endTime"  placeholder="请选择活动结束时间" style="width: 200px;"></DatePicker>
                </FormItem>
                <!-- 
                    待更新
                 -->
                <FormItem label="活动时间范围" prop="activityTime">
                    <Input v-model="formItemActivity.activityTime" placeholder="每周周一10:00至周日24：00" style="width: 240px;"></Input>
                    <!-- 备注周周赛不需要填写开始时间 结束时间，只需要填写这个活动时间范围 -->
                    <span style="font-size: 12px;color: #495060;">(周周赛无需填写开始时间、结束时间，请在此处输入活动时间范围)</span>
                </FormItem>
                <div class="uploadblock">
                    <label class="upload-label" style="width: 130px;">海报图片</label>
                    <!--背景图-->
                    <div class="demo-upload-list" v-for="item in ActivityBanner">
                        <template v-if="item.status === 'finished'">
                            <img :src="item.url">
                            <div class="demo-upload-list-cover">
                                <Icon type="ios-eye-outline" @click.native="handleView(item.url)"></Icon>
                                <Icon type="ios-trash-outline" @click.native="handleRemove3(item)"></Icon>
                            </div>
                        </template>
                        <template v-else>
                            <Progress v-if="item.showProgress" :percent="item.percentage" hide-info></Progress>
                        </template>
                    </div>
                    <Upload v-show="ActivityBanner.length === 0"
                        ref="upload3"
                        :show-upload-list="false"
                        :on-success="handleSuccess3"
                        :format="['jpg','jpeg','png']"
                        :max-size="2048"
                        :on-format-error="handleFormatError"
                        :on-exceeded-size="handleMaxSize"
                        :before-upload="handleBeforeUpload3"
                        type="drag"
                        :action="req_url + 'fileUpload'"
                        style="display: inline-block;width:100px;">
                        <div style="height:58px; padding: 10px 0;">
                            <Icon type="camera" size="20"></Icon>
                            <span class="up-tip">请上传海报图片</span>
                        </div>
                    </Upload>
                    <input type="hidden" v-model="formItemActivity.posterImg">
                </div>
                <!-- 个人信息 -->
                <h6 class="line"></h6>
                <FormItem label="我的净买入" prop="hasMyNetBuy">
                        <RadioGroup v-model="formItemActivity.hasMyNetBuy">
                            <Radio label="0">没有</Radio>
                            <Radio label="1">有</Radio>
                        </RadioGroup>
                </FormItem>
                <FormItem label="我的当前持有量" prop="hasMyHasCurrency">
                        <RadioGroup v-model="formItemActivity.hasMyHasCurrency">
                            <Radio label="0">没有</Radio>
                            <Radio label="1">有</Radio>
                        </RadioGroup>
                </FormItem>
                <FormItem label="我的注册" prop="hasMyRegister">
                        <RadioGroup v-model="formItemActivity.hasMyRegister">
                            <Radio label="0">没有</Radio>
                            <Radio label="1">有</Radio>
                        </RadioGroup>
                </FormItem>
                <!-- 排行榜 -->
                <h6 class="line"></h6>
                <FormItem label="活动引言说明">
                    <textarea class='tinymce-textarea'  id="activityIntroduction"></textarea>
                </FormItem>
                <!-- 排行榜 -->
                <!-- 排行榜->是否有交易大赛排行榜（0:没有，1:有） -->
                <h6 class="line"></h6>
                <FormItem label="交易大赛排行榜" prop="hasTransRank">
                        <RadioGroup v-model="formItemActivity.hasTransRank">
                            <Radio label="0">没有</Radio>
                            <Radio label="1">有</Radio>
                        </RadioGroup>
                </FormItem>
                <FormItem label="交易大赛排名个数" prop="transRankCount"  v-show="formItemActivity.hasTransRank==1">
                    <Input v-model="formItemActivity.transRankCount" placeholder="交易大赛排名个数" style="width: 300px;"></Input>
                </FormItem>
                <!-- 排行榜->是否需要注册邀请大赛排行榜（0:没有，1:有） -->
                <FormItem label="注册邀请大赛排行榜" prop="hasRegisteredRank">
                        <RadioGroup v-model="formItemActivity.hasRegisteredRank">
                            <Radio label="0">没有</Radio>
                            <Radio label="1">有</Radio>
                        </RadioGroup>
                </FormItem>
                <FormItem label="注册邀请排名个数" v-show="formItemActivity.hasRegisteredRank==1" prop="registeredRankCount">
                    <Input v-model="formItemActivity.registeredRankCount" placeholder="注册邀请排名个数" style="width: 300px;"></Input>
                </FormItem>
                <!-- 排行榜->是否需要持仓大赛排行榜（0:没有，1:有） -->
                 <FormItem label="持仓大赛排行榜" prop="hasCurrencyRank">
                        <RadioGroup v-model="formItemActivity.hasCurrencyRank">
                            <Radio label="0">没有</Radio>
                            <Radio label="1">有</Radio>
                        </RadioGroup>
                </FormItem>
                <FormItem label="持仓大赛排名个数" v-show="formItemActivity.hasCurrencyRank==1" prop="currencyRankCount">
                    <Input v-model="formItemActivity.currencyRankCount" placeholder="注册邀请排名个数" style="width: 300px;"></Input>
                </FormItem>
                <h6 class="line"></h6>
                <!-- 注册有奖 -->
                   <!-- 是否有注册有奖模块（0:没有，1:有） -->
                <FormItem label="注册有奖模块" prop="hasRegisteredRewark">
                        <RadioGroup v-model="formItemActivity.hasRegisteredRewark">
                            <Radio label="0">没有</Radio>
                            <Radio label="1">有</Radio>
                        </RadioGroup>
                </FormItem>
                   <!-- 注册有奖标题(例如：百万空投、注册有奖) -->
                <FormItem label="注册有奖标题" v-show="formItemActivity.hasRegisteredRewark==1" prop="registeredRewarkTitle">
                    <Input v-model="formItemActivity.registeredRewarkTitle" placeholder="注册有奖标题" style="width: 300px;"></Input>
                </FormItem>
                   <!-- 是否有注册有奖-注册送币（0:没有，1:有） -->
                <FormItem label="注册有奖--注册送币" v-show="formItemActivity.hasRegisteredRewark==1" prop="hasRegisteredRule">
                        <RadioGroup v-model="formItemActivity.hasRegisteredRule">
                            <Radio label="0">没有</Radio>
                            <Radio label="1">有</Radio>
                        </RadioGroup>
                </FormItem>
                   <!-- 注册有奖-注册送币富文本 -->
                <FormItem label="注册有奖-注册送币说明" v-show="formItemActivity.hasRegisteredRule==1" prop="registeredRule">
                    <textarea class='tinymce-textarea'  id="registeredRule"></textarea>
                </FormItem>
                    <!-- 是否有注册有奖-邀请注册（0:没有，1:有） -->
                <FormItem label="注册有奖-邀请注册" v-show="formItemActivity.hasRegisteredRewark==1" prop="hasRegisteredInviteRule">
                        <RadioGroup v-model="formItemActivity.hasRegisteredInviteRule">
                            <Radio label="0">没有</Radio>
                            <Radio label="1">有</Radio>
                        </RadioGroup>
                </FormItem>
                   <!-- 注册有奖-邀请注册富文本 -->
                <FormItem label="注册有奖-邀请注册说明" v-show="formItemActivity.hasRegisteredInviteRule==1" prop="registeredInviteRule">
                    <textarea class='tinymce-textarea'  id="registeredInviteRule"></textarea>
                </FormItem>
                <h6 class="line"></h6>
                <!-- 交易有奖 -->
                   <!-- 是否有交易有奖模块（0:没有，1:有） -->
                <FormItem label="交易有奖模块" prop="hasTransRewark">
                        <RadioGroup v-model="formItemActivity.hasTransRewark">
                            <Radio label="0">没有</Radio>
                            <Radio label="1">有</Radio>
                        </RadioGroup>
                </FormItem>
                   <!-- 交易有奖-交易有奖标题(例如：百万空投、注册有奖) -->
                <FormItem label="交易有奖标题" v-show="formItemActivity.hasTransRewark == 1"   prop="transRewarkTitle">
                    <Input v-model="formItemActivity.transRewarkTitle" placeholder="交易有奖标题" style="width: 300px;"></Input>
                </FormItem>
                   <!-- 交易有奖-交易有奖规则富文本 -->
                <FormItem label="交易有奖-交易有奖规则说明" v-show="formItemActivity.hasTransRewark == 1"  prop="transRewarkRule">
                    <textarea class='tinymce-textarea'  id="transRewarkRule"></textarea>
                </FormItem>

                <h6 class="line"></h6>
                <!-- 持仓有奖 -->
                   <!-- 是否有持仓有奖模块（0:没有，1:有） -->
                <FormItem label="持仓有奖模块" prop="hasCurrencyRewark">
                        <RadioGroup v-model="formItemActivity.hasCurrencyRewark">
                            <Radio label="0">没有</Radio>
                            <Radio label="1">有</Radio>
                        </RadioGroup>
                </FormItem>
                   <!-- 持仓有奖-持仓有奖标题(例如：百万空投、注册有奖) -->
                <FormItem label="持仓有奖标题" v-show="formItemActivity.hasCurrencyRewark==1" prop="hasCurrencyRewarkTitle">
                    <Input v-model="formItemActivity.hasCurrencyRewarkTitle" placeholder="持仓有奖标题" style="width: 300px;"></Input>
                </FormItem>
                   <!-- 持仓有奖-持仓有奖规则富文本 -->
                <FormItem label="持仓有奖-持仓有奖规则说明" v-show="formItemActivity.hasCurrencyRewark==1" prop="hasCurrencyRewarkRule">
                    <textarea class='tinymce-textarea'  id="hasCurrencyRewarkRule"></textarea>
                </FormItem>
                <h6 class="line"></h6>
                <!-- 活动规则 -->
                <FormItem label="活动规则" prop="activityRule">
                    <textarea class='tinymce-textarea'  id="activityRule"></textarea>
                </FormItem>                
                <!-- <FormItem label="活动规则详情" prop="activityRuleDetail">
                    <textarea class='tinymce-textarea'  id="activityRuleDetail"></textarea>
                </FormItem> -->

            </Form>
            <div slot="footer">
                <Button type="text" size="large" @click="handleResetActivity">取消</Button>
                <Button type="primary" size="large" @click="handleActivitySubmit">确定</Button>
            </div>
            <!--</Card>-->
            <Spin fix v-if="spinShow">
                <Icon type="load-c" size=18 class="demo-spin-icon-load"></Icon>
                <div>加载组件中...</div>
            </Spin>
        </Modal>    
    </div>
</template>

<script>
    import api from '@/api/banner';
    import axios from '@/axios/config';
    import env from '../../../../build/env';
    import moment from 'moment';
    import tinymce from 'tinymce';

    export default {
        name: 'banner',
        data () {
            return {
                spinShow: true,
                DefaultConfig: {
                // GLOBAL
                    theme: 'modern',
                    menubar: false,
                    paste_data_images: true, // 粘贴的同时能把内容里的图片自动上传，非常强力的功能
                    height: 100,
                    language: 'zh_CN.GB2312',
                    toolbar: 'styleselect | fontselect | formatselect | fontsizeselect | forecolor backcolor | bold italic underline strikethrough | image  media | table | alignleft aligncenter alignright alignjustify | outdent indent | numlist bullist | preview removeformat  hr | paste code  link | undo redo | fullscreen ',
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
                        body                      { background-color: #3F51B5;color:#fff; }
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
                    paste_word_valid_elements: '*[*]', // word需要它
                    paste_data_images: true, // 粘贴的同时能把内容里的图片自动上传，非常强力的功能
                    paste_convert_word_fake_lists: false, // 插入word文档需要该属性
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
                    url: axios.defaults.baseURL + 'fileUpload',
                    withCredentials: false,
                    images_upload_url: 'fileUpload'
                },
                textdata: '',
                req_url: axios.defaults.baseURL,
                type: 1, // 语言默认简体中文
                modalStatus: false,
                activityConfig: false,
                modalTitle: '添加',
                searchVal: '',
                platform: 1, // 平台默认1
                lanList: [
                    {
                        type: 1,
                        label: '简体中文'
                    },
                    {
                        type: 2,
                        label: 'English'
                    },
                    {
                        type: 3,
                        label: '한국어'
                    }
                ],
                platforms: [
                    {
                        type: 1,
                        label: 'Web端'
                    },
                    {
                        type: 2,
                        label: '移动端'
                    }
                ],
                tableColumns: [
                    {
                        title: '序号',
                        key: 'rank'
                    },
                    {
                        title: '上架时间',
                        key: 'shelvesTime',
                        render: (h, params) => {
                            return h('span', params.row.shelvesTime ? params.row.shelvesTime.split('.')[0] : '');
                        }
                    },
                    {
                        title: '活动名称',
                        key: 'bannerName'
                    },
                    {
                        title: '背景图',
                        key: 'baseImage',
                        render: (h, params) => {
                            return h('img', {
                                attrs: {
                                    'src': params.row.baseImage,
                                    'class': 'imgblock',
                                    'width': 100,
                                    'height': 100
                                }
                            });
                        }
                    },
                    {
                        title: '内容图',
                        key: 'textImage',
                        render: (h, params) => {
                            return h('img', {
                                attrs: {
                                    'src': params.row.textImage,
                                    'class': 'imgblock',
                                    'width': 100,
                                    'height': 100
                                }
                            });
                        }
                    },
                    {
                        title: '链接地址',
                        key: 'url'
                    },
                    {
                        title: '链接打开方式',
                        key: 'jumpWay',
                        render: (h, params) => {
                            return h('span', params.row.jumpWay == 1 ? '新页面' : '当前页');
                        }
                    },
                    {
                        title: '创建时间',
                        key: 'creatTime',
                        render: (h, params) => {
                            return h('span', params.row.creatTime ? params.row.creatTime.split('.')[0] : '');
                        }
                    },
                    {
                        title: '修改时间',
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
                                this.g_perm('up') ? h('Button', {
                                    props: {
                                        type: 'success',
                                        size: 'small',
                                        disabled: params.row.shelvesState == 1
                                    },
                                    style: {
                                        marginTop: '5px',
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.upBanner(params.row);
                                        }
                                    }
                                }, '上架') : '',
                                this.g_perm('down') ? h('Button', {
                                    props: {
                                        type: 'warning',
                                        size: 'small',
                                        disabled: params.row.shelvesState == 2
                                    },
                                    style: {
                                        marginTop: '5px',
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.downBanner(params.row);
                                        }
                                    }
                                }, '下架') : '',
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
                                            this.deleteBannerTip(params.row);
                                        }
                                    }
                                }, '删除') : '',
                                h('Button', {
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
                                            this.ActivityConfig(params.row);
                                        }
                                    }
                                }, '净买入活动配置')
                            ]);
                        }
                    }
                ],
                tableColumnsMobile: [
                    {
                        title: '序号',
                        key: 'rank'
                    },
                    {
                        title: '上架时间',
                        key: 'shelvesTime',
                        render: (h, params) => {
                            return h('span', params.row.shelvesTime ? params.row.shelvesTime.split('.')[0] : '');
                        }
                    },
                    {
                        title: '活动名称',
                        key: 'bannerName'
                    },
                    {
                        title: '背景图',
                        key: 'baseImage',
                        render: (h, params) => {
                            return h('img', {
                                attrs: {
                                    'src': params.row.baseImage,
                                    'class': 'imgblock',
                                    'width': 100,
                                    'height': 100
                                }
                            });
                        }
                    },
                    // {
                    //     title: '内容图',
                    //     key: 'textImage',
                    //     render: (h, params) => {
                    //         return h('img', {
                    //             attrs: {
                    //                 'src': params.row.textImage,
                    //                 'class': 'imgblock',
                    //                 'width': 100,
                    //                 'height': 100
                    //             }
                    //         });
                    //     }
                    // },
                    {
                        title: '交互方式',
                        key: 'interactWay',
                        render: (h, params) => {
                            return h('span', this.getInteractWay(params.row.interactWay));
                        }
                    },
                    {
                        title: '链接地址',
                        key: 'url',
                        render: (h, params) => {
                            return h('span', params.row.url || '-');
                        }
                    },
                    {
                        title: '交易对',
                        key: 'marketType',
                        render: (h, params) => {
                            return h('span', params.row.marketType || '-');
                        }
                    },
                    {
                        title: '法币币种',
                        key: 'legalTenderCurrency',
                        render: (h, params) => {
                            return h('span', this.getLegalTenderCurrency(parseInt(params.row.legalTenderCurrency)));
                        }
                    },
                    {
                        title: '法币买卖',
                        key: 'legalTenderType',
                        render: (h, params) => {
                            return h('span', this.getLegalTenderType(params.row.legalTenderType));
                        }
                    },
                    {
                        title: '创建时间',
                        key: 'creatTime',
                        render: (h, params) => {
                            return h('span', params.row.creatTime ? params.row.creatTime.split('.')[0] : '');
                        }
                    },
                    {
                        title: '修改时间',
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
                                this.g_perm('up') ? h('Button', {
                                    props: {
                                        type: 'success',
                                        size: 'small',
                                        disabled: params.row.shelvesState == 1
                                    },
                                    style: {
                                        marginTop: '5px',
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.upBanner(params.row);
                                        }
                                    }
                                }, '上架') : '',
                                this.g_perm('down') ? h('Button', {
                                    props: {
                                        type: 'warning',
                                        size: 'small',
                                        disabled: params.row.shelvesState == 2
                                    },
                                    style: {
                                        marginTop: '5px',
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.downBanner(params.row);
                                        }
                                    }
                                }, '下架') : '',
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
                                            this.deleteBannerTip(params.row);
                                        }
                                    }
                                }, '删除') : '',
                                h('Button', {
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
                                            this.ActivityConfig(params.row);
                                        }
                                    }
                                }, '净买入活动配置')
                            ]);
                        }
                    }
                ],
                tableData: [],
                formItem: {
                    id: '',
                    rank: '',
                    shelvesTime: '',
                    bannerName: '',
                    baseImage: '',
                    textImage: '',
                    url: '',
                    jumpWay: 1,
                    activityId: '', // 当前关联活动id
                    // 以下为移动端新增字段
                    interactWay: 1,
                    marketType: '',
                    legalTenderCurrency: '',
                    legalTenderType: ''
                },
                ruleValidate: {
                    rank: [
                        {required: true, type: 'number', message: '请输入排列序号(必须为大于0的数字)', trigger: 'blur'}
                    ],
                    shelvesTime: [
                        {required: true, type: 'date', message: '请选择上架时间', trigger: 'change'}
                    ],
                    bannerName: [
                        {required: true, message: '请输入活动名称', trigger: 'blur'}
                    ],
                    url: [
                        {required: true, message: '请输入链接地址', trigger: 'blur'}
                    ],
                    marketType: [
                        {required: true, message: '请选择交易对', trigger: 'change'}
                    ],
                    legalTenderCurrency: [
                        {required: true, type: 'number', message: '请选择法币币种', trigger: 'change'}
                    ],
                    legalTenderType: [
                        {required: true, type: 'number', message: '请选择法币买卖', trigger: 'change'}
                    ]
                },
                optionsStart: {
                    disabledDate: (date) => {
                        let end = this.formItemActivity.endTime.valueOf();
                        if (end) {
                            return date && date.valueOf() > end;
                        } else {
                            return '';
                        }
                    }
                },
                optionsEnd: {
                    disabledDate: (date) => {
                        let start = this.formItemActivity.startTime.valueOf();
                        if (start) {
                            return date && date.valueOf() < start;
                        } else {
                            return '';
                        }
                    }
                },
                formItemActivity: {
                    bannerId: '',
                    activityId: '',
                    globalBgColor: '', // 全局背景色
                    moduleBgColor: '', // 模块背景色
                    buttonColor: '', // 按钮颜色
                    startTime: '', // 活动开始时间
                    endTime: '', // 活动结束时间
                    posterImg: '', // banner图片
                    hasMyNetBuy: 0, // 是否有我的净买入（0:表示没有，1:有）
                    hasMyHasCurrency: 0, // 是否有我的当前持有量（0:没有，1:有）
                    hasMyRegister: 0, // 是否有我的注册要求（1:有，0:没有）
                    activityIntroduction: '', // 活动引言说明富文本
                    hasTransRank: 0, // 排行榜->是否有交易大赛排行榜（0:没有，1:有）
                    registeredRankCount: 0, // 排行榜->注册邀请大赛排行榜个数
                    hasRegisteredRank: 0, // 排行榜->是否需要注册邀请大赛排行榜（0:没有，1:有）
                    transRankCount: 0, // 排行榜->交易大赛排行榜个数
                    hasCurrencyRank: 0, // 排行榜->是否需要持仓大赛排行榜（0:没有，1:有）
                    currencyRankCount: 0, // 排行榜->持仓大赛排行榜个数
                    hasRegisteredRewark: 0, // 注册有奖->是否有注册有奖模块（0:没有，1:有）
                    registeredRewarkTitle: '', // 注册有奖->注册有奖标题(例如：百万空投、注册有奖)
                    hasRegisteredRule: 0, // 注册有奖->是否有注册有奖--注册送币（0:没有，1:有）
                    registeredRule: '', // 注册有奖->注册有奖--注册送币富文本
                    hasRegisteredInviteRule: 0, // 注册有奖->是否有注册有奖--邀请注册（0:没有，1:有）
                    registeredInviteRule: '', // 注册有奖->注册有奖--邀请注册富文本
                    hasTransRewark: 0, // 交易有奖-->是否有交易有奖模块（0:没有，1:有）
                    transRewarkTitle: '', // 交易有奖-->交易有奖标题
                    transRewarkRule: '', // 交易有奖-->交易有奖规则富文本
                    hasCurrencyRewark: 0, // 持仓有奖-->是否有持仓有奖模块（0:没有，1:有）
                    hasCurrencyRewarkTitle: '', // 持仓有奖-->持仓有奖标题
                    hasCurrencyRewarkRule: '', // 持仓有奖-->持仓有奖规则富文本
                    activityRule: '', // 活动规则明细富文本
                    activityRuleDetail: '', // 活动规则明详情细富文本
                    marketName: '', // 交易对名称
                    marketId: '', // 交易对ID
                    activityPageTitle: '', // 活动页面标题
                    registerUrlTitle: '', // 注册分享url标题
                    activityTime: '' //周周乐填写
                },
                allMarketType: [],
                ruleValidateActivity: {
                },
                operateList: [],
                marketList: [],
                currencyList: [],
                tradeTypeList: [],
                editType: 0, // 编辑类型 0添加 1编辑
                // 上传图片
                imgUrl: '',
                visible: false,
                uploadList1: [],
                uploadList2: [],
                ActivityBanner: [],
                selecActivity: [], // 关联活动列表,
                selectActivityInfo: null
            };
        },
        watch: {
            // 语言分类
            type () {
                this.getBanner();
            },
            // 平台分类
            platform (val, oldVal) {
                this.getBanner();
                if (val === 2) {
                    // 获取交互方式
                    this.getOperateList();
                    // 获取市场
                    this.getMarketList();
                    // 获取交易币种
                    this.getTradeCurrencyList();
                    // 获取交易类型
                    this.getTradeList();
                }
            }
        },
        computed: {
            // 已过滤的数据
            filterList () {
                let value = this.searchVal;
                if (value) {
                    return this.tableData.filter((item) => {
                        // 大小写都匹配
                        return item.bannerName.indexOf(value.toLowerCase()) !== -1 || item.bannerName.indexOf(value.toUpperCase()) !== -1;
                    });
                } else {
                    return this.tableData;
                }
            },
            Environment () {
                return env;
            },
            ActivityPreviewUrl () {
                if (this.platform === 1) {
                    return this.Environment === 'development' ? `http://tw.exx.com/common-activity/index?activityId=${this.formItemActivity.activityId}&bannerId=${this.formItemActivity.bannerId}` : `https://www.exxvip.com/common-activity/index?activityId=${this.formItemActivity.activityId}&bannerId=${this.formItemActivity.bannerId}`;
                } else {
                    if (this.type === 1) {
                        return this.Environment === 'development' ? `http://tw.exx.com/common-activity-h5/index?lan=cn&activityId=${this.formItemActivity.activityId}&bannerId=${this.formItemActivity.bannerId}` : `https://node.exxstar.com/common-activity-h5/index?lan=cn&activityId=${this.formItemActivity.activityId}&bannerId=${this.formItemActivity.bannerId}`;
                    } else if(this.type === 2) {
                        return this.Environment === 'development' ? `http://tw.exx.com/common-activity-h5/index?lan=en&activityId=${this.formItemActivity.activityId}&bannerId=${this.formItemActivity.bannerId}` : `https://node.exxstar.com/common-activity-h5/index?lan=en&activityId=${this.formItemActivity.activityId}&bannerId=${this.formItemActivity.bannerId}`;
                    } else if(this.type === 3) {
                        return this.Environment === 'development' ? `http://tw.exx.com/common-activity-h5/index?lan=kr&activityId=${this.formItemActivity.activityId}&bannerId=${this.formItemActivity.bannerId}` : `https://node.exxstar.com/common-activity-h5/index?lan=kr&activityId=${this.formItemActivity.activityId}&bannerId=${this.formItemActivity.bannerId}`;
                    }
                }
            }
        },
        methods: {
            init () {
                this.$nextTick(() => {
                    let vm = this;
                    tinymce.init({
                        selector: '#activityIntroduction',
                        ...vm.DefaultConfig,
                        setup: function (editor) {
                            editor.on('init', function (e) {
                                vm.spinShow = false;
                                // if (localStorage.editorContent) {
    
                                // }
                                tinymce.get('activityIntroduction').setContent(vm.formItemActivity.activityIntroduction);

                                // callback && callback(tinymce.get('activityIntroduction').getContent());
                                vm.formItemActivity.activityIntroduction = tinymce.get('activityIntroduction').getContent();
                            });
                            editor.on('keydown', function (e) {
                                vm.formItemActivity.activityIntroduction = tinymce.get('activityIntroduction').getContent();
                                // callback && callback(tinymce.get('activityIntroduction').getContent());
                            });
                            editor.on('change', function (e) {
                                vm.formItemActivity.activityIntroduction = tinymce.get('activityIntroduction').getContent();
                                // callback && callback(tinymce.get('activityIntroduction').getContent());
                            });
                        },

                        // 图片上传三个参数，图片数据，成功时的回调函数，失败时的回调函数
                        images_upload_handler: function (blobInfo, success, failure) {
                            let maxSize = 2097152;
                            let accept = 'image/jpeg,image/jpg,image/png';

                            if (blobInfo.blob().size > maxSize) {
                                failure('文件体积过大');
                            }
                            if (accept.indexOf(blobInfo.blob().type) >= 0) {
                                uploadPic();
                            } else {
                                failure('图片格式错误');
                            }
                            function uploadPic () {
                                let formData = new FormData();
                                // 服务端接收文件的参数名，文件数据，文件名
                                formData.append('file', blobInfo.blob(), blobInfo.filename());
                                axios({
                                    method: 'POST',
                                    // 这里是你的上传地址
                                    url: 'fileUpload',
                                    data: formData
                                })
                                    .then((res) => {
                                    // 这里返回的是你图片的地址
                                        success(res.data.data);
                                        vm.$Message.success('图片上传成功');
                                    })
                                    .catch(() => {
                                        failure('上传失败');
                                    });
                            }
                        }
                    });
                    tinymce.init({
                        selector: '#activityRule',
                        ...vm.DefaultConfig,
                        setup: function (editor) {
                            editor.on('init', function (e) {
                                vm.spinShow = false;
                                tinymce.get('activityRule').setContent(vm.formItemActivity.activityRule);
                                vm.formItemActivity.activityRule = tinymce.get('activityRule').getContent();
                            });
                            editor.on('keydown', function (e) {
                                vm.formItemActivity.activityRule = tinymce.get('activityRule').getContent();
                            });
                            editor.on('change', function (e) {
                                vm.formItemActivity.activityRule = tinymce.get('activityRule').getContent();
                            });
                        }
                    });
                    tinymce.init({
                        selector: '#registeredRule',
                        ...vm.DefaultConfig,
                        setup: function (editor) {
                            editor.on('init', function (e) {
                                vm.spinShow = false;
                                tinymce.get('registeredRule').setContent(vm.formItemActivity.registeredRule);
                                vm.formItemActivity.registeredRule = tinymce.get('registeredRule').getContent();
                            });
                            editor.on('keydown', function (e) {
                                vm.formItemActivity.registeredRule = tinymce.get('registeredRule').getContent();
                            });
                            editor.on('change', function (e) {
                                vm.formItemActivity.registeredRule = tinymce.get('registeredRule').getContent();
                            });
                        }
                    });
                    tinymce.init({
                        selector: '#registeredInviteRule',
                        ...vm.DefaultConfig,
                        setup: function (editor) {
                            editor.on('init', function (e) {
                                vm.spinShow = false;
                                tinymce.get('registeredInviteRule').setContent(vm.formItemActivity.registeredInviteRule);
                                vm.formItemActivity.registeredInviteRule = tinymce.get('registeredInviteRule').getContent();
                            });
                            editor.on('keydown', function (e) {
                                vm.formItemActivity.registeredInviteRule = tinymce.get('registeredInviteRule').getContent();
                            });
                            editor.on('change', function (e) {
                                vm.formItemActivity.registeredInviteRule = tinymce.get('registeredInviteRule').getContent();
                            });
                        }
                    });
                    tinymce.init({
                        selector: '#transRewarkRule',
                        ...vm.DefaultConfig,
                        setup: function (editor) {
                            editor.on('init', function (e) {
                                vm.spinShow = false;
                                tinymce.get('transRewarkRule').setContent(vm.formItemActivity.transRewarkRule);
                                vm.formItemActivity.transRewarkRule = tinymce.get('transRewarkRule').getContent();
                            });
                            editor.on('keydown', function (e) {
                                vm.formItemActivity.transRewarkRule = tinymce.get('transRewarkRule').getContent();
                            });
                            editor.on('change', function (e) {
                                vm.formItemActivity.transRewarkRule = tinymce.get('transRewarkRule').getContent();
                            });
                        }
                    });
                    tinymce.init({
                        selector: '#hasCurrencyRewarkRule',
                        ...vm.DefaultConfig,
                        setup: function (editor) {
                            editor.on('init', function (e) {
                                vm.spinShow = false;
                                tinymce.get('hasCurrencyRewarkRule').setContent(vm.formItemActivity.hasCurrencyRewarkRule);
                                vm.formItemActivity.hasCurrencyRewarkRule = tinymce.get('hasCurrencyRewarkRule').getContent();
                            });
                            editor.on('keydown', function (e) {
                                vm.formItemActivity.hasCurrencyRewarkRule = tinymce.get('hasCurrencyRewarkRule').getContent();
                            });
                            editor.on('change', function (e) {
                                vm.formItemActivity.hasCurrencyRewarkRule = tinymce.get('hasCurrencyRewarkRule').getContent();
                            });
                        }
                    });
                });
            },
            setCurrencyMarket (data) {
                if (!this.allMarketType) return;
                let currency = this.allMarketType.filter((item, key) => {
                    return item.marketName === data;
                });
                this.formItemActivity.marketId = currency[0] ? currency[0].id : '';
            },
            // 获取交易对
            getMarketType () {
                api.searchMarketType().then(res => {
                    this.allMarketType = res.data.data || [];
                });
            },
            getselectActivity () {
                let params = {
                    activityName: ''
                };
                api.getSelectActivity(params).then((res) => {
                    if (res.data.code === 1) {
                        this.selecActivity = res.data.data;
                    }
                });
            },
            getInteractWay (value) {
                for (let i = 0; i < this.operateList.length; i++) {
                    if (this.operateList[i].interactWay === value) {
                        return this.operateList[i].interactWayName;
                    }
                }
                return '-';
            },
            getLegalTenderType (value) {
                for (let i = 0; i < this.tradeTypeList.length; i++) {
                    if (this.tradeTypeList[i].legalTenderType === value) {
                        return this.tradeTypeList[i].legalTenderTypeName;
                    }
                }
                return '-';
            },
            getLegalTenderCurrency (value) {
                for (let i = 0; i < this.currencyList.length; i++) {
                    if (this.currencyList[i].legalTenderCurrency === value) {
                        return this.currencyList[i].legalTenderCurrencyName;
                    }
                }
                return '-';
            },
            setRankValue (event) {
                if (this.formItem.rank != '' && this.formItem.rank > 0 && parseInt(this.formItem.rank)) {
                    this.formItem.rank = parseInt(this.formItem.rank);
                }
            },
            handleSubmit () {
                this.$refs.formItem.validate((valid) => {
                    if (valid) {
                        this.submitBanner();
                    }
                });
            },
            handleActivitySubmit () {
                this.formItemActivity.startTime = moment(this.formItemActivity.startTime).format('YYYY-MM-DD HH:mm:ss');
                this.formItemActivity.endTime = moment(this.formItemActivity.endTime).format('YYYY-MM-DD HH:mm:ss');
                if( this.formItemActivity.startTime == 'Invalid date' ) {
                    this.formItemActivity.startTime = null
                }
                if( this.formItemActivity.endTime == 'Invalid date' ) {
                    this.formItemActivity.endTime = null
                }
                api.AddOrUpdateNetpage(this.formItemActivity).then((res) => {
                    if (res.data.code === 1) {
                        this.$Message.success('活动配置成功!');
                        this.$Modal.confirm({
                            title: '预览活动链接',
                            content: `<a href=${this.ActivityPreviewUrl} target="_blank">${this.ActivityPreviewUrl}</a>`,
                            onOk: () => {
                                // this.deleteBanner(item);
                                tinymce.get('activityIntroduction').destroy();
                                tinymce.get('activityRule').destroy();
                                tinymce.get('hasCurrencyRewarkRule').destroy();
                                tinymce.get('transRewarkRule').destroy();
                                tinymce.get('registeredInviteRule').destroy();
                                tinymce.get('registeredRule').destroy();
                                this.formItemActivity = {
                                    bannerId: '',
                                    globalBgColor: '', // 全局背景色
                                    moduleBgColor: '', // 模块背景色
                                    buttonColor: '', // 按钮颜色
                                    startTime: '', // 活动开始时间
                                    endTime: '', // 活动结束时间
                                    posterImg: '', // banner图片
                                    hasMyNetBuy: 0, // 是否有我的净买入（0:表示没有，1:有）
                                    hasMyHasCurrency: 0, // 是否有我的当前持有量（0:没有，1:有）
                                    hasMyRegister: 0, // 是否有我的注册要求（1:有，0:没有）
                                    activityIntroduction: '', // 活动引言说明富文本
                                    hasTransRank: 0, // 排行榜->是否有交易大赛排行榜（0:没有，1:有）
                                    registeredRankCount: 0, // 排行榜->注册邀请大赛排行榜个数
                                    hasRegisteredRank: 0, // 排行榜->是否需要注册邀请大赛排行榜（0:没有，1:有）
                                    transRankCount: 0, // 排行榜->交易大赛排行榜个数
                                    hasCurrencyRank: 0, // 排行榜->是否需要持仓大赛排行榜（0:没有，1:有）
                                    currencyRankCount: 0, // 排行榜->持仓大赛排行榜个数
                                    hasRegisteredRewark: 0, // 注册有奖->是否有注册有奖模块（0:没有，1:有）
                                    registeredRewarkTitle: '', // 注册有奖->注册有奖标题(例如：百万空投、注册有奖)
                                    hasRegisteredRule: 0, // 注册有奖->是否有注册有奖--注册送币（0:没有，1:有）
                                    registeredRule: '', // 注册有奖->注册有奖--注册送币富文本
                                    hasRegisteredInviteRule: 0, // 注册有奖->是否有注册有奖--邀请注册（0:没有，1:有）
                                    registeredInviteRule: '', // 注册有奖->注册有奖--邀请注册富文本
                                    hasTransRewark: 0, // 交易有奖-->是否有交易有奖模块（0:没有，1:有）
                                    transRewarkTitle: '', // 交易有奖-->交易有奖标题
                                    transRewarkRule: '', // 交易有奖-->交易有奖规则富文本
                                    hasCurrencyRewark: 0, // 持仓有奖-->是否有持仓有奖模块（0:没有，1:有）
                                    hasCurrencyRewarkTitle: '', // 持仓有奖-->持仓有奖标题
                                    hasCurrencyRewarkRule: '', // 持仓有奖-->持仓有奖规则富文本
                                    activityRule: '', // 活动规则明细富文本
                                    activityRuleDetail: '', // 活动规则明详情细富文本
                                    marketName: '', // 交易对名称
                                    marketId: '', // 交易对id
                                    activityPageTitle: '', // 活动页面标题
                                    registerUrlTitle: '' ,// 注册分享url标题
                                    activityTime: '' //周周乐填写
                                };
                                this.activityConfig = false;
                            },
                            onCancel: () => {
                                tinymce.get('activityIntroduction').destroy();
                                tinymce.get('activityRule').destroy();
                                tinymce.get('hasCurrencyRewarkRule').destroy();
                                tinymce.get('transRewarkRule').destroy();
                                tinymce.get('registeredInviteRule').destroy();
                                tinymce.get('registeredRule').destroy();
                                this.formItemActivity = {
                                    bannerId: '',
                                    globalBgColor: '', // 全局背景色
                                    moduleBgColor: '', // 模块背景色
                                    buttonColor: '', // 按钮颜色
                                    startTime: '', // 活动开始时间
                                    endTime: '', // 活动结束时间
                                    posterImg: '', // banner图片
                                    hasMyNetBuy: 0, // 是否有我的净买入（0:表示没有，1:有）
                                    hasMyHasCurrency: 0, // 是否有我的当前持有量（0:没有，1:有）
                                    hasMyRegister: 0, // 是否有我的注册要求（1:有，0:没有）
                                    activityIntroduction: '', // 活动引言说明富文本
                                    hasTransRank: 0, // 排行榜->是否有交易大赛排行榜（0:没有，1:有）
                                    registeredRankCount: 0, // 排行榜->注册邀请大赛排行榜个数
                                    hasRegisteredRank: 0, // 排行榜->是否需要注册邀请大赛排行榜（0:没有，1:有）
                                    transRankCount: 0, // 排行榜->交易大赛排行榜个数
                                    hasCurrencyRank: 0, // 排行榜->是否需要持仓大赛排行榜（0:没有，1:有）
                                    currencyRankCount: 0, // 排行榜->持仓大赛排行榜个数
                                    hasRegisteredRewark: 0, // 注册有奖->是否有注册有奖模块（0:没有，1:有）
                                    registeredRewarkTitle: '', // 注册有奖->注册有奖标题(例如：百万空投、注册有奖)
                                    hasRegisteredRule: 0, // 注册有奖->是否有注册有奖--注册送币（0:没有，1:有）
                                    registeredRule: '', // 注册有奖->注册有奖--注册送币富文本
                                    hasRegisteredInviteRule: 0, // 注册有奖->是否有注册有奖--邀请注册（0:没有，1:有）
                                    registeredInviteRule: '', // 注册有奖->注册有奖--邀请注册富文本
                                    hasTransRewark: 0, // 交易有奖-->是否有交易有奖模块（0:没有，1:有）
                                    transRewarkTitle: '', // 交易有奖-->交易有奖标题
                                    transRewarkRule: '', // 交易有奖-->交易有奖规则富文本
                                    hasCurrencyRewark: 0, // 持仓有奖-->是否有持仓有奖模块（0:没有，1:有）
                                    hasCurrencyRewarkTitle: '', // 持仓有奖-->持仓有奖标题
                                    hasCurrencyRewarkRule: '', // 持仓有奖-->持仓有奖规则富文本
                                    activityRule: '', // 活动规则明细富文本
                                    activityRuleDetail: '', // 活动规则明详情细富文本
                                    marketName: '', // 交易对名称
                                    marketId: '', // 交易对id
                                    activityPageTitle: '', // 活动页面标题
                                    registerUrlTitle: '' ,// 注册分享url标题
                                    activityTime: '' //周周乐填写
                                };
                                this.activityConfig = false;
                            }
                        });
                    }
                });
            },
            handleReset () {
                this.$refs.formItem.resetFields();
                this.formItem.baseImage = '';
                this.formItem.textImage = '';

                this.$refs.upload1.fileList.splice(0, 1);
                this.$refs.upload2.fileList.splice(0, 1);

                this.modalStatus = false;
            },
            handleResetActivity () {
                tinymce.get('activityIntroduction').destroy();
                // tinymce.get('activityRuleDetail').destroy();
                tinymce.get('activityRule').destroy();
                tinymce.get('hasCurrencyRewarkRule').destroy();
                tinymce.get('transRewarkRule').destroy();
                tinymce.get('registeredInviteRule').destroy();
                tinymce.get('registeredRule').destroy();
                this.formItemActivity = {
                    bannerId: '',
                    globalBgColor: '', // 全局背景色
                    moduleBgColor: '', // 模块背景色
                    buttonColor: '', // 按钮颜色
                    startTime: '', // 活动开始时间
                    endTime: '', // 活动结束时间
                    posterImg: '', // banner图片
                    hasMyNetBuy: 0, // 是否有我的净买入（0:表示没有，1:有）
                    hasMyHasCurrency: 0, // 是否有我的当前持有量（0:没有，1:有）
                    hasMyRegister: 0, // 是否有我的注册要求（1:有，0:没有）
                    activityIntroduction: '', // 活动引言说明富文本
                    hasTransRank: 0, // 排行榜->是否有交易大赛排行榜（0:没有，1:有）
                    registeredRankCount: 0, // 排行榜->注册邀请大赛排行榜个数
                    hasRegisteredRank: 0, // 排行榜->是否需要注册邀请大赛排行榜（0:没有，1:有）
                    transRankCount: 0, // 排行榜->交易大赛排行榜个数
                    hasCurrencyRank: 0, // 排行榜->是否需要持仓大赛排行榜（0:没有，1:有）
                    currencyRankCount: 0, // 排行榜->持仓大赛排行榜个数
                    hasRegisteredRewark: 0, // 注册有奖->是否有注册有奖模块（0:没有，1:有）
                    registeredRewarkTitle: '', // 注册有奖->注册有奖标题(例如：百万空投、注册有奖)
                    hasRegisteredRule: 0, // 注册有奖->是否有注册有奖--注册送币（0:没有，1:有）
                    registeredRule: '', // 注册有奖->注册有奖--注册送币富文本
                    hasRegisteredInviteRule: 0, // 注册有奖->是否有注册有奖--邀请注册（0:没有，1:有）
                    registeredInviteRule: '', // 注册有奖->注册有奖--邀请注册富文本
                    hasTransRewark: 0, // 交易有奖-->是否有交易有奖模块（0:没有，1:有）
                    transRewarkTitle: '', // 交易有奖-->交易有奖标题
                    transRewarkRule: '', // 交易有奖-->交易有奖规则富文本
                    hasCurrencyRewark: 0, // 持仓有奖-->是否有持仓有奖模块（0:没有，1:有）
                    hasCurrencyRewarkTitle: '', // 持仓有奖-->持仓有奖标题
                    hasCurrencyRewarkRule: '', // 持仓有奖-->持仓有奖规则富文本
                    activityRule: '', // 活动规则明细富文本
                    activityRuleDetail: '', // 活动规则明详情细富文本
                    marketName: '', // 交易对名称
                    marketId: '', // 交易对id
                    activityPageTitle: '', // 活动页面标题
                    registerUrlTitle: '' ,// 注册分享url标题
                    activityTime: '' //周周乐填写
                };
                this.$refs.upload3.fileList.splice(0, 1);
                this.activityConfig = false;
            },
            submitBanner () {
                if (this.formItem.baseImage == '') {
                    this.$Message.warning('请上传图片');
                    return;
                }
                let params = {
                    adminUserId: 1,
                    type: this.type,
                    forType: this.platform
                };
                let copyObj = Object.assign({}, this.formItem);
                copyObj.shelvesTime = moment(copyObj.shelvesTime).format('YYYY-MM-DD HH:mm:ss');

                // 根据交互方式处理数据
                if (copyObj.interactWay === 1) {
                    copyObj.marketType = '';
                    copyObj.legalTenderCurrency = '';
                    copyObj.legalTenderType = '';
                } else if (copyObj.interactWay === 2 || copyObj.interactWay === 3) {
                    copyObj.url = '';
                    copyObj.legalTenderCurrency = '';
                    copyObj.legalTenderType = '';
                } else if (copyObj.interactWay === 4) {
                    copyObj.url = '';
                    copyObj.marketType = '';
                }

                let obj = Object.assign(params, copyObj);

                if (this.editType == 0) {
                    api.addBanner(obj).then((res) => {
                        if (res.data.code == 1) {
                            this.$Message.success('添加成功');
                            this.handleReset();
                            // 提交成功重新获取
                            this.getBanner();
                        }
                    });
                } else if (this.editType == 1) {
                    api.editBanner(obj).then((res) => {
                        if (res.data.code == 1) {
                            this.$Message.success('编辑成功');
                            this.handleReset();
                            // 提交成功重新获取
                            this.getBanner();
                        }
                    });
                }
            },
            getMarketList () {
                api.getMarketInfos().then((res) => {
                    if (res.data.code == 1) {
                        this.marketList = res.data.data;
                    }
                });
            },
            getOperateList () {
                api.getOperateWay().then((res) => {
                    if (res.data.code == 1) {
                        const datas = res.data.data;
                        let result = [];
                        Object.keys(datas).forEach((item, index) => {
                            let obj = {};
                            obj.interactWay = parseInt(item);
                            obj.interactWayName = datas[item];
                            result.push(obj);
                        });

                        this.operateList = result;
                    }
                });
            },
            getTradeCurrencyList () {
                api.getTradeCurrency().then((res) => {
                    if (res.data.code == 1) {
                        const datas = res.data.data;
                        let result = [];
                        Object.keys(datas).forEach((item, index) => {
                            let obj = {};
                            obj.legalTenderCurrency = parseInt(item);
                            obj.legalTenderCurrencyName = datas[item];
                            result.push(obj);
                        });

                        this.currencyList = result;
                    }
                });
            },
            getTradeList () {
                api.getTradeTypes().then((res) => {
                    if (res.data.code == 1) {
                        const datas = res.data.data;
                        let result = [];
                        Object.keys(datas).forEach((item, index) => {
                            let obj = {};
                            obj.legalTenderType = parseInt(item);
                            obj.legalTenderTypeName = datas[item];
                            result.push(obj);
                        });

                        this.tradeTypeList = result;
                    }
                });
            },
            getBanner () {
                let params = {
                    type: this.type,
                    forType: this.platform
                };
                api.getBanners(params).then((res) => {
                    if (res.data.code == 1) {
                        this.tableData = res.data.data;
                    }
                });
            },
            deleteBannerTip (item) {
                this.$Modal.confirm({
                    title: '提示',
                    content: '确认删除 ' + item.bannerName + ' ？',
                    onOk: () => {
                        this.deleteBanner(item);
                    }
                });
            },
            ActivityConfig (item) {
                api.getBannertoActivity(item.id).then((res) => {
                    // console.log('res', res.data.data);
                    this.selectActivityInfo = res.data.data ? res.data.data : '';
                    this.init();
                    this.formItemActivity = {
                        bannerId: this.selectActivityInfo.bannerId ? this.selectActivityInfo.bannerId : '',
                        activityId: this.selectActivityInfo.activityId ? this.selectActivityInfo.activityId : '',
                        globalBgColor: this.selectActivityInfo.globalBgColor ? this.selectActivityInfo.globalBgColor : '', // 全局背景色
                        moduleBgColor: this.selectActivityInfo.moduleBgColor ? this.selectActivityInfo.moduleBgColor : '', // 模块背景色
                        buttonColor: this.selectActivityInfo.buttonColor ? this.selectActivityInfo.buttonColor : '', // 按钮颜色
                        startTime: this.selectActivityInfo.startTime ? this.selectActivityInfo.startTime : '', // 活动开始时间
                        endTime: this.selectActivityInfo.endTime ? this.selectActivityInfo.endTime : '', // 活动结束时间
                        posterImg: this.selectActivityInfo.posterImg ? this.selectActivityInfo.posterImg : '', // banner图片
                        hasMyNetBuy: this.selectActivityInfo.hasMyNetBuy ? this.selectActivityInfo.hasMyNetBuy : 0, // 是否有我的净买入（0:表示没有，1:有）
                        hasMyHasCurrency: this.selectActivityInfo.hasMyHasCurrency ? this.selectActivityInfo.hasMyHasCurrency : 0, // 是否有我的当前持有量（0:没有，1:有）
                        hasMyRegister: this.selectActivityInfo.hasMyRegister ? this.selectActivityInfo.hasMyRegister : 0, // 是否有我的注册要求（1:有，0:没有）
                        activityIntroduction: this.selectActivityInfo.activityIntroduction ? this.selectActivityInfo.activityIntroduction : '', // 活动引言说明富文本
                        hasTransRank: this.selectActivityInfo.hasTransRank ? this.selectActivityInfo.hasTransRank : 0, // 排行榜->是否有交易大赛排行榜（0:没有，1:有）
                        registeredRankCount: this.selectActivityInfo.registeredRankCount ? this.selectActivityInfo.registeredRankCount : 0, // 排行榜->注册邀请大赛排行榜个数
                        hasRegisteredRank: this.selectActivityInfo.hasRegisteredRank ? this.selectActivityInfo.hasRegisteredRank : 0, // 排行榜->是否需要注册邀请大赛排行榜（0:没有，1:有）
                        transRankCount: this.selectActivityInfo.transRankCount ? this.selectActivityInfo.transRankCount : 0, // 排行榜->交易大赛排行榜个数
                        hasCurrencyRank: this.selectActivityInfo.hasCurrencyRank ? this.selectActivityInfo.hasCurrencyRank : 0, // 排行榜->是否需要持仓大赛排行榜（0:没有，1:有）
                        currencyRankCount: this.selectActivityInfo.currencyRankCount ? this.selectActivityInfo.currencyRankCount : 0, // 排行榜->持仓大赛排行榜个数
                        hasRegisteredRewark: this.selectActivityInfo.hasRegisteredRewark ? this.selectActivityInfo.hasRegisteredRewark : 0, // 注册有奖->是否有注册有奖模块（0:没有，1:有）
                        registeredRewarkTitle: this.selectActivityInfo.registeredRewarkTitle ? this.selectActivityInfo.registeredRewarkTitle : '', // 注册有奖->注册有奖标题(例如：百万空投、注册有奖)
                        hasRegisteredRule: this.selectActivityInfo.hasRegisteredRule ? this.selectActivityInfo.hasRegisteredRule : 0, // 注册有奖->是否有注册有奖--注册送币（0:没有，1:有）
                        registeredRule: this.selectActivityInfo.registeredRule ? this.selectActivityInfo.registeredRule : '', // 注册有奖->注册有奖--注册送币富文本
                        hasRegisteredInviteRule: this.selectActivityInfo.hasRegisteredInviteRule ? this.selectActivityInfo.hasRegisteredInviteRule : 0, // 注册有奖->是否有注册有奖--邀请注册（0:没有，1:有）
                        registeredInviteRule: this.selectActivityInfo.registeredInviteRule ? this.selectActivityInfo.registeredInviteRule : '', // 注册有奖->注册有奖--邀请注册富文本
                        hasTransRewark: this.selectActivityInfo.hasTransRewark ? this.selectActivityInfo.hasTransRewark : 0, // 交易有奖-->是否有交易有奖模块（0:没有，1:有）
                        transRewarkTitle: this.selectActivityInfo.transRewarkTitle ? this.selectActivityInfo.transRewarkTitle : '', // 交易有奖-->交易有奖标题
                        transRewarkRule: this.selectActivityInfo.transRewarkRule ? this.selectActivityInfo.transRewarkRule : '', // 交易有奖-->交易有奖规则富文本
                        hasCurrencyRewark: this.selectActivityInfo.hasCurrencyRewark ? this.selectActivityInfo.hasCurrencyRewark : 0, // 持仓有奖-->是否有持仓有奖模块（0:没有，1:有）
                        hasCurrencyRewarkTitle: this.selectActivityInfo.hasCurrencyRewarkTitle ? this.selectActivityInfo.hasCurrencyRewarkTitle : '', // 持仓有奖-->持仓有奖标题
                        hasCurrencyRewarkRule: this.selectActivityInfo.hasCurrencyRewarkRule ? this.selectActivityInfo.hasCurrencyRewarkRule : '', // 持仓有奖-->持仓有奖规则富文本
                        activityRule: this.selectActivityInfo.activityRule ? this.selectActivityInfo.activityRule : '', // 活动规则明细富文本
                        activityRuleDetail: this.selectActivityInfo.activityRuleDetail ? this.selectActivityInfo.activityRuleDetail : '', // 活动规则明详情细富文本
                        marketName: this.selectActivityInfo.marketName ? this.selectActivityInfo.marketName : '', // 交易对名称
                        marketId: this.selectActivityInfo.marketId ? this.selectActivityInfo.marketId : '', // 交易对ID
                        activityPageTitle: this.selectActivityInfo.activityPageTitle ? this.selectActivityInfo.activityPageTitle : '', // 活动页面标题
                        registerUrlTitle: this.selectActivityInfo.registerUrlTitle ? this.selectActivityInfo.registerUrlTitle : '' ,// 注册分享url标题
                        activityTime: this.selectActivityInfo.activityTime ? this.selectActivityInfo.activityTime : '' //周周乐填写
                    };

                    // 显示已上传图片
                    let obj = {};
                    this.formItemActivity.bannerId = item.id;
                    this.formItemActivity.posterImg = this.selectActivityInfo.posterImg ? this.selectActivityInfo.posterImg : '';
                    if (this.formItemActivity.posterImg) {
                        obj.status = 'finished';
                        obj.url = this.formItemActivity.posterImg;
                        this.ActivityBanner[0] = obj;
                    } else {
                        this.$refs.upload3.fileList.splice(0, 1);
                        this.formItemActivity.posterImg = '';
                    }
                    // obj.url = this.formItemActivity.posterImg;
    
                    this.activityConfig = true;
                });
                // this.activityConfig = true;
            },
            deleteBanner (item) {
                let params = {
                    id: item.id
                };
                api.deleteBanner(params).then((res) => {
                    if (res.data.code == 1) {
                        this.$Message.success('删除成功');
                        // 提交成功重新获取
                        this.getBanner();
                    }
                });
            },
            showEditModal (currRow, type) {
                this.editType = type;
                if (type == 0) {
                    this.modalTitle = '添加';

                    // 添加
                    this.formItem.id = '';

                    this.formItem.rank = '';
                    this.formItem.shelvesTime = '';
                    this.formItem.bannerName = '';
                    this.formItem.baseImage = '';
                    this.formItem.textImage = '';
                    this.formItem.url = '';
                    this.formItem.jumpWay = 1;

                    this.formItem.interactWay = 1;
                    this.formItem.marketType = '';
                    this.formItem.legalTenderCurrency = '';
                    this.formItem.legalTenderType = '';

                    this.$refs.upload1.fileList.splice(0, 1);
                    // this.$refs.upload2.fileList.splice(0, 1);
                } else if (type == 1) {
                    this.modalTitle = '编辑';

                    // 赋值表单
                    this.formItem.id = currRow.id;

                    this.formItem.rank = currRow.rank;
                    this.formItem.shelvesTime = currRow.shelvesTime;
                    this.formItem.bannerName = currRow.bannerName;
                    this.formItem.baseImage = currRow.baseImage;
                    this.formItem.textImage = currRow.textImage;
                    this.formItem.url = currRow.url;
                    this.formItem.jumpWay = currRow.jumpWay;

                    this.formItem.interactWay = currRow.interactWay;
                    this.formItem.marketType = currRow.marketType || '';
                    this.formItem.legalTenderCurrency = parseInt(currRow.legalTenderCurrency) || '';
                    this.formItem.legalTenderType = currRow.legalTenderType || '';

                    // 关联活动
                    this.formItem.activityId = currRow.activityId || '';

                    // 显示已上传图片
                    let obj1 = {}, obj2 = {};

                    obj1.status = 'finished';
                    obj1.url = this.formItem.baseImage;
                    this.uploadList1[0] = obj1;

                    obj2.status = 'finished';
                    obj2.url = this.formItem.textImage;
                    this.uploadList2[0] = obj2;
                }
                this.modalStatus = true;
            },
            // 上架
            upBanner (item) {
                item.shelvesState = 1;
                api.upBanner(item).then((res) => {
                    if (res.data.code == 1) {
                        this.$Message.success('上架成功');
                        // 提交成功重新获取
                        this.getBanner();
                    }
                });
            },
            // 下架
            downBanner (item) {
                item.shelvesState = 2;
                api.downBanner(item).then((res) => {
                    if (res.data.code == 1) {
                        this.$Message.success('下架成功');
                        // 提交成功重新获取
                        this.getBanner();
                    }
                });
            },
            refreshList () {
                this.getBanner();
            },
            // 上传图片
            handleView (imgUrl) {
                this.imgUrl = imgUrl;
                this.visible = true;
            },
            handleRemove1 (file) {
                const fileList = this.$refs.upload1.fileList;
                this.$refs.upload1.fileList.splice(fileList.indexOf(file), 1);
                this.formItem.baseImage = '';
            },
            handleRemove2 (file) {
                const fileList = this.$refs.upload2.fileList;
                this.$refs.upload2.fileList.splice(fileList.indexOf(file), 1);
                this.formItem.textImage = '';
            },
            handleRemove3 (file) {
                const fileList = this.$refs.upload3.fileList;
                this.$refs.upload3.fileList.splice(fileList.indexOf(file), 1);
                this.formItemActivity.posterImg = '';
            },
            handleSuccess1 (res, file) {
                file.url = res.data;
                this.formItem.baseImage = res.data;
            },
            handleSuccess2 (res, file) {
                file.url = res.data;
                this.formItem.textImage = res.data;
            },
            handleSuccess3 (res, file) {
                file.url = res.data;
                this.formItemActivity.posterImg = res.data;
            },
            handleFormatError (file) {
                this.$Notice.warning({
                    title: '文件格式不正确',
                    desc: '文件 ' + file.name + ' 格式不正确，请选择 jpg 或者 png 格式。'
                });
            },
            handleMaxSize (file) {
                this.$Notice.warning({
                    title: '超出文件大小限制',
                    desc: '文件：' + file.name + ' 过大，不能超过 2M'
                });
            },
            handleBeforeUpload1 () {
                const check = this.uploadList1.length < 5;
                if (!check) {
                    this.$Notice.warning({
                        title: '最多可以上传5张照片。'
                    });
                }
                return check;
            },
            handleBeforeUpload2 () {
                const check = this.uploadList2.length < 5;
                if (!check) {
                    this.$Notice.warning({
                        title: '最多可以上传5张照片。'
                    });
                }
                return check;
            },
            handleBeforeUpload3 () {
                const check = this.ActivityBanner.length < 5;
                if (!check) {
                    this.$Notice.warning({
                        title: '最多可以上传5张照片。'
                    });
                }
                return check;
            }
        },
        created () {
            this.getMarketType();
            this.getBanner();
            this.getselectActivity();
            // console.log('e', this.Environment);
        },
        mounted () {
            this.uploadList1 = this.$refs.upload1.fileList;
            this.uploadList2 = this.$refs.upload2.fileList;
            this.ActivityBanner = this.$refs.upload3.fileList;
        },
        destroyed () {
            tinymce.get('activityIntroduction') ? tinymce.get('activityIntroduction').destroy() : '';
            tinymce.get('activityRuleDetail') ? tinymce.get('activityRuleDetail').destroy() : '';
            tinymce.get('activityRule') ? tinymce.get('activityRule').destroy() : '';
            tinymce.get('hasCurrencyRewarkRule') ? tinymce.get('hasCurrencyRewarkRule').destroy() : '';
            tinymce.get('transRewarkRule') ? tinymce.get('transRewarkRule').destroy() : '';
            tinymce.get('registeredInviteRule') ? tinymce.get('registeredInviteRule').destroy() : '';
            tinymce.get('registeredRule') ? tinymce.get('registeredRule').destroy() : '';
        }
    };
</script>
