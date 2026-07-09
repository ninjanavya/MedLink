from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from backend.database.connection import get_db
from backend.models.models import HCP, Interaction

router = APIRouter()

# Pydantic Schemas for Request/Response validation
class HCPBase(BaseModel):
    name: str
    hospital: str
    specialty: str
    engagement_score: Optional[int] = 70
    visit_frequency: Optional[str] = "1.0 visits / month"
    risk_alert: Optional[str] = "Low Risk"
    email: Optional[str] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    status: Optional[str] = "Active"
    products_assigned: Optional[str] = ""

class HCPCreate(HCPBase):
    pass

class HCPUpdate(BaseModel):
    name: Optional[str] = None
    hospital: Optional[str] = None
    specialty: Optional[str] = None
    engagement_score: Optional[int] = None
    visit_frequency: Optional[str] = None
    risk_alert: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    status: Optional[str] = None
    products_assigned: Optional[str] = None

class HCPResponse(HCPBase):
    id: int

    class Config:
        from_attributes = True

# 1. GET /hcps - Fetch all HCPs
@router.get("/hcps", response_model=List[HCPResponse])
def get_hcps(db: Session = Depends(get_db)):
    return db.query(HCP).all()

# 2. POST /hcps - Add new doctor
@router.post("/hcps", response_model=HCPResponse, status_code=status.HTTP_201_CREATED)
def create_hcp(hcp_in: HCPCreate, db: Session = Depends(get_db)):
    # Check duplicate email if email is provided
    if hcp_in.email:
        existing = db.query(HCP).filter(HCP.email == hcp_in.email).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"HCP with email {hcp_in.email} already exists."
            )
            
    db_hcp = HCP(**hcp_in.dict())
    db.add(db_hcp)
    db.commit()
    db.refresh(db_hcp)
    return db_hcp

# 3. PUT /hcps/{id} - Edit doctor details
@router.put("/hcps/{id}", response_model=HCPResponse)
def update_hcp(id: int, hcp_in: HCPUpdate, db: Session = Depends(get_db)):
    db_hcp = db.query(HCP).filter(HCP.id == id).first()
    if not db_hcp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"HCP with ID {id} not found."
        )
        
    update_data = hcp_in.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_hcp, key, value)
        
    # Also update de-normalized fields in interactions
    if "name" in update_data or "hospital" in update_data or "specialty" in update_data:
        db.query(Interaction).filter(Interaction.hcp_id == id).update({
            Interaction.hcp_name: db_hcp.name,
            Interaction.hospital: db_hcp.hospital,
            Interaction.specialty: db_hcp.specialty
        }, synchronize_session=False)

    db.commit()
    db.refresh(db_hcp)
    return db_hcp

# 4. DELETE /hcps/{id} - Delete doctor profile
@router.delete("/hcps/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_hcp(id: int, db: Session = Depends(get_db)):
    db_hcp = db.query(HCP).filter(HCP.id == id).first()
    if not db_hcp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"HCP with ID {id} not found."
        )
        
    # Delete associated interactions to prevent orphan logs
    db.query(Interaction).filter(Interaction.hcp_id == id).delete(synchronize_session=False)
    
    db.delete(db_hcp)
    db.commit()
    return None
