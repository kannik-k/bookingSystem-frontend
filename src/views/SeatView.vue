<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRoute } from 'vue-router';

const flightData = ref({});
const errorMessage = ref('');
const seats = ref([]);

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

    <!-- Lennu info vasakul -->
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

    <!-- Istekohtade kaart paremal -->
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
</template>

<style scoped>
.content-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 50px;
}

.flight-info {
  flex: 1;
}

.flight-info p {
  font-size: 18px;
  margin: 5px 0;
}

h2 {
  font-weight: bold;
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
</style>
