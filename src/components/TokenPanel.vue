<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  label: { type: String, required: true },
  token: { type: String, required: true },
  expiresAt: { type: Number, default: null },
})

const activeTab = ref('parsed')

const parsed = computed(() => {
  try {
    const payload = props.token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(payload))
  } catch {
    return null
  }
})
</script>

<template>
  <div class="token-panel">
    <div class="token-header">
      <h2>{{ label }}</h2>
      <div class="tabs" role="tablist">
        <button
          role="tab"
          :aria-selected="activeTab === 'parsed'"
          :class="{ active: activeTab === 'parsed' }"
          @click="activeTab = 'parsed'"
        >
          Parsed
        </button>
        <button
          role="tab"
          :aria-selected="activeTab === 'raw'"
          :class="{ active: activeTab === 'raw' }"
          @click="activeTab = 'raw'"
        >
          Raw
        </button>
      </div>
    </div>

    <dl v-if="expiresAt" class="meta">
      <dt>Expires</dt>
      <dd>{{ new Date(expiresAt * 1000).toLocaleString() }}</dd>
    </dl>

    <pre v-if="activeTab === 'parsed' && parsed" class="token-value">{{ JSON.stringify(parsed, null, 2) }}</pre>
    <p v-else-if="activeTab === 'parsed'" class="parse-error">Unable to parse token.</p>
    <pre v-else class="token-value raw">{{ token }}</pre>
  </div>
</template>

<style scoped>
.token-panel {
  margin-top: 2rem;
}

.token-panel:first-child {
  margin-top: 0;
}

.token-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

h2 {
  font-size: 1.1rem;
  margin: 0;
  color: var(--color-heading);
}

.tabs {
  display: flex;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  overflow: hidden;
}

.tabs button {
  padding: 0.3rem 0.85rem;
  font-size: 0.8rem;
  font-weight: 500;
  background: transparent;
  border: none;
  border-left: 1px solid var(--color-border);
  color: var(--color-text);
  cursor: pointer;
  transition: background 0.15s;
}

.tabs button:first-child {
  border-left: none;
}

.tabs button.active {
  background: var(--color-text);
  color: var(--color-background);
}

.tabs button:not(.active):hover {
  background: var(--color-background-mute);
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

.token-value {
  font-size: 0.75rem;
  background: var(--color-background-mute);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 0.75rem;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
}

.token-value.raw {
  word-break: break-all;
}

.parse-error {
  font-size: 0.85rem;
  opacity: 0.6;
}
</style>
