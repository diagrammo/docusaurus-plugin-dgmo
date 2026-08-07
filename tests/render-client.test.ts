import { describe, it, expect, beforeEach } from 'vitest';
import { onRouteDidUpdate } from '../src/docusaurus-render-client.js';

/**
 * The registry key and the event are `remark-dgmo`'s published handshake — two
 * separately-bundled files meet on a global because a host may concatenate them.
 * Asserting the global here is asserting the contract, not an implementation
 * detail.
 */
const REGISTRY_KEY = '__dgmoReferenceRenderer';

type RegistryHost = { [REGISTRY_KEY]?: unknown };

describe('the opt-in render client', () => {
  beforeEach(() => {
    delete (globalThis as RegistryHost)[REGISTRY_KEY];
  });

  it('registers a renderer Docusaurus can reach', async () => {
    expect((globalThis as RegistryHost)[REGISTRY_KEY]).toBeUndefined();
    onRouteDidUpdate();
    // The import is dynamic, so registration lands a microtask later — which is
    // also the proof it survived bundling rather than being elided.
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(typeof (globalThis as RegistryHost)[REGISTRY_KEY]).toBe('function');
  });

  it('registers once, however many route changes fire', async () => {
    onRouteDidUpdate();
    await new Promise((resolve) => setTimeout(resolve, 0));
    const first = (globalThis as RegistryHost)[REGISTRY_KEY];
    onRouteDidUpdate();
    onRouteDidUpdate();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect((globalThis as RegistryHost)[REGISTRY_KEY]).toBe(first);
  });
});
