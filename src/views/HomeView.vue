<script setup>
import { useAuth } from '@okta/okta-vue'
import { useRouter } from 'vue-router'

const { authState, oktaAuth } = useAuth()
const router = useRouter()

async function login() {
  await oktaAuth.signInWithRedirect({ originalUri: '/profile' })
}

function goToProfile() {
  router.push('/profile')
}
</script>

<template>
  <main class="home">
    <div class="content">
      <h1>Welcome</h1>
      <p>Sign in to continue.</p>
      <button v-if="authState?.isAuthenticated" class="btn" @click="goToProfile">
        Go to Profile
      </button>
      <button v-else class="btn" :disabled="!authState" @click="login">Sign In</button>
    </div>
  </main>
</template>

<style scoped>
.home {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.content {
  text-align: center;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

p {
  color: var(--color-text);
  margin-bottom: 2rem;
}

.btn {
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  background-color: var(--color-text);
  color: var(--vt-c-white);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn:hover:not(:disabled) {
  opacity: 0.85;
}

.btn:disabled {
  opacity: 0.4;
  cursor: default;
}
</style>
