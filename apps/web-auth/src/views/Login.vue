<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h1>🔐 统一认证中心</h1>
        <p>Unified Authentication Center</p>
      </div>

      <a-form
        :model="formState"
        :rules="rules"
        @finish="handleLogin"
        layout="vertical"
        class="login-form"
      >
        <!-- 选择账户 -->
        <a-form-item label="选择账户" name="selectAccount">
          <a-select
            v-model:value="formState.selectAccount"
            placeholder="请选择账户"
            @change="handleAccountChange"
          >
            <a-select-option value="vben">Super - vben</a-select-option>
            <a-select-option value="admin">Admin - admin</a-select-option>
            <a-select-option value="jack">User - jack</a-select-option>
          </a-select>
        </a-form-item>

        <!-- 用户名 -->
        <a-form-item label="用户名" name="username">
          <a-input
            v-model:value="formState.username"
            placeholder="请输入用户名"
            size="large"
          >
            <template #prefix>
              <UserOutlined />
            </template>
          </a-input>
        </a-form-item>

        <!-- 密码 -->
        <a-form-item label="密码" name="password">
          <a-input-password
            v-model:value="formState.password"
            placeholder="请输入密码"
            size="large"
          >
            <template #prefix>
              <LockOutlined />
            </template>
          </a-input-password>
        </a-form-item>

        <!-- 验证码 -->
        <a-form-item name="captcha">
          <div class="captcha-slider">
            <a-slider
              v-model:value="formState.captcha"
              :min="0"
              :max="100"
              @after-change="handleCaptchaChange"
            />
            <span class="captcha-text">
              {{ formState.captcha < 100 ? '拖动滑块验证' : '验证成功 ✓' }}
            </span>
          </div>
        </a-form-item>

        <!-- 登录按钮 -->
        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            size="large"
            :loading="loading"
            block
          >
            登录
          </a-button>
        </a-form-item>
      </a-form>

      <div class="login-footer">
        <p>登录后将跳转回原应用</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import { message } from 'ant-design-vue';
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue';
import { loginApi, getUserInfoApi } from '../api/auth';
import { setToken, setUserInfo } from '../utils/storage';

const route = useRoute();
const loading = ref(false);

const formState = reactive({
  selectAccount: 'vben',
  username: 'vben',
  password: '123456',
  captcha: 0,
});

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  captcha: [
    {
      validator: (_: any, value: number) => {
        if (value < 100) {
          return Promise.reject('请完成滑块验证');
        }
        return Promise.resolve();
      },
      trigger: 'change',
    },
  ],
};

// 账户切换
function handleAccountChange(value: string) {
  formState.username = value;
  formState.password = '123456';
}

// 验证码变化
function handleCaptchaChange(value: number) {
  if (value === 100) {
    message.success('验证成功');
  }
}

// 登录处理
async function handleLogin() {
  loading.value = true;

  try {
    // 调用登录 API
    const { accessToken } = await loginApi({
      username: formState.username,
      password: formState.password,
    });

    if (accessToken) {
      // 存储 Token
      setToken(accessToken);

      // 获取用户信息
      const userInfo = await getUserInfoApi();
      setUserInfo(userInfo);

      message.success(`登录成功！欢迎 ${userInfo.realName || userInfo.username}`);

      // 获取重定向 URL
      const redirectUrl = route.query.redirect as string;

      // 延迟跳转，让用户看到成功消息
      setTimeout(() => {
        if (redirectUrl) {
          // 带 Token 跳转回原应用
          const separator = redirectUrl.includes('?') ? '&' : '?';
          window.location.href = `${redirectUrl}${separator}token=${accessToken}`;
        } else {
          // 默认跳转到主应用
          const mainAppUrl = import.meta.env.VITE_MAIN_APP_URL || 'http://localhost:5666';
          window.location.href = `${mainAppUrl}?token=${accessToken}`;
        }
      }, 500);
    }
  } catch (error: any) {
    message.error(error.message || '登录失败，请检查用户名和密码');
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-box {
  width: 100%;
  max-width: 450px;
  padding: 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-header h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  color: #333;
}

.login-header p {
  margin: 0;
  color: #999;
  font-size: 14px;
}

.login-form {
  margin-top: 24px;
}

.captcha-slider {
  position: relative;
}

.captcha-text {
  display: block;
  text-align: center;
  margin-top: 8px;
  font-size: 14px;
  color: #666;
}

.login-footer {
  margin-top: 24px;
  text-align: center;
}

.login-footer p {
  margin: 0;
  font-size: 14px;
  color: #999;
}
</style>
