import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getNotesService,
  createNoteService,
  updateNoteService,
  deleteNoteService,
} from '../../services/notes.service';

export const fetchNotes = createAsyncThunk(
  'notes/fetchNotes',
  async (arg, { rejectWithValue }) => {
    const params = arg ?? {};
    try {
      return await getNotesService(params);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch notes');
    }
  }
);

export const addNote = createAsyncThunk(
  'notes/addNote',
  async (noteData, { rejectWithValue }) => {
    try {
      console.log('[DEBUG addNote thunk] calling createNoteService with:', noteData);
      const result = await createNoteService(noteData);
      console.log('[DEBUG addNote thunk] createNoteService returned:', result);
      return result;
    } catch (err) {
      console.error('[DEBUG addNote thunk] Error:', err);
      console.error('[DEBUG addNote thunk] Error response:', err.response?.data);
      return rejectWithValue(err.response?.data?.message || 'Failed to create note');
    }
  }
);

export const editNote = createAsyncThunk(
  'notes/editNote',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await updateNoteService(id, data);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update note');
    }
  }
);

export const removeNote = createAsyncThunk(
  'notes/removeNote',
  async (id, { rejectWithValue }) => {
    try {
      await deleteNoteService(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete note');
    }
  }
);

const normalizeFetchResponse = (payload) => {
  // ✅ Handle ApiResponse structure: { statusCode, data: {...}, message, success }
  // Extract the data property if it exists (backend wraps in ApiResponse)
  let dataObj = payload?.data ?? payload ?? {};
  
  // Extract notes array from various possible locations
  let notes = [];
  if (Array.isArray(dataObj?.notes)) {
    notes = dataObj.notes;
  } else if (Array.isArray(dataObj)) {
    notes = dataObj;
  }

  // Ensure pagination fields always exist
  const total = dataObj?.total ?? notes.length;
  const limit = dataObj?.limit ?? 10;
  const page = dataObj?.page ?? 1;
  
  return {
    notes: notes,
    page: page,
    limit: limit,
    total: total,
    totalPages: dataObj?.totalPages ?? (Math.ceil(total / limit) || 1),
  };
};

const normalizeSingleNote = (payload) => {
  // ✅ Handle ApiResponse structure where data property wraps the note
  return payload?.data ?? payload;
};

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
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    clearNotesError: (state) => {
      state.error = null;
    },
    resetNotes: (state) => {
      state.notes = [];
      state.pagination = { page: 1, limit: 10, total: 0, totalPages: 0 };
    },

    noteCreatedFromSocket: (state, action) => {
      const exists = state.notes.some((n) => n._id === action.payload._id);
      if (!exists) {
        state.notes.unshift(action.payload);
        state.pagination.total += 1;
      }
    },

    noteUpdatedFromSocket: (state, action) => {
      const index = state.notes.findIndex((n) => n._id === action.payload._id);
      if (index !== -1) {
        state.notes[index] = action.payload;
      }
    },

    noteDeletedFromSocket: (state, action) => {
      const exists = state.notes.some((n) => n._id === action.payload);
      if (exists) {
        state.notes = state.notes.filter((n) => n._id !== action.payload);
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      }
    },
  },
  extraReducers: (builder) => {
    builder
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
        state.isSearching = false;

        const normalized = normalizeFetchResponse(action.payload);

        state.notes = normalized.notes;
        state.pagination = {
          page: normalized.page,
          limit: normalized.limit,
          total: normalized.total,
          totalPages: normalized.totalPages,
        };
      })
      .addCase(fetchNotes.rejected, (state, action) => {
        state.isInitialLoading = false;
        state.isSearching = false;
        state.error = action.payload;
      })

      .addCase(addNote.pending, (state) => {
        state.loading = true;
      })
      .addCase(addNote.fulfilled, (state, action) => {
        state.loading = false;
        console.log('[DEBUG addNote fulfilled] action.payload:', action.payload);
        const note = normalizeSingleNote(action.payload);
        console.log('[DEBUG addNote fulfilled] normalized note:', note);
        
        if (!note || !note._id) {
          console.error('[DEBUG addNote fulfilled] ERROR: note or note._id is missing!');
          return;
        }

        const exists = state.notes.some((n) => n._id === note._id);
        if (!exists) {
          state.notes.unshift(note);
          state.pagination.total += 1;
          console.log('[DEBUG addNote fulfilled] Note added to state. Total notes:', state.notes.length);
        } else {
          console.log('[DEBUG addNote fulfilled] Note already exists, skipping');
        }
      })
      .addCase(addNote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error('[DEBUG addNote rejected] Error:', action.payload);
      })

      .addCase(editNote.pending, (state) => {
        state.loading = true;
      })
      .addCase(editNote.fulfilled, (state, action) => {
        state.loading = false;
        const updated = normalizeSingleNote(action.payload);
        const index = state.notes.findIndex((n) => n._id === updated._id);

        if (index !== -1) {
          state.notes[index] = updated;
        }
      })
      .addCase(editNote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(removeNote.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeNote.fulfilled, (state, action) => {
        state.loading = false;

        const exists = state.notes.some((n) => n._id === action.payload);
        if (exists) {
          state.notes = state.notes.filter((n) => n._id !== action.payload);
          state.pagination.total = Math.max(0, state.pagination.total - 1);
        }
      })
      .addCase(removeNote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
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