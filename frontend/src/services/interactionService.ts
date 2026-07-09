import api from './api';
import { MockInteraction, MOCK_INTERACTIONS, MockHCP, MOCK_HCPS } from '../utils/mockData';

// Maintain a local state in case backend is offline
let localInteractions: MockInteraction[] = [...MOCK_INTERACTIONS];
let localHCPs: MockHCP[] = [...MOCK_HCPS];

export const interactionService = {
  getInteractions: async (): Promise<MockInteraction[]> => {
    try {
      const response = await api.get('/interactions');
      return response.data;
    } catch (e) {
      console.warn('Falling back to local mock interactions database');
      return localInteractions;
    }
  },

  createInteraction: async (interaction: Omit<MockInteraction, 'id'>): Promise<MockInteraction> => {
    try {
      const response = await api.post('/interactions', {
        hcp_name: interaction.hcp_name,
        hospital: interaction.hospital,
        specialty: interaction.specialty,
        interaction_type: interaction.interaction_type,
        products_discussed: interaction.products_discussed,
        interaction_date: interaction.interaction_date,
        follow_up_date: interaction.follow_up_date || "",
        priority: interaction.priority,
        notes: interaction.notes || "",
        summary: interaction.summary || "",
        sentiment: interaction.sentiment || "Neutral",
        priority_score: interaction.priority_score || 50,
        next_best_action: interaction.next_best_action || "",
        recent_ai_insights: interaction.recent_ai_insights || "",
        follow_up_completed: interaction.follow_up_completed || false
      });
      return response.data;
    } catch (e) {
      console.warn('Logging interaction to local mock storage');
      const newId = localInteractions.length > 0 ? Math.max(...localInteractions.map(i => i.id)) + 1 : 1;
      const newRecord: MockInteraction = {
        ...interaction,
        id: newId,
        summary: interaction.summary || `Logged ${interaction.interaction_type} interaction regarding ${interaction.products_discussed}.`,
        sentiment: interaction.sentiment || "Neutral",
        priority_score: interaction.priority === "High" ? 85 : (interaction.priority === "Medium" ? 60 : 30),
        next_best_action: interaction.next_best_action || `Schedule follow-up on ${interaction.products_discussed} by ${interaction.follow_up_date}.`,
        recent_ai_insights: interaction.recent_ai_insights || `Dr. ${interaction.hcp_name} details logged.`
      };
      
      // Update local mock HCP if it doesn't exist
      const hcpExists = localHCPs.some(h => h.name.toLowerCase() === interaction.hcp_name.toLowerCase());
      if (!hcpExists) {
        localHCPs.push({
          id: localHCPs.length + 1,
          name: interaction.hcp_name,
          hospital: interaction.hospital,
          specialty: interaction.specialty,
          engagement_score: 75,
          visit_frequency: "2x/month",
          risk_alert: "Low Risk",
          email: `${interaction.hcp_name.toLowerCase().replace(/\s+/g, '')}@example.com`,
          phone: "555-0100"
        });
      }
      
      localInteractions = [newRecord, ...localInteractions];
      return newRecord;
    }
  },

  updateInteraction: async (id: number, interaction: Partial<MockInteraction>): Promise<MockInteraction> => {
    try {
      const response = await api.put(`/interactions/${id}`, interaction);
      return response.data;
    } catch (e) {
      console.warn('Updating local mock interaction');
      const idx = localInteractions.findIndex(i => i.id === id);
      if (idx === -1) throw new Error('Interaction not found');
      
      const updated = { ...localInteractions[idx], ...interaction } as MockInteraction;
      localInteractions[idx] = updated;
      return updated;
    }
  },

  deleteInteraction: async (id: number): Promise<void> => {
    try {
      await api.delete(`/interactions/${id}`);
    } catch (e) {
      console.warn('Deleting from local mock interactions');
      localInteractions = localInteractions.filter(i => i.id !== id);
    }
  },

  getHCPs: async (): Promise<MockHCP[]> => {
    try {
      const response = await api.get('/hcps');
      return response.data;
    } catch (e) {
      return localHCPs;
    }
  },

  getDashboardStats: async (): Promise<any> => {
    try {
      const response = await api.get('/dashboard/stats');
      return response.data;
    } catch (e) {
      // Local calculations mock fallback
      const todayStr = new Date().toISOString().split('T')[0];
      const todays_visits = localInteractions.filter(i => i.interaction_date === todayStr).length;
      const pending_followups = localInteractions.filter(i => i.follow_up_date && i.follow_up_date >= todayStr).length;
      const high_priority_hcps = localHCPs.filter(h => h.engagement_score >= 80).length;
      
      return {
        todays_visits,
        pending_followups,
        high_priority_hcps,
        completed_interactions: localInteractions.length,
        weekly_visits: localInteractions.length + 2,
        monthly_interactions: localInteractions.length + 5,
        top_products: ["CardioGuard", "BetaBlock", "NeuroMax"],
        top_hcps: ["Dr. Sarah Jenkins", "Dr. Robert Chen", "Dr. Amit Patel"],
        followup_completion_rate: 88,
        ai_insights: [
          "Conversations regarding CardioGuard have increased by 14% this week.",
          "Dr. Sarah Jenkins shows high responsiveness; target a virtual meeting next week.",
          "3 high-priority follow-ups are due by Friday; ensure email reminders are sent."
        ]
      };
    }
  }
};
