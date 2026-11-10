import { OktaAuth } from '@okta/okta-auth-js'

const rawScopes = import.meta.env.VITE_OKTA_SCOPES
const scopes = rawScopes ? rawScopes.split(' ').filter(Boolean) : ['openid', 'profile', 'email']

export const oktaAuth = new OktaAuth({
  issuer: import.meta.env.VITE_OKTA_ISSUER,
  clientId: import.meta.env.VITE_OKTA_CLIENT_ID,
  redirectUri: `${window.location.origin}/login/callback`,
  scopes,
})

// Separate client used only for the MyAccount API call. It uses the same
// authorization server as the main client but requests the MyAccount scope on
// demand, so sign-in still works if that scope can't be issued.
const orgIssuer = import.meta.env.VITE_OKTA_ISSUER
const MYACCOUNT_SCOPE = 'okta.myAccount.authenticators.read'

export const orgOktaAuth = new OktaAuth({
  issuer: orgIssuer,
  clientId: import.meta.env.VITE_OKTA_CLIENT_ID,
  redirectUri: `${window.location.origin}/login/callback`,
  scopes: ['openid', MYACCOUNT_SCOPE],
  tokenManager: { storageKey: 'okta-org-token-storage', autoRenew: false },
})

// Returns an org access token, reusing a cached one when still valid. Tries a silent
// request using the existing Okta session first, then falls back to a popup.
export async function getOrgAccessToken() {
  const cached = await orgOktaAuth.tokenManager.get('accessToken')
  if (
    cached &&
    !orgOktaAuth.tokenManager.hasExpired(cached) &&
    cached.scopes?.includes(MYACCOUNT_SCOPE)
  ) {
    return cached.accessToken
  }

  let tokens
  try {
    ;({ tokens } = await orgOktaAuth.token.getWithoutPrompt())
  } catch {
    ;({ tokens } = await orgOktaAuth.token.getWithPopup())
  }
  orgOktaAuth.tokenManager.setTokens(tokens)
  if (!tokens.accessToken.scopes?.includes(MYACCOUNT_SCOPE)) {
    throw new Error(
      `Okta issued a token without ${MYACCOUNT_SCOPE}. Granted scopes: ${tokens.accessToken.scopes?.join(' ') || 'none'}`,
    )
  }
  return tokens.accessToken.accessToken
}

// Drops the cached org tokens so the next call requests fresh ones.
export function clearOrgTokens() {
  orgOktaAuth.tokenManager.clear()
}

// Okta "enroll authenticator" flow: a full-page redirect to /authorize with
// prompt=enroll_authenticator and response_type=none. No tokens come back; Okta
// redirects to the redirect URI with state (and error/error_description on failure).
const ENROLL_STATE_KEY = 'okta-enroll-state'

export const enrollConfig = {
  clientId: import.meta.env.VITE_OKTA_ENROLL_CLIENT_ID,
  amrValues: import.meta.env.VITE_OKTA_ENROLL_AMR_VALUES || 'webauthn',
  redirectUri: import.meta.env.VITE_OKTA_ENROLL_REDIRECT_URI || `${window.location.origin}/profile`,
}

export function startEnrollment() {
  const state = crypto.randomUUID().replaceAll('-', '')
  sessionStorage.setItem(ENROLL_STATE_KEY, state)
  const params = new URLSearchParams({
    client_id: enrollConfig.clientId,
    response_type: 'none',
    prompt: 'enroll_authenticator',
    enroll_amr_values: enrollConfig.amrValues,
    // Okta rejects any other acr_values with prompt=enroll_authenticator.
    acr_values: 'urn:okta:loa:2fa:any:ifpossible',
    max_age: '0',
    redirect_uri: enrollConfig.redirectUri,
    state,
  })
  const orgUrl = new URL(import.meta.env.VITE_OKTA_ISSUER).origin
  window.location.assign(`${orgUrl}/oauth2/v1/authorize?${params}`)
}

// If the current URL is the return from startEnrollment, returns
// { ok, error, description } and clears the stored state; otherwise null.
export function consumeEnrollmentResult(query) {
  const expected = sessionStorage.getItem(ENROLL_STATE_KEY)
  if (!expected || query.state !== expected) return null
  sessionStorage.removeItem(ENROLL_STATE_KEY)
  return {
    ok: !query.error,
    error: query.error ?? null,
    description: query.error_description ?? null,
  }
}
