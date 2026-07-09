import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import interactionReducer from './slices/interactionSlice';
import chatReducer from './slices/chatSlice';
import toastReducer from './slices/toastSlice';
import authReducer from './slices/authSlice';
import hcpReducer from './slices/hcpSlice';

export const store = configureStore({
  reducer: {
    interactions: interactionReducer,
    chat: chatReducer,
    toast: toastReducer,
    auth: authReducer,
    hcps: hcpReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Custom typed hooks for Redux state
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
