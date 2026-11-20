<template>
  <section class="w-full overflow-hidden bg-teal-950 py-3.5" aria-label="Acerca de Localy">
    <div class="marquee-track">
      <div v-for="copy in 3" :key="copy" class="marquee-group" :aria-hidden="copy === 3">
        <span class="marquee-dot"></span>
        <p>Localy conecta viajeros, guías independientes y experiencias auténticas.</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.marquee-track {
  display: flex;
  width: max-content;
  animation: marquee 25s linear infinite;
  will-change: transform;
}

.marquee-group {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 12px;
  padding-right: 48px;
}

.marquee-group p {
  margin: 0;
  white-space: nowrap;
  color: #f0fdfa;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.025em;
}

.marquee-dot {
  width: 6px;
  height: 6px;
  flex-shrink: 0;
  border-radius: 50%;
  background: #2dd4bf;
}

@keyframes marquee {
  from {
    transform: translateX(100vw);
  }

  to {
    transform: translateX(-50%);
  }
}

@media (hover: hover) {
  .marquee-track:hover {
    animation-play-state: paused;
  }
}

@media (prefers-reduced-motion: reduce) {
  .marquee-track {
    animation: none;
  }
}
</style>
