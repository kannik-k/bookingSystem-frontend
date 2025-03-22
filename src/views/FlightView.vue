<script setup>
import { onMounted, ref, watch } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";

// Constants
const flights = ref([]);
const errorMessage = ref(null); // error handling

// Pagination
const currentPage = ref(0);
const pageSize = ref(10);
const hasNextPage = ref(false);

// Search query state
const lastSearchQuery = ref({
  flightId: null,
  flightNum: null,
  departureAirport: null,
  arrivalAirport: null,
  departureTime: null,
  arrivalTime: null,
  price: null
});

// Fetch flights from the backend
const getFlights = async () => {
  try {
    const params = {
      flightId: lastSearchQuery.value.flightId,
      flightNum: lastSearchQuery.value.flightNum,
      departureAirport: lastSearchQuery.value.departureAirport,
      arrivalAirport: lastSearchQuery.value.arrivalAirport,
      departureTime: lastSearchQuery.value.departureTime,
      arrivalTime: lastSearchQuery.value.arrivalTime,
      price: lastSearchQuery.value.price,
      page: currentPage.value, // Pagination
      size: pageSize.value // Pagination
    };

    const response = await axios.get('/api/flights', { params });

    flights.value = response.data

  } catch (error) {
    errorMessage.value = error.response?.data.message || 'An error occurred while fetching the flights';
  }
};

// Watchers to trigger fetching flights when page size or sort option changes
watch([pageSize, currentPage], () => {
  getFlights();
});

onMounted(() => {
  console.log('Current Route:', router.currentRoute.value.path);
  getFlights();
});

const router = useRouter();
function redirectToCreateBook() {
  router.push('/seats');  // Redirect to /seats (seat booking page)
}
</script>

<template>
  <div class="page-layout">
    <!-- Error message -->
    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

    <!-- Flights list -->
    <div v-if="flights.length > 0">
      <ul>
        <li v-for="(flight, index) in flights" :key="index">
          Flight ID: {{ flight.flightId }} | Flight Number: {{ flight.flightNum }} | Departure: {{ flight.departureAirport }}
          | Arrival: {{ flight.arrivalAirport }} | Price: ${{ flight.price }}
        </li>
      </ul>

      <!-- Pagination -->
      <div v-if="hasNextPage">
        <button @click="currentPage.value++">Next Page</button>
      </div>
    </div>

    <!-- If no flights found -->
    <div v-else>
      <p>No flights found.</p>
    </div>

    <!-- Example button to navigate to seat booking -->
    <button @click="redirectToCreateBook">Go to Seat Booking</button>
  </div>
</template>

<style scoped>
/* Style your component as needed */
.error-message {
  color: red;
}
</style>
