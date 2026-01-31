"""
Green Matchers - Pydantic Schemas
"""
from .user import (
    UserRegister,
    UserLogin,
    UserUpdate,
    EmployerProfileUpdate,
    UserResponse,
    TokenResponse,
    SkillsUpdate,
)
from .job import (
    JobCreate,
    JobUpdate,
    JobResponse,
    JobDetailResponse,
    JobQueryParams,
)
from .career import (
    CareerCreate,
    CareerUpdate,
    CareerResponse,
    CareerDetailResponse,
    CareerRecommendation,
    CareerQueryParams,
)
from .application import (
    ApplicationCreate,
    ApplicationUpdate,
    ApplicationResponse,
    ApplicationDetailResponse,
    ApplicationQueryParams,
)
from .analytics import (
    CareerDemand,
    SkillPopularity,
    SalaryRange,
    SDGDistribution,
    AnalyticsOverview,
    AnalyticsResponse,
    CareerDemandQuery,
    SkillPopularityQuery,
    SalaryRangeQuery,
)

__all__ = [
    # User schemas
    "UserRegister",
    "UserLogin",
    "UserUpdate",
    "EmployerProfileUpdate",
    "UserResponse",
    "TokenResponse",
    "SkillsUpdate",
    # Job schemas
    "JobCreate",
    "JobUpdate",
    "JobResponse",
    "JobDetailResponse",
    "JobQueryParams",
    # Career schemas
    "CareerCreate",
    "CareerUpdate",
    "CareerResponse",
    "CareerDetailResponse",
    "CareerRecommendation",
    "CareerQueryParams",
    # Application schemas
    "ApplicationCreate",
    "ApplicationUpdate",
    "ApplicationResponse",
    "ApplicationDetailResponse",
    "ApplicationQueryParams",
    # Analytics schemas
    "CareerDemand",
    "SkillPopularity",
    "SalaryRange",
    "SDGDistribution",
    "AnalyticsOverview",
    "AnalyticsResponse",
    "CareerDemandQuery",
    "SkillPopularityQuery",
    "SalaryRangeQuery",
]
