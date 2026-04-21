import { OktaAuth } from '@okta/okta-auth-js'

const rawScopes = import.meta.env.VITE_OKTA_SCOPES
const scopes = rawScopes ? rawScopes.split(' ').filter(Boolean) : ['openid', 'profile', 'email']

export const oktaAuth = new OktaAuth({
  issuer: import.meta.env.VITE_OKTA_ISSUER,
  clientId: import.meta.env.VITE_OKTA_CLIENT_ID,
  redirectUri: `${window.location.origin}/login/callback`,
  scopes,
})
