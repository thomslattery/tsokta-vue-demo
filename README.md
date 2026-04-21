# Tsokta Vue Demo App

A Vue 3 app for testing and demonstrating OAuth/OIDC functionality with Okta. After signing in, the profile page displays identity claims, decoded tokens, and the result of the userinfo endpoint.

## Prerequisites

- Node.js 20.19 or later
- An Okta account with a configured application and authorization server

## Configuration

Create a `.env.local` file in the project root. This file is gitignored and is the right place for secrets.

```sh
cp .env.example .env.local
```

Then fill in the values:

| Variable | Required | Description |
|---|---|---|
| `VITE_OKTA_ISSUER` | Yes | Issuer URL of your custom authorization server, e.g. `https://your-domain.okta.com/oauth2/your-auth-server-id` |
| `VITE_OKTA_CLIENT_ID` | Yes | Client ID of your Okta application |
| `VITE_OKTA_SCOPES` | No | Space-separated list of scopes to request. Defaults to `openid profile email` |
| `VITE_OKTA_PROFILE_CLAIMS` | No | Comma-separated list of `claim:Heading` pairs to display as additional sections on the profile page (see below) |

### Okta Application Setup

In your Okta admin console:

1. Create a **Single-Page Application (SPA)**.
2. Add `http://localhost:5173/login/callback` to the **Sign-in redirect URIs**.
3. Add `http://localhost:5173` to the **Sign-out redirect URIs**.
4. Note the **Client ID** and the **Issuer URI** of your authorization server.

### Extra Profile Claims

`VITE_OKTA_PROFILE_CLAIMS` lets you surface additional token claims as labelled sections in the left column of the profile page. Each entry is a `claim:Heading` pair. Multiple entries are separated by commas.

```
VITE_OKTA_PROFILE_CLAIMS=groups:Group Membership,department:Department
```

Array values (e.g. `groups`) are rendered as a list. Scalar values are rendered as plain text. Claims not present in the token are silently omitted.

To include a claim, make sure it is configured to be included in the ID or access token in your Okta authorization server's claim settings, and that the relevant scope is listed in `VITE_OKTA_SCOPES`.

## Running the App

Install dependencies:

```sh
npm install
```

Start the development server:

```sh
npm run dev
```

The app will be available at `http://localhost:5173`.

## Other Commands

| Command | Description |
|---|---|
| `npm run build` | Compile and minify for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Lint and auto-fix with ESLint and oxlint |
| `npm run format` | Format source files with Prettier |
