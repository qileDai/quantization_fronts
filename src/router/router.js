import Main from '@/views/Main.vue';

// 不作为Main组件的子页面展示的页面单独写，如下
export const loginRouter = {
    path: '/login',
    name: 'login',
    meta: {
        title: 'Login - 登录'
    },
    component: () => import('@/views/login.vue')
    // component: () => import('@/views/permission/accounts/accounts.vue')
};

export const page404 = {
    path: '/*',
    name: 'error-404',
    meta: {
        title: '404-页面不存在'
    },
    component: () => import('@/views/error-page/404.vue')
};

export const page403 = {
    path: '/403',
    meta: {
        title: '403-权限不足'
    },
    name: 'error-403',
    component: () => import('@//views/error-page/403.vue')
};

export const page500 = {
    path: '/500',
    meta: {
        title: '500-服务端错误'
    },
    name: 'error-500',
    component: () => import('@/views/error-page/500.vue')
};

/*export const preview = {
    path: '/preview',
    name: 'preview',
    component: () => import('@/views/form/article-publish/preview.vue')
};*/

export const locking = {
    path: '/locking',
    name: 'locking',
    component: () => import('@/views/main-components/lockscreen/components/locking-page.vue')
};

export const sendbroad = {
    path: '/sendbroad/:id',
    name: 'sendbroad',
    component: () => import('@/views/exxhome/broadlist/sendbroad.vue')
};

// 作为Main组件的子页面展示但是不在左侧菜单显示的路由写在otherRouter里
export const otherRouter = {
    path: '/',
    name: 'otherRouter',
    // redirect: '/exxhome',
    component: Main,
    children: [
        // { path: 'home', title: {i18n: 'home'}, name: 'home_index', component: () => import('@/views/home/home.vue') },
        { path: 'ownspace', title: '个人中心', name: 'ownspace_index', component: () => import('@/views/own-space/own-space.vue') },
        { path: 'order/:order_id', title: '订单详情', name: 'order-info', component: () => import('@/views/advanced-router/component/order-info.vue') }, // 用于展示动态路由
        { path: 'shopping', title: '购物详情', name: 'shopping', component: () => import('@/views/advanced-router/component/shopping-info.vue') }, // 用于展示带参路由
        { path: 'message', title: '消息中心', name: 'message_index', component: () => import('@/views/message/message.vue') }
    ]
};

// 作为Main组件的子页面展示并且在左侧菜单显示的路由写在appRouter里
// 为了方便管理（很多地方代码已定向到home_index）将要默认展示的子页面name='home_index'
export const appRouter = [
    // {
    //     path: '/exxhome',
    //     icon: 'android-home',
    //     name: 'exxhome',
    //     title: '首页管理',
    //     component: Main,
    //     children: [
    //         { path: 'bannerManage', title: 'banner管理', name: 'home_index', icon: 'android-film', component: () => import('@/views/exxhome/banner/banner.vue') },
    //         { path: 'mobileManage', title: '移动端二维码', name: 'mobile-manage', icon: 'iphone', component: () => import('@/views/exxhome/mobile/mobile.vue') },
    //         /*{
    //             path: 'broadlist',
    //             icon: 'compose',
    //             name: 'broadlist',
    //             title: '公共管理',
    //             component: () => import('@/views/exxhome/broadlist/broadlist.vue')
    //         }*/
    //     ]
    // },
    // {
    //     path: '/etoken',
    //     icon: 'jet',
    //     name: 'etoken',
    //     title: 'ET管理',
    //     component: Main,
    //     children: [
    //         // { path: 'subscription', title: 'ET认购管理', name: 'subscription', icon: 'ios-cart', component: () => import('@/views/etoken/subscription/subscription.vue') },
    //         { path: 'etokenIssue', title: 'ET挖矿', name: 'etoken-issue', icon: 'beer', component: () => import('@/views/etoken/etokenIssue/etokenIssue.vue') },
    //         { path: 'etokenStatistics', title: 'ET挖矿统计', name: 'etoken-statistics', icon: 'arrow-graph-up-right', component: () => import('@/views/etoken/etokenStatistics/etokenStatistics.vue') },
    //         { path: 'etokenBonus', title: 'ET分红', name: 'etoken-bonus', icon: 'ribbon-b', component: () => import('@/views/etoken/etokenBonus/etokenBonus.vue') },
    //         { path: 'etokenBonusStatistics', title: 'ET分红统计', name: 'etoken-bonus-statistics', icon: 'pie-graph', component: () => import('@/views/etoken/etokenBonusStatistics/etokenBonusStatistics.vue') },
    //     ]
    // },
    {
                path: '/rbac',
                icon: 'ios-locked',
                name: 'rbac',
                title: '权限管理',
                component: Main,
                children: [
                    { path: 'user', title: '用户管理', name: 'user', icon: 'person', component: () => import('@/views/permission/accounts/accounts.vue') },
                    { path: 'role', title: '角色管理', name: 'role', icon: 'person-stalker', component: () => import('@/views/permission/roles/roles.vue') },
                    { path: 'menu', title: '菜单管理', name: 'menu', icon: 'ios-list', component: () => import('@/views/permission/menus/menus.vue') }
                ]
            },
    {
        path: '/deal',
        icon: 'ios-locked',
        name: 'deal',
        title: '交易管理',
        component: Main,
        children: [
            { path: 'account', title: '账户管理', name: 'account', icon: 'person', component: () => import('@/views/tradeManage/tomcatManage/tomcatManage.vue') },


            { path: 'robot', title: '机器人管理', name: 'robot', icon: 'person', component: () => import('@/views/tradeManage/robots/robots.vue') }
        ]
    },
    // {
    //     path: '/permission',
    //     icon: 'ios-locked',
    //     name: 'permission',
    //     title: '权限管理',
    //     component: Main,
    //     children: [
    //         { path: 'account', title: '账户管理', name: 'account', icon: 'person', component: () => import('@/views/permission/accounts/accounts.vue') },
    //         { path: 'role', title: '角色管理', name: 'role', icon: 'person-stalker', component: () => import('@/views/permission/roles/roles.vue') },
    //         { path: 'menus', title: '菜单管理', name: 'menus', icon: 'ios-list', component: () => import('@/views/permission/menus/menus.vue') }
    //     ]
    // },
    // {
    //     path: '/sysManage',
    //     icon: 'android-options',
    //     name: 'sysManage',
    //     title: '系统管理',
    //     component: Main,
    //     children: [
    //         // { path: 'operateLog', title: '操作日志', name: 'operate-log', icon: 'document-text', component: () => import('@/views/systems/operateLog/operateLog.vue') }
    //         { path: 'emails', title: '邮箱管理', name: 'emails', icon: 'android-mail', component: () => import('@/views/systems/emails/emails.vue') },
    //         { path: 'verificationcode', title: '验证码管理', name: 'verification-code', icon: 'chatbox-working', component: () => import('@/views/systems/verificationcode/verificationcode.vue') },
    //         { path: 'messagechannel', title: '消息通道管理', name: 'message-channel', icon: 'chatbubbles', component: () => import('@/views/systems/messageChannel/messageChannel.vue') },
    //         { path: 'vipsetting', title: 'VIP等级设置', name: 'vipsetting', icon: 'chatbox-working', component: () => import('@/views/systems/vipSetting/vipSetting.vue') }
    //     ]
    // },
    // {
    //     path: '/transactionAlliance',
    //     icon: 'person-stalker',
    //     name: 'transactionAlliance',
    //     title: '交易所管理',
    //     component: Main,
    //     children: [
    //         { path: 'sitecontrol', title: '站点管理', name: 'sitecontrol', icon: 'social-chrome', component: () => import('@/views/transactionAlliance/siteControl/siteControl.vue') },
    //         { path: 'transbannercontrol', title: '广告位管理', name: 'transbannercontrol', icon: 'images', component: () => import('@/views/transactionAlliance/transactionBannerControl/transactionBannerControl.vue') },
    //         { path: 'wordsfiltering', title: '域名敏感词过滤', name: 'words-filtering', icon: 'ios-color-filter', component: () => import('@/views/transactionAlliance/wordsFiltering/wordsFiltering.vue') },
    //         // { path: 'transactionmanage', title: '交易所管理', name: 'transactionmanage', icon: 'settings', component: () => import('@/views/transactionAlliance/transactionManage/transactionManage.vue') },
    //         { path: 'systemsetting', title: '系统配置', name: 'systemsetting', icon: 'ios-gear', component: () => import('@/views/transactionAlliance/systemSetting/systemSetting.vue') },
    //         { path: 'bazaarconfig', title: '交易对配置', name: 'bazaarconfig', icon: 'ios-star', component: () => import('@/views/transactionAlliance/bazaarConfig/bazaarConfig.vue') },
    //         { path: 'sitestatistics', title: '站点统计', name: 'sitestatistics', icon: 'podium', component: () => import('@/views/transactionAlliance/siteStatistics/siteStatistics.vue') }
    //     ]
    // },
    // {
    //     path: '/userManage',
    //     icon: 'ios-people',
    //     name: 'userManage',
    //     title: '用户管理',
    //     component: Main,
    //     children: [
    //         { path: 'users', title: '用户列表', name: 'users', icon: 'ios-person', component: () => import('@/views/userManage/users/users.vue') },
    //         { path: 'supernode', title: '超级节点', name: 'super-node', icon: 'network', component: () => import('@/views/userManage/supernode/supernode.vue') }
    //     ]
    // },
    // {
    //     path: '/tradeManage',
    //     icon: 'ios-cart',
    //     name: 'tradeManage',
    //     title: '交易管理',
    //     component: Main,
    //     children: [
    //         { path: 'robots', title: '机器人管理', name: 'robots', icon: 'social-android', component: () => import('@/views/tradeManage/robots/robots.vue') },
    //         { path: 'servicecharge', title: '手续费管理', name: 'servicecharge', icon: 'social-usd', component: () => import('@/views/tradeManage/serviceCharge/serviceCharge.vue') },
    //         { path: 'trademarkets', title: '交易市场管理', name: 'trade-markets', icon: 'hammer', component: () => import('@/views/tradeManage/tradeMarkets/tradeMarkets.vue') },
    //         { path: 'tomcatmanage', title: 'tomcat管理', name: 'tomcat-manage', icon: 'wrench', component: () => import('@/views/tradeManage/tomcatManage/tomcatManage.vue') },
    //         { path: 'dishservermanage', title: '盘口服务器管理', name: 'dishserver-manage', icon: 'loop', component: () => import('@/views/tradeManage/dishServerManage/dishServerManage.vue') },
    //         { path: 'datasource', title: '数据源服务器管理', name: 'data-source', icon: 'funnel', component: () => import('@/views/tradeManage/dataSource/dataSource.vue') }
    //     ]
    // },
    // {
    //     path: '/fundsManage',
    //     icon: 'cash',
    //     name: 'fundsManage',
    //     title: '资金管理',
    //     component: Main,
    //     children: [
    //         { path: 'transfer', title: '转账管理', name: 'transfer', icon: 'arrow-swap', component: () => import('@/views/fundsManage/transfer/transfer.vue') },
    //         { path: 'transferrecord', title: '转账记录', name: 'transfer-record', icon: 'calculator', component: () => import('@/views/fundsManage/transferRecord/transferRecord.vue') },
    //         { path: 'transfermultiple', title: '批量转账', name: 'transfer-multiple', icon: 'arrow-shrink', component: () => import('@/views/fundsManage/transferFile/transferFile.vue') },
    //         // { path: 'transferfile', title: '文件管理', name: 'transfer-file', icon: 'android-folder', component: () => import('@/views/fundsManage/transferFile/transferFile.vue') }
    //         { path: 'topupmoney', title: '充币记录', name: 'topupmoney', icon: 'android-upload', component: () => import('@/views/fundsManage/topUpMoney/topUpMoney.vue') },
    //         { path: 'extractmoney', title: '提币记录', name: 'extractmoney', icon: 'android-download', component: () => import('@/views/fundsManage/extractMoney/extractMoney.vue') },
    //         { path: 'assetmanage', title: '资产管理', name: 'assetmanage', icon: 'social-bitcoin-outline', component: () => import('@/views/fundsManage/assetsManage/assetsManage.vue') },
    //         { path: 'usertransfermanage', title: '用户转账管理', name: 'usertransfermanage', icon: 'social-bitcoin-outline', component: () => import('@/views/fundsManage/usertransfermanage/usertransfermanage.vue') },
    //         { path: 'usertransferrecord', title: '用户转账记录', name: 'usertransferrecord', icon: 'social-bitcoin-outline', component: () => import('@/views/fundsManage/usertransferrecord/usertransferrecord.vue') },
    //     ]
    // },
    // {
    //     path: '/activityManage',
    //     icon: 'ios-game-controller-b',
    //     name: 'activityManage',
    //     title: '活动管理',
    //     component: Main,
    //     children: [
    //         { path: 'activitylist', title: '活动列表', name: 'activitylist', icon: 'android-list', component: () => import('@/views/activityManage/activityList/activityList.vue') },
    //         { path: 'activitystatistics', title: '活动统计', name: 'activity-statistics', icon: 'podium', component: () => import('@/views/activityManage/activityStatistics/activityStatistics.vue') }
    //     ]
    // },
    // {
    //     path: '/coinsManage',
    //     icon: 'social-bitcoin',
    //     name: 'coinsManage',
    //     title: '币种管理',
    //     component: Main,
    //     children: [
    //         { path: 'icoApply', title: '上币申请', name: 'ico-apply', icon: 'social-euro', component: () => import('@/views/coinsManage/icoApply/icoApply.vue') }
    //     ]
    // },
    // {
    //     path: '/financialManage',
    //     icon: 'card',
    //     name: 'financialManage',
    //     title: '财务管理',
    //     component: Main,
    //     children: [
    //         { path: 'financialReport', title: '财务报表', name: 'financial-report', icon: 'ios-calculator', component: () => import('@/views/financialManage/financialReport/financialReport.vue') },
    //         { path: 'billdetail', title: '账单明细', name: 'billdetail', icon: 'ios-calculator', component: () => import('@/views/financialManage/billDetail/billDetail.vue') }
    //     ]
    // },
    // {
    //     path: '/ctocManage',
    //     icon: 'social-yen',
    //     name: 'ctocManage',
    //     title: 'c2c管理',
    //     component: Main,
    //     children: [
    //         { path: 'verified', title: '实名认证', name: 'verified', icon: 'man', component: () => import('@/views/ctocManage/verified/verified.vue') },
    //         { path: 'appealManage', title: '申诉管理', name: 'appeal-manage', icon: 'speakerphone', component: () => import('@/views/ctocManage/appealManage/appealManage.vue') },
    //         { path: 'orderManage', title: '订单管理', name: 'order-manage', icon: 'ios-book', component: () => import('@/views/ctocManage/orderManage/orderManage.vue') },
    //         { path: 'bitmallManager', title: 'bitmall管理', name: 'bitmall-manager', icon: 'ios-book', component: () => import('@/views/ctocManage/bitmallManager/bitmallManager.vue') }
    //     ]
    // },

    // {
    //     path: '/entrust',
    //     icon: 'person-stalker',
    //     name: 'entrust',
    //     title: '委托管理',
    //     component: Main,
    //     children: [
    //         { path: 'curentrus', title: '当前委托', name: 'curentrus', icon: 'ios-calculator', component: () => import('@/views/entrust/curentrus/curentrus.vue') },
    //         { path: 'inoutentrust', title: '净买入/净卖出', name: 'inoutentrust', icon: 'ios-calculator', component: () => import('@/views/entrust/inoutentrust/inoutentrust.vue') },
    //         { path: 'transentrust', title: '成交记录', name: 'transentrust', icon: 'ios-calculator', component: () => import('@/views/entrust/transentrust/transentrust.vue') }
    //     ]
    // },
    /*{
         path: '/access',
         icon: 'key',
         name: 'access',
         title: '权限管理',
         component: Main,
         children: [
             { path: 'index', title: '权限管理', name: 'access_index', component: () => import('@/views/access/access.vue') }
         ]
     },
     {
         path: '/access-test',
         icon: 'lock-combination',
         title: '权限测试页',
         name: 'accesstest',
         access: 0,
         component: Main,
         children: [
             { path: 'index', title: '权限测试页', name: 'accesstest_index', access: 0, component: () => import('@/views/access/access-test.vue') }
         ]
     },
     {
        path: '/international',
        icon: 'earth',
        title: {i18n: 'international'},
        name: 'international',
        component: Main,
        children: [
            { path: 'index', title: {i18n: 'international'}, name: 'international_index', component: () => import('@/views/international/international.vue') }
        ]
    },
    {
        path: '/component',
        icon: 'social-buffer',
        name: 'component',
        title: '组件',
        component: Main,
        children: [
            {
                path: 'text-editor',
                icon: 'compose',
                name: 'text-editor',
                title: '富文本编辑器',
                component: () => import('@/views/my-components/text-editor/text-editor.vue')
            },
            {
                path: 'md-editor',
                icon: 'pound',
                name: 'md-editor',
                title: 'Markdown编辑器',
                component: () => import('@/views/my-components/markdown-editor/markdown-editor.vue')
            },
            {
                path: 'image-editor',
                icon: 'crop',
                name: 'image-editor',
                title: '图片预览编辑',
                component: () => import('@/views/my-components/image-editor/image-editor.vue')
            },
            {
                path: 'draggable-list',
                icon: 'arrow-move',
                name: 'draggable-list',
                title: '可拖拽列表',
                component: () => import('@/views/my-components/draggable-list/draggable-list.vue')
            },
            {
                path: 'area-linkage',
                icon: 'ios-more',
                name: 'area-linkage',
                title: '城市级联',
                component: () => import('@/views/my-components/area-linkage/area-linkage.vue')
            },
            {
                path: 'file-upload',
                icon: 'android-upload',
                name: 'file-upload',
                title: '文件上传',
                component: () => import('@/views/my-components/file-upload/file-upload.vue')
            },
            {
                path: 'scroll-bar',
                icon: 'android-upload',
                name: 'scroll-bar',
                title: '滚动条',
                component: () => import('@/views/my-components/scroll-bar/scroll-bar-page.vue')
            },
            {
                path: 'count-to',
                icon: 'arrow-graph-up-right',
                name: 'count-to',
                title: '数字渐变',
                // component: () => import('@/views/my-components/count-to/count-to.vue')
                component: () => import('@/views/my-components/count-to/count-to.vue')
            },
            {
                path: 'split-pane-page',
                icon: 'ios-pause',
                name: 'split-pane-page',
                title: 'split-pane',
                component: () => import('@/views/my-components/split-pane/split-pane-page.vue')
            }
        ]
    },
    {
        path: '/form',
        icon: 'android-checkbox',
        name: 'form',
        title: '表单编辑',
        component: Main,
        children: [
            { path: 'artical-publish', title: '文章发布', name: 'artical-publish', icon: 'compose', component: () => import('@/views/form/article-publish/article-publish.vue') },
            { path: 'workflow', title: '工作流', name: 'workflow', icon: 'arrow-swap', component: () => import('@/views/form/work-flow/work-flow.vue') }

        ]
    },
    {
        path: '/tables',
        icon: 'ios-grid-view',
        name: 'tables',
        title: '表格',
        component: Main,
        children: [
            { path: 'dragableTable', title: '可拖拽排序', name: 'dragable-table', icon: 'arrow-move', component: () => import('@/views/tables/dragable-table.vue') },
            { path: 'editableTable', title: '可编辑表格', name: 'editable-table', icon: 'edit', component: () => import('@/views/tables/editable-table.vue') },
            { path: 'searchableTable', title: '可搜索表格', name: 'searchable-table', icon: 'search', component: () => import('@/views/tables/searchable-table.vue') },
            { path: 'exportableTable', title: '表格导出数据', name: 'exportable-table', icon: 'code-download', component: () => import('@/views/tables/exportable-table.vue') },
            { path: 'table2image', title: '表格转图片', name: 'table-to-image', icon: 'images', component: () => import('@/views/tables/table-to-image.vue') }
        ]
    },
    {
        path: '/advanced-router',
        icon: 'ios-infinite',
        name: 'advanced-router',
        title: '高级路由',
        component: Main,
        children: [
            { path: 'mutative-router', title: '动态路由', name: 'mutative-router', icon: 'link', component: () => import('@/views/advanced-router/mutative-router.vue') },
            { path: 'argument-page', title: '带参页面', name: 'argument-page', icon: 'android-send', component: () => import('@/views/advanced-router/argument-page.vue') }
        ]
    },
    {
        path: '/error-page',
        icon: 'android-sad',
        title: '错误页面',
        name: 'errorpage',
        component: Main,
        children: [
            { path: 'index', title: '错误页面', name: 'errorpage_index', component: () => import('@/views/error-page/error-page.vue') }
        ]
    }*/
];

// 所有上面定义的路由都要写在下面的routers里
export const routers = [
    loginRouter,
    otherRouter,
    // preview,
    locking,
    sendbroad,
    ...appRouter,
    page500,
    page403,
    page404
];
