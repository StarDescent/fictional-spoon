<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus';
import { resetPasswordService } from '@/api/user.js';
import { useTokenStore } from '@/stores/token.js'
const tokenStore = useTokenStore();

const userInfo = ref({
    old_pwd: '',
    new_pwd: '',
    re_pwd: ''
});
const rules = {
    old_pwd: [
        { required: true, message: '请输入旧密码', trigger: 'blur' }
    ],
    new_pwd: [
        { required: true, message: '请输入新密码', trigger: 'blur' },
        { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
    ],
    re_pwd: [
        { required: true, message: '请再次输入新密码', trigger: 'blur' },
        {
            validator: (rule, value, callback) => {
                if (value !== userInfo.value.new_pwd) {
                    callback(new Error('两次输入密码不一致'));
                } else {
                    callback();
                }
            },
            trigger: 'blur'
        }
    ]
}

const resetPassword = async () => {
    if (userInfo.value.new_pwd !== userInfo.value.re_pwd) {
        ElMessage.error('两次输入密码不一致');
    } else {
        try {
            let result = await resetPasswordService(userInfo.value.old_pwd, userInfo.value.new_pwd, userInfo.value.re_pwd);
            ElMessage.success(result.msg ? result.msg : '密码重置成功');
        } catch (error) {
            ElMessage.error('密码重置失败');
        }
    }
}
</script>

<template>
    <el-card class="page-container">
        <template #header>
            <div class="header">
                <span>重置密码</span>
            </div>
        </template>
        <el-row>
            <el-col :span="12">
                <el-form :model="userInfo" :rules="rules" label-width="100px" size="large">
                    <el-form-item label="旧密码" prop="old_pwd">
                        <el-input type="password" v-model="userInfo.old_pwd"></el-input>
                    </el-form-item>
                    <el-form-item label="新密码" prop="new_pwd">
                        <el-input type="password" v-model="userInfo.new_pwd"></el-input>
                    </el-form-item>
                    <el-form-item label="确认密码" prop="re_pwd">
                        <el-input type="password" v-model="userInfo.re_pwd"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="resetPassword">重置密码</el-button>
                    </el-form-item>
                </el-form>
            </el-col>
        </el-row>
    </el-card>
</template>