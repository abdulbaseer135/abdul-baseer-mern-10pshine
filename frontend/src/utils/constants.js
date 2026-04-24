export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const ROUTES = {
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
};

export const NOTE_TITLE_MAX_LENGTH = 100;
export const NOTE_CONTENT_PREVIEW_LENGTH = 150;