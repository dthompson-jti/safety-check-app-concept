# Security Rule (Lethal Trifecta)

## Hard Stop Paths
If any change touches these paths, **STOP** and notify user:
- `/config/`
- `/security/`
- `/.github/`
- Any file with "secret", "key", or "token" in the name

## Prohibited Actions
1. **No Hardcoded Secrets**: Never commit API keys, passwords, or tokens
2. **No Unauthorized Dependencies**: Do not add new dependencies without explicit approval
3. **No Network Calls**: Do not add unauthorized external network requests

## Verification
Before completing any implementation:
- [ ] No secrets in code
- [ ] No new dependencies without approval
- [ ] No unauthorized network calls
