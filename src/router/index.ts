import {createRouter, createWebHashHistory, RouteRecordRaw} from 'vue-router';
import RoomList from "../components/RoomList.vue";

const routes : RouteRecordRaw[] = [{
    path: '/',
    component: RoomList,
}];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

export default router;