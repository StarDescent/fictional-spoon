import request from '@/utils/request.js'
//import { useTokenStore } from '@/stores/token'
//import { id } from 'element-plus/es/locale'

//文章分类列表查询
export const articleCategoryListService = () => {
  // const tokenStore = useTokenStore();
  // return request.get('/category', {headers:{'Authorization':tokenStore.token}})
  return request.get('/category')
}

//文章分类添加接口
export const articleCategoryAddService = (categoryData) => {
  return request.post('/category', categoryData)
}

//文章分类修改
export const articleCategoryUpdateService = (categoryData) => {
  return request.put('/category', categoryData)
}

//文章分类删除
export const articleCategoryDeleteService = (id) => {
  return request.delete('/category?id=' + id)
}

//文章列表查询
export const articleListService = (params) => {
  return request.get('/article', { params: params })
}

//文章添加
export const articleAddService = (articleData) => {
  return request.post('/article', articleData);
}

// 定义获取文章详情的后端接口函数
export const getArticleDetailService = async (articleId) => {
  try {
    const response = await request.get(`/article/${articleId}`);
    return {
      code: 0,
      message: "操作成功",
      data: {
        id: response.data.id,
        title: response.data.title,
        content: response.data.content,
        coverImg: response.data.coverImg,
        state: response.data.state,
        categoryId: response.data.categoryId,
        createUser: response.data.createUser,
        createTime: response.data.createTime,
        updateTime: response.data.updateTime
      }
    };
  } catch (error) {
    // 处理异常情况
    return {
      code: -1,
      message: "操作失败",
      data: null
    };
  }
};

export const articleEditService = async (id, updatedArticleData) => {
  return request.put(`/article/${id}`, updatedArticleData);
};

// 调用后端删除文章接口的函数
export const deleteArticleService = (id) => {
  return request.delete(`/article/${id}`);
}