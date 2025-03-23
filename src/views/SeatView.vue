<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRoute } from 'vue-router';

const flightData = ref({});
const errorMessage = ref('');

const route = useRoute();
const flightId = route.params.flightId;

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

// Lennu andmete toomine
const fetchFlightData = async () => {
  try {
    if (!flightId) {
      throw new Error('Flight ID is missing');
    }

    const response = await axios.get(`/api/flights/${flightId}`);

    flightData.value = response.data;
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Error fetching flight data';
  }
};

onMounted(() => {
  fetchFlightData();
});
</script>

<template>
  <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
  <div v-else>
    <h2 style="font-weight: bold;">Flight Information</h2>

    <div class="flight-info">
      <p><strong>Flight Number:</strong> {{ flightData.flightNumber }}</p>
      <p><strong>From:</strong> {{ flightData.departureAirport }}</p>
      <p><strong>To:</strong> {{ flightData.arrivalAirport }}</p>
      <p><strong>Departure Date:</strong> {{ formatDate(flightData.departureTime) }}</p>
      <p><strong>Arrival Date:</strong> {{ formatDate(flightData.arrivalTime) }}</p>
      <p><strong>Departure Time:</strong> {{ formatTime(flightData.departureTime) }}</p>
      <p><strong>Arrival Time:</strong> {{ formatTime(flightData.arrivalTime) }}</p>
      <p><strong>Economy Class Ticket Price:</strong> €{{ flightData.price ? flightData.price.toFixed(2) : 'N/A' }}</p>
    </div>
  </div>
</template>

<style scoped>
.error-message {
  color: red;
}

.flight-info {
  margin-bottom: 20px;
}

.flight-info p {
  font-size: 18px;
}
</style>
