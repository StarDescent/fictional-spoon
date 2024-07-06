import { createRouter, createWebHistory } from 'vue-router'

//导入组件
import LayoutVue from '@/views/Layout.vue'
import LoginVue from '@/views/Login.vue'

import ArticleCategoryVue from '@/views/article/ArticleCategory.vue'
import ArticleDetailVue from '@/views/article/ArticleDetail.vue'
import ArticleManageVue from '@/views/article/ArticleManage.vue'
import ArticleTableVue from '@/views/article/ArticleTable.vue'
import UserAvatarVue from '@/views/user/UserAvatar.vue'
import UserInfoVue from '@/views/user/UserInfo.vue'
import UserResetPasswordVue from '@/views/user/UserResetPassword.vue'

//定义路由关系
const routes = [
    { path: '/login', component: LoginVue },
    {
        path: '/', component: LayoutVue, redirect: '/article/manage', children: [
            { path: '/article/category', component: ArticleCategoryVue },
            { path: '/article/manage', component: ArticleManageVue },
            { path: '/article/table', component: ArticleTableVue },
            { path: '/user/info', component: UserInfoVue },
            { path: '/user/avatar', component: UserAvatarVue },
            { path: '/user/resetPassword', component: UserResetPasswordVue },
            {
                path: '/article/:id',
                name: 'ArticleDetail',
                component: ArticleDetailVue
            }
        ]
    }
]

//创建路由器
const router = createRouter({
    history: createWebHistory(),
    routes: routes
})

//导出路由
export default router
