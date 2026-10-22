export const redirectToLogin = () => {
  if (globalThis.location && globalThis.location.pathname !== '/login') {
    globalThis.location.assign('/login');
  }
};
