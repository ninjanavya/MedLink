import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { interactionService } from '../../services/interactionService';
import { MockInteraction, MockHCP } from '../../utils/mockData';
import { addToast } from './toastSlice';

export interface InteractionDraft {
  hcp_name: string;
  hospital: string;
  specialty: string;
  interaction_type: string;
  products_discussed: string[];
  interaction_date: string;
  follow_up_date: string;
  priority: 'Low' | 'Medium' | 'High';
  notes: string;
}

interface InteractionState {
  interactions: MockInteraction[];
  hcps: MockHCP[];
  dashboardStats: {
    todays_visits: number;
    pending_followups: number;
    high_priority_hcps: number;
    completed_interactions: number;
    weekly_visits: number;
    monthly_interactions: number;
    top_products: string[];
    top_hcps: string[];
    followup_completion_rate: number;
    ai_insights: string[];
  } | null;
  currentDraft: InteractionDraft;
  draftLastSaved: string | null;
  loading: boolean;
  statsLoading: boolean;
  error: string | null;
}

const defaultDraft: InteractionDraft = {
  hcp_name: '',
  hospital: '',
  specialty: '',
  interaction_type: 'In-Person',
  products_discussed: [],
  interaction_date: new Date().toISOString().split('T')[0],
  follow_up_date: '',
  priority: 'Medium',
  notes: ''
};

const initialState: InteractionState = {
  interactions: [],
  hcps: [],
  dashboardStats: null,
  currentDraft: { ...defaultDraft },
  draftLastSaved: null,
  loading: false,
  statsLoading: false,
  error: null
};

// Async Thunks
export const fetchInteractions = createAsyncThunk(
  'interactions/fetchInteractions',
  async (_, { rejectWithValue }) => {
    try {
      return await interactionService.getInteractions();
    } catch (e: any) {
      return rejectWithValue(e.message || 'Failed to fetch interactions');
    }
  }
);

export const createInteraction = createAsyncThunk(
  'interactions/createInteraction',
  async (interaction: Omit<MockInteraction, 'id'>, { dispatch, rejectWithValue }) => {
    try {
      const res = await interactionService.createInteraction(interaction);
      dispatch(addToast({ message: `Logged interaction for Dr. ${res.hcp_name}`, type: 'success' }));
      dispatch(fetchDashboardStats()); // refresh stats
      return res;
    } catch (e: any) {
      dispatch(addToast({ message: 'Failed to log interaction', type: 'error' }));
      return rejectWithValue(e.message || 'Failed to create interaction');
    }
  }
);

export const updateInteraction = createAsyncThunk(
  'interactions/updateInteraction',
  async ({ id, data }: { id: number; data: Partial<MockInteraction> }, { dispatch, rejectWithValue }) => {
    try {
      const res = await interactionService.updateInteraction(id, data);
      dispatch(addToast({ message: 'Updated interaction record', type: 'success' }));
      dispatch(fetchDashboardStats());
      return res;
    } catch (e: any) {
      dispatch(addToast({ message: 'Failed to update interaction', type: 'error' }));
      return rejectWithValue(e.message || 'Failed to update interaction');
    }
  }
);

export const deleteInteraction = createAsyncThunk(
  'interactions/deleteInteraction',
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      await interactionService.deleteInteraction(id);
      dispatch(addToast({ message: 'Deleted interaction record', type: 'success' }));
      dispatch(fetchDashboardStats());
      return id;
    } catch (e: any) {
      dispatch(addToast({ message: 'Failed to delete interaction', type: 'error' }));
      return rejectWithValue(e.message || 'Failed to delete interaction');
    }
  }
);

export const fetchHCPs = createAsyncThunk(
  'interactions/fetchHCPs',
  async (_, { rejectWithValue }) => {
    try {
      return await interactionService.getHCPs();
    } catch (e: any) {
      return rejectWithValue(e.message || 'Failed to fetch HCPs');
    }
  }
);

export const fetchDashboardStats = createAsyncThunk(
  'interactions/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      return await interactionService.getDashboardStats();
    } catch (e: any) {
      return rejectWithValue(e.message || 'Failed to fetch stats');
    }
  }
);

const interactionSlice = createSlice({
  name: 'interactions',
  initialState,
  reducers: {
    updateDraft: (state, action: PayloadAction<Partial<InteractionDraft>>) => {
      state.currentDraft = { ...state.currentDraft, ...action.payload };
      state.draftLastSaved = new Date().toLocaleTimeString();
    },
    clearDraft: (state) => {
      state.currentDraft = { ...defaultDraft };
      state.draftLastSaved = null;
    },
    loadInteractionIntoDraft: (state, action: PayloadAction<MockInteraction>) => {
      const item = action.payload;
      state.currentDraft = {
        hcp_name: item.hcp_name,
        hospital: item.hospital,
        specialty: item.specialty,
        interaction_type: item.interaction_type,
        products_discussed: item.products_discussed ? item.products_discussed.split(',').map(p => p.trim()) : [],
        interaction_date: item.interaction_date,
        follow_up_date: item.follow_up_date || '',
        priority: item.priority,
        notes: item.notes || ''
      };
      state.draftLastSaved = new Date().toLocaleTimeString();
    }
  },
  extraReducers: (builder) => {
    // getInteractions
    builder.addCase(fetchInteractions.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchInteractions.fulfilled, (state, action: PayloadAction<MockInteraction[]>) => {
      state.loading = false;
      state.interactions = action.payload;
    });
    builder.addCase(fetchInteractions.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // createInteraction
    builder.addCase(createInteraction.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(createInteraction.fulfilled, (state, action: PayloadAction<MockInteraction>) => {
      state.loading = false;
      state.interactions = [action.payload, ...state.interactions];
    });
    builder.addCase(createInteraction.rejected, (state) => {
      state.loading = false;
    });

    // updateInteraction
    builder.addCase(updateInteraction.fulfilled, (state, action: PayloadAction<MockInteraction>) => {
      const idx = state.interactions.findIndex(i => i.id === action.payload.id);
      if (idx !== -1) {
        state.interactions[idx] = action.payload;
      }
    });

    // deleteInteraction
    builder.addCase(deleteInteraction.fulfilled, (state, action: PayloadAction<number>) => {
      state.interactions = state.interactions.filter(i => i.id !== action.payload);
    });

    // fetchHCPs
    builder.addCase(fetchHCPs.fulfilled, (state, action: PayloadAction<MockHCP[]>) => {
      state.hcps = action.payload;
    });

    // fetchDashboardStats
    builder.addCase(fetchDashboardStats.pending, (state) => {
      state.statsLoading = true;
    });
    builder.addCase(fetchDashboardStats.fulfilled, (state, action: PayloadAction<any>) => {
      state.statsLoading = false;
      state.dashboardStats = action.payload;
    });
    builder.addCase(fetchDashboardStats.rejected, (state) => {
      state.statsLoading = false;
    });
  }
});

export const { updateDraft, clearDraft, loadInteractionIntoDraft } = interactionSlice.actions;
export default interactionSlice.reducer;
