import api from './api';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  name?: string;
}

export interface ChatResponse {
  reply: string;
  messages: ChatMessage[];
  doctor_details: {
    name: string;
    hospital: string;
    specialty: string;
  };
  products_mentioned: string[];
  sentiment: string;
  priority_score: number;
  next_best_action: string;
  recent_insights: string[];
  risk_alert: string;
  visit_frequency: string;
  engagement_score: number;
  summary: string;
}

export const chatService = {
  sendMessage: async (messages: ChatMessage[], localHCPs?: any[]): Promise<ChatResponse> => {
    try {
      const response = await api.post('/chat', { messages });
      return response.data;
    } catch (e) {
      console.warn('Falling back to local AI Chat simulation');
      // Simulate LangGraph delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
      const text = lastUserMsg ? lastUserMsg.content.toLowerCase() : '';
      
      let reply = "I've reviewed the notes. I can help you log this meeting. I have extracted the details of your visit. You can preview the extracted fields and save it with one click.";
      let doctor_name = "Dr. Sarah Jenkins";
      let hospital = "City Cardiology Clinic";
      let specialty = "Cardiology";
      let products = ["CardioGuard"];
      let sentiment = "Positive";
      let priority_score = 85;
      let next_best_action = "Schedule virtual demo of CardioGuard within 3 days.";
      let risk_alert = "Low Risk";
      let visit_frequency = "2.4 visits / month";
      let engagement_score = 92;
      let insights = [
        "Prefers clinical study trials data over marketing slide decks.",
        "Interested in pediatric drug dosages for CardioGuard.",
        "Prefers email check-ins on Tuesday mornings."
      ];
      let summary = "Dr. Jenkins showed high interest in the CardioGuard clinical trials. Requested pediatric dosage packages.";

      // Try to find a matching HCP in the provided local list
      let matchedHCP = null;
      if (localHCPs && localHCPs.length > 0) {
        for (const h of localHCPs) {
          const clean = h.name.replace("Dr.", "").replace("Dr", "").trim().toLowerCase();
          const parts = clean.split(/\s+/).filter((p: string) => p.length > 2);
          if (clean && (text.includes(clean) || (parts.length > 0 && parts.some((p: string) => text.includes(p))))) {
            matchedHCP = h;
            break;
          }
        }
      }

      if (matchedHCP) {
        doctor_name = matchedHCP.name;
        hospital = matchedHCP.hospital;
        specialty = matchedHCP.specialty;
        risk_alert = matchedHCP.risk_alert || "Low Risk";
        engagement_score = matchedHCP.engagement_score || 80;
        visit_frequency = matchedHCP.visit_frequency || "2x/month";
        summary = `Interaction with ${matchedHCP.name} regarding products discussed.`;
        reply = `I've analyzed your meeting with ${matchedHCP.name}. I've successfully extracted the details for this doctor. You can review the preview card and save it.`;
        insights = [
          `Affiliated with ${matchedHCP.hospital} as a ${matchedHCP.specialty} specialist.`,
          `Engagement level: ${matchedHCP.engagement_score}% (${matchedHCP.risk_alert}).`
        ];
      } else if (text.includes('chen') || text.includes('oncology') || text.includes('robert')) {
        reply = "I've analyzed your meeting with Dr. Robert Chen. He raised questions regarding BetaBlock tolerability. I've updated the profile insights and structured log preview.";
        doctor_name = "Dr. Robert Chen";
        hospital = "St. Jude Cancer Care";
        specialty = "Oncology";
        products = ["BetaBlock"];
        sentiment = "Neutral";
        priority_score = 60;
        next_best_action = "Send follow-up tolerability studies on BetaBlock by Friday.";
        risk_alert = "Medium Risk";
        visit_frequency = "1.8 visits / month";
        engagement_score = 85;
        insights = [
          "Focused heavily on placebo comparison charts.",
          "Expressed concern about elderly patient fatigue rates.",
          "Typically reviews journals on weekend evenings."
        ];
        summary = "Virtual presentation on BetaBlock efficacy. Dr. Chen is focused on tolerability details.";
      } else if (text.includes('patel') || text.includes('pediatric') || text.includes('amit')) {
        reply = "Meeting notes with Dr. Amit Patel processed. I've summarized his feedback regarding the new pediatric syringe kits.";
        doctor_name = "Dr. Amit Patel";
        hospital = "Metro General Hospital";
        specialty = "Pediatrics";
        products = ["NeuroMax"];
        sentiment = "Positive";
        priority_score = 45;
        next_best_action = "Arrange demo kit shipment to clinic.";
        risk_alert = "Low Risk";
        visit_frequency = "1.2 visits / month";
        engagement_score = 78;
        insights = [
          "Prefers interactive demos over clinical journals.",
          "Very receptive to quick-log forms."
        ];
        summary = "Logged discussion regarding NeuroMax safety profile. Dr. Patel is highly positive.";
      } else if (text.includes('warren') || text.includes('lisa') || text.includes('neurology')) {
        reply = "I've processed your notes on Dr. Lisa Warren. She expressed dissatisfaction with delivery delays. I have logged this and flagged her profile as a risk alert.";
        doctor_name = "Dr. Lisa Warren";
        hospital = "St. Luke Medical Center";
        specialty = "Neurology";
        products = ["NeuroMax"];
        sentiment = "Negative";
        priority_score = 90;
        next_best_action = "Escalate logistics delay issue to Regional Sales Director.";
        risk_alert = "At Churn Risk";
        visit_frequency = "0.8 visits / month";
        engagement_score = 64;
        insights = [
          "Experiencing delivery delays for NeuroMax.",
          "Refused to schedule next visit until shipping resolved."
        ];
        summary = "Dr. Warren raised serious concerns regarding fulfillment delays. High risk flagged.";
      }
      
      return {
        reply,
        messages: [
          ...messages,
          { role: 'assistant', content: reply }
        ],
        doctor_details: {
          name: doctor_name,
          hospital,
          specialty
        },
        products_mentioned: products,
        sentiment,
        priority_score,
        next_best_action,
        recent_insights: insights,
        risk_alert,
        visit_frequency,
        engagement_score,
        summary
      };
    }
  }
};
