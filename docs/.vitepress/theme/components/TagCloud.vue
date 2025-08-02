<template>
  <div class="tag-cloud">
    <h3 v-if="title" class="tag-cloud-title">{{ title }}</h3>
    <div class="tags-container">
      <button
        v-for="tag in sortedTags"
        :key="tag.name"
        class="tag-item"
        :class="`tag-size-${getTagSize(tag.count)}`"
        :title="`${tag.count} article${tag.count > 1 ? 's' : ''}`"
        @click="$emit('tag-click', tag.name)"
      >
        {{ tag.name }}
        <span class="tag-count">{{ tag.count }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface TagInfo {
  name: string
  count: number
}

const props = withDefaults(defineProps<{
  tags: Record<string, number> | TagInfo[]
  title?: string
  maxTags?: number
  sortBy?: 'name' | 'count'
}>(), {
  maxTags: 30,
  sortBy: 'count'
})

defineEmits<{
  'tag-click': [tag: string]
}>()

const normalizedTags = computed(() => {
  if (Array.isArray(props.tags)) {
    return props.tags
  }
  
  return Object.entries(props.tags).map(([name, count]) => ({
    name,
    count
  }))
})

const sortedTags = computed(() => {
  const sorted = [...normalizedTags.value]
  
  if (props.sortBy === 'count') {
    sorted.sort((a, b) => b.count - a.count)
  } else {
    sorted.sort((a, b) => a.name.localeCompare(b.name, 'fr'))
  }
  
  return sorted.slice(0, props.maxTags)
})

const maxCount = computed(() => 
  Math.max(...normalizedTags.value.map(tag => tag.count))
)

const getTagSize = (count: number): number => {
  const percentage = count / maxCount.value
  if (percentage > 0.8) return 5
  if (percentage > 0.6) return 4
  if (percentage > 0.4) return 3
  if (percentage > 0.2) return 2
  return 1
}
</script>

<style scoped>
.tag-cloud {
  padding: 1.5rem;
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
}

.tag-cloud-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--vp-c-text-1);
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
}

.tag-item {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.875rem;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 20px;
  color: var(--vp-c-text-2);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  white-space: nowrap;
}

.tag-item:hover {
  background: var(--vp-c-brand-soft);
  border-color: var(--vp-c-brand);
  color: var(--vp-c-brand);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.tag-count {
  font-size: 0.75em;
  padding: 0.125rem 0.375rem;
  background: var(--vp-c-bg-soft);
  border-radius: 10px;
  color: var(--vp-c-text-3);
  font-weight: 600;
}

.tag-item:hover .tag-count {
  background: var(--vp-c-brand);
  color: white;
}

/* Tailles de tags basées sur la fréquence */
.tag-size-1 {
  font-size: 0.875rem;
  opacity: 0.8;
}

.tag-size-2 {
  font-size: 0.9375rem;
}

.tag-size-3 {
  font-size: 1rem;
  font-weight: 600;
}

.tag-size-4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.tag-size-5 {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--vp-c-brand);
  border-color: var(--vp-c-brand-soft);
}

.tag-size-5:hover {
  background: var(--vp-c-brand);
  color: white;
  border-color: var(--vp-c-brand);
}

@media (max-width: 768px) {
  .tag-cloud {
    padding: 1rem;
  }
  
  .tags-container {
    gap: 0.5rem;
  }
  
  .tag-item {
    padding: 0.25rem 0.625rem;
    font-size: 0.875rem;
  }
  
  .tag-size-1 { font-size: 0.75rem; }
  .tag-size-2 { font-size: 0.8125rem; }
  .tag-size-3 { font-size: 0.875rem; }
  .tag-size-4 { font-size: 1rem; }
  .tag-size-5 { font-size: 1.125rem; }
}
</style>