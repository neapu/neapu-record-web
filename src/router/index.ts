import {createRouter, createWebHistory, RouteRecordRaw} from 'vue-router';
import RoomList from "../components/RoomList.vue";

const routes : RouteRecordRaw[] = [{
    path: '/',
    component: RoomList,
}];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;