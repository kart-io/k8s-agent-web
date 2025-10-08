/**
 * Image Build App Mock 数据服务
 */

// 模拟延迟
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms))

// 生成随机镜像构建数据
const generateImageBuilds = (count) => {
  const statuses = ['pending', 'building', 'success', 'failed']
  const repositories = [
    'docker.io/myapp',
    'docker.io/webapp',
    'docker.io/api-service',
    'gcr.io/project/service',
    'registry.example.com/app',
    'harbor.io/prod/backend',
    'quay.io/org/frontend'
  ]
  const tags = ['latest', 'v1.0.0', 'v1.1.0', 'v1.2.0', 'dev', 'staging', 'prod']
  const builds = []

  for (let i = 1; i <= count; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const repository = repositories[Math.floor(Math.random() * repositories.length)]
    const tag = tags[Math.floor(Math.random() * tags.length)]
    const createdAt = Date.now() - Math.floor(Math.random() * 30) * 24 * 3600 * 1000
    const buildTime = status === 'success' ? Math.floor(Math.random() * 600) + 60 :
                      status === 'failed' ? Math.floor(Math.random() * 300) + 30 : 0

    builds.push({
      id: i,
      name: `build-${String(i).padStart(3, '0')}`,
      repository,
      tag,
      status,
      dockerfile: `FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000
CMD ["npm", "start"]`,
      buildArgs: 'NODE_ENV=production\nPORT=3000',
      buildTime,
      createdAt,
      completedAt: status === 'success' || status === 'failed' ? createdAt + buildTime * 1000 : null,
      description: `Build for ${repository}:${tag}`
    })
  }

  return builds
}

// 生成镜像数据
const generateImages = (count) => {
  const repositories = [
    'docker.io/myapp',
    'docker.io/webapp',
    'docker.io/api-service',
    'gcr.io/project/service',
    'registry.example.com/app'
  ]
  const tags = ['latest', 'v1.0.0', 'v1.1.0', 'v1.2.0', 'dev']
  const images = []

  for (let i = 1; i <= count; i++) {
    const repository = repositories[Math.floor(Math.random() * repositories.length)]
    const tag = tags[Math.floor(Math.random() * tags.length)]

    images.push({
      id: i,
      repository,
      tag,
      digest: `sha256:${Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      size: Math.floor(Math.random() * 500 * 1024 * 1024) + 50 * 1024 * 1024, // 50MB - 550MB
      buildId: i <= 25 ? i : null,
      createdAt: Date.now() - Math.floor(Math.random() * 30) * 24 * 3600 * 1000
    })
  }

  return images
}

// 生成构建模板数据
const generateBuildTemplates = () => {
  return [
    {
      id: 1,
      name: 'Node.js Alpine Template',
      baseImage: 'node:18-alpine',
      dockerfile: `FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000
CMD ["npm", "start"]`,
      defaultBuildArgs: 'NODE_ENV=production',
      description: 'Node.js application template with Alpine Linux',
      createdAt: Date.now() - 60 * 24 * 3600 * 1000
    },
    {
      id: 2,
      name: 'Python FastAPI Template',
      baseImage: 'python:3.11-slim',
      dockerfile: `FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]`,
      defaultBuildArgs: 'PYTHONUNBUFFERED=1',
      description: 'Python FastAPI application template',
      createdAt: Date.now() - 50 * 24 * 3600 * 1000
    },
    {
      id: 3,
      name: 'Go Multi-stage Template',
      baseImage: 'golang:1.21-alpine',
      dockerfile: `FROM golang:1.21-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/main .

EXPOSE 8080
CMD ["./main"]`,
      defaultBuildArgs: 'CGO_ENABLED=0\nGOOS=linux',
      description: 'Go application with multi-stage build',
      createdAt: Date.now() - 45 * 24 * 3600 * 1000
    },
    {
      id: 4,
      name: 'Nginx Static Site Template',
      baseImage: 'nginx:alpine',
      dockerfile: `FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]`,
      defaultBuildArgs: '',
      description: 'Nginx static site with Node.js build stage',
      createdAt: Date.now() - 40 * 24 * 3600 * 1000
    },
    {
      id: 5,
      name: 'Java Spring Boot Template',
      baseImage: 'openjdk:17-slim',
      dockerfile: `FROM maven:3.8-openjdk-17 AS builder

WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline

COPY src ./src
RUN mvn package -DskipTests

FROM openjdk:17-slim
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]`,
      defaultBuildArgs: 'JAVA_OPTS=-Xmx512m',
      description: 'Java Spring Boot application template',
      createdAt: Date.now() - 35 * 24 * 3600 * 1000
    }
  ]
}

// Mock 数据
const mockData = {
  imageBuilds: generateImageBuilds(25),
  images: generateImages(30),
  buildTemplates: generateBuildTemplates()
}

// Mock API 实现
export const mockApi = {
  /**
   * 获取镜像构建列表
   */
  async getImageBuilds(params = {}) {
    await delay(import.meta.env.VITE_MOCK_DELAY || 300)

    let builds = [...mockData.imageBuilds]

    // 筛选
    if (params.status) {
      builds = builds.filter(b => b.status === params.status)
    }
    if (params.search) {
      builds = builds.filter(b =>
        b.name.includes(params.search) ||
        b.repository.includes(params.search) ||
        b.tag.includes(params.search)
      )
    }

    // 排序（最新的在前面）
    builds.sort((a, b) => b.createdAt - a.createdAt)

    // 分页
    const page = params.page || 1
    const pageSize = params.pageSize || 10
    const start = (page - 1) * pageSize
    const end = start + pageSize

    return {
      data: builds.slice(start, end),
      total: builds.length,
      page,
      pageSize
    }
  },

  /**
   * 获取镜像构建详情
   */
  async getImageBuildDetail(id) {
    await delay(import.meta.env.VITE_MOCK_DELAY || 300)

    const build = mockData.imageBuilds.find(b => b.id == id)
    if (!build) {
      throw new Error('Build not found')
    }

    return build
  },

  /**
   * 创建镜像构建
   */
  async createImageBuild(data) {
    await delay(import.meta.env.VITE_MOCK_DELAY || 300)

    const newBuild = {
      id: mockData.imageBuilds.length + 1,
      name: data.name,
      repository: data.repository,
      tag: data.tag,
      dockerfile: data.dockerfile,
      buildArgs: data.buildArgs || '',
      status: 'pending',
      buildTime: 0,
      createdAt: Date.now(),
      completedAt: null,
      description: data.description || ''
    }

    mockData.imageBuilds.unshift(newBuild)

    // 模拟异步构建
    setTimeout(() => {
      newBuild.status = 'building'
    }, 1000)

    setTimeout(() => {
      newBuild.status = Math.random() > 0.2 ? 'success' : 'failed'
      newBuild.buildTime = Math.floor(Math.random() * 300) + 60
      newBuild.completedAt = Date.now()
    }, 5000)

    return newBuild
  },

  /**
   * 更新镜像构建
   */
  async updateImageBuild(id, data) {
    await delay(import.meta.env.VITE_MOCK_DELAY || 300)

    const build = mockData.imageBuilds.find(b => b.id == id)
    if (!build) {
      throw new Error('Build not found')
    }

    Object.assign(build, data)
    return build
  },

  /**
   * 删除镜像构建
   */
  async deleteImageBuild(id) {
    await delay(import.meta.env.VITE_MOCK_DELAY || 300)

    const index = mockData.imageBuilds.findIndex(b => b.id == id)
    if (index === -1) {
      throw new Error('Build not found')
    }

    mockData.imageBuilds.splice(index, 1)
    return { message: 'Build deleted successfully' }
  },

  /**
   * 重新构建镜像
   */
  async rebuildImage(id) {
    await delay(import.meta.env.VITE_MOCK_DELAY || 300)

    const build = mockData.imageBuilds.find(b => b.id == id)
    if (!build) {
      throw new Error('Build not found')
    }

    build.status = 'building'
    build.buildTime = 0
    build.completedAt = null

    // 模拟异步构建
    setTimeout(() => {
      build.status = Math.random() > 0.2 ? 'success' : 'failed'
      build.buildTime = Math.floor(Math.random() * 300) + 60
      build.completedAt = Date.now()
    }, 5000)

    return build
  },

  /**
   * 获取镜像列表
   */
  async getImages(params = {}) {
    await delay(import.meta.env.VITE_MOCK_DELAY || 300)

    let images = [...mockData.images]

    // 筛选
    if (params.search) {
      images = images.filter(i =>
        i.repository.includes(params.search) || i.tag.includes(params.search)
      )
    }

    // 排序
    images.sort((a, b) => b.createdAt - a.createdAt)

    // 分页
    const page = params.page || 1
    const pageSize = params.pageSize || 10
    const start = (page - 1) * pageSize
    const end = start + pageSize

    return {
      data: images.slice(start, end),
      total: images.length,
      page,
      pageSize
    }
  },

  /**
   * 删除镜像
   */
  async deleteImage(id) {
    await delay(import.meta.env.VITE_MOCK_DELAY || 300)

    const index = mockData.images.findIndex(i => i.id == id)
    if (index === -1) {
      throw new Error('Image not found')
    }

    mockData.images.splice(index, 1)
    return { message: 'Image deleted successfully' }
  },

  /**
   * 获取构建模板列表
   */
  async getBuildTemplates(params = {}) {
    await delay(import.meta.env.VITE_MOCK_DELAY || 300)

    let templates = [...mockData.buildTemplates]

    // 筛选
    if (params.search) {
      templates = templates.filter(t =>
        t.name.includes(params.search) ||
        t.baseImage.includes(params.search) ||
        t.description.includes(params.search)
      )
    }

    // 分页
    const page = params.page || 1
    const pageSize = params.pageSize || 10
    const start = (page - 1) * pageSize
    const end = start + pageSize

    return {
      data: templates.slice(start, end),
      total: templates.length,
      page,
      pageSize
    }
  },

  /**
   * 创建构建模板
   */
  async createBuildTemplate(data) {
    await delay(import.meta.env.VITE_MOCK_DELAY || 300)

    const newTemplate = {
      id: mockData.buildTemplates.length + 1,
      name: data.name,
      baseImage: data.baseImage,
      dockerfile: data.dockerfile,
      defaultBuildArgs: data.defaultBuildArgs || '',
      description: data.description || '',
      createdAt: Date.now()
    }

    mockData.buildTemplates.push(newTemplate)
    return newTemplate
  },

  /**
   * 更新构建模板
   */
  async updateBuildTemplate(id, data) {
    await delay(import.meta.env.VITE_MOCK_DELAY || 300)

    const template = mockData.buildTemplates.find(t => t.id == id)
    if (!template) {
      throw new Error('Template not found')
    }

    Object.assign(template, data)
    return template
  },

  /**
   * 删除构建模板
   */
  async deleteBuildTemplate(id) {
    await delay(import.meta.env.VITE_MOCK_DELAY || 300)

    const index = mockData.buildTemplates.findIndex(t => t.id == id)
    if (index === -1) {
      throw new Error('Template not found')
    }

    mockData.buildTemplates.splice(index, 1)
    return { message: 'Template deleted successfully' }
  },

  /**
   * 获取构建日志
   */
  async getBuildLogs(id) {
    await delay(import.meta.env.VITE_MOCK_DELAY || 300)

    const build = mockData.imageBuilds.find(b => b.id == id)
    if (!build) {
      throw new Error('Build not found')
    }

    // 生成模拟日志
    const logs = `[2024-10-07 10:23:45] Starting build for ${build.repository}:${build.tag}
[2024-10-07 10:23:46] Step 1/8 : FROM node:18-alpine
[2024-10-07 10:23:46] ---> Using cache
[2024-10-07 10:23:46] ---> 3a1e5d4c7b8f
[2024-10-07 10:23:46] Step 2/8 : WORKDIR /app
[2024-10-07 10:23:46] ---> Using cache
[2024-10-07 10:23:46] ---> 9f8e7d6c5b4a
[2024-10-07 10:23:46] Step 3/8 : COPY package*.json ./
[2024-10-07 10:23:47] ---> 8e7d6c5b4a3f
[2024-10-07 10:23:47] Step 4/8 : RUN npm install --production
[2024-10-07 10:23:48] ---> Running in a1b2c3d4e5f6
[2024-10-07 10:23:52] npm WARN deprecated package@1.0.0: This package is deprecated
[2024-10-07 10:24:05] added 245 packages from 158 contributors and audited 246 packages in 15.432s
[2024-10-07 10:24:06] ---> 7d6c5b4a3f2e
[2024-10-07 10:24:06] Step 5/8 : COPY . .
[2024-10-07 10:24:08] ---> 6c5b4a3f2e1d
[2024-10-07 10:24:08] Step 6/8 : EXPOSE 3000
[2024-10-07 10:24:08] ---> Running in b2c3d4e5f6a1
[2024-10-07 10:24:08] ---> 5b4a3f2e1d0c
[2024-10-07 10:24:08] Step 7/8 : CMD ["npm", "start"]
[2024-10-07 10:24:08] ---> Running in c3d4e5f6a1b2
[2024-10-07 10:24:08] ---> 4a3f2e1d0c9b
[2024-10-07 10:24:08] Step 8/8 : LABEL version="${build.tag}"
[2024-10-07 10:24:09] ---> Running in d4e5f6a1b2c3
[2024-10-07 10:24:09] ---> 3f2e1d0c9b8a
[2024-10-07 10:24:09] Successfully built 3f2e1d0c9b8a
[2024-10-07 10:24:09] Successfully tagged ${build.repository}:${build.tag}
[2024-10-07 10:24:10] Build completed successfully`

    return { logs }
  }
}

// 检查是否启用 Mock
export const isMockEnabled = () => {
  return import.meta.env.VITE_USE_MOCK === 'true'
}

// 打印 Mock 状态
if (isMockEnabled()) {
  console.log(
    '%c[Image Build] Mock 数据已启用',
    'color: #10b981; font-weight: bold;'
  )
} else {
  console.log(
    '%c[Image Build] 使用真实接口',
    'color: #f59e0b; font-weight: bold;'
  )
}
