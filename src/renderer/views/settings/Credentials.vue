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

const tableData = reactive<ConfigsType>([
  {
    client_secret: '',
    client_id: '',
    sn_host: '',
    isCurrent: true,
  },
  {
    client_secret: '',
    client_id: '',
    sn_host: '',
    isCurrent: false,
  }
]);

const handleEdit = (row: ConfigType) => {

};
const handleSave = () => {
  // 保存数据逻辑
};
const handleDelete = (row: ConfigType) => {
  // 删除数据逻辑
};
const handleAdd = () => {
  const newRow = {
    client_secret: '',
    client_id: '',
    sn_host: '',
    isCurrent: true,
  };
  tableData.push(newRow);
};
</script>