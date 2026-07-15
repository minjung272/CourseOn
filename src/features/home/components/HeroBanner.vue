<template>
  <section
    class="hero-banner"
    aria-roledescription="carousel"
    aria-label="Course On 추천 여행 배너"
    @mouseenter="stopAutoPlay"
    @mouseleave="startAutoPlay"
    @focusin="stopAutoPlay"
    @focusout="startAutoPlay"
  >
    <Transition name="banner-fade" mode="out-in">
      <article :key="activeSlide.id" class="hero-slide">
        <div
          class="hero-photo"
          :style="{ backgroundImage: `url(${activeSlide.image})` }"
          role="img"
          :aria-label="activeSlide.imageAlt"
        ></div>
        <div class="hero-overlay" aria-hidden="true"></div>

        <div class="hero-content" aria-live="polite">
          <p class="hero-kicker">{{ activeSlide.kicker }}</p>
          <h1 id="hero-title">
            {{ activeSlide.title }}<br />
            <strong>
              {{ activeSlide.highlight }}
              <span aria-hidden="true">{{ activeSlide.symbol }}</span>
            </strong>
          </h1>
          <p class="hero-description">{{ activeSlide.description }}</p>
        </div>
      </article>
    </Transition>

    <button
      class="hero-arrow hero-arrow--prev"
      type="button"
      aria-label="이전 배너 보기"
      @click="showPrevious"
    >
      <span aria-hidden="true">‹</span>
    </button>

    <button
      class="hero-arrow hero-arrow--next"
      type="button"
      aria-label="다음 배너 보기"
      @click="showNext"
    >
      <span aria-hidden="true">›</span>
    </button>

    <div class="hero-dots" aria-label="배너 선택">
      <button
        v-for="(slide, index) in slides"
        :key="slide.id"
        type="button"
        :class="{ 'is-active': index === activeIndex }"
        :aria-label="`${index + 1}번째 배너: ${slide.highlight}`"
        :aria-current="index === activeIndex ? 'true' : undefined"
        @click="goToSlide(index)"
      ></button>
    </div>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import heroSeoulImage from '../../../assets/images/hero-seoul.jpg'
import bukchonImage from '../../../assets/images/course-bukchon.jpg'
import namsanImage from '../../../assets/images/course-namsan.jpg'
import hangangImage from '../../../assets/images/course-hangang.jpg'

const AUTO_PLAY_DELAY = 5000

const slides = [
  {
    id: 1,
    kicker: '오늘의 서울 여행',
    title: '서울에서의 특별한 하루,',
    highlight: 'Course On과 함께해요',
    symbol: '♥',
    description: '나에게 딱 맞는 서울 여행 코스를 쉽고 즐겁게 찾아보세요.',
    image: heroSeoulImage,
    imageAlt: '분홍빛 노을 아래 서울 남산과 도심 전경',
  },
  {
    id: 2,
    kicker: '전통과 감성이 만나는 곳',
    title: '고즈넉한 골목을 따라,',
    highlight: '북촌의 하루를 걸어봐요',
    symbol: '✦',
    description: '한옥과 작은 골목 사이에서 서울의 오래된 이야기를 발견해보세요.',
    image: bukchonImage,
    imageAlt: '한옥이 이어진 북촌 골목길',
  },
  {
    id: 3,
    kicker: '서울 야경 추천 코스',
    title: '해가 지면 더 아름다운,',
    highlight: '남산의 밤을 만나보세요',
    symbol: '★',
    description: '남산서울타워에서 반짝이는 서울의 야경을 한눈에 담아보세요.',
    image: namsanImage,
    imageAlt: '노을과 남산서울타워가 보이는 풍경',
  },
  {
    id: 4,
    kicker: '도심 속 여유로운 쉼표',
    title: '바람이 머무는 강변에서,',
    highlight: '한강의 여유를 즐겨봐요',
    symbol: '●',
    description: '산책부터 피크닉까지, 한강에서 나만의 느긋한 하루를 완성해보세요.',
    image: hangangImage,
    imageAlt: '도시 야경과 불빛이 비치는 한강 풍경',
  },
]

const activeIndex = ref(0)
let autoPlayTimer = null

const activeSlide = computed(() => slides[activeIndex.value])

function goToSlide(index) {
  activeIndex.value = index
  restartAutoPlay()
}

function showPrevious() {
  activeIndex.value = (activeIndex.value - 1 + slides.length) % slides.length
  restartAutoPlay()
}

function showNext() {
  activeIndex.value = (activeIndex.value + 1) % slides.length
  restartAutoPlay()
}

function startAutoPlay() {
  if (autoPlayTimer) return

  autoPlayTimer = window.setInterval(() => {
    activeIndex.value = (activeIndex.value + 1) % slides.length
  }, AUTO_PLAY_DELAY)
}

function stopAutoPlay() {
  if (!autoPlayTimer) return

  window.clearInterval(autoPlayTimer)
  autoPlayTimer = null
}

function restartAutoPlay() {
  stopAutoPlay()
  startAutoPlay()
}

onMounted(startAutoPlay)
onBeforeUnmount(stopAutoPlay)
</script>

<style scoped>
.hero-banner {
  position: relative;
  height: 278px;
  overflow: hidden;
  border-radius: var(--radius-lg);
  background: #e9e5ff;
  box-shadow: inset 0 0 0 1px rgba(117, 87, 246, 0.04);
}

.hero-slide {
  position: absolute;
  inset: 0;
}

.hero-photo {
  position: absolute;
  inset: 0 0 0 40%;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  transform: scale(1.01);
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(
      90deg,
      rgba(238, 237, 255, 1) 0%,
      rgba(239, 237, 255, 0.98) 34%,
      rgba(239, 237, 255, 0.75) 51%,
      rgba(239, 232, 255, 0.22) 72%,
      rgba(255, 228, 245, 0.08) 100%
    ),
    linear-gradient(180deg, rgba(255, 246, 254, 0.16), rgba(167, 146, 242, 0.18));
}

.hero-content {
  position: relative;
  z-index: 2;
  width: min(660px, 58%);
  padding: 50px 64px;
}

.hero-kicker {
  margin: 0 0 8px;
  color: var(--color-primary-deep);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.02em;
}

.hero-content h1 {
  margin: 0;
  color: #171923;
  font-size: clamp(29px, 2.25vw, 38px);
  line-height: 1.43;
  letter-spacing: -0.045em;
}

.hero-content strong {
  color: var(--color-primary-deep);
}

.hero-content strong span {
  margin-left: 6px;
  color: #a58bf6;
  font-size: 0.82em;
}

.hero-description {
  margin: 12px 0 0;
  color: #73798d;
  font-size: 16px;
  line-height: 1.65;
}

.hero-arrow {
  position: absolute;
  z-index: 4;
  top: 50%;
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.58);
  border-radius: 50%;
  color: #5f48ce;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 7px 18px rgba(55, 42, 130, 0.12);
  cursor: pointer;
  opacity: 0;
  transform: translateY(-50%);
  transition: opacity 0.2s ease, background 0.2s ease, transform 0.2s ease;
  backdrop-filter: blur(8px);
}

.hero-banner:hover .hero-arrow,
.hero-arrow:focus-visible {
  opacity: 1;
}

.hero-arrow:hover {
  background: rgba(255, 255, 255, 0.94);
  transform: translateY(-50%) scale(1.05);
}

.hero-arrow span {
  margin-top: -3px;
  font-size: 31px;
  line-height: 1;
}

.hero-arrow--prev {
  left: 18px;
}

.hero-arrow--next {
  right: 18px;
}

.hero-dots {
  position: absolute;
  z-index: 5;
  left: 50%;
  bottom: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
  transform: translateX(-50%);
}

.hero-dots button {
  width: 10px;
  height: 10px;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.84);
  box-shadow: 0 1px 5px rgba(33, 27, 88, 0.12);
  cursor: pointer;
  transition: width 0.25s ease, background 0.25s ease;
}

.hero-dots button.is-active {
  width: 25px;
  background: var(--color-primary);
}

.banner-fade-enter-active,
.banner-fade-leave-active {
  transition: opacity 0.42s ease, transform 0.42s ease;
}

.banner-fade-enter-from {
  opacity: 0;
  transform: scale(1.015);
}

.banner-fade-leave-to {
  opacity: 0;
  transform: scale(0.995);
}

@media (max-width: 820px) {
  .hero-banner {
    height: 320px;
  }

  .hero-photo {
    inset: 0;
    opacity: 0.52;
  }

  .hero-overlay {
    background: linear-gradient(90deg, rgba(239, 237, 255, 0.98), rgba(239, 237, 255, 0.76));
  }

  .hero-content {
    width: 85%;
    padding: 48px 42px;
  }

  .hero-arrow {
    opacity: 1;
  }
}

@media (max-width: 520px) {
  .hero-banner {
    height: 306px;
    border-radius: 14px;
  }

  .hero-content {
    width: 100%;
    padding: 38px 24px;
  }

  .hero-kicker {
    font-size: 12px;
  }

  .hero-content h1 {
    font-size: 26px;
  }

  .hero-description {
    max-width: 285px;
    font-size: 14px;
  }

  .hero-arrow {
    top: auto;
    bottom: 10px;
    width: 34px;
    height: 34px;
    transform: none;
  }

  .hero-arrow:hover {
    transform: scale(1.04);
  }

  .hero-arrow--prev {
    left: 15px;
  }

  .hero-arrow--next {
    right: 15px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .banner-fade-enter-active,
  .banner-fade-leave-active,
  .hero-arrow,
  .hero-dots button {
    transition: none;
  }
}
</style>
