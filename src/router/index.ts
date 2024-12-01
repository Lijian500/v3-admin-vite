import {type RouteRecordRaw, createRouter} from "vue-router"
import {history, flatMultiLevelRoutes} from "./helper"
import routeSettings from "@/config/route"

const Layouts = () => import("@/layouts/index.vue")

/**
 * 常驻路由
 * 除了 redirect/403/404/login 等隐藏页面，其他页面建议设置 Name 属性
 */
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "home",
    component: () => import("@/views/home/index.vue"),
    meta: {
      hidden: true
    }
  },
  {
    path: "/redirect",
    component: Layouts,
    meta: {
      hidden: true
    },
    children: [
      {
        path: ":path(.*)",
        component: () => import("@/views/redirect/index.vue")
      }
    ]
  },
  {
    path: "/403",
    component: () => import("@/views/error-page/403.vue"),
    meta: {
      hidden: true
    }
  },
  {
    path: "/404",
    component: () => import("@/views/error-page/404.vue"),
    meta: {
      hidden: true
    },
    alias: "/:pathMatch(.*)*"
  },
  {
    path: "/login",
    component: () => import("@/views/login/index.vue"),
    meta: {
      hidden: true
    }
  },
  // {
  //   path: "/dashboard",
  //   component: Layouts,
  //   redirect: "/dashboard",
  //   children: [
  //     {
  //       path: "dashboard",
  //       component: () => import("@/views/dashboard/index.vue"),
  //       name: "Dashboard",
  //       meta: {
  //         title: "首页",
  //         svgIcon: "dashboard",
  //         affix: true
  //       }
  //     }
  //   ]
  // },
  {
    path: "/table",
    component: Layouts,
    redirect: "/table/element-plus",
    name: "TableManagement",
    meta: {
      title: "用户管理",
      elIcon: "User"
    },
    children: [
      {
        path: "element-plus",
        component: () => import("@/views/table/element-plus/index.vue"),
        name: "ElementPlus",
        meta: {
          title: "用户列表",
          keepAlive: false
        }
      }, {
        path: "/element-plus/detail/:id",
        component: () => import("@/views/table/element-plus/detail.vue"),
        name: "UserDetail",
        meta: {
          title: "详情",
          keepAlive: true,
          hidden: true
        }
      }, {
        path: "/login/log",
        component: () => import("@/views/table/login-log/index.vue"),
        name: "LoginLog",
        meta: {
          title: "登录日志",
          keepAlive: false,
        }
      }, {
        path: "/login/log/detail/:id",
        component: () => import("@/views/table/login-log/detail.vue"),
        name: "LoginLogDetail",
        meta: {
          title: "详情",
          keepAlive: true,
          hidden: true
        }
      }
    ]
  },
  {
    path: "/category",
    component: Layouts,
    redirect: "/category/list",
    name: "Category",
    meta: {
      title: "分类管理",
      elIcon: "Grid",
      alwaysShow: true
    },
    children: [
      {
        path: "list",
        component: () => import("@/views/category/list/index.vue"),
        name: "CategoryList",
        meta: {
          title: "分类列表",
          keepAlive: true
        }
      }
    ]
  },
  {
    path: '/tool',
    component: Layouts,
    redirect: "/tool/list",
    name: "tool",
    meta: {
      title: "工具管理",
      elIcon: "tools",
      alwaysShow: true
    },
    children: [
      {
        path: 'list',
        name: 'ToolManagement',
        component: () => import('@/views/tool/index.vue'),
        meta: {title: '工具管理'}
      },
      {
        path: 'add',
        name: 'ToolAdd',
        component: () => import('@/views/tool/detail.vue'),
        meta: {title: '新增工具', activeMenu: '/tool/list', hidden: true}
      },
      {
        path: 'edit/:id',
        name: 'ToolEdit',
        component: () => import('@/views/tool/detail.vue'),
        meta: {title: '编辑工具', activeMenu: '/tool/list', hidden: true}
      },
      {
        path: 'detail/:id',
        name: 'ToolDetail',
        component: () => import('@/views/tool/detail.vue'),
        meta: {title: '工具详情', activeMenu: '/tool/list', hidden: true}
      }
    ]
  }
]

/**
 * 动态路由
 * 用来放置有权限 (Roles 属性) 的路由
 * 必须带有 Name 属性
 */
export const dynamicRoutes: RouteRecordRaw[] = [
  {
    path: "/permission",
    component: Layouts,
    redirect: "/permission/page",
    name: "Permission",
    meta: {
      title: "权限",
      svgIcon: "lock",
      roles: ["admin", "editor"], // 可以在根路由中设置角色
      alwaysShow: true // 将始终显示根菜单
    },
    children: [
      {
        path: "page",
        component: () => import("@/views/permission/page.vue"),
        name: "PagePermission",
        meta: {
          title: "页面级",
          roles: ["admin"] // 或者在子导航中设置角色
        }
      },
      {
        path: "directive",
        component: () => import("@/views/permission/directive.vue"),
        name: "DirectivePermission",
        meta: {
          title: "按钮级" // 如果未设置角色，则表示：该页面不需要权限，但会继承根路由的角色
        }
      }
    ]
  }
]

const router = createRouter({
  history,
  routes: routeSettings.thirdLevelRouteCache ? flatMultiLevelRoutes(constantRoutes) : constantRoutes
})

/** 重置路由 */
export function resetRouter() {
  // 注意：所有动态路由路由必须带有 Name 属性，否则可能会不能完全重置干净
  try {
    router.getRoutes().forEach((route) => {
      const {name, meta} = route
      if (name && meta.roles?.length) {
        router.hasRoute(name) && router.removeRoute(name)
      }
    })
  } catch {
    // 强制刷新浏览器也行，只是交互体验不是很好
    window.location.reload()
  }
}

export default router
