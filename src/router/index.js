import { createRouter, createWebHistory } from 'vue-router';
import FlightView from '../views/FlightView.vue';
import SeatView from "../views/SeatView.vue";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'flights',
            component: FlightView,
        },
        {
            path: "/seats:flightId",
            name: 'seats',
            component: SeatView,
        }
    ],
});

export default router;
