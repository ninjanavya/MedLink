from sqlalchemy import Column, Integer, String, Text, ForeignKey, Float, Boolean
from sqlalchemy.orm import relationship
from backend.database.connection import Base

class HCP(Base):
    __tablename__ = "hcps"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    hospital = Column(String, index=True, nullable=False)
    specialty = Column(String, index=True, nullable=False)
    engagement_score = Column(Integer, default=70) # 0-100 rating
    visit_frequency = Column(String, default="1x/month") # e.g. "2x/month"
    risk_alert = Column(String, default="Low Risk") # e.g. "Low Risk", "Medium Risk", "At Churn Risk"
    email = Column(String, unique=True, index=True, nullable=True)
    phone = Column(String, nullable=True)
    
    city = Column(String, nullable=True)
    state = Column(String, nullable=True)
    status = Column(String, default="Active") # Active / Inactive
    products_assigned = Column(String, nullable=True) # Comma-separated list

    interactions = relationship("Interaction", back_populates="hcp")


class Interaction(Base):
    __tablename__ = "interactions"

    id = Column(Integer, primary_key=True, index=True)
    hcp_id = Column(Integer, ForeignKey("hcps.id"), nullable=True)
    
    # Store de-normalized copy for speed and simple schema fallback
    hcp_name = Column(String, index=True, nullable=False)
    hospital = Column(String, nullable=False)
    specialty = Column(String, nullable=False)
    
    interaction_type = Column(String, nullable=False) # In-Person, Virtual, Email, Phone
    products_discussed = Column(String, nullable=True) # Comma-separated product list (e.g., "CardioGuard, BetaBlock")
    interaction_date = Column(String, nullable=False) # YYYY-MM-DD
    follow_up_date = Column(String, nullable=True) # YYYY-MM-DD
    priority = Column(String, default="Medium") # Low, Medium, High
    notes = Column(Text, nullable=True)
    
    # AI Panel fields
    summary = Column(Text, nullable=True)
    sentiment = Column(String, default="Neutral") # Positive, Neutral, Negative
    sentiment_score = Column(Float, default=0.0) # -1.0 to 1.0
    priority_score = Column(Integer, default=50) # 0-100 rating
    next_best_action = Column(Text, nullable=True)
    recent_ai_insights = Column(Text, nullable=True)
    
    follow_up_completed = Column(Boolean, default=False)

    hcp = relationship("HCP", back_populates="interactions")
