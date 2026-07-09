import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { addToast } from './toastSlice';

export interface UserSession {
  email: string;
  role: 'Administrator' | 'Medical Representative';
}

interface AuthState {
  user: UserSession | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Read initial session from localStorage
const storedUser = localStorage.getItem('crm_user_session');
const initialUser: UserSession | null = storedUser ? JSON.parse(storedUser) : null;

const initialState: AuthState = {
  user: initialUser,
  isAuthenticated: initialUser !== null,
  loading: false,
  error: null
};

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; md5Pass: string }, { dispatch, rejectWithValue }) => {
    // In a real production app this hits a POST /api/auth endpoint.
    // For this enterprise spec, we authenticate via the required credentials locally.
    const { email, md5Pass } = credentials;
    
    // Simulate minor network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    if (email === 'admin@healthcrm.ai' && md5Pass === 'admin123') {
      const session: UserSession = { email, role: 'Administrator' };
      localStorage.setItem('crm_user_session', JSON.stringify(session));
      dispatch(addToast({ message: "Successfully logged in as Administrator", type: "success" }));
      return session;
    } else if (email === 'rep@healthcrm.ai' && md5Pass === 'rep123') {
      const session: UserSession = { email, role: 'Medical Representative' };
      localStorage.setItem('crm_user_session', JSON.stringify(session));
      dispatch(addToast({ message: "Successfully logged in as Medical Representative", type: "success" }));
      return session;
    } else {
      dispatch(addToast({ message: "Invalid email or password", type: "error" }));
      return rejectWithValue("Invalid email or password");
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    localStorage.removeItem('crm_user_session');
    dispatch(addToast({ message: "Logged out successfully", type: "success" }));
    return null;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<UserSession>) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Login failed';
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      });
  }
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
