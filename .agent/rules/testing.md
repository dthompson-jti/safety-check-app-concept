# Testing Rule

Always run verification before completing any implementation.

## Required Commands
Adapt these to your project's specific commands:
```bash
# Examples - adjust to your project
npm run lint
npm run build
# or
yarn lint
yarn build
# or
pnpm lint
pnpm build
```

## Error Handling
If lint or build fails:
1. Parse the error
2. Fix the issue
3. Re-run verification
4. Maximum 3 attempts before escalating to user

## No New Errors
Do not introduce new lint errors. If an existing lint error is discovered, note it but focus on the current task.
