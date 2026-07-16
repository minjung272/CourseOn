<template>
  <form class="search-panel" @submit.prevent="submitRecommendation">
    <label class="search-field destination-field">
      <span class="field-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.8"/>
          <path d="m16.3 16.3 3.7 3.7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        </svg>
      </span>
      <span class="sr-only">여행지</span>
      <input v-model="form.destination" type="text" placeholder="어디로 떠나세요?" />
    </label>

    <label class="search-field">
      <span class="field-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.7"/>
          <path d="M7 3v4M17 3v4M3 10h18" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
        </svg>
      </span>
      <span class="sr-only">날짜 선택</span>
      <input v-model="form.date" type="date" aria-label="날짜 선택" />
    </label>

    <label class="search-field">
      <span class="field-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <circle cx="9" cy="8" r="3" stroke="currentColor" stroke-width="1.7"/>
          <path d="M3.5 20c.5-4 2.3-6 5.5-6s5 2 5.5 6M16 6.5c2 .4 3 1.7 3 3.5s-1 3.1-3 3.5M17 15c2.5.8 3.6 2.4 3.8 5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
        </svg>
      </span>
      <span class="sr-only">인원</span>
      <select v-model="form.people" aria-label="인원">
        <option value="">인원</option>
        <option v-for="person in 8" :key="person" :value="person">{{ person }}명</option>
      </select>
    </label>

    <label class="search-field">
      <span class="field-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H13l7 7-9 9-7-7V5.5Z" stroke="currentColor" stroke-width="1.7"/>
          <circle cx="8" cy="8" r="1.3" fill="currentColor"/>
        </svg>
      </span>
      <span class="sr-only">테마</span>
      <select v-model="form.theme" aria-label="테마 선택">
        <option value="">테마 선택</option>
        <option value="tradition">전통</option>
        <option value="night">야경</option>
        <option value="healing">힐링</option>
        <option value="food">맛집</option>
      </select>
    </label>

    <button class="recommend-button" type="submit">
      <span aria-hidden="true">✦</span>
      코스 추천받기
      <span aria-hidden="true">✦</span>
    </button>
  </form>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const form = reactive({
  destination: '',
  date: '',
  people: '',
  theme: '',
})

function submitRecommendation() {
  router.push({
    name: 'Recommend',
    query: Object.fromEntries(Object.entries(form).filter(([, value]) => value)),
  })
}
</script>

<style scoped>
.search-panel {
  min-height: 72px;
  margin: 18px 64px 0;
  padding: 12px 16px 12px 20px;
  display: grid;
  grid-template-columns: 1.55fr 1.05fr 0.95fr 1fr auto;
  align-items: center;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: white;
  box-shadow: var(--shadow-sm);
}

.search-field {
  min-width: 0;
  height: 46px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  gap: 14px;
  border-right: 1px solid var(--color-border);
  color: #53617e;
}

.destination-field {
  padding-left: 0;
}

.field-icon {
  flex: 0 0 22px;
  width: 22px;
  height: 22px;
  color: #66718c;
}

.field-icon svg {
  width: 100%;
  height: 100%;
}

input,
select {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: 0;
  color: #394158;
  background: transparent;
  font-size: 15px;
}

input::placeholder,
select:invalid {
  color: #959bad;
}

input[type='date'] {
  color: #737a8f;
}

.recommend-button {
  height: 46px;
  margin-left: 24px;
  padding: 0 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 0;
  border-radius: 12px;
  color: white;
  background: linear-gradient(135deg, #7d5df6, #6947ed);
  box-shadow: 0 8px 18px rgba(101, 72, 233, 0.22);
  font-weight: 800;
  cursor: pointer;
  white-space: nowrap;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.recommend-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 11px 24px rgba(101, 72, 233, 0.3);
}

@media (max-width: 1100px) {
  .search-panel {
    margin-inline: 0;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .search-field {
    border: 1px solid var(--color-border-soft);
    border-radius: 10px;
    padding: 0 14px;
  }

  .recommend-button {
    grid-column: 1 / -1;
    margin: 0;
  }
}

@media (max-width: 620px) {
  .search-panel {
    grid-template-columns: 1fr;
    padding: 14px;
  }

  .recommend-button {
    grid-column: auto;
  }
}
</style>
