<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import axios from 'axios';
import { useRoute } from 'vue-router';

const flightData = ref({});
const errorMessage = ref('');
const seats = ref([]);
const selectedSeats = ref([]);

const seatClass = ref('economy');
const extraLegroom = ref(false);
const nearExit = ref(false);
const isWindowSeat = ref(false);
const seatNum = ref();
const seatsTogether = ref(false);

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

    console.log("Fetching flight data...");
    const response = await axios.get(`/api/flights/${flightId}`);
    flightData.value = response.data;

    console.log("Fetching seats data...");
    const seatResponse = await axios.get(`/api/seats/${flightId}`);
    seats.value = seatResponse.data;
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Error fetching flight data';
    console.error(error);
  }
};

const getSeatsByFlightId = async () => {
  try {
    if (!flightId) {
      throw new Error('Flight ID is missing');
    }

    console.log("Fetching seats with filters...");
    const filterParams = {
      classType: seatClass.value,
      isNearExit: nearExit.value,
      hasExtraLegroom: extraLegroom.value,
      seatNum: seatNum.value,
      windowSeat: isWindowSeat.value,
      seatsTogether: seatsTogether.value,
    };

    console.log("Filter Params:", filterParams);

    const seatResponse = await axios.get(`/api/seats/select/${flightId}`, { params: filterParams });
    selectedSeats.value = seatResponse.data;

    console.log("Fetched seats:", selectedSeats.value);
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Error fetching seat data';
    console.error(error);
  }
};

const isSeatReserved = (seatId) => {
  const seat = seats.value.find(s => s.seatNumber === seatId);
  return seat?.isReserved || false;
};

const isSeatSelected = (seatId) => {
  return selectedSeats.value.some(s => s.seatNumber === seatId);
};

const totalPrice = computed(() => {
  let price = flightData.value.price || 0;
  let total = 0;

  if (seatClass.value === 'business') {
    total = (price * 1.2) * selectedSeats.value.length;
  } else if (seatClass.value === 'first') {
    total = (price * 1.5) * selectedSeats.value.length;
  } else {
    total = price * selectedSeats.value.length;
  }
  console.log(total)
  return total.toFixed(2);
});

watch([seatClass, extraLegroom, nearExit, isWindowSeat, seatNum, seatsTogether], () => {
  console.log("Filters changed, re-fetching seats...");
  getSeatsByFlightId();
});

onMounted(() => {
  console.log("Component mounted, fetching flight data...");
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
          <option v-for="n in 6" :key="n" :value="n">{{ n }}</option>
        </select>
      </label>

      <label>
        <input type="checkbox" v-model="seatsTogether" />
        Seats together
      </label>

      <label>
        Class:
        <select v-model="seatClass">
          <option value="economy">Economy</option>
          <option value="business">Business</option>
          <option value="first">First Class</option>
        </select>
      </label>

      <label>
        <input type="checkbox" v-model="isWindowSeat" />
        Window seat
      </label>

      <label>
        <input type="checkbox" v-model="nearExit" />
        Near exit
      </label>

      <label>
        <input type="checkbox" v-model="extraLegroom" />
        Extra legroom
      </label>

      <button class="search-button" @click="getSeatsByFlightId">Search</button>
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


        <h3>Selected Seats:</h3>
        <p v-if="selectedSeats.length > 0">
          {{ selectedSeats.map(seat => seat.seatNumber).join(', ') }}
        </p>
        <p v-else>No seats matching your wishes</p>

        <h4>Total Price: {{ totalPrice }}</h4>
      </div>

      <div class="seat-map">
        <h2>Seat Map</h2>
        <div v-for="row in rows" :key="row" class="row">
          <div v-for="seat in seatLetters" :key="row + seat"
               :class="[
                  'seat',
                  seat === 'gap'
                    ? 'gap'
                    : isSeatReserved(row + seat)
                      ? 'reserved'
                      : isSeatSelected(row + seat)
                        ? 'selected'
                        : 'seat-box'
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

.flight-info h3 {
  padding-top: 5vh;
  font-size: 18px;
  color: #97DC21;
}

.flight-info h4 {
  font-size: 18px;
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

.selected {
  width: 40px;
  height: 40px;
  background-color: #4CAF50;
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
