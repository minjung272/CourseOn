<script setup>
import { computed } from 'vue'

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '비밀번호 확인'
  },
  modelValue: {
    type: String,
    default: ''
  },
  errorMessage: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const password = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

function handleConfirm() {
  emit('confirm')
}
</script>

<template>
  <div v-if="open" class="modal-backdrop" @click.self="emit('cancel')">
    <div class="modal-card">
      <h3>{{ title }}</h3>
      <p>게시글의 비밀번호를 입력해주세요.</p>

      <input
        v-model="password"
        type="password"
        class="password-input"
        placeholder="비밀번호 입력"
        @keydown.enter.prevent="handleConfirm"
      />

      <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

      <div class="modal-actions">
        <button class="btn btn-secondary" type="button" @click="emit('cancel')">취소</button>
        <button class="btn btn-primary" type="button" @click="handleConfirm">확인</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: grid;
  place-items: center;
  z-index: 1000;
  padding: 16px;
}

.modal-card {
  width: min(420px, 100%);
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
}

h3 {
  margin: 0 0 8px;
  font-size: 1.2rem;
  color: #1f2430;
}

p {
  margin: 0 0 14px;
  color: #6b7280;
}

.password-input {
  width: 100%;
  height: 48px;
  border: 1px solid #d9dce5;
  border-radius: 10px;
  padding: 0 12px;
  font-size: 1rem;
}

.error-text {
  margin-top: 10px;
  color: #ef4444;
  font-size: 0.95rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 16px;
}

.btn {
  border-radius: 10px;
  border: 1px solid transparent;
  padding: 10px 14px;
  font-weight: 700;
  cursor: pointer;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-primary {
  background: #7c5cfc;
  color: #fff;
}
</style>