<script setup>
import {
Delete,
Edit
} from '@element-plus/icons-vue';
import { ref } from 'vue';
//文章分类数据模型
const categorys = ref([
    {
        "id": 3,
        "categoryName": "美食",
        "categoryAlias": "my",
        "createTime": "2023-09-02 12:06:59",
        "updateTime": "2023-09-02 12:06:59"
    },
])

//用户搜索时选中的分类id
const categoryId = ref('')

//用户搜索时选中的发布状态
const state = ref('')

//文章列表数据模型
const articles = ref([
    {
        "id": 5,
        "title": "陕西旅游攻略",
        "content": "兵马俑,华清池,法门寺,华山...爱去哪去哪...",
        "coverImg": "https://big-event-gwd.oss-cn-beijing.aliyuncs.com/9bf1cf5b-1420-4c1b-91ad-e0f4631cbed4.png",
        "state": "草稿",
        "categoryId": 2,
        "createTime": "2023-09-03 11:55:30",
        "updateTime": "2023-09-03 11:55:30"
    },
])
//分页条数据模型
const pageNum = ref(1)//当前页
const total = ref(20)//总条数
const pageSize = ref(3)//每页条数

// 添加此函数以从本地存储中存储和检索当前页码和每页条数
const setPageDataFromLocalStorage = () => {
    const storedPageNum = localStorage.getItem('currentPage');
    const storedPageSize = localStorage.getItem('pageSize');
    if (storedPageNum) {
        pageNum.value = parseInt(storedPageNum);
    }
    if (storedPageSize) {
        pageSize.value = parseInt(storedPageSize);
    }
}
// 在组件加载时调用函数以检索页码
// 在组件加载时调用函数以检索页码和每页条数
setPageDataFromLocalStorage();
//当每页条数发生了变化，调用此函数
const onSizeChange = (size) => {
    pageSize.value = size;
    localStorage.setItem('pageSize', size); // 将每页条数存储在本地存储中
    articleList();
}

const onCurrentChange = (num) => {
    pageNum.value = num;
    localStorage.setItem('currentPage', num); // 将当前页码存储在本地存储中
    articleList();
}


//回显文章分类
import { articleAddService, articleCategoryListService, articleEditService, articleListService, deleteArticleService, getArticleDetailService } from '@/api/article';
const articleCategoryList = async () => {
    let result = await articleCategoryListService();

    categorys.value = result.data;
}

//获取文章列表数据
const articleList = async () => {
    let params = {
        pageNum: pageNum.value,
        pageSize: pageSize.value,
        categoryId: categoryId.value ? categoryId.value : null,
        state: state.value ? state.value : null
    }
    let result = await articleListService(params);

    //渲染视图
    total.value = result.data.total;
    articles.value = result.data.items;

    //处理数据，给数据模型扩展一个属性
    for (let i = 0; i < articles.value.length; i++) {
        let article = articles.value[i];
        for (let j = 0; j < categorys.value.length; j++) {
            if (article.categoryId == categorys.value[j].id) {
                article.categoryName = categorys.value[j].categoryName;
            }
        }
    }
}

articleCategoryList()
articleList();

import { Plus } from '@element-plus/icons-vue';
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';
//控制抽屉是否显示
const visibleDrawer = ref(false)
//添加表单数据类型
const articleModel = ref({
    title: '',
    categoryId: '',
    coverImg: '',
    content: '',
    state: ''
})

//导入token
import { useTokenStore } from '@/stores/token';
import { ElMessage, ElMessageBox } from 'element-plus';
const tokenStore = useTokenStore();

//上传成功的回调函数
const uploadSuccess = (result) => {
    articleModel.value.coverImg = result.data;
    console.log(result.data);
}

//添加文章
const addArticle = async (clickState) => {
    //把发布状态赋值给数据模型
    articleModel.value.state = clickState;

    //调用接口
    let result = await articleAddService(articleModel.value);

    ElMessage.success(result.msg ? result.msg : '添加成功')

    //让抽屉消失
    visibleDrawer.value = false;

    //刷新
    articleList(pageNum.value);
}

// 在组件中创建一个响应式对象
const articleDetail = ref(null);
const Vdrawer = ref(false)
// 添加编辑文章的方法
const editArticle = async (id) => {
    try {
        //存储当前页码
        const currentPage = pageNum.value;

        // 获取文章详情
        let articleDetailResponse = await getArticleDetailService(id); // 通过接口获取文章详情，此处需要根据实际情况调用接口

        // 检查是否成功获取文章详情
        if (articleDetailResponse && articleDetailResponse.data) {
            // 填充编辑表单
            articleModel.value.title = articleDetailResponse.data.title;
            articleModel.value.categoryId = articleDetailResponse.data.categoryId;
            articleModel.value.coverImg = articleDetailResponse.data.coverImg;
            articleModel.value.content = articleDetailResponse.data.content;
            articleModel.value.state = articleDetailResponse.data.state; // 设置发布状态

            // 设置 articleDetail
            articleDetail.value = articleDetailResponse.data;

            // 显示抽屉
            Vdrawer.value = true;

            articleDetail.value.currentPage = currentPage;
        } else {
            console.error('未能成功获取文章详情');
            ElMessage.error('未能成功获取文章详情');
        }
    } catch (error) {
        console.error('Error fetching article detail:', error);
        ElMessage.error('获取文章详情时出错');
    }
}

// 编辑文章的提交方法
const submitEditedArticle = async () => {
    try {
        if (articleDetail.value) {
            // 更新文章状态
            articleDetail.value.state = articleModel.value.state;
            const result = await articleEditService(articleDetail.value.id, articleModel.value); // 调用编辑文章的接口
            ElMessage.success(result.msg ? result.msg : '编辑成功');

            // 关闭抽屉
            visibleDrawer.value = false;

            // 刷新文章列表
            articleList(articleDetail.value.currentPage);
        } else {
            console.error('文章详情为空');
            ElMessage.error('文章详情为空');
        }
    } catch (error) {
        console.error('Error editing article:', error);
        ElMessage.error('编辑文章失败');
        console.log(error); // 输出 error 对象以便查看具体内容
    }
}


// 调用后端删除文章接口的函数
const deleteArticle = async (id) => {
    try {
        ElMessageBox.confirm('确定要删除吗？', '提示', {
            type: 'warning'
        }).then(async () => {
            const response = await deleteArticleService(id);
            // 处理删除成功的情况
            console.log('文章删除成功');
            ElMessage.success('删除成功');
            // 在成功删除文章后，刷新文章列表或进行其他操作
            articleList(pageNum.value);
        }).catch(() => {
            console.log('取消删除');
            ElMessage.success('删除取消');
        });
    } catch (error) {
        // 处理删除失败的情况
        console.error('文章删除失败', error);
        ElMessage.error('删除失败');
        // 在删除失败时，进行错误处理或其他操作
    }
}
</script>

<template>
    <el-card class="page-container">
        <template #header>
            <div class="header">
                <span>产品管理</span>
                <div class="extra">
                    <el-button type="primary" @click="visibleDrawer = true">添加产品</el-button>
                </div>
            </div>
        </template>
        <!-- 搜索表单 -->
        <el-form inline>
            <el-form-item label="产品大类：">
                <el-select placeholder="请选择" v-model="categoryId" style="width: 200px;">
                    <el-option v-for="c in categorys" :key="c.id" :label="c.categoryName" :value="c.id">
                    </el-option>
                </el-select>
            </el-form-item>

            <el-form-item label="发布状态：">
                <el-select placeholder="请选择" v-model="state" style="width: 200px;">
                    <el-option label="已发布" value="已发布"></el-option>
                    <el-option label="草稿" value="草稿"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="articleList">搜索</el-button>
                <!--<el-button @click="categoryId = ''; state = ''">重置</el-button>-->
            </el-form-item>
        </el-form>
        <!-- 文章列表 -->
        <el-table :data="articles" style="width: 100%">
            <el-table-column label="产品名称" width="400">
                <template #default="{ row }">
                    <router-link :to="{ name: 'ArticleDetail', params: { id: row.id } }">
                        {{ row.title }}
                    </router-link>
                </template>
            </el-table-column>
            <el-table-column label="分类" prop="categoryName"></el-table-column>
            <el-table-column label="发表时间" prop="createTime"> </el-table-column>
            <el-table-column label="状态" prop="state"></el-table-column>
            <el-table-column label="操作" width="100">
                <template #default="{ row }">
                    <el-button :icon="Edit" circle plain type="primary" @click="editArticle(row.id)"></el-button>
                    <el-button :icon="Delete" circle plain type="danger" @click="deleteArticle(row.id)">
                    </el-button>
                </template>
            </el-table-column>
            <template #empty>
                <el-empty description="没有数据" />
            </template>
        </el-table>
        <!--<div v-if="showDetail">
            <h3>{{ articleDetail.title }}</h3>
            <p>{{ articleDetail.content }}</p>
            <img :src="articleDetail.coverImg" alt="Article Cover Image" />
        </div>-->
        <!-- 分页条 -->
        <el-pagination v-model:current-page="pageNum" v-model:page-size="pageSize" :page-sizes="[3, 5, 10, 15]"
            layout="jumper, total, sizes, prev, pager, next" background :total="total" @size-change="onSizeChange"
            @current-change="onCurrentChange" style="margin-top: 20px; justify-content: flex-end" />

        <!-- 抽屉 -->
        <el-drawer v-model="visibleDrawer" title="添加文章" direction="rtl" size="50%">
            <!-- 添加文章表单 -->
            <el-form :model="articleModel" label-width="100px">
                <el-form-item label="文章标题">
                    <el-input v-model="articleModel.title" placeholder="请输入标题"></el-input>
                </el-form-item>
                <el-form-item label="文章分类">
                    <el-select placeholder="请选择" v-model="articleModel.categoryId">
                        <el-option v-for="c in categorys" :key="c.id" :label="c.categoryName" :value="c.id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="文章封面">
                    <el-upload class="avatar-uploader" :auto-upload="true" :show-file-list="false" action="/api/upload"
                        name="file" :headers="{ 'Authorization': tokenStore.token }" :on-success="uploadSuccess">
                        <img v-if="articleModel.coverImg" :src="articleModel.coverImg" class="avatar" />
                        <el-icon v-else class="avatar-uploader-icon">
                            <Plus />
                        </el-icon>
                    </el-upload>
                </el-form-item>
                <el-form-item label="文章内容">
                    <div class="editor">
                        <quill-editor theme="snow" v-model:content="articleModel.content" contentType="html">
                        </quill-editor>
                    </div>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="addArticle('已发布')">发布</el-button>
                    <el-button type="info" @click="addArticle('草稿')">草稿</el-button>
                </el-form-item>
            </el-form>
        </el-drawer>
        <!-- 抽屉 -->
        <el-drawer v-model="Vdrawer" title="编辑文章" direction="rtl" size="50%">
            <!-- 编辑文章表单 -->
            <el-form :model="articleModel" label-width="100px">
                <el-form-item label="文章标题">
                    <el-input v-model="articleModel.title" placeholder="请输入标题"></el-input>
                </el-form-item>
                <el-form-item label="文章分类">
                    <el-select placeholder="请选择" v-model="articleModel.categoryId">
                        <el-option v-for="c in categorys" :key="c.id" :label="c.categoryName" :value="c.id"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="文章封面">
                    <el-upload class="avatar-uploader" :auto-upload="true" :show-file-list="false" action="/api/upload"
                        name="file" :headers="{ 'Authorization': tokenStore.token }" :on-success="uploadSuccess">
                        <img v-if="articleModel.coverImg" :src="articleModel.coverImg" class="avatar" />
                        <el-icon v-else class="avatar-uploader-icon">
                            <Plus />
                        </el-icon>
                    </el-upload>
                </el-form-item>
                <el-form-item label="文章内容">
                    <div class="editor">
                        <quill-editor theme="snow" v-model:content="articleModel.content" contentType="html"></quill-editor>
                    </div>
                </el-form-item>
                <el-form-item label="发布状态">
                    <el-select v-model="articleModel.state" placeholder="请选择">
                        <el-option label="已发布" value="已发布"></el-option>
                        <el-option label="草稿" value="草稿"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="submitEditedArticle">保存</el-button>
                </el-form-item>
            </el-form>
        </el-drawer>
    </el-card>
</template>
<style lang="scss" scoped>
.page-container {
    min-height: 100%;
    box-sizing: border-box;

    .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
}

/* 抽屉样式 */
.avatar-uploader {
    :deep() {
        .avatar {
            width: 178px;
            height: 178px;
            display: block;
        }

        .el-upload {
            border: 1px dashed var(--el-border-color);
            border-radius: 6px;
            cursor: pointer;
            position: relative;
            overflow: hidden;
            transition: var(--el-transition-duration-fast);
        }

        .el-upload:hover {
            border-color: var(--el-color-primary);
        }

        .el-icon.avatar-uploader-icon {
            font-size: 28px;
            color: #8c939d;
            width: 178px;
            height: 178px;
            text-align: center;
        }
    }
}

.editor {
    width: 100%;

    :deep(.ql-editor) {
        min-height: 200px;
    }
}
</style>