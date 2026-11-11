# Maestro E2E tests

End-to-end tests that drive the real app on an Android emulator, using the same
accessibility labels TalkBack reads.

| Flow | What it checks |
|---|---|
| `01_sign_in_errors.yaml` | Empty sign-in shows a text error under each field (WCAG 3.3.1) |
| `02_auth_links.yaml` | Create account and Forgot password links open the right screens |
| `03_home_tabs.yaml` | Signed in: Home's info buttons have names, every bottom tab opens (WCAG 1.1.1, 4.1.2) |

## Run

1. Install Maestro: `curl -fsSL "https://get.maestro.mobile.dev" | bash`
2. Start the emulator and install the app (React Native also needs Metro running).
3. From this app's folder:

```bash
maestro test .maestro --exclude-tags=login
```

To include the signed-in flow, pass a test account (never commit real credentials):

```bash
maestro test -e PACE_USERNAME=yourname -e PACE_PASSWORD=yourpassword .maestro
```
