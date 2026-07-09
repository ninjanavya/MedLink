export interface MockHCP {
  id: number;
  name: string;
  hospital: string;
  specialty: string;
  engagement_score: number;
  visit_frequency: string;
  risk_alert: 'Low Risk' | 'Medium Risk' | 'At Churn Risk';
  email: string;
  phone: string;
  city?: string;
  state?: string;
  status?: 'Active' | 'Inactive';
  products_assigned?: string;
}

export interface MockInteraction {
  id: number;
  hcp_id?: number;
  hcp_name: string;
  hospital: string;
  specialty: string;
  interaction_type: string;
  products_discussed: string; // Comma-separated list
  interaction_date: string;
  follow_up_date?: string;
  priority: 'Low' | 'Medium' | 'High';
  notes: string;
  summary?: string;
  sentiment?: 'Positive' | 'Neutral' | 'Negative';
  sentiment_score?: number;
  priority_score?: number;
  next_best_action?: string;
  recent_ai_insights?: string;
  follow_up_completed?: boolean;
}

export const PRODUCTS_LIST = [
  "CardioGuard",
  "BetaBlock",
  "NeuroMax",
  "OsteoShield",
  "LipiSentry",
  "PulmoClear",
  "GastrEase",
  "DermaGlow"
];

export const SPECIALTIES_LIST = [
  "Cardiology",
  "Neurology",
  "Oncology",
  "Dermatology",
  "Orthopedics",
  "Pulmonology",
  "Pediatrics",
  "Endocrinology",
  "Gastroenterology",
  "Gynecology"
];

export const HOSPITALS_LIST = [
  "City Cardiology Clinic",
  "Mercy Heart Institute",
  "St. Luke Medical Center",
  "Brain Health Center",
  "St. Jude Cancer Care",
  "Memorial Oncology",
  "Skin Science Clinic",
  "Radiant Derm",
  "Joint & Bone Clinic",
  "Ortho Spine Rehab",
  "Respiratory Care Clinic",
  "Lung Health Institute",
  "Metro General Hospital",
  "Children's Health Center",
  "Hormone & Diabetes Clinic",
  "Metro Endocrine",
  "Digestive Disease Center",
  "Gastro Care Clinic",
  "Women's Wellness Center",
  "Mercy OBGYN"
];

export const MOCK_HCPS: MockHCP[] = [
  { id: 1, name: "Dr. Sarah Jenkins", hospital: "City Cardiology Clinic", specialty: "Cardiology", engagement_score: 92, visit_frequency: "2.4 visits / month", risk_alert: "Low Risk", email: "sjenkins@citycardio.org", phone: "555-0199" },
  { id: 2, name: "Dr. David Miller", hospital: "Mercy Heart Institute", specialty: "Cardiology", engagement_score: 88, visit_frequency: "2.0 visits / month", risk_alert: "Low Risk", email: "dmiller@mercyheart.com", phone: "555-0122" },
  
  { id: 3, name: "Dr. Lisa Warren", hospital: "St. Luke Medical Center", specialty: "Neurology", engagement_score: 64, visit_frequency: "0.8 visits / month", risk_alert: "At Churn Risk", email: "lwarren@stlukes.org", phone: "555-0105" },
  { id: 4, name: "Dr. Helen Carter", hospital: "Brain Health Center", specialty: "Neurology", engagement_score: 71, visit_frequency: "1.0 visits / month", risk_alert: "Medium Risk", email: "hcarter@brainhealth.org", phone: "555-0158" },
  
  { id: 5, name: "Dr. Robert Chen", hospital: "St. Jude Cancer Care", specialty: "Oncology", engagement_score: 85, visit_frequency: "1.8 visits / month", risk_alert: "Medium Risk", email: "r.chen@stjude.org", phone: "555-0142" },
  { id: 6, name: "Dr. James Vance", hospital: "Memorial Oncology", specialty: "Oncology", engagement_score: 80, visit_frequency: "1.5 visits / month", risk_alert: "Low Risk", email: "jvance@memorialonc.com", phone: "555-0181" },
  
  { id: 7, name: "Dr. Clara Evans", hospital: "Skin Science Clinic", specialty: "Dermatology", engagement_score: 76, visit_frequency: "1.2 visits / month", risk_alert: "Low Risk", email: "cevans@skinscience.net", phone: "555-0111" },
  { id: 8, name: "Dr. Edward Taylor", hospital: "Radiant Derm", specialty: "Dermatology", engagement_score: 69, visit_frequency: "0.9 visits / month", risk_alert: "Medium Risk", email: "etaylor@radiantderm.com", phone: "555-0164" },
  
  { id: 9, name: "Dr. Sophia Brooks", hospital: "Joint & Bone Clinic", specialty: "Orthopedics", engagement_score: 85, visit_frequency: "1.6 visits / month", risk_alert: "Low Risk", email: "sbrooks@jointbone.com", phone: "555-0177" },
  { id: 10, name: "Dr. Ryan King", hospital: "Ortho Spine Rehab", specialty: "Orthopedics", engagement_score: 62, visit_frequency: "0.8 visits / month", risk_alert: "At Churn Risk", email: "rking@orthospine.org", phone: "555-0129" },
  
  { id: 11, name: "Dr. Maria Garcia", hospital: "Respiratory Care Clinic", specialty: "Pulmonology", engagement_score: 74, visit_frequency: "1.1 visits / month", risk_alert: "Low Risk", email: "mgarcia@respcare.com", phone: "555-0193" },
  { id: 12, name: "Dr. Thomas Wright", hospital: "Lung Health Institute", specialty: "Pulmonology", engagement_score: 70, visit_frequency: "1.0 visits / month", risk_alert: "Medium Risk", email: "twright@lunghealth.net", phone: "555-0187" },
  
  { id: 13, name: "Dr. Amit Patel", hospital: "Metro General Hospital", specialty: "Pediatrics", engagement_score: 78, visit_frequency: "1.2 visits / month", risk_alert: "Low Risk", email: "apatel@metrogeneral.com", phone: "555-0176" },
  { id: 14, name: "Dr. Anna Ivanova", hospital: "Children's Health Center", specialty: "Pediatrics", engagement_score: 83, visit_frequency: "1.7 visits / month", risk_alert: "Low Risk", email: "aivanova@childhealth.org", phone: "555-0144" },
  
  { id: 15, name: "Dr. Susan Lee", hospital: "Hormone & Diabetes Clinic", specialty: "Endocrinology", engagement_score: 89, visit_frequency: "2.2 visits / month", risk_alert: "Low Risk", email: "slee@hormonedoc.com", phone: "555-0125" },
  { id: 16, name: "Dr. George Harris", hospital: "Metro Endocrine", specialty: "Endocrinology", engagement_score: 58, visit_frequency: "0.6 visits / month", risk_alert: "At Churn Risk", email: "gharris@metroendo.net", phone: "555-0183" },
  
  { id: 17, name: "Dr. Laura Adams", hospital: "Digestive Disease Center", specialty: "Gastroenterology", engagement_score: 75, visit_frequency: "1.3 visits / month", risk_alert: "Low Risk", email: "ladams@digestivedisease.com", phone: "555-0133" },
  { id: 18, name: "Dr. Frank Nelson", hospital: "Gastro Care Clinic", specialty: "Gastroenterology", engagement_score: 67, visit_frequency: "0.9 visits / month", risk_alert: "Medium Risk", email: "fnelson@gastrocare.net", phone: "555-0155" },
  
  { id: 19, name: "Dr. Karen Vance", hospital: "Women's Wellness Center", specialty: "Gynecology", engagement_score: 90, visit_frequency: "2.3 visits / month", risk_alert: "Low Risk", email: "kvance@womenswellness.org", phone: "555-0161" },
  { id: 20, name: "Dr. Kevin Lopez", hospital: "Mercy OBGYN", specialty: "Gynecology", engagement_score: 73, visit_frequency: "1.1 visits / month", risk_alert: "Low Risk", email: "klopez@mercyobgyn.com", phone: "555-0149" }
];

// Helper to generate mock interactions for static file
const generateMockInteractions = (): MockInteraction[] => {
  const interactions: MockInteraction[] = [];
  const productsMap: Record<string, string> = {
    "Cardiology": "CardioGuard",
    "Neurology": "NeuroMax",
    "Oncology": "BetaBlock",
    "Dermatology": "DermaGlow",
    "Orthopedics": "OsteoShield",
    "Pulmonology": "PulmoClear",
    "Pediatrics": "NeuroMax",
    "Endocrinology": "LipiSentry",
    "Gastroenterology": "GastrEase",
    "Gynecology": "OsteoShield"
  };

  const baseDate = new Date("2026-07-08");
  let interactionIdCounter = 1;

  MOCK_HCPS.forEach((hcp, idx) => {
    const numInteractions = idx % 2 === 0 ? 3 : 4;
    const product = productsMap[hcp.specialty] || "CardioGuard";

    for (let k = 0; k < numInteractions; k++) {
      const daysAgo = (k + 1) * 3;
      const intDateObj = new Date(baseDate.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      const intDate = intDateObj.toISOString().split('T')[0];

      const followDateObj = new Date(baseDate.getTime() + (7 - k * 2) * 24 * 60 * 60 * 1000);
      const followDate = followDateObj.toISOString().split('T')[0];

      const priority = k === 0 ? "High" : (k === 1 ? "Medium" : "Low");
      const sentiment = k % 2 === 0 ? "Positive" : "Neutral";
      const sentimentScore = sentiment === "Positive" ? 0.8 : 0.1;
      const priorityScore = priority === "High" ? 85 : (priority === "Medium" ? 60 : 30);

      const lastName = hcp.name.split(" ").pop();
      const notes = `Completed visit with Dr. ${lastName} to discuss clinical trials on ${product}. Physician requested brochures and safety summaries. Feedback was ${sentiment.toLowerCase()}.`;
      const summary = `Review of ${product} safety data and efficacy with Dr. ${lastName}.`;
      const nextAction = `Deliver clinical trial briefs and schedule follow-up visit regarding ${product} efficacy.`;
      const insights = `Highly receptive. Interested in regional safety study reviews.`;

      interactions.push({
        id: interactionIdCounter++,
        hcp_id: hcp.id,
        hcp_name: hcp.name,
        hospital: hcp.hospital,
        specialty: hcp.specialty,
        interaction_type: k % 2 === 0 ? "In-Person" : "Virtual",
        products_discussed: product,
        interaction_date: intDate,
        follow_up_date: followDate,
        priority,
        notes,
        summary,
        sentiment,
        sentiment_score: sentimentScore,
        priority_score: priorityScore,
        next_best_action: nextAction,
        recent_ai_insights: insights
      });
    }
  });

  return interactions;
};

export const MOCK_INTERACTIONS: MockInteraction[] = generateMockInteractions();
