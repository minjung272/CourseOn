import { createRouter, createWebHistory } from 'vue-router'
import BoardList from '../../features/community/views/BoardList.vue'
import BoardDetail from '../../features/community/views/BoardDetail.vue'
import BoardWrite from '../../features/community/views/BoardWrite.vue'

const routes = [
  {
    path: '/',
    redirect: '/board'
  },
  {
    path: '/board',
    name: 'BoardList',
    component: BoardList
  },
  {
    path: '/board/write',
    name: 'BoardWrite',
    component: BoardWrite
  },
  {
    path: '/board/edit/:id',
    name: 'BoardEdit',
    component: BoardWrite
  },
  {
    path: '/board/:id',
    name: 'BoardDetail',
    component: BoardDetail
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router