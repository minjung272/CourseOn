import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'Home', component: () => import('../../features/home/HomePage.vue') },
  {
    path: '/courses',
    name: 'Courses',
    component: () => import('../../features/courses/views/CourseListView.vue'),
  },
  {
    path: '/courses/:courseId',
    name: 'CourseDetail',
    component: () => import('../../features/courses/views/CourseDetailView.vue'),
    props: true,
  },
  { path: '/recommend', name: 'Recommend', component: () => import('../../features/recommendation/RecommendPage.vue') },
  { path: '/recommend/result', name: 'RecommendResult', component: () => import('../../features/recommendation/RecommendResult.vue') },
  { path: '/map', name: 'Map', component: () => import('../../features/map/MapPage.vue') },
  { path: '/boards', name: 'Boards', component: () => import('../../features/community/BoardsPage.vue') },
  { path: '/boards/write', name: 'BoardWrite', component: () => import('../../features/community/BoardWrite.vue') },
  { path: '/boards/:id/edit', name: 'BoardEdit', component: () => import('../../features/community/BoardWrite.vue') },
  { path: '/boards/:id', name: 'BoardDetail', component: () => import('../../features/community/BoardDetail.vue') },
  { path: '/chatbot', name: 'Chatbot', component: () => import('../../features/chatbot/ChatbotPage.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
