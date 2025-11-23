# Troubleshooting

This guide covers common issues and solutions you might encounter when working with Payload CMS.

## Dependency Mismatches

All `payload` and `@payloadcms/*` packages must be on exactly the same version and installed only once.

When two copies—or two different versions—of any of these packages (or of `react` / `react-dom`) appear in your dependency graph, you can see puzzling runtime errors. The most frequent is a broken React context:

```
TypeError: Cannot destructure property 'config' of...
```

This happens because one package imports a hook (most commonly `useConfig`) from **version A** while the context provider comes from **version B**. The fix is always the same: make sure every Payload-related and React package resolves to the same module.

### Confirm Whether Duplicates Exist

The first thing to do is to confirm whether duplicative dependencies do in fact exist. There are two ways to do this:

**Using pnpm's built-in inspection tool**

```bash
pnpm why @payloadcms/ui
```

This prints the dependency tree and shows which versions are being installed. If you see more than one distinct version—or the same version listed under different paths—you have duplication.

**Manual check (works with any package manager)**

```bash
find node_modules -name "package.json" -exec grep -H "'name': \"@payloadcms/ui\"" {} \;
```

Most of these hits are likely symlinks created by pnpm. Edit the matching package.json files (temporarily add a comment or change a description) to confirm whether they point to the same physical folder or to multiple copies.

Perform the same two checks for `react` and `react-dom`; a second copy of React can cause identical symptoms.

#### If No Duplicates Are Found

`@payloadcms/ui` intentionally contains two bundles of itself, so you may see dual paths even when everything is correct. Inside the Payload Admin UI you must import only:

- `@payloadcms/ui`
- `@payloadcms/ui/rsc`
- `@payloadcms/ui/shared`

Any other deep import such as `@payloadcms/ui/elements/Button` should **only** be used in your own frontend, outside of the Payload Admin Panel. Those deep entries are published un-bundled to help you tree-shake and ship a smaller client bundle if you only need a few components from `@payloadcms/ui`.

### Fixing Dependency Issues

These steps assume `pnpm`, which the Payload team recommends and uses internally. The principles apply to other package managers like npm and yarn as well. Do note that yarn 1.x is not supported by Payload.

**1. Pin every critical package to an exact version**

In `package.json` remove `^` or `~` from all versions of:
- `payload`
- `@payloadcms/*`
- `react`
- `react-dom`

Prefixes allow your package manager to float to a newer minor/patch release, causing mismatches.

**2. Delete node_modules**

Old packages often linger even after you change versions or removed them from your `package.json`. Deleting `node_modules` ensures a clean slate.

**3. Re-install dependencies**

```bash
pnpm install
```

#### If the Error Persists

**Clean the global store (pnpm only)**

```bash
pnpm store prune
```

**Delete the lockfile**

Depending on your package manager, this could be `pnpm-lock.yaml`, `package-lock.json`, or `yarn.lock`.

Make sure you delete the lockfile **and** the `node_modules` folder at the same time, then run `pnpm install`. This forces a fresh, consistent resolution for all packages. It will also update all packages with dynamic versions to the latest version.

While it's best practice to manage dependencies in such a way where the lockfile can easily be re-generated (often this is the easiest way to resolve dependency issues), this may break your project if you have not tested the latest versions of your dependencies.

If you are using a version control system, make sure to commit your lockfile after this step.

**Deduplicate anything that slipped through**

```bash
pnpm dedupe
```

**Still stuck?**

- Switch to `pnpm` if you are on npm. Its symlinked store helps reducing accidental duplication.
- Inspect the lockfile directly for peer-dependency violations.
- Check project-level `.npmrc` / `.pnpmfile.cjs` overrides.
- Run [Syncpack](https://www.npmjs.com/package/syncpack) to enforce identical versions of every `@payloadcms/*`, `react`, and `react-dom` reference.
- Absolute last resort: add Webpack aliases so that all imports of a given package resolve to the same path (e.g. `resolve.alias['react'] = path.resolve('./node_modules/react')`). Keep this only until you can fix the underlying version skew.

### Monorepos

Another error you might see is the following or similarly related to hooks, in particular when `next` versions are mismatched:

```
useUploadHandlers must be used within UploadHandlersProvider
```

This is a common pitfall when using a monorepo setup with multiple packages. In this case, ensure that all packages in the monorepo use the same version of `payload`, `@payloadcms/*`, `next`, `react`, and `react-dom`. You can use pnpm with workspaces to manage dependencies across packages in a monorepo effectively. Unfortunately this error becomes harder to debug inside a monorepo due to how package managers hoist dependencies as well as resolve them.

If you've pinned the versions and the error persists we recommend removing `.next/`, `node_modules/` and if possible deleting the lockfile and re-generating it to ensure that all packages in the monorepo are using the same version of the dependencies mentioned above.

## "Unauthorized, you must be logged in to make this request" When Attempting to Log In

This means that your auth cookie is not being set or accepted correctly upon logging in. To resolve check the following settings in your Payload Config:

- **CORS** - If you are using the '*', try to explicitly only allow certain domains instead including the one you have specified.
- **CSRF** - Do you have this set? if so, make sure your domain is whitelisted within the csrf domains. If not, probably not the issue, but probably can't hurt to whitelist it anyway.
- **Cookie settings**. If these are completely undefined, then that's fine. but if you have cookie domain set, or anything similar, make sure you don't have the domain misconfigured

This error likely means that the auth cookie that Payload sets after logging in successfully is being rejected because of misconfiguration.

To further investigate the issue:

1. Go to the login screen. Open your inspector. Go to the Network tab.
2. Log in and then find the login request that should appear in your network panel. Click the login request.
3. The login request should have a `Set-Cookie` header on the response, and the cookie should be getting set successfully. If it is not, most browsers generally have a little yellow ⚠️ symbol that you can hover over to see why the cookie was rejected.

## Using --experimental-https

If you are using the `--experimental-https` flag when starting your Payload server, you may run into issues with your WebSocket connection for HMR (Hot Module Reloading) in development mode.

To resolve this, you can set the `USE_HTTPS` environment variable to `true` in your `.env` file:

```env
USE_HTTPS=true
```

This will ensure that the WebSocket connection uses the correct protocol (`wss://` instead of `ws://`) when HTTPS is enabled.

Alternatively if more of your URL is dynamic, you can set the full URL for the WebSocket connection using the `PAYLOAD_HMR_URL_OVERRIDE` environment variable:

```env
PAYLOAD_HMR_URL_OVERRIDE=wss://localhost:3000/_next/webpack-hmr
```

## Common Solutions Summary

| Issue | Common Cause | Solution |
|-------|--------------|----------|
| React context errors | Duplicate packages or version mismatches | Pin versions, delete node_modules, reinstall |
| Hook provider errors | Mismatched versions in monorepos | Ensure consistent versions across all packages |
| Auth cookie errors | CORS/CSRF misconfiguration | Check cookie domains and CORS settings |
| WebSocket/HMR issues | Using experimental HTTPS | Set `USE_HTTPS=true` or `PAYLOAD_HMR_URL_OVERRIDE` |

## Getting Additional Help

If you're still experiencing issues after trying these solutions:

1. Check the [Payload GitHub Discussions](https://github.com/payloadcms/payload/discussions) for similar issues
2. Join the [Payload Discord Community](https://discord.com/invite/r6sCXqVk3v) for real-time help
3. [Search existing GitHub Issues](https://github.com/payloadcms/payload/issues) to see if your problem has been reported
4. Create a minimal reproduction case when reporting new issues

Remember to include:
- Payload version
- Node.js version
- Package manager (npm, yarn, pnpm)
- Relevant configuration files
- Complete error messages and stack traces