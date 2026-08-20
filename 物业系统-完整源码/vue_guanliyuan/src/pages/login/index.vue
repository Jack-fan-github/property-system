<template>
  <div class="bg">
    <div
      style="
        width: 350px;
        background-color: #fff;
        border-radius: 5px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        padding: 40px 20px;
      "
    >
      <el-form ref="formRef" :model="data.form" :rules="data.rules">
        <div
          style="
            margin-bottom: 40px;
            text-align: center;
            font-weight: bold;
            font-size: 24px;
          "
        >
          智慧社区登录
        </div>
        <el-form-item prop="username">
          <el-input
            size="large"
            v-model="data.form.username"
            autocomplete="off"
            prefix-icon="User"
            placeholder="请输入账号"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            size="large"
            show-password
            v-model="data.form.password"
            autocomplete="off"
            prefix-icon="Lock"
            placeholder="请输入密码"
          />
        </el-form-item>
        <div style="margin-bottom: 20px">
          <el-button
            style="width: 100%"
            size="large"
            type="primary"
            @click="login"
            :loading="loginLoading"
            >登录</el-button
          >
        </div>
        <div style="text-align: right; color: #6b7280; font-size: 12px">
          仅限管理员账号登录
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import request from "@/api/request.js";
import { ElMessage } from "element-plus";
import router from "@/router/index.js";

const formRef = ref();
const loginLoading = ref(false);

const data = reactive({
  form: {
  },
  rules: {
    username: [
      { required: true, message: "请输入账号", trigger: "blur" },
      { min: 3, message: "账号最少 3 位", trigger: "blur" },
    ],
    password: [{ required: true, message: "请输入密码", trigger: "blur" }],
  },
});

const login = () => {
  localStorage.removeItem("code_user");
  formRef.value.validate((valid) => {
    if (valid) {
      loginLoading.value = true;
      
      // 先取出表单里的角色，拼接接口
      request.post("/LoginRegister/adminlogin", data.form).then((res) => {
        if (res.code == "200") {
          localStorage.setItem("code_user", JSON.stringify(res.data || {}));
          ElMessage.success("登录成功");

          const userRole = res.data.role; // 例如 ADMIN / USER / OPERATOR
          if (userRole === "ADMIN" || userRole === "SUPER_ADMIN" || userRole === "OPERATOR") {
            router.push("/dashboard");
          } else {
            ElMessage.error("无权限访问管理员后台");
            localStorage.removeItem("code_user");
          }
        } else {
          ElMessage.error(res.msg || "登录失败，请检查账号密码");
        }
      }).catch((err) => {
        console.error("登录请求失败:", err);
        ElMessage.error(err.response?.data?.msg || "登录失败，请稍后重试");
      }).finally(() => {
        loginLoading.value = false;
      });
    }
  });
};

</script>

<style scoped>
.bg {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  background-image: url("@/assets/imgs/bg.jpg");
  background-size: cover;
}
</style>
