<script setup>
import { reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import tagMappings from './data/tagMappings.json'
import {
  buildConditionQuery,
  parseConditions,
  saveRecommendationConditions,
} from './services/recommendationService'

const route = useRoute()
const router = useRouter()

function options(groupKey, values) {
  return values.map((value) => ({
    value,
    label: tagMappings.mappings[groupKey][value].label,
  }))
}

const groups = [
  { key: 'companion', icon: '♧', title: '동행', subtitle: '누구와 함께 떠나시나요?', options: options('companion', ['solo', 'couple', 'friends', 'family']) },
  { key: 'interests', icon: '♡', title: '관심사', subtitle: '어떤 것에 관심이 있으신가요? (복수 선택 가능)', multiple: true, options: options('interests', ['hotplace-photo', 'history-culture', 'nature-healing', 'food-cafe', 'shopping']) },
  { key: 'preferredArea', icon: '⌖', title: '선호 지역', subtitle: '어떤 지역을 선호하시나요?', options: options('preferredArea', ['gangbuk', 'gangnam', 'hongdae-mapo', 'seongsu-ttukseom', 'yeouido-yeongdeungpo']) },
  { key: 'travelStyle', icon: '☆', title: '여행 스타일', subtitle: '어떤 여행을 원하시나요?', options: options('travelStyle', ['healing', 'highlights', 'activity', 'luxury']) },
  { key: 'transport', icon: '▣', title: '이동 수단', subtitle: '주로 어떤 수단을 이용하시나요?', options: options('transport', ['public', 'walking', 'bike', 'car']) },
]

const selections = reactive(parseConditions(route.query))

function isSelected(group, value) {
  const selected = selections[group.key]
  return Array.isArray(selected) ? selected.includes(value) : selected === value
}

function select(group, value) {
  if (!group.multiple) {
    selections[group.key] = selections[group.key] === value ? '' : value
    return
  }

  const selected = selections[group.key]
  selections[group.key] = selected.includes(value)
    ? selected.filter((item) => item !== value)
    : [...selected, value]
}

function submit() {
  saveRecommendationConditions(selections)
  router.push({ name: 'RecommendResult', query: buildConditionQuery(selections) })
}
</script>

<template>
  <main class="recommend-page page-shell">
    <section class="surface recommend-card">
      <header class="recommend-heading">
        <h1><span>✧</span> 나만의 여행 추천</h1>
        <p>선택한 조건에 맞춰 서울 여행 코스를 추천해드릴게요!</p>
      </header>

      <div class="preference-list">
        <section v-for="group in groups" :key="group.key" class="preference-row">
          <div class="preference-label"><span>{{ group.icon }}</span><div><h2>{{ group.title }}</h2><p>{{ group.subtitle }}</p></div></div>
          <div class="preference-options">
            <button
              v-for="option in group.options"
              :key="option.value"
              type="button"
              :class="{ selected: isSelected(group, option.value) }"
              @click="select(group, option.value)"
            >
              {{ option.label }}
            </button>
          </div>
        </section>
      </div>

      <button class="primary-button submit-button" type="button" @click="submit">✧ 추천 코스 보기</button>
    </section>
  </main>
</template>

<style scoped>
.recommend-page { max-width: 1300px; }
.recommend-card { padding: 34px 38px 42px; }
.recommend-heading { text-align: center; }
.recommend-heading h1 { margin: 0; font-size: 34px; }
.recommend-heading h1 span { color: var(--color-primary); }
.recommend-heading p { color: var(--color-text-secondary); }
.preference-list { margin-top: 30px; overflow: hidden; border: 1px solid var(--color-border); border-radius: 16px; }
.preference-row { min-height: 102px; padding: 20px 24px; display: grid; grid-template-columns: 280px 1fr; align-items: center; gap: 24px; border-bottom: 1px solid var(--color-border-soft); }
.preference-row:last-child { border-bottom: 0; }
.preference-label { display: flex; align-items: center; gap: 18px; }
.preference-label > span { color: var(--color-primary); font-size: 32px; }
.preference-label h2 { margin: 0; font-size: 18px; }
.preference-label p { margin: 5px 0 0; color: var(--color-text-secondary); font-size: 13px; }
.preference-options { display: grid; grid-template-columns: repeat(auto-fit, minmax(132px, 1fr)); gap: 14px; }
.preference-options button { min-height: 52px; padding: 8px 14px; border: 1px solid #dcd8f1; border-radius: 9px; background: white; cursor: pointer; font-weight: 650; }
.preference-options button.selected { border-color: var(--color-primary); color: var(--color-primary-deep); background: var(--color-primary-pale); box-shadow: inset 0 0 0 1px var(--color-primary); }
.submit-button { width: min(100%, 650px); margin: 32px auto 0; display: flex; }
@media (max-width: 850px) { .preference-row { grid-template-columns: 1fr; } }
@media (max-width: 600px) { .recommend-card { padding: 26px 16px; } .recommend-heading h1 { font-size: 27px; } .preference-row { padding: 18px 14px; } .preference-options { grid-template-columns: repeat(2, 1fr); } }
</style>
