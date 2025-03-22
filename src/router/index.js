import { createRouter, createWebHistory } from 'vue-router';
import FlightView from '../views/FlightView.vue';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'flights',
            component: FlightView,
        },
    ],
});

export default router;
