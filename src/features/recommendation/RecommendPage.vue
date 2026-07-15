<script setup>
import { reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Activity,
  Bike,
  BusFront,
  Camera,
  Car,
  CircleCheckBig,
  Clock3,
  Coffee,
  Footprints,
  Gem,
  Heart,
  House,
  Landmark,
  Leaf,
  MapPin,
  ShoppingBag,
  Sparkles,
  Star,
  UserRound,
  UsersRound,
} from '@lucide/vue'
import RecommendationOptionGroup from './components/RecommendationOptionGroup.vue'
import tagMappings from './data/tagMappings.json'
import {
  buildConditionQuery,
  parseConditions,
} from './services/recommendationService'

const route = useRoute()
const router = useRouter()

function mappedOption(groupKey, value, icon) {
  return {
    value,
    icon,
    ...tagMappings.mappings[groupKey][value],
  }
}

const conditionGroups = [
  {
    key: 'companion',
    label: '동행',
    description: '누구와 함께 떠나시나요?',
    icon: UsersRound,
    columns: 4,
    multiple: false,
    options: [
      mappedOption('companion', 'solo', UserRound),
      mappedOption('companion', 'couple', Heart),
      mappedOption('companion', 'friends', UsersRound),
      mappedOption('companion', 'family', House),
    ],
  },
  {
    key: 'interests',
    label: '관심사',
    description: '어떤 것에 관심이 있으신가요?',
    icon: Heart,
    columns: 5,
    multiple: true,
    options: [
      mappedOption('interests', 'hotplace-photo', Camera),
      mappedOption('interests', 'history-culture', Landmark),
      mappedOption('interests', 'nature-healing', Leaf),
      mappedOption('interests', 'food-cafe', Coffee),
      mappedOption('interests', 'shopping', ShoppingBag),
    ],
  },
  {
    key: 'preferredArea',
    label: '선호 지역',
    description: '어떤 지역을 선호하시나요?',
    icon: MapPin,
    columns: 5,
    multiple: false,
    options: [
      mappedOption('preferredArea', 'gangbuk', MapPin),
      mappedOption('preferredArea', 'gangnam', MapPin),
      mappedOption('preferredArea', 'hongdae-mapo', MapPin),
      mappedOption('preferredArea', 'seongsu-ttukseom', MapPin),
      mappedOption('preferredArea', 'yeouido-yeongdeungpo', MapPin),
    ],
  },
  {
    key: 'travelStyle',
    label: '여행 스타일',
    description: '어떤 여행을 원하시나요?',
    icon: Star,
    columns: 4,
    multiple: false,
    options: [
      mappedOption('travelStyle', 'healing', Clock3),
      mappedOption('travelStyle', 'highlights', CircleCheckBig),
      mappedOption('travelStyle', 'activity', Activity),
      mappedOption('travelStyle', 'luxury', Gem),
    ],
  },
  {
    key: 'transport',
    label: '이동 수단',
    description: '주로 어떤 수단을 이용하시나요?',
    icon: BusFront,
    columns: 4,
    multiple: false,
    options: [
      mappedOption('transport', 'public', BusFront),
      mappedOption('transport', 'walking', Footprints),
      mappedOption('transport', 'bike', Bike),
      mappedOption('transport', 'car', Car),
    ],
  },
]

const selectedConditions = reactive(parseConditions(route.query))

function selectCondition(group, value) {
  if (!group.multiple) {
    selectedConditions[group.key] = selectedConditions[group.key] === value ? '' : value
    return
  }

  const values = selectedConditions[group.key]
  selectedConditions[group.key] = values.includes(value)
    ? values.filter((selectedValue) => selectedValue !== value)
    : [...values, value]
}

function submitConditions() {
  router.push({
    name: 'RecommendResult',
    query: buildConditionQuery(selectedConditions),
  })
}
</script>

<template>
  <section class="recommend-page" aria-labelledby="recommend-title">
    <div class="recommend-panel">
      <header class="recommend-header">
        <div class="title-line">
          <Sparkles :size="31" :stroke-width="1.8" aria-hidden="true" />
          <h1 id="recommend-title">나만의 여행 추천</h1>
        </div>
        <p>선택한 조건에 맞춰 서울 여행 코스를 추천해드릴게요!</p>
      </header>

      <form class="condition-form" @submit.prevent="submitConditions">
        <div class="condition-groups">
          <RecommendationOptionGroup
            v-for="group in conditionGroups"
            :key="group.key"
            :group="group"
            :selected-value="selectedConditions[group.key]"
            @select="selectCondition(group, $event)"
          />
        </div>

        <button type="submit" class="submit-button">
          <Sparkles :size="20" :stroke-width="2" aria-hidden="true" />
          <span>추천 코스 보기</span>
        </button>
      </form>
    </div>
  </section>
</template>

<style scoped>
.recommend-page {
  width: 100%;
  max-width: 1240px;
  margin: 4px auto 24px;
}

.recommend-panel {
  padding: 30px 34px 38px;
  border: 1px solid #e7e3f0;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 8px 28px rgba(58, 44, 105, 0.05);
}

.recommend-header {
  margin-bottom: 24px;
  text-align: center;
}

.title-line {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  color: #7559ed;
}

.title-line h1 {
  margin: 0;
  color: #1f1c27;
  font-size: 30px;
  line-height: 1.3;
}

.recommend-header p {
  margin: 8px 0 0;
  color: #807a8d;
  font-size: 14px;
}

.condition-groups {
  overflow: hidden;
  border: 1px solid #e8e4f1;
  border-radius: 8px;
  background: #fff;
}

.submit-button {
  width: min(100%, 690px);
  min-height: 58px;
  margin: 30px auto 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: 0;
  border-radius: 8px;
  background: linear-gradient(110deg, #7859ee, #6342df);
  color: #fff;
  box-shadow: 0 10px 22px rgba(101, 69, 220, 0.2);
  font-size: 17px;
  font-weight: 750;
  cursor: pointer;
  transition: transform 0.16s ease, box-shadow 0.16s ease;
}

.submit-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 13px 26px rgba(101, 69, 220, 0.27);
}

.submit-button:focus-visible {
  outline: 3px solid rgba(117, 89, 237, 0.24);
  outline-offset: 3px;
}

@media (max-width: 760px) {
  .recommend-panel {
    padding: 24px 16px 28px;
  }

  .title-line h1 {
    font-size: 25px;
  }
}
</style>
