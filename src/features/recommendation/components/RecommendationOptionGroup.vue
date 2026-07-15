<script setup>
defineProps({
  group: {
    type: Object,
    required: true,
  },
  selectedValue: {
    type: [String, Array],
    default: '',
  },
})

const emit = defineEmits(['select'])

function isSelected(value, selectedValue) {
  return Array.isArray(selectedValue)
    ? selectedValue.includes(value)
    : selectedValue === value
}
</script>

<template>
  <section class="option-group" :aria-labelledby="`${group.key}-title`">
    <div class="group-icon" aria-hidden="true">
      <component :is="group.icon" :size="28" :stroke-width="1.8" />
    </div>

    <div class="group-copy">
      <h2 :id="`${group.key}-title`">{{ group.label }}</h2>
      <p>{{ group.description }}</p>
    </div>

    <div class="option-list" :class="`option-list-${group.columns}`">
      <button
        v-for="option in group.options"
        :key="option.value"
        type="button"
        class="option-button"
        :class="{ selected: isSelected(option.value, selectedValue) }"
        :aria-pressed="isSelected(option.value, selectedValue)"
        @click="emit('select', option.value)"
      >
        <component :is="option.icon" :size="21" :stroke-width="1.8" aria-hidden="true" />
        <span>{{ option.label }}</span>
      </button>
    </div>
  </section>
</template>

<style scoped>
.option-group {
  display: grid;
  grid-template-columns: 52px 220px minmax(0, 1fr);
  align-items: center;
  gap: 16px;
  min-height: 104px;
  padding: 18px 24px;
  border-bottom: 1px solid #eceaf3;
}

.option-group:last-child {
  border-bottom: 0;
}

.group-icon {
  display: grid;
  place-items: center;
  color: #7559ed;
}

.group-copy h2 {
  margin: 0;
  color: #24212d;
  font-size: 18px;
  line-height: 1.35;
}

.group-copy p {
  margin: 5px 0 0;
  color: #8a8597;
  font-size: 13px;
  line-height: 1.4;
}

.option-list {
  display: grid;
  gap: 12px;
}

.option-list-4 {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.option-list-5 {
  grid-template-columns: repeat(5, minmax(0, 1fr));
}

.option-button {
  min-width: 0;
  min-height: 52px;
  padding: 10px 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: 1px solid #ded9ef;
  border-radius: 7px;
  background: #fff;
  color: #403b4b;
  font-size: 14px;
  font-weight: 650;
  cursor: pointer;
  transition: border-color 0.16s ease, background 0.16s ease, color 0.16s ease,
    box-shadow 0.16s ease;
}

.option-button:hover {
  border-color: #ad9df6;
  color: #6243dc;
}

.option-button:focus-visible {
  outline: 3px solid rgba(117, 89, 237, 0.2);
  outline-offset: 2px;
}

.option-button.selected {
  border-color: #7559ed;
  background: #f2efff;
  color: #6243dc;
  box-shadow: inset 0 0 0 1px rgba(117, 89, 237, 0.12);
}

.option-button span {
  min-width: 0;
  overflow-wrap: anywhere;
}

@media (max-width: 1080px) {
  .option-group {
    grid-template-columns: 44px minmax(0, 1fr);
  }

  .option-list {
    grid-column: 1 / -1;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .option-group {
    padding: 18px 16px;
  }

  .option-list {
    grid-template-columns: 1fr;
  }
}
</style>
