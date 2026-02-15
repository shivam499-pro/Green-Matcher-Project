"""
Admin-Only Schemas for Read-Only Oversight
Used for admin dashboard and audit purposes.
"""

from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from apps.backend.models.application import ApplicationStatus


class AdminJobResponse(BaseModel):
    """Admin view of job listing - read-only oversight."""
    id: int
    title: str
    employer_id: int
    status: str
    is_verified: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class AdminApplicationResponse(BaseModel):
    """Admin view of application - read-only audit trail."""
    id: int
    job_id: int
    candidate_id: int
    status: ApplicationStatus
    decided_at: Optional[datetime] = None
    decided_by: Optional[int] = None
    created_at: datetime

    model_config = {"from_attributes": True}
