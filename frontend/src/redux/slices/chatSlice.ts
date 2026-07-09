import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { chatService, ChatMessage, ChatResponse } from '../../services/chatService';
import { MockInteraction } from '../../utils/mockData';
import { addToast } from './toastSlice';
import { createInteraction } from './interactionSlice';

interface ChatState {
  messages: ChatMessage[];
  aiProcessing: boolean;
  
  // Right side AI Panel fields
  doctorDetails: {
    name: string;
    hospital: string;
    specialty: string;
  };
  productsMentioned: string[];
  sentiment: string;
  priorityScore: number;
  nextBestAction: string;
  recentInsights: string[];
  riskAlert: string;
  visitFrequency: string;
  engagementScore: number;
  summary: string;

  // Extracted preview ready for saving
  extractedPreview: Omit<MockInteraction, 'id'> | null;
}

const initialState: ChatState = {
  messages: [
    {
      role: 'assistant',
      content: "Hello! I am your Copilot Healthcare Assistant. Tell me about your recent medical visit (e.g., *'Met with Dr. Jenkins at City Clinic, discussed CardioGuard trials. She is highly positive and wants a virtual follow-up next Tuesday'*), and I will structure and log it for you."
    }
  ],
  aiProcessing: false,
  doctorDetails: {
    name: "Dr. Sarah Jenkins",
    hospital: "City Cardiology Clinic",
    specialty: "Cardiology"
  },
  productsMentioned: ["CardioGuard", "BetaBlock"],
  sentiment: "Positive",
  priorityScore: 85,
  nextBestAction: "Deliver printed pediatric dosage pamphlets and schedule follow-up call.",
  riskAlert: "Low Risk",
  visitFrequency: "2.4 visits / month",
  engagementScore: 92,
  recentInsights: [
    "Prefers clinical study trials data over marketing slide decks.",
    "Interested in pediatric drug dosages for CardioGuard.",
    "Prefers email check-ins on Tuesday mornings."
  ],
  summary: "Detailed review of CardioGuard pediatric trials. Receptive feedback; requested documentation package.",
  extractedPreview: null
};

export const sendChatMessage = createAsyncThunk(
  'chat/sendChatMessage',
  async (text: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { chat: ChatState; hcps: any };
      const userMsg: ChatMessage = { role: 'user', content: text };
      const updatedMessages = [...state.chat.messages, userMsg];
      const localHCPs = state.hcps ? state.hcps.doctors : [];
      
      const response = await chatService.sendMessage(updatedMessages, localHCPs);
      return response;
    } catch (e: any) {
      return rejectWithValue(e.message || 'Chat service error');
    }
  }
);

export const saveExtractedPreview = createAsyncThunk(
  'chat/saveExtractedPreview',
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState() as { chat: ChatState };
      const preview = state.chat.extractedPreview;
      if (!preview) {
        throw new Error("No structured preview available to save");
      }
      
      const res = await dispatch(createInteraction(preview)).unwrap();
      dispatch(addToast({ message: "Successfully logged interaction from AI chat", type: "success" }));
      return res;
    } catch (e: any) {
      dispatch(addToast({ message: e.message || "Failed to save preview", type: "error" }));
      return rejectWithValue(e.message);
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addManualUserMessage: (state, action: PayloadAction<string>) => {
      state.messages.push({ role: 'user', content: action.payload });
    },
    clearChat: (state) => {
      state.messages = [
        {
          role: 'assistant',
          content: "Hello! I am your Copilot Healthcare Assistant. Tell me about your recent medical visit and I will structure and log it for you."
        }
      ];
      state.extractedPreview = null;
    },
    discardPreview: (state) => {
      state.extractedPreview = null;
    },
    updatePreviewField: (state, action: PayloadAction<Partial<Omit<MockInteraction, 'id'>>>) => {
      if (state.extractedPreview) {
        state.extractedPreview = { ...state.extractedPreview, ...action.payload };
      }
    }
  },
  extraReducers: (builder) => {
    builder.addCase(sendChatMessage.pending, (state, action) => {
      state.aiProcessing = true;
      // Optimistically push user message
      state.messages.push({ role: 'user', content: action.meta.arg });
    });
    builder.addCase(sendChatMessage.fulfilled, (state, action: PayloadAction<ChatResponse>) => {
      state.aiProcessing = false;
      state.messages = action.payload.messages;
      
      // Update AI Side Panel metrics from response
      state.doctorDetails = action.payload.doctor_details;
      state.productsMentioned = action.payload.products_mentioned;
      state.sentiment = action.payload.sentiment;
      state.priorityScore = action.payload.priority_score;
      state.nextBestAction = action.payload.next_best_action;
      state.recentInsights = action.payload.recent_insights;
      state.riskAlert = action.payload.risk_alert;
      state.visitFrequency = action.payload.visit_frequency;
      state.engagementScore = action.payload.engagement_score;
      state.summary = action.payload.summary;

      // Compile an extractable structured preview
      const todayStr = new Date().toISOString().split('T')[0];
      const followUp = todayStr; // default to today
      
      state.extractedPreview = {
        hcp_name: action.payload.doctor_details.name,
        hospital: action.payload.doctor_details.hospital,
        specialty: action.payload.doctor_details.specialty,
        interaction_type: 'Virtual', // default mock
        products_discussed: action.payload.products_mentioned.join(', '),
        interaction_date: todayStr,
        follow_up_date: followUp,
        priority: action.payload.priority_score >= 80 ? 'High' : (action.payload.priority_score >= 50 ? 'Medium' : 'Low'),
        notes: `AI Extracted Notes: ${action.payload.summary}`,
        summary: action.payload.summary,
        sentiment: action.payload.sentiment as any,
        priority_score: action.payload.priority_score,
        next_best_action: action.payload.next_best_action
      };
    });
    builder.addCase(sendChatMessage.rejected, (state, action) => {
      state.aiProcessing = false;
      state.messages.push({
        role: 'assistant',
        content: `Sorry, I encountered an issue processing your request: ${action.payload as string}. Using simulated response fallback.`
      });
    });
    builder.addCase(saveExtractedPreview.fulfilled, (state) => {
      state.extractedPreview = null; // Clear preview once saved
    });
  }
});

export const { addManualUserMessage, clearChat, discardPreview, updatePreviewField } = chatSlice.actions;
export default chatSlice.reducer;
