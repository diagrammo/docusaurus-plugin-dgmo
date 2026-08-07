import { describe, it, expect } from 'vitest';
import { onRouteDidUpdate } from '../src/docusaurus-render-client.js';

/**
 * The registry key and the event are `remark-dgmo`'s published handshake — two
 * separately-bundled files meet on a global because a host may concatenate them.
 * Asserting the global here is asserting the contract, not an implementation
 * detail.
 */
const REGISTRY_KEY = '__dgmoReferenceRenderer';

type RegistryHost = { [REGISTRY_KEY]?: unknown };

/**
 * Poll rather than await the import here. Awaiting
 * `import('remark-dgmo/client-render.js')` in the test would REGISTER the
 * renderer itself, so the assertion would pass against a `onRouteDidUpdate`
 * that did nothing at all — the exact failure this file exists to catch. A
 * single `setTimeout(0)` was the first attempt and proved flaky: whether a cold
 * dynamic import resolves within one macrotask is not something to assert.
 */
async function waitForRegistration(timeoutMs = 2000): Promise<unknown> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const registered = (globalThis as RegistryHost)[REGISTRY_KEY];
    if (registered) return registered;
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
  return undefined;
}

/**
 * One test, in order, rather than two: registering is once-per-page-load module
 * state, so a second test cannot ask for a fresh registration — it would find
 * the guard already tripped and hang waiting for a global that will never be
 * set again. Splitting these is what makes the suite flaky, not what makes it
 * thorough.
 */
describe('the opt-in render client', () => {
  it('registers a renderer Docusaurus can reach, exactly once', async () => {
    expect((globalThis as RegistryHost)[REGISTRY_KEY]).toBeUndefined();

    onRouteDidUpdate();
    const registered = await waitForRegistration();
    expect(typeof registered).toBe('function');

    // Docusaurus fires this on every SPA route change; the renderer is already
    // there and must not be swapped for a second thunk.
    onRouteDidUpdate();
    onRouteDidUpdate();
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect((globalThis as RegistryHost)[REGISTRY_KEY]).toBe(registered);
  });
});
