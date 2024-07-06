<template>
    <div v-if="showDetail">
      <h1>{{ articleDetail.title }}</h1>
      <div v-html="articleDetail.content" class="article-content"></div>
      <img :src="articleDetail.coverImg" alt="文章封面图片" class="cover-image"/>
    </div>
  </template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { getArticleDetailService } from '@/api/article';

const route = useRoute(); // 使用 useRoute 函数获取路由信息

const articleDetail = ref(null);
const showDetail = ref(false);

const fetchArticleDetail = async () => {
  const articleId = route.params.id; // 从路由参数中获取文章ID
  try {
    const response = await getArticleDetailService(articleId);
    if (response.code === 0) {
      articleDetail.value = {
        title: response.data.title,
        content: response.data.content,
        coverImg: response.data.coverImg
      };
      showDetail.value = true;
    } else {
      // 处理错误情况
    }
  } catch (error) {
    // 处理异常情况
  }
};

// 在组件创建时调用获取文章详细内容的方法
onMounted(() => {
  fetchArticleDetail();
});
</script>

<style>
.article-content {
  line-height: 1.6;
  font-size: 1.1em;
  margin-top: 20px;
}

.cover-image {
  max-width: 15%;
  height: auto;
  margin-top: 20px;
}
</style>