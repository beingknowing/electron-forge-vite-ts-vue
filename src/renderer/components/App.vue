<script setup lang="ts">
import { el } from 'element-plus/es/locale';
import { watchEffect, reactive, toRaw, computed } from 'vue'

type Option = { des: string; queue: string }


const options: Option[] = [
  { des: '域名申请、解析', queue: 'GBL-NETWORK DDI' },
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
const ticket = reactive<TicketType>({
  title: '',
  content: '',
  queue_val: '',
})
const result = reactive<{ v?: TicketResponse }>({})
async function submitTicket() {
  result.v = undefined
  result.v = await window.electron.ipcRenderer.invoke("ticket", toRaw(ticket))
  console.log('Submitting ticket:', ticket, 'Queue:', ticket.queue_val)

}

const link = computed(() => {
  if (result.v) {
    return {
      txt: result.v.result[0].display_value,
      href: `https://pfetst.service-now.com/now/sow/record/incident/${result.v?.result[0]?.sys_id}`
    }
  }
  return {
    txt: 'waiting...',
    href: `https://pfetst.service-now.com/now/sow/home`
  }
})

</script>

<template>
  <main class="main">
    <h1> 提交工单 </h1><br />

    <el-card style="margin-top: 16px;width: 100%;height: 100%;">
      <div style="margin-bottom: 8px; font-weight: 600;"></div>
      <el-input v-model="ticket.title" placeholder="请输入工单简要标题" clearable show-word-limit maxlength="100" />
      <div style="margin-bottom: 8px; font-weight: 600;"></div>
      <el-input v-model="ticket.content" type="textarea" :rows="6" placeholder="请输入工单详细描述（支持换行）" clearable
        show-word-limit maxlength="1000" />

      <div style="margin-bottom: 8px; font-weight: 600;"></div>
      <el-autocomplete v-model="ticket.queue_val" :fetch-suggestions="querySearch" placeholder="请输入以筛选队列"
        value-key="queue">
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
    <el-card style="margin-top: 16px;width: 100%;height: 100%;">
      <div style="margin-bottom: 8px; font-weight: 600;"></div>

      <el-link :href="link.href" target="_blank">{{ link.txt }}</el-link>
    </el-card>
  </main>

</template>
