<script setup>
defineProps({
  label: { type: String, required: true },
  updatedAt: { type: Number, default: null },
})
</script>

<template>
  <div class="claim-panel">
    <div class="claim-header">
      <h2>{{ label }}</h2>
      <slot name="action" />
    </div>
    <dl v-if="updatedAt" class="meta">
      <dt>Updated At</dt>
      <dd>{{ new Date(updatedAt).toLocaleString() }}</dd>
    </dl>
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

h2 {
  font-size: 1.1rem;
  margin: 0;
}

.meta {
  margin: 0 0 0.75rem;
}

.meta dt {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.6;
}

.meta dd {
  margin: 0.2rem 0 0;
  font-size: 0.9rem;
}

.claim-body {
  font-size: 1rem;
  background: var(--color-background-mute);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 0.75rem 1rem;
}
</style>
