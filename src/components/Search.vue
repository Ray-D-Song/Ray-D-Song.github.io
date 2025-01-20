<script setup lang="ts">
import { ref, onMounted } from 'vue'

const showSearch = ref(false)
const searchResults = ref<any[]>([])
const searchInput = ref('')
let pagefind: any

onMounted(async () => {
  if (import.meta.env.PROD) {
    try {
      const module = await import('virtual:pagefind/pagefind')
      pagefind = module.default
    } catch (e) {
      console.error('Failed to load pagefind:', e)
    }
  }
})

async function handleSearch() {
  if (!searchInput.value || !pagefind) {
    searchResults.value = []
    return
  }
  
  try {
    const search = await pagefind.search(searchInput.value)
    const results = await Promise.all(
      search.results.map(async (result: any) => {
        const data = await result.data()
        return {
          title: data.meta.title,
          excerpt: data.excerpt,
          url: data.url,
        }
      })
    )
    searchResults.value = results
  } catch (e) {
    console.error('Search failed:', e)
    searchResults.value = []
  }
}

function closeSearch() {
  showSearch.value = false
  searchResults.value = []
  searchInput.value = ''
}
</script>

<template>
  <div>
    <div 
      class="i-mdi-magnify w-6 h-6 my-2 mx-4 lg:mx-2 hover:cursor-pointer hover:opacity-80"
      @click="showSearch = true"
    />
    
    <div v-if="showSearch" class="fixed inset-0 bg-black/50 z-50">
      <div class="w-full h-full flex items-start justify-center pt-20">
        <div class="w-120 bg-light dark:bg-dark rounded-lg p-4">
          <div class="flex justify-between items-center mb-4">
            <input
              v-model="searchInput"
              type="text"
              :placeholder="'搜索文章...'"
              class="w-full px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-dark focus:outline-none mr-2"
              @input="handleSearch"
            />
            <div 
              class="i-mdi-close w-6 h-6 hover:cursor-pointer hover:opacity-80"
              @click="closeSearch"
            />
          </div>
          
          <div v-if="searchResults.length > 0" class="max-h-100 overflow-y-auto">
            <a
              v-for="result in searchResults"
              :key="result.url"
              :href="result.url"
              class="block p-4 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg mb-2"
            >
              <div class="font-medium mb-1">{{ result.title }}</div>
              <div class="text-sm text-gray-500" v-html="result.excerpt" />
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 