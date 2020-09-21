import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from "components/Login"
var Home = () => import('components/Home')
// import Home from "components/Home"
// import Welcome from "components/Welcome"
var Welcome = () => import('components/Welcome')
// import Users from "components/user/Users"
var Users = () => import('components/user/Users')
// import Rights from "components/power/Rights"
var Rights = () => import('components/power/Rights')
// import Roles from "components/power/Roles"
var Roles = () => import('components/power/Roles')
// import Cate from "components/goods/Cate"
var Cate = () => import('components/goods/Cate')
// import Params from 'components/goods/Params'
var Params = () => import('components/goods/Params')
// import List from 'components/goods/List'
var List = () => import('components/goods/List')
// import Add from 'components/goods/Add'
var Add = () => import('components/goods/Add')
// import Order from 'components/order/Order'
var Order = () => import('components/order/Order')
// import Report from 'components/report/Report'
var Report = () => import('components/report/Report')
Vue.use(VueRouter)
const routes = [
  {
    path: "/", redirect: "/login"
  },
  {
    path: "/login", component: Login
  },
  {
    path: "/home",
    component: Home,
    children: [
      {
        path: "/welcome", component: Welcome, beforeEnter: (to, from, next) => {
          if (to.path === "/welcome") {
            sessionStorage.setItem('activePath', '')
            next()
          }
        }
      },
      { path: "/users", component: Users },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles },
      { path: "/categories", component: Cate },
      { path: "/params", component: Params },
      { path: "/goods", component: List },
      { path: "/goods/add", component: Add },
      { path: "/orders", component: Order },
      { path: "/reports", component: Report },
    ],

  },
]

const router = new VueRouter({
  routes
})

// 挂载路由守卫
router.beforeEach((to, from, next) => {
  // to 将要访问的路径
  // from 从哪个路径跳转而来
  // next 是一个函数    表示 放行
  // next() 放行  next('/login') 强制跳转
  if (to.path === "/login") return next()
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) {
    return next('/login')
  }
  next()
})


export default router
