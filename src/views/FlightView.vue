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
  flightNumber: null,
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
      flightNumber: lastSearchQuery.value.flightNumber,
      departureAirport: lastSearchQuery.value.departureAirport,
      arrivalAirport: lastSearchQuery.value.arrivalAirport,
      departureTime: lastSearchQuery.value.departureTime,
      arrivalTime: lastSearchQuery.value.arrivalTime,
      price: lastSearchQuery.value.price,
      page: currentPage.value, // Pagination
      size: pageSize.value // Pagination
    };

    const response = await axios.get('/api/flights', { params });
    console.log(response);

    flights.value = response.data.flights && response.data.flights.length > 0
      ? response.data.flights : [];
    console.log(flights.value)
    console.log('Lennud massiiv:', flights.value);
    hasNextPage.value = response.data.hasNextPage || false;

  } catch (error) {
    errorMessage.value = error.response?.data.message || 'An error occurred while fetching the flights';
  }
};

watch([pageSize, currentPage], () => {
  //currentPage.value = 0;
  getFlights();
});

onMounted(() => {
  console.log('Current Route:', router.currentRoute.value.path);
  getFlights();
});

function goToNextPage() {
  if (hasNextPage.value) {
    currentPage.value++;
    getFlights();
  }
}

function goToPreviousPage() {
  if (currentPage.value > 0) {
    currentPage.value--;
    getFlights();
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

const router = useRouter();
function redirectToSeats() {
  router.push('/seats');  // Redirect to /seats (seat booking page)
}
</script>

<template>
  <div class="page-layout">
    <!-- Error message -->
    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

    <div class="search-bar">
      <label for="departureAirport">Departure Airport</label>
      <input type="text" v-model="lastSearchQuery.departureAirport" id="departureAirport" placeholder="Enter departure airport"/>

      <label for="arrivalAirport">Arrival Airport</label>
      <input type="text" v-model="lastSearchQuery.arrivalAirport" id="arrivalAirport" placeholder="Enter arrival airport"/>

      <label for="departureTime">Departure Time</label>
      <input type="text" v-model="lastSearchQuery.departureTime" id="departureTime" placeholder="Enter departure time"/>

      <button @click="getFlights" class="search-button">Search</button>
    </div>

    <!-- Flights list -->
    <div v-if="flights.length > 0">
      <table class="flight-table" aria-label="Flights">
        <thead>
        <tr>
          <th>Flight Number</th>
          <th>Departure Airport</th>
          <th>Arrival Airport</th>
          <th>Departure Time</th>
          <th>Arrival Time</th>
          <th>Price</th>
        </tr>
        </thead>
        <tbody>
        <tr
            v-for="(flight, index) in flights"
            :key="index"
            @click="redirectToSeats"
            style="cursor: pointer;"
        >
          <td>{{ flight.flightNumber }}</td>
          <td>{{ flight.departureAirport }}</td>
          <td>{{ flight.arrivalAirport }}</td>
          <td>{{ formatDate(flight.departureTime) }}</td>
          <td>{{ formatDate(flight.arrivalTime) }}</td>
          <td>${{ flight.price }}</td>
        </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div class="pagination">
        <button :disabled="currentPage === 0" @click="goToPreviousPage">Previous</button>
        <span class="page-number">Page {{ currentPage + 1 }}</span>
        <button :disabled="!hasNextPage" @click="goToNextPage">Next</button>
      </div>
    </div>

    <!-- If no flights found -->
    <div v-else>
      <p>No flights found.</p>
    </div>
  </div>
</template>

<style>

.search-bar {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 20px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 8px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
}

.search-button {
  background-color: #97DC21;
  color: white;
  font-size: 16px;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.search-button:hover {
  background-color: #45a049;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 1.5rem;
  gap: 1rem;
}

.pagination button {
  background-color: var(--vt-c-lime-green);
  color: white;
  border: none;
  padding: 0.5rem 1.2rem;
  border-radius: 20px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.pagination button:hover:not(:disabled) {
  background-color: #4caf50;
}

.pagination button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.page-number {
  font-weight: bold;
  font-size: 1rem;
}

.error-message {
  color: red;
}

.flight-table {
  width: 100%;
  border-collapse: collapse;
  margin: 2rem 0;
}

.flight-table th, .flight-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}

.flight-table tr:hover {
  background-color: var(--vt-c-lime-green);
}

.flight-table th {
  background-color: var(--table-color);
}
</style>
