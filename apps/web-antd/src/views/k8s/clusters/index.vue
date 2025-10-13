<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue';

import {
  createCluster,
  deleteCluster,
  getClusterList,
  updateCluster,
} from '#/api/k8s';
import type { Cluster, ClusterListParams } from '#/api/k8s/types';

import {
  Button,
  Card,
  Col,
  Descriptions,
  DescriptionsItem,
  Empty,
  Form,
  FormItem,
  Input,
  message,
  Modal,
  Popconfirm,
  Row,
  Space,
  Spin,
  Table,
  Tag,
  Textarea,
} from 'ant-design-vue';

// 状态管理
const loading = ref(false);
const clusters = ref<Cluster[]>([]);
const total = ref(0);
const searchParams = reactive<ClusterListParams>({
  page: 1,
  pageSize: 10,
  keyword: '',
  status: '',
});

// 表单相关
const modalVisible = ref(false);
const modalTitle = ref('添加集群');
const formRef = ref();
const formData = ref<Partial<Cluster>>({
  name: '',
  description: '',
  apiServer: '',
  kubeconfig: '',
});
const isEdit = ref(false);

// 表格列定义
const columns = [
  {
    title: '集群名称',
    dataIndex: 'name',
    key: 'name',
    width: 200,
  },
  {
    title: '描述',
    dataIndex: 'description',
    key: 'description',
    ellipsis: true,
  },
  {
    title: 'API Server',
    dataIndex: 'apiServer',
    key: 'apiServer',
    width: 250,
  },
  {
    title: '版本',
    dataIndex: 'version',
    key: 'version',
    width: 120,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
  },
  {
    title: 'Nodes',
    dataIndex: 'nodeCount',
    key: 'nodeCount',
    width: 80,
  },
  {
    title: 'Pods',
    dataIndex: 'podCount',
    key: 'podCount',
    width: 80,
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 180,
  },
  {
    title: '操作',
    key: 'action',
    width: 200,
    fixed: 'right' as const,
  },
];

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请输入集群名称', trigger: 'blur' }],
  apiServer: [
    { required: true, message: '请输入 API Server 地址', trigger: 'blur' },
    { type: 'url', message: '请输入有效的 URL', trigger: 'blur' },
  ],
  kubeconfig: [
    { required: true, message: '请输入 Kubeconfig', trigger: 'blur' },
  ],
};

// 获取集群列表
async function fetchClusterList() {
  loading.value = true;
  try {
    const res = await getClusterList(searchParams);
    clusters.value = res.items;
    total.value = res.total;
  } catch (error: any) {
    message.error(error.message || '获取集群列表失败');
  } finally {
    loading.value = false;
  }
}

// 搜索
function handleSearch() {
  searchParams.page = 1;
  fetchClusterList();
}

// 重置搜索
function handleReset() {
  searchParams.keyword = '';
  searchParams.status = '';
  searchParams.page = 1;
  fetchClusterList();
}

// 分页变化
function handlePageChange(page: number, pageSize: number) {
  searchParams.page = page;
  searchParams.pageSize = pageSize;
  fetchClusterList();
}

// 打开添加/编辑弹窗
function handleAdd() {
  isEdit.value = false;
  modalTitle.value = '添加集群';
  formData.value = {
    name: '',
    description: '',
    apiServer: '',
    kubeconfig: '',
  };
  modalVisible.value = true;
}

function handleEdit(record: Cluster) {
  isEdit.value = true;
  modalTitle.value = '编辑集群';
  formData.value = { ...record };
  modalVisible.value = true;
}

// 提交表单
async function handleSubmit() {
  try {
    await formRef.value.validate();
    loading.value = true;

    if (isEdit.value && formData.value.id) {
      await updateCluster(formData.value.id, formData.value);
      message.success('更新集群成功');
    } else {
      await createCluster(formData.value);
      message.success('创建集群成功');
    }

    modalVisible.value = false;
    fetchClusterList();
  } catch (error: any) {
    if (error.errorFields) {
      return;
    }
    message.error(error.message || '操作失败');
  } finally {
    loading.value = false;
  }
}

// 删除集群
async function handleDelete(id: string) {
  loading.value = true;
  try {
    await deleteCluster(id);
    message.success('删除集群成功');
    fetchClusterList();
  } catch (error: any) {
    message.error(error.message || '删除集群失败');
  } finally {
    loading.value = false;
  }
}

// 查看详情
function handleViewDetail(record: Cluster) {
  window.open(`/k8s/clusters/${record.id}`, '_blank');
}

// 获取状态标签颜色
function getStatusColor(status: string) {
  const colorMap: Record<string, string> = {
    healthy: 'success',
    unhealthy: 'error',
    unknown: 'default',
  };
  return colorMap[status] || 'default';
}

// 获取状态文本
function getStatusText(status: string) {
  const textMap: Record<string, string> = {
    healthy: '健康',
    unhealthy: '异常',
    unknown: '未知',
  };
  return textMap[status] || status;
}

// 初始化
onMounted(() => {
  fetchClusterList();
});
</script>

<template>
  <div class="p-5">
    <!-- 搜索栏 -->
    <Card class="mb-4">
      <Form layout="inline">
        <FormItem label="关键字">
          <Input
            v-model:value="searchParams.keyword"
            placeholder="搜索集群名称"
            style="width: 200px"
            @press-enter="handleSearch"
          />
        </FormItem>
        <FormItem>
          <Space>
            <Button type="primary" @click="handleSearch">搜索</Button>
            <Button @click="handleReset">重置</Button>
            <Button type="primary" @click="handleAdd">添加集群</Button>
          </Space>
        </FormItem>
      </Form>
    </Card>

    <!-- 集群列表 -->
    <Card title="集群列表">
      <Spin :spinning="loading">
        <Table
          :columns="columns"
          :data-source="clusters"
          :pagination="{
            current: searchParams.page,
            pageSize: searchParams.pageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total: number) => `共 ${total} 条`,
            onChange: handlePageChange,
          }"
          :scroll="{ x: 1400 }"
          row-key="id"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <Tag :color="getStatusColor(record.status)">
                {{ getStatusText(record.status) }}
              </Tag>
            </template>
            <template v-if="column.key === 'action'">
              <Space>
                <Button size="small" type="link" @click="handleViewDetail(record)">
                  详情
                </Button>
                <Button size="small" type="link" @click="handleEdit(record)">
                  编辑
                </Button>
                <Popconfirm
                  title="确定要删除这个集群吗？"
                  @confirm="handleDelete(record.id)"
                >
                  <Button danger size="small" type="link">删除</Button>
                </Popconfirm>
              </Space>
            </template>
          </template>
        </Table>
      </Spin>
    </Card>

    <!-- 添加/编辑弹窗 -->
    <Modal
      v-model:open="modalVisible"
      :title="modalTitle"
      width="600px"
      @ok="handleSubmit"
    >
      <Form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-col="{ span: 6 }"
        wrapper-col="{ span: 16 }"
      >
        <FormItem label="集群名称" name="name">
          <Input v-model:value="formData.name" placeholder="请输入集群名称" />
        </FormItem>
        <FormItem label="描述" name="description">
          <Textarea
            v-model:value="formData.description"
            placeholder="请输入描述"
            :rows="3"
          />
        </FormItem>
        <FormItem label="API Server" name="apiServer">
          <Input
            v-model:value="formData.apiServer"
            placeholder="https://kubernetes.default.svc"
          />
        </FormItem>
        <FormItem label="Kubeconfig" name="kubeconfig">
          <Textarea
            v-model:value="formData.kubeconfig"
            placeholder="粘贴 kubeconfig 内容"
            :rows="8"
          />
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>
