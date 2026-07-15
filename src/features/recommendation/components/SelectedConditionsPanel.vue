<script setup>
import {
  BusFront,
  Heart,
  MapPin,
  Pencil,
  Star,
  UsersRound,
} from '@lucide/vue'

defineProps({
  items: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['edit'])

const icons = {
  companion: UsersRound,
  interests: Heart,
  preferredArea: MapPin,
  travelStyle: Star,
  transport: BusFront,
}
</script>

<template>
  <aside class="conditions-panel" aria-labelledby="selected-conditions-title">
    <header class="panel-heading">
      <div class="heading-icon" aria-hidden="true">
        <Star :size="24" :stroke-width="1.9" />
      </div>
      <h2 id="selected-conditions-title">선택한 조건</h2>
    </header>

    <dl class="condition-list">
      <div v-for="item in items" :key="item.key" class="condition-item">
        <component :is="icons[item.key]" :size="20" :stroke-width="1.8" aria-hidden="true" />
        <div>
          <dt>{{ item.label }}</dt>
          <dd>{{ item.value }}</dd>
        </div>
      </div>
    </dl>

    <button type="button" class="edit-button" @click="emit('edit')">
      <Pencil :size="18" :stroke-width="1.9" aria-hidden="true" />
      조건 수정하기
    </button>
  </aside>
</template>

<style scoped>
.conditions-panel {
  align-self: start;
  padding: 26px 24px;
  border: 1px solid #e6e1f0;
  border-radius: 8px;
  background: #fff;
}

.panel-heading {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 18px;
  border-bottom: 1px solid #ece9f3;
}

.heading-icon {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #f0edff;
  color: #7254e8;
}

.panel-heading h2 {
  margin: 0;
  font-size: 20px;
}

.condition-list {
  margin: 0;
}

.condition-item {
  min-height: 86px;
  padding: 18px 2px;
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr);
  gap: 10px;
  border-bottom: 1px solid #ece9f3;
  color: #765aeb;
}

.condition-item dt {
  color: #765aeb;
  font-size: 13px;
  font-weight: 700;
}

.condition-item dd {
  margin: 8px 0 0;
  color: #282431;
  font-size: 14px;
  font-weight: 650;
  line-height: 1.5;
}

.edit-button {
  width: 100%;
  min-height: 48px;
  margin-top: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid #8b72ef;
  border-radius: 7px;
  background: #fff;
  color: #6545df;
  font-weight: 750;
  cursor: pointer;
}

.edit-button:hover {
  background: #f7f5ff;
}

.edit-button:focus-visible {
  outline: 3px solid rgba(117, 89, 237, 0.2);
  outline-offset: 2px;
}
</style>
