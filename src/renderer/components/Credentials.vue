<template>
  <div class="credentials-container">
    <el-button type="primary" @click="handleAdd" class="add-button">添加行</el-button>
    <el-table :data="tableData" border>
      <el-table-column prop="isCurrent" label="是否当前"></el-table-column>

      <el-table-column prop="date" label="日期"></el-table-column>
      <el-table-column prop="name" label="姓名"></el-table-column>
      <el-table-column prop="address" label="地址"></el-table-column>
      <el-table-column label="操作">
        <template #default="scope">
          <span v-show="!scope.row.editing">{{ scope.row.value }}</span>
          <el-input v-show="scope.row.editing" v-model="scope.row.value"></el-input>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button @click="handleEdit(row)">编辑</el-button>
          <el-button type="primary" @click="handleSave">保存</el-button>
          <el-button type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script setup lang="ts">
// import { ConfigsType, ConfigType } from './../../';
const tableData = reactive<ConfigsType>([
  {
    date: '2024-01-01',
    name: '张三',
    address: '北京市朝阳区',
    value: '示例值1',
    isCurrent: true,
    editing: false
  },
  {
    date: '2024-02-01',
    name: '李四',
    address: '上海市浦东新区',
    value: '示例值2',
    isCurrent: false,
    editing: false
  }
]);

const handleEdit = (row: ConfigType) => {
  row.editing = true;
};
const handleSave = () => {
  // 保存数据逻辑
};
const handleDelete = (row: ConfigType) => {
  // 删除数据逻辑
};
const handleAdd = () => {
  const newRow = {
    date: new Date().toISOString().split('T')[0],
    name: '',
    address: '',
    value: '',
    editing: true
  };
  tableData.push(newRow);
};
</script>