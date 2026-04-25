import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loginService, signupService } from '../../services/auth.service';
import { getProfileService, updateProfileService, deleteProfileService, changePasswordService } from '../../services/profile.service';

// Thunks
export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    return await loginService(credentials);
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const register = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    return await signupService(userData);
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

export const fetchProfile = createAsyncThunk('auth/fetchProfile', async (_, { rejectWithValue }) => {
  try {
    return await getProfileService();
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch profile');
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (data, { rejectWithValue }) => {
  try {
    return await updateProfileService(data);
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update profile');
  }
});

export const changePassword = createAsyncThunk('auth/changePassword', async (data, { rejectWithValue }) => {
  try {
    return await changePasswordService(data);
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to change password');
  }
});

export const deleteAccount = createAsyncThunk('auth/deleteAccount', async (_, { rejectWithValue }) => {
  try {
    return await deleteProfileService();
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete account');
  }
});

// ✅ Safe localStorage helper
const getStoredToken = () => {
  try {
    return localStorage.getItem('token') || null;
  } catch {
    return null;
  }
};

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: getStoredToken(),
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      try { localStorage.removeItem('token'); } catch {}
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending,    (state) => { state.loading = true; state.error = null; })
      .addCase(login.fulfilled,  (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user  = action.payload.user;
        try { localStorage.setItem('token', action.payload.token); } catch {}
      })
      .addCase(login.rejected,   (state, action) => { state.loading = false; state.error = action.payload; })

      // Register
      .addCase(register.pending,    (state) => { state.loading = true; state.error = null; })
      .addCase(register.fulfilled,  (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user  = action.payload.user;
        try { localStorage.setItem('token', action.payload.token); } catch {}
      })
      .addCase(register.rejected,   (state, action) => { state.loading = false; state.error = action.payload; })

      // Fetch Profile
      .addCase(fetchProfile.pending,   (state) => { state.loading = true; })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;        // ✅ FIXED — was action.payload.data
      })
      .addCase(fetchProfile.rejected,  (state, action) => { state.loading = false; state.error = action.payload; })

      // Update Profile
      .addCase(updateProfile.pending,   (state) => { state.loading = true; })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;        // ✅ FIXED — was action.payload.data
      })
      .addCase(updateProfile.rejected,  (state, action) => { state.loading = false; state.error = action.payload; })

      // Change Password
      .addCase(changePassword.pending,   (state) => { state.loading = true; state.error = null; })
      .addCase(changePassword.fulfilled, (state) => { state.loading = false; })
      .addCase(changePassword.rejected,  (state, action) => { state.loading = false; state.error = action.payload; })

      // Delete Account
      .addCase(deleteAccount.fulfilled, (state) => {
        state.user  = null;
        state.token = null;
        try { localStorage.removeItem('token'); } catch {}
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;