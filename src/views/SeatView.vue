<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { useRoute } from 'vue-router';

const flightData = ref({});
const errorMessage = ref('');
const seats = ref([]);
const selectedFilters = ref({
  isWindowSeat: false,
  extraLegroom: false,
  nearExit: false,
  seatClass: 'economy',
});

const selectedSeatCount = ref(1);
const areSeatsTogether = ref(false);

const route = useRoute();
const flightId = route.params.flightId;

const rows = Array.from({ length: 33 }, (_, i) => i + 1);
const seatLetters = ['A', 'B', 'C', 'gap', 'D', 'E', 'F'];

const formatDate = (dateTime) => {
  if (!dateTime) return '';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateTime).toLocaleDateString(undefined, options);
};

const formatTime = (dateTime) => {
  if (!dateTime) return '';
  const options = { hour: '2-digit', minute: '2-digit' };
  return new Date(dateTime).toLocaleTimeString(undefined, options);
};

const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const fetchFlightData = async () => {
  try {
    if (!flightId) {
      throw new Error('Flight ID is missing');
    }

    const response = await axios.get(`/api/flights/${flightId}`);
    flightData.value = response.data;

    const seatResponse = await axios.get(`/api/seats/${flightId}`);
    seats.value = seatResponse.data;
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Error fetching flight data';
  }
};

const isSeatReserved = (seatId) => {
  const seat = seats.value.find(s => s.seatNumber === seatId);
  return seat?.isReserved || false;
};

onMounted(() => {
  fetchFlightData();
});

</script>

<template>
  <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
  <div v-else class="content-wrapper">

    <div class="search-bar">
      <label>
        Seats:
        <select v-model="seatNum">
          <option v-for="n in 10" :key="n" :value="n">{{ n }}</option>
        </select>
      </label>

      <label>
        <input type="checkbox" v-model="areSeatsTogether" />
        Seats together
      </label>

      <label>
        Class:
        <select v-model="selectedFilters.seatClass">
          <option value="economy class">Economy</option>
          <option value="business class">Business</option>
          <option value="first class">First Class</option>
        </select>
      </label>

      <label>
        <input type="checkbox" v-model="selectedFilters.isWindowSeat" />
        Window seat
      </label>

      <label>
        <input type="checkbox" v-model="selectedFilters.isNearExit" />
        Near exit
      </label>

      <label>
        <input type="checkbox" v-model="selectedFilters.hasExtraLegroom" />
        Extra legroom
      </label>

      <button class="search-button" @click="fetchFlightData">Search</button>
    </div>

    <div class="main-section">
      <div class="flight-info">
        <h2>Flight Information</h2>
        <p><strong>Flight Number:</strong> {{ flightData.flightNumber?.toUpperCase() }}</p>
        <p><strong>From:</strong> {{ capitalize(flightData.departureAirport) }}</p>
        <p><strong>To:</strong> {{ capitalize(flightData.arrivalAirport) }}</p>
        <p><strong>Departure Date:</strong> {{ formatDate(flightData.departureTime) }}</p>
        <p><strong>Arrival Date:</strong> {{ formatDate(flightData.arrivalTime) }}</p>
        <p><strong>Departure Time:</strong> {{ formatTime(flightData.departureTime) }}</p>
        <p><strong>Arrival Time:</strong> {{ formatTime(flightData.arrivalTime) }}</p>
        <p><strong>Economy Class Ticket Price:</strong> €{{ flightData.price ? flightData.price.toFixed(2) : 'N/A' }}</p>
      </div>

      <div class="seat-map">
        <h2>Seat Map</h2>
        <div v-for="row in rows" :key="row" class="row">
          <div v-for="seat in seatLetters" :key="seat + row"
               :class="[
                  'seat',
                  seat === 'gap' ? 'gap' : isSeatReserved(row + seat) ? 'reserved' : 'seat-box'
                ]">
            <span v-if="seat !== 'gap'">{{ row }}{{ seat }}</span>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style>

.content-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.search-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
}

.search-bar label {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.search-bar input[type="checkbox"],
.search-bar select {
  margin-top: 3px;
  margin-left: 8px;
}

.search-bar input[type="checkbox"] {
  width: 18px;
  height: 18px;
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

.search-bar select {
  padding: 8px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-top: 5px;
  background-color: white;
}

.main-section {
  display: flex;
  justify-content: center;
  width: 100%;
  padding-top: 5vh;
  padding-left: 10vh;
}

.flight-info {
  flex: 1;
}

.flight-info p {
  font-size: 18px;
  margin: 5px 0;
}

.seat-map {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.row {
  display: flex;
  gap: 8px;
}

.seat-box {
  width: 40px;
  height: 40px;
  background-color: gray;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  border-radius: 4px;
}

.reserved {
  width: 40px;
  height: 40px;
  background-color: red;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  border-radius: 4px;
}

.gap {
  width: 40px;
  height: 40px;
  background-color: white;
}

.error-message {
  color: red;
}

.together {
  display: flex;
}

</style>
