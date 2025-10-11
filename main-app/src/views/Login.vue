<template>
  <div class="login-container">
    <!-- 动态粒子网络背景 -->
    <ParticleNetwork />

    <!-- 登录内容层 -->
    <div class="login-box">
      <div class="login-header">
        <h1>K8s Agent 管理平台</h1>
        <p>Kubernetes Agent 监控与管理系统</p>
      </div>

      <a-form
        :model="formState"
        :rules="rules"
        class="login-form"
        @finish="handleLogin"
      >
        <a-form-item name="username">
          <a-input
            v-model:value="formState.username"
            size="large"
            placeholder="用户名"
            autocomplete="username"
          >
            <template #prefix>
              <UserOutlined />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item name="password">
          <a-input-password
            v-model:value="formState.password"
            size="large"
            placeholder="密码"
            autocomplete="current-password"
          >
            <template #prefix>
              <LockOutlined />
            </template>
          </a-input-password>
        </a-form-item>

        <a-form-item>
          <a-checkbox v-model:checked="formState.remember">
            记住我
          </a-checkbox>
        </a-form-item>

        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            size="large"
            block
            :loading="loading"
          >
            登录
          </a-button>
        </a-form-item>
      </a-form>

      <div class="login-footer">
        <p>默认账号: admin / admin123</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'
import { useUserStore } from '@/store/user'
import ParticleNetwork from '@/components/ParticleNetwork.vue'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)

const formState = reactive({
  username: '',
  password: '',
  remember: false
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  loading.value = true
  try {
    await userStore.login(formState.username, formState.password)
    message.success('登录成功')
    router.push('/')
  } catch (error) {
    message.error(error.response?.data?.error || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.login-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 1rem;
}

.login-box {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 420px;
  padding: 3rem 2.5rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 8px;
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.2),
    0 0 50px rgba(0, 0, 0, 0.1);
  animation: cardFloat 6s ease-in-out infinite alternate;
}

@keyframes cardFloat {
  0% {
    transform: translateY(0px);
    box-shadow:
      0 10px 30px rgba(0, 0, 0, 0.2),
      0 0 50px rgba(0, 0, 0, 0.1);
  }
  100% {
    transform: translateY(-8px);
    box-shadow:
      0 15px 40px rgba(0, 0, 0, 0.25),
      0 0 60px rgba(0, 0, 0, 0.15);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 2.5rem;

  h1 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 400;
    color: #4a5568;
    letter-spacing: 0.05em;
  }

  p {
    margin: 0.75rem 0 0;
    font-size: 0.875rem;
    color: #64748b;
    font-weight: 500;
  }
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  :deep(.ant-form-item) {
    margin-bottom: 0;
  }

  :deep(.ant-input-affix-wrapper),
  :deep(.ant-input-password) {
    background: rgba(247, 250, 252, 0.8);
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    transition: all 0.3s ease;
    padding: 0.75rem 1rem;

    &:hover {
      border-color: #1890ff;
      background: rgba(255, 255, 255, 0.95);
    }

    &:focus,
    &:focus-within {
      border-color: #1890ff;
      box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.15);
      background: rgba(255, 255, 255, 0.95);
    }

    input {
      background: transparent;
    }
  }

  :deep(.ant-input-prefix) {
    color: #a0aec0;
    font-size: 1.1rem;
    margin-right: 0.75rem;
  }

  :deep(.ant-input-suffix) {
    color: #a0aec0;
  }

  :deep(.ant-btn-primary) {
    width: 100%;
    height: 44px;
    padding: 1rem;
    background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    font-weight: 500;
    letter-spacing: 0.025em;
    transition: all 0.3s ease;

    &:hover:not(:disabled) {
      background: linear-gradient(135deg, #40a9ff 0%, #1890ff 100%);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(24, 144, 255, 0.5);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
    }

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      transform: none;
    }
  }

  :deep(.ant-checkbox-wrapper) {
    color: #64748b;
    font-size: 0.875rem;

    .ant-checkbox-checked .ant-checkbox-inner {
      background-color: #1890ff;
      border-color: #1890ff;
    }

    .ant-checkbox-inner {
      border-color: #d9d9d9;

      &:hover {
        border-color: #1890ff;
      }
    }
  }
}

.login-footer {
  text-align: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;

  p {
    margin: 0;
    color: #94a3b8;
    font-size: 0.8125rem;
    font-weight: 500;
  }
}

/* 响应式设计 */
@media (max-width: 480px) {
  .login-box {
    padding: 2rem 1.5rem;
    margin: 1rem;
    border-radius: 6px;
    animation: none;
    transform: none !important;
  }

  .login-header h1 {
    font-size: 1.25rem;
  }

  .login-form {
    gap: 1.25rem;
  }
}

/* 悬停效果优化 */
@media (hover: hover) {
  .login-box:hover {
    animation-play-state: paused;
    transform: translateY(-12px) !important;
  }
}
</style>
