<script setup>
import { reactive } from 'vue'
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

const conditionGroups = [
  {
    key: 'companion',
    label: '동행',
    description: '누구와 함께 떠나시나요?',
    icon: UsersRound,
    columns: 4,
    multiple: false,
    options: [
      { value: 'solo', label: '혼자', icon: UserRound },
      { value: 'couple', label: '연인/커플', icon: Heart },
      { value: 'friends', label: '친구', icon: UsersRound },
      { value: 'family', label: '가족', icon: House },
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
      { value: 'hotplace-photo', label: '핫플/사진', icon: Camera },
      { value: 'history-culture', label: '역사/문화', icon: Landmark },
      { value: 'nature-healing', label: '자연/힐링', icon: Leaf },
      { value: 'food-cafe', label: '미식/카페', icon: Coffee },
      { value: 'shopping', label: '쇼핑', icon: ShoppingBag },
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
      { value: 'gangbuk', label: '강북 (종로, 성북 등)', icon: MapPin },
      { value: 'gangnam', label: '강남 (강남, 서초 등)', icon: MapPin },
      { value: 'hongdae-mapo', label: '홍대/마포', icon: MapPin },
      { value: 'seongsu-ttukseom', label: '성수/뚝섬', icon: MapPin },
      { value: 'yeouido-yeongdeungpo', label: '여의도/영등포', icon: MapPin },
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
      { value: 'healing', label: '여유롭게 힐링', icon: Clock3 },
      { value: 'highlights', label: '알차게 핵심만', icon: CircleCheckBig },
      { value: 'activity', label: '체험 & 액티비티', icon: Activity },
      { value: 'luxury', label: '럭셔리 & 특별하게', icon: Gem },
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
      { value: 'public', label: '대중교통', icon: BusFront },
      { value: 'walking', label: '도보 위주', icon: Footprints },
      { value: 'bike', label: '자전거/킥보드', icon: Bike },
      { value: 'car', label: '자동차', icon: Car },
    ],
  },
]

const selectedConditions = reactive({
  companion: '',
  interests: [],
  preferredArea: '',
  travelStyle: '',
  transport: '',
})

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
  // The recommendation service will consume this normalized object in the next step.
  console.info('Selected recommendation conditions:', { ...selectedConditions })
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
