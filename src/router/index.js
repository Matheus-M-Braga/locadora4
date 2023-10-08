import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/HomeView.vue'
import UserView from '../views/UserView.vue'
import BookView from '../views/BookView.vue'
import EditView from '../views/PublisherView.vue'
import AlugView from '../views/RentalView.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/usuario',
    name: 'user',
    component: UserView
  },
  {
    path: '/livro',
    name: 'book',
    component: BookView
  },
  {
    path: '/editora',
    name: 'edit',
    component: EditView
  },
  {
    path: '/aluguel',
    name: 'alug',
    component: AlugView
  },
  // {
  //   path: '/about',
  //   name: 'about',
  //   // route level code-splitting
  //   // this generates a separate chunk (about.[hash].js) for this route
  //   // which is lazy-loaded when the route is visited.
  //   component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  // }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
