<script setup>
import { useAuth } from '@okta/okta-vue'

const { authState, oktaAuth } = useAuth()

async function signOut() {
  await oktaAuth.signOut()
}
</script>

<template>
  <main class="profile">
    <div class="card">
      <h1>Profile</h1>
      <template v-if="authState?.isAuthenticated && authState.idToken">
        <dl>
          <dt>Name</dt>
          <dd>{{ authState.idToken.claims.name }}</dd>
          <dt>Email</dt>
          <dd>{{ authState.idToken.claims.email }}</dd>
          <dt>Subject</dt>
          <dd>{{ authState.idToken.claims.sub }}</dd>
        </dl>
      </template>
      <button class="btn btn-outline" @click="signOut">Sign Out</button>
    </div>
  </main>
</template>

<style scoped>
.profile {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.card {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 2.5rem 3rem;
  min-width: 320px;
}

h1 {
  font-size: 1.75rem;
  margin-bottom: 1.5rem;
}

dl {
  margin-bottom: 2rem;
}

dt {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text);
  opacity: 0.6;
  margin-top: 1rem;
}

dt:first-child {
  margin-top: 0;
}

dd {
  margin: 0.25rem 0 0;
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
