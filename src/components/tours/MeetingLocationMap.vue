<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const emit = defineEmits<{
  locationSelected: [
    {
      meetingAddress: string;
      latitude: number;
      longitude: number;
    },
  ];
}>();
const mapContainer = ref<HTMLElement | null>(null);
let map: L.Map | null = null;
let marker: L.Marker | null = null;
const cartagena = {
  latitude: 10.4236,
  longitude: -75.5478,
};
onMounted(() => {
  if (!mapContainer.value) return;
  map = L.map(mapContainer.value).setView([cartagena.latitude, cartagena.longitude], 14);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(map);
  nextTick(() => map?.invalidateSize());
  map.on("click", (event: L.LeafletMouseEvent) => {
    const latitude = event.latlng.lat;
    const longitude = event.latlng.lng;
    if (marker) {
      marker.remove();
    }
    if (map) {
      marker = L.marker([latitude, longitude]).addTo(map);
      marker
        .bindPopup(
          `
          <div style="font-size: 14px;">
            <strong>Lugar de encuentro</strong><br>
            ${latitude.toFixed(6)}, ${longitude.toFixed(6)}
          </div>
        `,
        )
        .openPopup();
    }
    const fallbackAddress = `Cartagena, Colombia (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
    emit("locationSelected", {
      latitude,
      longitude,
      meetingAddress: fallbackAddress,
    });
  });
});
onBeforeUnmount(() => {
  if (map) {
    map.remove();
  }
});
</script>
<template>
  <div
    ref="mapContainer"
    class="isolate h-100 w-full overflow-hidden rounded-2xl border border-gray-200 shadow-sm"
  ></div>
</template>
