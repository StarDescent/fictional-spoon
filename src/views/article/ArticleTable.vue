<script setup>
import {
deleteTableService,
tableListService,
updateTableService,
uploadTableService,
} from '@/api/table';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ref } from 'vue';

// 表格数据和对话框状态
const articles = ref([]);
const dialogVisible = ref(false);
const editDialogVisible = ref(false); // 编辑对话框的可见性状态
const openPredictDialog = ref(false);
const tableName = ref(''); // 上传或编辑文件的名称
let fileToUpload = ref(null); // 待上传或更新的文件
const editingArticle = ref({}); // 当前正在编辑的文章对象

// 初始化获取表格数据
const articleTableList = async () => {
  try {
    const result = await tableListService();
    if (result && result.data) {
      articles.value = result.data;
    }
  } catch (error) {
    console.error('加载表格数据失败:', error);
    ElMessage.error('加载数据失败');
  }
};

// 立即调用，初始化数据
articleTableList();

// 处理文件选择操作
const handleFileChange = (event) => {
  fileToUpload.value = event.target.files[0];
};

// 上传文件
const uploadFile = async () => {
  if (!fileToUpload.value || !tableName.value) {
    ElMessage.error('请填写完整信息并选择一个文件');
    return;
  }

  const formData = new FormData();
  formData.append('file', fileToUpload.value);
  formData.append('title', tableName.value);

  try {
    await uploadTableService(formData);
    ElMessage.success('文件上传成功');
    dialogVisible.value = false; // 关闭对话框
    articleTableList(); // 刷新列表
    // 重置表单
    fileToUpload.value = null;
    tableName.value = '';
  } catch (error) {
    console.error('文件上传失败', error);
    ElMessage.error('文件上传失败');
  }
};

// 删除文件
const deleteFile = async (id) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这个文件吗？',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    
    await deleteTableService(id);
    ElMessage.success('删除成功');
    articleTableList(); // 刷新列表
  } catch (error) {
    if (error !== 'cancel') {
      console.error('文件删除失败', error);
      ElMessage.error('删除失败');
    }
  }
};

// 准备更新文章
const handleEdit = (article) => {
  editingArticle.value = {...article};
  tableName.value = article.title;
  editDialogVisible.value = true;
};

// 更新文章
const updateArticle = async () => {
  if (!editingArticle.value.id || !tableName.value) {
    ElMessage.error('请填写完整信息');
    return;
  }

  const formData = new FormData();
  if (fileToUpload.value) {
    formData.append('file', fileToUpload.value);
  }
  formData.append('title', tableName.value);

  try {
    await updateTableService(editingArticle.value.id, formData);
    ElMessage.success('表格更新成功');
    editDialogVisible.value = false; // 关闭对话框
    articleTableList(); // 刷新列表
    // 重置表单
    fileToUpload.value = null;
    tableName.value = '';
    editingArticle.value = {};
  } catch (error) {
    console.error('表格更新失败', error);
    ElMessage.error('表格更新失败');
  }
};

const predictTab = () => {
  openPredictDialog.value=true;
}

// 对话框关闭前的处理逻辑
const beforeClose = () => {
  dialogVisible.value = false;
  editDialogVisible.value = false;
  openPredictDialog.value = false;
  fileToUpload.value = null; // 清理待上传文件
  tableName.value = ''; // 重置输入
  editingArticle.value = {}; // 重置编辑对象
};
</script>

<template>
  <el-container>
    <!-- 头部区域，包含上传文件按钮 -->
    <el-header style="text-align: left; padding: 20px;">
      <el-button type="primary" @click="dialogVisible = true">上传文件</el-button>
    </el-header>

    <!-- 主内容区域，展示文件列表 -->
    <el-main>
      <el-card class="box-card">
        <el-table :data="articles" stripe style="width: 100%">
          <el-table-column prop="title" label="标题"></el-table-column>
          <el-table-column prop="tableFileUrl" label="文件">
            <template #default="{ row }">
              <a :href="row.tableFileUrl" target="_blank">{{ row.tableFileUrl.split('/').pop() }}</a>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template #default="{ row }">
              <el-button @click="handleEdit(row)" type="primary" size="small">编辑</el-button>
              <el-button @click="deleteFile(row.id)" type="danger" size="small">删除</el-button>
              <el-button @click="predictTab()" type="info" size="small">预测</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </el-main>

    <!-- 上传文件抽屉，从右侧弹出 -->
    <el-drawer v-model="dialogVisible" title="上传文件" direction="rtl" size="30%" :before-close="beforeClose">
      <el-form>
        <el-form-item label="表格名称">
          <el-input v-model="tableName" placeholder="请输入表格名称"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="() => $refs.fileInput.click()">选择文件</el-button>
          <input type="file" @change="handleFileChange" ref="fileInput" class="file-input" hidden>
        </el-form-item>
        <el-form-item>
          <el-button type="success" @click="uploadFile">确认上传</el-button>
          <el-button type="info" @click="beforeClose">取消</el-button>
        </el-form-item>
      </el-form>
    </el-drawer>

    <!-- 编辑文件抽屉，逻辑与上传类似 -->
    <el-drawer
      v-model="editDialogVisible"
      title="编辑文件"
      direction="rtl"
      size="30%"
      :before-close="beforeClose"
    >
      <el-form>
        <el-form-item label="表格名称">
          <el-input v-model="tableName" placeholder="请输入新的表格名称"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="() => $refs.editFileInput.click()">选择文件</el-button>
          <input type="file" @change="handleFileChange" ref="editFileInput" class="file-input" hidden>
        </el-form-item>
        <el-form-item>
          <el-button type="success" @click="updateArticle">确认更新</el-button>
          <el-button type="info" @click="beforeClose">取消</el-button>
        </el-form-item>
      </el-form>
    </el-drawer>

    <!-- 预测算法选择抽屉 -->
    <el-drawer v-model="openPredictDialog" title="选择预测算法" direction="rtl" size="30%" :before-close="beforeClose">
      <el-form>
        <el-form-item label="选择算法">
          <el-select v-model="selectedAlgorithm" placeholder="请选择">
            <el-option label="决策树回归（DTR）" value="DTR"></el-option>
            <el-option label="线性回归（LR）" value="LR"></el-option>
            <el-option label="随机森林回归（RFR）" value="RFR"></el-option>
            <el-option label="AdaBoost回归（ABR）" value="ABR"></el-option>
            <el-option label="Bagging回归（BR）" value="BR"></el-option>
            <el-option label="极端随机树回归（ETR）" value="ETR"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="success" @click="predict">开始预测</el-button>
          <el-button type="info" @click="beforeClose">取消</el-button>
        </el-form-item>
      </el-form>
    </el-drawer>
  </el-container>
</template>

<style scoped>
.file-input {
  display: none;
}
</style>
