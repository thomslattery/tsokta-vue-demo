<script setup>
defineProps({
  label: { type: String, required: true },
})
</script>

<template>
  <div class="claim-panel">
    <div class="claim-header">
      <h2>{{ label }}</h2>
    </div>
    <div class="claim-body">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.claim-panel {
  margin-top: 2rem;
}

.claim-panel:first-child {
  margin-top: 0;
}

.claim-header {
  margin-bottom: 0.75rem;
}

h2 {
  font-size: 1.1rem;
  margin: 0;
}

.claim-body {
  font-size: 1rem;
  background: var(--color-background-mute);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 0.75rem 1rem;
}
</style>
