from sqlalchemy.orm import Session
from backend.models.models import HCP, Interaction
from datetime import datetime, timedelta

def seed_database(db: Session):
    # Check if HCPs exist
    hcp_count = db.query(HCP).count()
    if hcp_count > 0:
        return # already seeded
        
    hcps = [
        # Cardiology
        HCP(name="Dr. Sarah Jenkins", hospital="City Cardiology Clinic", specialty="Cardiology", engagement_score=92, visit_frequency="2.4 visits / month", risk_alert="Low Risk", email="sjenkins@citycardio.org", phone="555-0199"),
        HCP(name="Dr. David Miller", hospital="Mercy Heart Institute", specialty="Cardiology", engagement_score=88, visit_frequency="2.0 visits / month", risk_alert="Low Risk", email="dmiller@mercyheart.com", phone="555-0122"),
        
        # Neurology
        HCP(name="Dr. Lisa Warren", hospital="St. Luke Medical Center", specialty="Neurology", engagement_score=64, visit_frequency="0.8 visits / month", risk_alert="At Churn Risk", email="lwarren@stlukes.org", phone="555-0105"),
        HCP(name="Dr. Helen Carter", hospital="Brain Health Center", specialty="Neurology", engagement_score=71, visit_frequency="1.0 visits / month", risk_alert="Medium Risk", email="hcarter@brainhealth.org", phone="555-0158"),
        
        # Oncology
        HCP(name="Dr. Robert Chen", hospital="St. Jude Cancer Care", specialty="Oncology", engagement_score=85, visit_frequency="1.8 visits / month", risk_alert="Medium Risk", email="r.chen@stjude.org", phone="555-0142"),
        HCP(name="Dr. James Vance", hospital="Memorial Oncology", specialty="Oncology", engagement_score=80, visit_frequency="1.5 visits / month", risk_alert="Low Risk", email="jvance@memorialonc.com", phone="555-0181"),
        
        # Dermatology
        HCP(name="Dr. Clara Evans", hospital="Skin Science Clinic", specialty="Dermatology", engagement_score=76, visit_frequency="1.2 visits / month", risk_alert="Low Risk", email="cevans@skinscience.net", phone="555-0111"),
        HCP(name="Dr. Edward Taylor", hospital="Radiant Derm", specialty="Dermatology", engagement_score=69, visit_frequency="0.9 visits / month", risk_alert="Medium Risk", email="etaylor@radiantderm.com", phone="555-0164"),
        
        # Orthopedics
        HCP(name="Dr. Sophia Brooks", hospital="Joint & Bone Clinic", specialty="Orthopedics", engagement_score=85, visit_frequency="1.6 visits / month", risk_alert="Low Risk", email="sbrooks@jointbone.com", phone="555-0177"),
        HCP(name="Dr. Ryan King", hospital="Ortho Spine Rehab", specialty="Orthopedics", engagement_score=62, visit_frequency="0.8 visits / month", risk_alert="At Churn Risk", email="rking@orthospine.org", phone="555-0129"),
        
        # Pulmonology
        HCP(name="Dr. Maria Garcia", hospital="Respiratory Care Clinic", specialty="Pulmonology", engagement_score=74, visit_frequency="1.1 visits / month", risk_alert="Low Risk", email="mgarcia@respcare.com", phone="555-0193"),
        HCP(name="Dr. Thomas Wright", hospital="Lung Health Institute", specialty="Pulmonology", engagement_score=70, visit_frequency="1.0 visits / month", risk_alert="Medium Risk", email="twright@lunghealth.net", phone="555-0187"),
        
        # Pediatrics
        HCP(name="Dr. Amit Patel", hospital="Metro General Hospital", specialty="Pediatrics", engagement_score=78, visit_frequency="1.2 visits / month", risk_alert="Low Risk", email="apatel@metrogeneral.com", phone="555-0176"),
        HCP(name="Dr. Anna Ivanova", hospital="Children's Health Center", specialty="Pediatrics", engagement_score=83, visit_frequency="1.7 visits / month", risk_alert="Low Risk", email="aivanova@childhealth.org", phone="555-0144"),
        
        # Endocrinology
        HCP(name="Dr. Susan Lee", hospital="Hormone & Diabetes Clinic", specialty="Endocrinology", engagement_score=89, visit_frequency="2.2 visits / month", risk_alert="Low Risk", email="slee@hormonedoc.com", phone="555-0125"),
        HCP(name="Dr. George Harris", hospital="Metro Endocrine", specialty="Endocrinology", engagement_score=58, visit_frequency="0.6 visits / month", risk_alert="At Churn Risk", email="gharris@metroendo.net", phone="555-0183"),
        
        # Gastroenterology
        HCP(name="Dr. Laura Adams", hospital="Digestive Disease Center", specialty="Gastroenterology", engagement_score=75, visit_frequency="1.3 visits / month", risk_alert="Low Risk", email="ladams@digestivedisease.com", phone="555-0133"),
        HCP(name="Dr. Frank Nelson", hospital="Gastro Care Clinic", specialty="Gastroenterology", engagement_score=67, visit_frequency="0.9 visits / month", risk_alert="Medium Risk", email="fnelson@gastrocare.net", phone="555-0155"),
        
        # Gynecology
        HCP(name="Dr. Karen Vance", hospital="Women's Wellness Center", specialty="Gynecology", engagement_score=90, visit_frequency="2.3 visits / month", risk_alert="Low Risk", email="kvance@womenswellness.org", phone="555-0161"),
        HCP(name="Dr. Kevin Lopez", hospital="Mercy OBGYN", specialty="Gynecology", engagement_score=73, visit_frequency="1.1 visits / month", risk_alert="Low Risk", email="klopez@mercyobgyn.com", phone="555-0149")
    ]
    
    # Assign default city, state, status and products to the seed doctors
    import random
    cities = ["Houston", "New York", "Chicago", "Philadelphia", "Boston", "San Francisco", "Atlanta", "Miami", "Denver", "Seattle"]
    states = ["TX", "NY", "IL", "PA", "MA", "CA", "GA", "FL", "CO", "WA"]
    products_pool = ["CardioGuard", "BetaBlock", "NeuroMax", "OsteoShield", "GastroZole", "Dermacure"]
    
    for idx, h in enumerate(hcps):
        h.city = cities[idx % len(cities)]
        h.state = states[idx % len(states)]
        h.status = "Active"
        # Assign 1 to 2 random products
        num_p = random.randint(1, 2)
        assigned = random.sample(products_pool, num_p)
        h.products_assigned = ", ".join(assigned)
        
    db.add_all(hcps)
    db.commit()
    
    # Retrieve HCPs with database-assigned IDs
    for h in hcps:
        db.refresh(h)
        
    # Generate 3-5 interactions per HCP (total ~60-80 interactions)
    products_map = {
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
    }

    base_date = datetime(2026, 7, 8)
    
    for idx, hcp in enumerate(hcps):
        # We assign 3-4 historical interactions per HCP
        num_interactions = 3 if idx % 2 == 0 else 4
        product = products_map.get(hcp.specialty, "CardioGuard")
        
        for k in range(num_interactions):
            days_ago = (k + 1) * 3
            int_date = (base_date - timedelta(days=days_ago)).strftime('%Y-%m-%d')
            follow_date = (base_date + timedelta(days=2 - k * 3)).strftime('%Y-%m-%d')
            
            # Alternate priorities and sentiments
            priority = "High" if k == 0 else ("Medium" if k == 1 else "Low")
            sentiment = "Positive" if k % 2 == 0 else "Neutral"
            sentiment_score = 0.8 if sentiment == "Positive" else 0.1
            priority_score = 85 if priority == "High" else (60 if priority == "Medium" else 30)
            
            notes = (
                f"Completed visit with Dr. {hcp.name.split()[-1]} to discuss clinical trials on {product}. "
                f"Physician requested updated brochures and safety summary sheets. Feedback was generally {sentiment.lower()}."
            )
            
            summary = f"Review of {product} safety data and efficacy parameters with Dr. {hcp.name.split()[-1]}."
            next_action = f"Deliver clinical trial briefs and schedule follow-up visit regarding {product} efficacy."
            insights = f"Highly receptive. Interested in regional safety study reviews."

            interaction = Interaction(
                hcp_id=hcp.id,
                hcp_name=hcp.name,
                hospital=hcp.hospital,
                specialty=hcp.specialty,
                interaction_type="In-Person" if k % 2 == 0 else "Virtual",
                products_discussed=product,
                interaction_date=int_date,
                follow_up_date=follow_date,
                priority=priority,
                notes=notes,
                summary=summary,
                sentiment=sentiment,
                sentiment_score=sentiment_score,
                priority_score=priority_score,
                next_best_action=next_action,
                recent_ai_insights=insights
            )
            db.add(interaction)
            
    db.commit()
