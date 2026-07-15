<script setup>
defineProps({
  keyword: {
    type: String,
    default: '',
  },
  tags: {
    type: Array,
    default: () => [],
  },
  selectedTags: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:keyword', 'toggle-tag', 'reset'])
const tagIcons = { 데이트: '♥', 자연: '♧', 역사: '▣', 야경: '☾', 산책: '♧', 맛집: '♨', 문화예술: '◇', 도심여행: '⌂', 체험: '✦', 혼자: '●' }
</script>

<template>
  <aside class="course-filter">
    <section class="filter-section">
      <h2>코스 검색</h2>
      <label class="search-field">
        <span class="sr-only">여행코스 검색</span>
        <input
          :value="keyword"
          type="search"
          placeholder="코스명으로 검색해보세요"
          @input="emit('update:keyword', $event.target.value)"
        />
      </label>
    </section>

    <section class="filter-section">
      <h2>테마</h2>
      <div class="tag-list">
        <button
          v-for="tag in tags"
          :key="tag"
          type="button"
          class="tag-button"
          :class="{ selected: selectedTags.includes(tag) }"
          :aria-pressed="selectedTags.includes(tag)"
          @click="emit('toggle-tag', tag)"
        >
          <span aria-hidden="true">{{ tagIcons[tag] || '✦' }}</span>{{ tag }}
        </button>
      </div>
    </section>

    <button type="button" class="reset-button" @click="emit('reset')">필터 초기화</button>
  </aside>
</template>

<style scoped>
.course-filter {
  position: sticky;
  top: 100px;
  border: 1px solid #e4e1f1;
  border-radius: 16px;
  background: #fff;
  overflow: hidden;
}

.filter-section {
  padding: 24px;
  border-bottom: 1px solid #eeeaf7;
}

h2 {
  margin: 0 0 16px;
  font-size: 18px;
}

.search-field input {
  width: 100%;
  box-sizing: border-box;
  padding: 13px 14px;
  border: 1px solid #d9d5e7;
  border-radius: 9px;
  font: inherit;
}

.tag-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.tag-button,
.reset-button {
  padding: 10px;
  border: 1px solid #ded9ef;
  border-radius: 9px;
  background: #fff;
  color: #4a4658;
  cursor: pointer;
}

.tag-button.selected {
  border-color: #7457e8;
  background: #f1edff;
  color: #6341df;
  font-weight: 700;
}

.tag-button { display: flex; align-items: center; justify-content: center; gap: 7px; }
.tag-button span { color: var(--color-primary); }

.reset-button {
  width: calc(100% - 48px);
  margin: 20px 24px;
  color: #6341df;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 760px) {
  .course-filter { position: static; }
  .tag-list {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
