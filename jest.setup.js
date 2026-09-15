/* global afterEach, jest */

// Setup file for Jest tests in TEGA Bus frontend

// Polyfill or ensure fetch is available
if (!global.fetch) {
  global.fetch = jest.fn();
}

// Track and clean up any timers left open by production code
const activeTimeouts = new Set();
const originalSetTimeout = global.setTimeout;
const originalClearTimeout = global.clearTimeout;

global.setTimeout = (fn, delay, ...args) => {
  const id = originalSetTimeout(fn, delay, ...args);
  activeTimeouts.add(id);
  return id;
};

global.clearTimeout = (id) => {
  activeTimeouts.delete(id);
  originalClearTimeout(id);
};

// Reset mocks and clear all active timers after each test
afterEach(() => {
  jest.clearAllMocks();
  for (const id of activeTimeouts) {
    originalClearTimeout(id);
  }
  activeTimeouts.clear();
});
