import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'Home', component: () => import('../pages/HomePage.vue') },
  { path: '/courses', name: 'Courses', component: () => import('../pages/CoursesPage.vue') },
  { path: '/courses/:id', name: 'CourseDetail', component: () => import('../pages/CourseDetail.vue') },
  { path: '/recommend', name: 'Recommend', component: () => import('../pages/RecommendPage.vue') },
  { path: '/recommend/result', name: 'RecommendResult', component: () => import('../pages/RecommendResult.vue') },
  { path: '/map', name: 'Map', component: () => import('../pages/MapPage.vue') },
  { path: '/boards', name: 'Boards', component: () => import('../pages/BoardsPage.vue') },
  { path: '/boards/:id', name: 'BoardDetail', component: () => import('../pages/BoardDetail.vue') },
  { path: '/chatbot', name: 'Chatbot', component: () => import('../pages/ChatbotPage.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router