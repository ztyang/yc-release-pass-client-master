import Vue from 'vue'
import Router from 'vue-router'
import Nav from '@/components/common/Nav'

// const ReleasePassDetail from '@/components/releasePassDetail/ReleasePassDetail'
const ReleasePassDetail = () => import('@/components/releasePassDetail/ReleasePassDetail')
Vue.use(Router)

export default new Router({
    routes: [
        {
            path: '/wx',
            component: Nav
        }, {
            path: '/wx/releasePassDetail/:id',
            component: ReleasePassDetail
        }
    ]
})
