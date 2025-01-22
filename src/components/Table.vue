<script setup lang="ts">
import { computed } from 'vue'

interface Column {
  title: string
  key: string
  width?: string
  align?: 'left' | 'center' | 'right'
  colspan?: number
}

interface Props {
  columns: Column[]
  data: Record<string, any>[]
  loading?: boolean
  showHeader?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showHeader: true
})

const totalColumns = computed(() => {
  return props.columns.reduce((acc, col) => acc + (col.colspan || 1), 0)
})

// 计算分组后的数据
const groupedData = computed(() => {
  const groups: {
    value: string
    rowspan: number
    items: Record<string, any>[]
  }[] = []
  
  const firstKey = props.columns[0].key
  
  props.data.forEach((item) => {
    const value = item[firstKey]
    const lastGroup = groups[groups.length - 1]
    
    if (lastGroup && lastGroup.value === value) {
      lastGroup.rowspan++
      lastGroup.items.push(item)
    } else {
      groups.push({
        value,
        rowspan: 1,
        items: [item]
      })
    }
  })
  
  return groups
})
</script>

<template>
  <div class="w-full overflow-x-auto">
    <table class="min-w-full border-collapse">
      <thead v-if="showHeader" class="bg-gray-50 dark:bg-gray-700">
        <tr>
          <th 
            v-for="col in columns" 
            :key="col.key"
            :style="{ width: col.width }"
            :colspan="col.colspan"
            :class="[
              'px-6 py-3 text-sm font-semibold text-gray-900 dark:text-gray-100',
              col.align === 'center' ? 'text-center' : '',
              col.align === 'right' ? 'text-right' : '',
            ]"
          >
            {{ col.title }}
          </th>
        </tr>
      </thead>

      <tbody v-if="loading" class="bg-white dark:bg-gray-800">
        <tr>
          <td 
            :colspan="totalColumns"
            class="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
          >
            <div class="flex items-center justify-center">
              <div class="animate-spin i-mdi-loading h-5 w-5 mr-2" />
              Loading...
            </div>
          </td>
        </tr>
      </tbody>

      <tbody v-else-if="!data.length" class="bg-white dark:bg-gray-800">
        <tr>
          <td 
            :colspan="totalColumns"
            class="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
          >
            No data
          </td>
        </tr>
      </tbody>

      <tbody v-else class="bg-white dark:bg-gray-800">
        <template v-for="group in groupedData" :key="group.value">
          <template v-for="(item, itemIndex) in group.items" :key="itemIndex">
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <!-- 第一列使用 rowspan -->
              <td
                v-if="itemIndex === 0"
                :rowspan="group.rowspan"
                :class="[
                  'px-6 py-4 text-sm text-gray-900 dark:text-gray-100 border-t border-solid dark:border-gray-700',
                  columns[0].align === 'center' ? 'text-center' : '',
                  columns[0].align === 'right' ? 'text-right' : '',
                ]"
              >
                {{ item[columns[0].key] }}
              </td>
              <!-- 其他列正常渲染 -->
              <td
                v-for="col in columns.slice(1)"
                :key="col.key"
                :colspan="col.colspan"
                :class="[
                  'px-6 py-4 text-sm text-gray-900 dark:text-gray-100 border-t border-solid dark:border-gray-700',
                  col.align === 'center' ? 'text-center' : '',
                  col.align === 'right' ? 'text-right' : '',
                ]"
              >
                {{ item[col.key] }}
              </td>
            </tr>
          </template>
        </template>
      </tbody>
    </table>
  </div>
</template>
