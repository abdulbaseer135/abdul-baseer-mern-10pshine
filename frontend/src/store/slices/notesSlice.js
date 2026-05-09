import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getNotesService, createNoteService, updateNoteService, deleteNoteService } from '../../services/notes.service';


// Thunks
export const fetchNotes = createAsyncThunk('notes/fetchNotes', async (params = {}, { rejectWithValue }) => {
  try {
    return await getNotesService(params);
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch notes');
  }
});


export const addNote = createAsyncThunk('notes/addNote', async (noteData, { rejectWithValue }) => {
  try {
    return await createNoteService(noteData);
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create note');
  }
});


export const editNote = createAsyncThunk('notes/editNote', async ({ id, data }, { rejectWithValue }) => {
  try {
    return await updateNoteService(id, data);
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update note');
  }
});


export const removeNote = createAsyncThunk('notes/removeNote', async (id, { rejectWithValue }) => {
  try {
    await deleteNoteService(id);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete note');
  }
});


// Slice
const notesSlice = createSlice({
  name: 'notes',
  initialState: {
    notes: [],
    pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    isInitialLoading: false,
    isSearching: false,
    loading: false,
    error: null,
    searchQuery: '',
  },
  reducers: {
    setSearchQuery:  (state, action) => { state.searchQuery = action.payload; },
    clearNotesError: (state) => { state.error = null; },
    resetNotes: (state) => {
      state.notes = [];
      state.pagination = { page: 1, limit: 10, total: 0, totalPages: 0 };
    },

    // ─── Socket real-time reducers ─────────────────────────────────
    noteCreatedFromSocket: (state, action) => {
      // ✅ Guard: socket fires AFTER addNote.fulfilled already added it
      // so only add if not already present in state
      const exists = state.notes.some((n) => n._id === action.payload._id);
      if (!exists) {
        state.notes.unshift(action.payload);
        state.pagination.total += 1;
      }
    },

    noteUpdatedFromSocket: (state, action) => {
      const index = state.notes.findIndex((n) => n._id === action.payload._id);
      if (index !== -1) state.notes[index] = action.payload;
    },

    noteDeletedFromSocket: (state, action) => {
      const exists = state.notes.some((n) => n._id === action.payload);
      if (exists) {
        // ✅ Guard: only update total if note was actually in current page
        state.notes = state.notes.filter((n) => n._id !== action.payload);
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      }
    },
  },

  extraReducers: (builder) => {
    builder
      // ─── Fetch Notes ───────────────────────────────────────────────
      .addCase(fetchNotes.pending, (state, action) => {
        state.error = null;
        if (action.meta.arg?.isInitial) {
          state.isInitialLoading = true;
        } else {
          state.isSearching = true;
        }
      })
      .addCase(fetchNotes.fulfilled, (state, action) => {
        state.isInitialLoading = false;
        state.isSearching      = false;

        const d = action.payload.data ?? action.payload;

        state.notes = d.notes ?? d;

        state.pagination = {
          page:       d.page       ?? state.pagination.page,
          limit:      d.limit      ?? state.pagination.limit,
          total:      d.total      ?? state.pagination.total,
          totalPages: d.totalPages ?? state.pagination.totalPages,
        };
      })
      .addCase(fetchNotes.rejected, (state, action) => {
        state.isInitialLoading = false;
        state.isSearching      = false;
        state.error            = action.payload;
      })

      // ─── Add Note ──────────────────────────────────────────────────
      .addCase(addNote.pending,   (state) => { state.loading = true; })
      .addCase(addNote.fulfilled, (state, action) => {
        state.loading = false;
        const note = action.payload.data ?? action.payload;
        // ✅ Guard: socket may have already added this note
        // so check before inserting to prevent duplicate key warning
        const exists = state.notes.some((n) => n._id === note._id);
        if (!exists) {
          state.notes.unshift(note);
          state.pagination.total += 1;
        }
      })
      .addCase(addNote.rejected,  (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      })

      // ─── Edit Note ─────────────────────────────────────────────────
      .addCase(editNote.pending,   (state) => { state.loading = true; })
      .addCase(editNote.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload.data ?? action.payload;
        const index   = state.notes.findIndex((n) => n._id === updated._id);
        if (index !== -1) state.notes[index] = updated;
      })
      .addCase(editNote.rejected,  (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      })

      // ─── Remove Note ───────────────────────────────────────────────
      .addCase(removeNote.pending,   (state) => { state.loading = true; })
      .addCase(removeNote.fulfilled, (state, action) => {
        state.loading  = false;
        // ✅ Guard: socket may have already removed it
        const exists = state.notes.some((n) => n._id === action.payload);
        if (exists) {
          state.notes = state.notes.filter((n) => n._id !== action.payload);
          state.pagination.total = Math.max(0, state.pagination.total - 1);
        }
      })
      .addCase(removeNote.rejected,  (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      });
  },
});


export const {
  setSearchQuery,
  clearNotesError,
  resetNotes,
  noteCreatedFromSocket,
  noteUpdatedFromSocket,
  noteDeletedFromSocket,
} = notesSlice.actions;


export default notesSlice.reducer;