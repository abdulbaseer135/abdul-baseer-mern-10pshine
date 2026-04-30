import { createSlice } from '@reduxjs/toolkit';


// ✅ Read theme before React mounts — syncs with anti-flash script
const getInitialTheme = () => {
  try {
    const stored = localStorage.getItem('theme');
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light'; // fallback if localStorage blocked
  }
};


const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    mode: getInitialTheme(), // 'light' | 'dark'
  },
  reducers: {

    // ✅ Toggle between light and dark
    toggleTheme: (state) => {
      state.mode = state.mode === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', state.mode);
      document.documentElement.classList.toggle('dark', state.mode === 'dark');
    },

    // ✅ Set a specific theme directly
    setTheme: (state, action) => {
      state.mode = action.payload; // 'light' | 'dark'
      localStorage.setItem('theme', state.mode);
      document.documentElement.classList.toggle('dark', state.mode === 'dark');
    },

  },
});


export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;