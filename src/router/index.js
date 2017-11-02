import Vue from 'vue'
import Router from 'vue-router'
import ReportViewer from '@/components/ReportViewer'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/:rev?/:rt?',
      name: 'reports',
      component: ReportViewer,
      props: true
    }
  ]
})
