<script setup lang="ts">
import { ref, reactive } from 'vue'

const queue_val = ref('')
const options: Option[] = [
  { des: '域名申请、解析', queue: 'GBL-NETWORK DDI' },
  { des: '安装操作系统', queue: 'GBL-WTE-SAMS-OS' },
  { des: '安装数据库', queue: 'GBL-WTE-SAMS-DBA' },
  { des: 'Local App DevOps', queue: 'CHN-LOCAL APP DEVOPS' },

]

const querySearch = (query: string, cb: (results: Option[]) => void) => {
  const result = options.filter(
    (item) =>
      item.des.toLowerCase().includes(query.toLowerCase()) ||
      item.queue.toLowerCase().includes(query.toLowerCase()),
  )
  cb(result)
}
const ticket = reactive({
  title: '',
  content: ''
})

function submitTicket() {
  // TODO: Implement ticket submission logic here
  console.log('Submitting ticket:', ticket, 'Queue:', queue_val.value)
 
}



</script>

<template>
  <div class="content">
    <div class="content-container">
      <main class="main">
        <h1> 提交工单 </h1><br />

        <el-card style="margin-top: 16px">
          <div style="margin-bottom: 8px; font-weight: 600;"></div>
          <el-input v-model="ticket.title" placeholder="请输入工单简要标题" clearable show-word-limit maxlength="100" />
          <div style="margin-bottom: 8px; font-weight: 600;"></div>
          <el-input v-model="ticket.content" type="textarea" :rows="6" placeholder="请输入工单详细描述（支持换行）" clearable
            show-word-limit maxlength="1000" />

          <div style="margin-bottom: 8px; font-weight: 600;"></div>
          <el-autocomplete v-model="queue_val" :fetch-suggestions="querySearch" placeholder="请输入以筛选队列" value-key="des">
            <template #default="scope">
              <div v-if="scope?.item" class="auto-item"
                @mouseenter="() => console.log('hover:', scope.item.des, scope.item.queue)">
                {{ scope.item.des }}（{{ scope.item.queue }}）
              </div>
            </template>
          </el-autocomplete>
          <div style="margin-bottom: 8px; font-weight: 600;"></div>
          <el-button type="primary" @click="submitTicket">提交工单</el-button>
        </el-card>
      </main>
    </div>
  </div>
</template>
