<script setup>
import { inject, computed, ref } from 'vue'
import { useAuth } from '@okta/okta-vue'
import TokenPanel from '../components/TokenPanel.vue'
import ClaimPanel from '../components/ClaimPanel.vue'

const oktaAuth = useAuth()
const authState = inject('okta.authState')

const refreshing = ref(false)
const refreshError = ref(null)

async function refreshTokens() {
  refreshing.value = true
  refreshError.value = null
  try {
    await oktaAuth.tokenManager.renew('accessToken')
  } catch (e) {
    refreshError.value = e.message ?? 'Token refresh failed.'
  } finally {
    refreshing.value = false
  }
}

const userinfo = ref(null)
const userinfoLoading = ref(false)
const userinfoError = ref(null)
const userinfoUpdatedAt = ref(null)

async function fetchUserinfo() {
  userinfoLoading.value = true
  userinfoError.value = null
  try {
    userinfo.value = await oktaAuth.getUser()
    userinfoUpdatedAt.value = Date.now()
  } catch (e) {
    userinfoError.value = e.message ?? 'Failed to fetch userinfo.'
  } finally {
    userinfoLoading.value = false
  }
}

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

</script>

<template>
  <main class="profile">
    <div class="layout">
      <div class="panel">
        <template v-if="authState?.isAuthenticated && authState.idToken">
          <ClaimPanel label="Profile">
            <dl>
              <dt>Name</dt>
              <dd>{{ authState.idToken.claims.name }}</dd>
              <dt>Email</dt>
              <dd>{{ authState.idToken.claims.email }}</dd>
              <dt>Subject</dt>
              <dd>{{ authState.idToken.claims.sub }}</dd>
            </dl>
          </ClaimPanel>

          <template v-for="{ claim, heading } in extraClaims" :key="claim">
            <ClaimPanel v-if="allClaims[claim] !== undefined" :label="heading">
              <ul v-if="Array.isArray(allClaims[claim])" class="claim-list">
                <li v-for="item in allClaims[claim]" :key="item">{{ item }}</li>
              </ul>
              <p v-else class="claim-value">{{ allClaims[claim] }}</p>
            </ClaimPanel>
          </template>

          <ClaimPanel label="Userinfo" :updated-at="userinfoUpdatedAt">
            <template #action>
              <button class="btn-fetch" :disabled="userinfoLoading" @click="fetchUserinfo">
                {{ userinfoLoading ? 'Loading…' : 'Fetch Userinfo' }}
              </button>
            </template>
            <p v-if="userinfoError" class="fetch-error">{{ userinfoError }}</p>
            <dl v-if="userinfo">
              <template v-for="(value, key) in userinfo" :key="key">
                <dt>{{ key }}</dt>
                <dd>{{ Array.isArray(value) ? value.join(', ') : value }}</dd>
              </template>
            </dl>
            <p v-else class="empty-hint">Press Fetch Userinfo to load.</p>
          </ClaimPanel>
        </template>
      </div>

      <div class="panel">
        <template v-if="authState?.isAuthenticated">
          <TokenPanel
            v-if="authState.accessToken"
            label="Access Token"
            :token="authState.accessToken.accessToken"
            :expires-at="authState.accessToken.expiresAt"
          />
          <TokenPanel
            v-if="authState.idToken"
            label="ID Token"
            :token="authState.idToken.idToken"
            :expires-at="authState.idToken.expiresAt"
          />
          <template v-if="authState.refreshToken">
            <div class="token-heading">
              <h2>Refresh Token</h2>
              <button class="btn-refresh" :disabled="refreshing" @click="refreshTokens">
                {{ refreshing ? 'Refreshing…' : 'Refresh' }}
              </button>
            </div>
            <p v-if="refreshError" class="refresh-error">{{ refreshError }}</p>
            <dl v-if="authState.refreshToken.expiresAt">
              <dt>Expires</dt>
              <dd>{{ new Date(authState.refreshToken.expiresAt * 1000).toLocaleString() }}</dd>
            </dl>
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

.token-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 2rem;
  margin-bottom: 0.75rem;
}

.token-heading h2 {
  margin: 0;
}

.btn-refresh {
  font-size: 0.8rem;
  font-weight: 500;
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text);
  border-radius: 6px;
  padding: 0.3rem 0.85rem;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-refresh:hover:not(:disabled) {
  opacity: 0.7;
}

.btn-refresh:disabled {
  opacity: 0.4;
  cursor: default;
}

.refresh-error {
  font-size: 0.85rem;
  color: #c0392b;
  margin: 0 0 0.75rem;
}

.btn-fetch {
  font-size: 0.85rem;
  font-weight: 500;
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text);
  border-radius: 6px;
  padding: 0.35rem 1rem;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-fetch:hover:not(:disabled) {
  opacity: 0.7;
}

.btn-fetch:disabled {
  opacity: 0.4;
  cursor: default;
}

.empty-hint {
  font-size: 0.9rem;
  opacity: 0.5;
  margin: 0;
}

.fetch-error {
  font-size: 0.85rem;
  color: #c0392b;
  margin: 0 0 0.5rem;
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

</style>
