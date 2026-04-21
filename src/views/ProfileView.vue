<script setup>
import { useAuth } from '@okta/okta-vue'
import { inject, computed } from 'vue'
import TokenPanel from '../components/TokenPanel.vue'

const oktaAuth = useAuth()
const authState = inject('okta.authState')

const extraClaims = computed(() => {
  const raw = import.meta.env.VITE_OKTA_PROFILE_CLAIMS
  if (!raw) return []
  return raw.split(',').flatMap((entry) => {
    const colon = entry.indexOf(':')
    if (colon === -1) return []
    const claim = entry.slice(0, colon).trim()
    const heading = entry.slice(colon + 1).trim()
    return claim && heading ? [{ claim, heading }] : []
  })
})

const allClaims = computed(() => ({
  ...authState.value?.accessToken?.claims,
  ...authState.value?.idToken?.claims,
}))

async function signOut() {
  await oktaAuth.signOut()
}
</script>

<template>
  <main class="profile">
    <div class="layout">
      <div class="panel">
        <h2>Profile</h2>
        <template v-if="authState?.isAuthenticated && authState.idToken">
          <dl>
            <dt>Name</dt>
            <dd>{{ authState.idToken.claims.name }}</dd>
            <dt>Email</dt>
            <dd>{{ authState.idToken.claims.email }}</dd>
            <dt>Subject</dt>
            <dd>{{ authState.idToken.claims.sub }}</dd>
          </dl>

          <template v-for="{ claim, heading } in extraClaims" :key="claim">
            <template v-if="allClaims[claim] !== undefined">
              <h2>{{ heading }}</h2>
              <ul v-if="Array.isArray(allClaims[claim])" class="claim-list">
                <li v-for="item in allClaims[claim]" :key="item">{{ item }}</li>
              </ul>
              <p v-else class="claim-value">{{ allClaims[claim] }}</p>
            </template>
          </template>
        </template>
        <button class="btn btn-outline" @click="signOut">Sign Out</button>
      </div>

      <div class="panel">
        <template v-if="authState?.isAuthenticated">
          <TokenPanel
            v-if="authState.accessToken"
            label="Access Token"
            :token="authState.accessToken.accessToken"
          />
          <TokenPanel
            v-if="authState.idToken"
            label="ID Token"
            :token="authState.idToken.idToken"
          />
          <template v-if="authState.refreshToken">
            <h2>Refresh Token</h2>
            <pre class="token-value">{{ authState.refreshToken.refreshToken }}</pre>
          </template>
        </template>
      </div>
    </div>
  </main>
</template>

<style scoped>
.profile {
  min-height: 100vh;
  padding: 3rem 2rem;
  box-sizing: border-box;
}

.layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  max-width: 1100px;
  margin: 0 auto;
}

.panel {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 2rem;
}

h2 {
  font-size: 1.25rem;
  margin-top: 2rem;
  margin-bottom: 1rem;
}

h2:first-child {
  margin-top: 0;
}

dl {
  margin-bottom: 1.5rem;
}

dt {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.6;
  margin-top: 1rem;
}

dt:first-child {
  margin-top: 0;
}

dd {
  margin: 0.25rem 0 0;
  font-size: 1rem;
  word-break: break-all;
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
}

.claim-list {
  list-style: none;
  padding: 0;
  margin: 0 0 1.5rem;
}

.claim-list li {
  padding: 0.2rem 0;
  font-size: 1rem;
}

.claim-value {
  margin: 0 0 1.5rem;
  font-size: 1rem;
}

.btn {
  padding: 0.6rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-outline {
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text);
}

.btn-outline:hover {
  opacity: 0.7;
}
</style>
