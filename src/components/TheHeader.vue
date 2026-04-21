<script setup>
import { useAuth } from '@okta/okta-vue'
import { inject } from 'vue'
import { RouterLink } from 'vue-router'

const oktaAuth = useAuth()
const authState = inject('okta.authState')

async function signIn() {
  await oktaAuth.signInWithRedirect({ originalUri: '/profile' })
}

async function signOut() {
  await oktaAuth.signOut()
}
</script>

<template>
  <header>
    <div class="inner">
      <RouterLink to="/" class="title">Tsokta Demo App</RouterLink>
      <nav>
        <template v-if="authState?.isAuthenticated">
          <RouterLink to="/profile">Profile</RouterLink>
          <button class="btn-action" @click="signOut">Sign Out</button>
        </template>
        <button v-else-if="authState && !authState.isAuthenticated" class="btn-action" @click="signIn">
          Sign In
        </button>
      </nav>
    </div>
  </header>
</template>

<style scoped>
header {
  border-bottom: 1px solid var(--color-border);
  background: var(--color-background-soft);
}

.inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 2rem;
  height: 56px;
}

.title {
  font-weight: 700;
  font-size: 1rem;
  color: var(--color-heading);
  text-decoration: none;
  padding: 0;
}

.title:hover {
  background: transparent;
}

nav {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

nav a {
  font-size: 0.9rem;
  color: var(--color-text);
  text-decoration: none;
  padding: 0;
}

nav a:hover {
  background: transparent;
  opacity: 0.7;
}

.btn-action {
  font-size: 0.9rem;
  font-weight: 600;
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text);
  border-radius: 6px;
  padding: 0.35rem 1rem;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-action:hover {
  opacity: 0.7;
}
</style>
