import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { hcpService } from '../../services/hcpService';
import { MockHCP } from '../../utils/mockData';
import { addToast } from './toastSlice';
import { fetchInteractions } from './interactionSlice';

interface HCPState {
  doctors: MockHCP[];
  selectedDoctor: MockHCP | null;
  loading: boolean;
  error: string | null;
  searchTerm: string;
  specialtyFilter: string;
  hospitalFilter: string;
}

const initialState: HCPState = {
  doctors: [],
  selectedDoctor: null,
  loading: false,
  error: null,
  searchTerm: '',
  specialtyFilter: 'All',
  hospitalFilter: 'All'
};

// Async Thunks
export const fetchHCPs = createAsyncThunk(
  'hcps/fetchHCPs',
  async (_, { rejectWithValue }) => {
    try {
      return await hcpService.getHCPs();
    } catch (e: any) {
      return rejectWithValue(e.message || 'Failed to fetch HCPs');
    }
  }
);

export const createHCP = createAsyncThunk(
  'hcps/createHCP',
  async (hcp: Omit<MockHCP, 'id'>, { dispatch, rejectWithValue }) => {
    try {
      const res = await hcpService.createHCP(hcp);
      dispatch(addToast({ message: `Created HCP profile for Dr. ${res.name}`, type: 'success' }));
      dispatch(fetchHCPs());
      return res;
    } catch (e: any) {
      dispatch(addToast({ message: 'Failed to create HCP profile', type: 'error' }));
      return rejectWithValue(e.message || 'Failed to create HCP');
    }
  }
);

export const updateHCP = createAsyncThunk(
  'hcps/updateHCP',
  async ({ id, data }: { id: number; data: Partial<MockHCP> }, { dispatch, rejectWithValue }) => {
    try {
      const res = await hcpService.updateHCP(id, data);
      dispatch(addToast({ message: `Updated doctor details for Dr. ${res.name}`, type: 'success' }));
      dispatch(fetchHCPs());
      dispatch(fetchInteractions()); // refresh de-normalized fields in timeline
      return res;
    } catch (e: any) {
      dispatch(addToast({ message: 'Failed to update doctor details', type: 'error' }));
      return rejectWithValue(e.message || 'Failed to update HCP');
    }
  }
);

export const deleteHCP = createAsyncThunk(
  'hcps/deleteHCP',
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      await hcpService.deleteHCP(id);
      dispatch(addToast({ message: 'Doctor profile deleted successfully', type: 'success' }));
      dispatch(fetchHCPs());
      dispatch(fetchInteractions()); // interactions also cascade-deleted on backend
      return id;
    } catch (e: any) {
      dispatch(addToast({ message: 'Failed to delete doctor profile', type: 'error' }));
      return rejectWithValue(e.message || 'Failed to delete HCP');
    }
  }
);

const hcpSlice = createSlice({
  name: 'hcps',
  initialState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setSpecialtyFilter: (state, action: PayloadAction<string>) => {
      state.specialtyFilter = action.payload;
    },
    setHospitalFilter: (state, action: PayloadAction<string>) => {
      state.hospitalFilter = action.payload;
    },
    setSelectedDoctor: (state, action: PayloadAction<MockHCP | null>) => {
      state.selectedDoctor = action.payload;
    },
    clearFilters: (state) => {
      state.searchTerm = '';
      state.specialtyFilter = 'All';
      state.hospitalFilter = 'All';
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch HCPs
      .addCase(fetchHCPs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHCPs.fulfilled, (state, action: PayloadAction<MockHCP[]>) => {
        state.loading = false;
        state.doctors = action.payload;
      })
      .addCase(fetchHCPs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch HCPs';
      })
      // Create HCP
      .addCase(createHCP.pending, (state) => {
        state.loading = true;
      })
      .addCase(createHCP.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createHCP.rejected, (state) => {
        state.loading = false;
      })
      // Update HCP
      .addCase(updateHCP.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateHCP.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateHCP.rejected, (state) => {
        state.loading = false;
      })
      // Delete HCP
      .addCase(deleteHCP.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteHCP.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteHCP.rejected, (state) => {
        state.loading = false;
      });
  }
});

export const { 
  setSearchTerm, 
  setSpecialtyFilter, 
  setHospitalFilter, 
  setSelectedDoctor, 
  clearFilters 
} = hcpSlice.actions;

export default hcpSlice.reducer;
