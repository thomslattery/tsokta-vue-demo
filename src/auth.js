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
