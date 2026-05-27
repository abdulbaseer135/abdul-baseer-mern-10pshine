import '@testing-library/jest-dom';

// Silence React Router v6 future flag warnings in all tests
const originalWarn = console.warn.bind(console);
console.warn = (msg, ...args) => {
  if (
    typeof msg === 'string' &&
    (msg.includes('v7_startTransition') || msg.includes('v7_relativeSplatPath'))
  ) {
    return;
  }
  originalWarn(msg, ...args);
};
