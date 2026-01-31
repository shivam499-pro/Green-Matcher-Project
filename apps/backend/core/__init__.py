"""
Green Matchers - Core Module
Contains configuration, security, and dependency injection.
"""
from .config import get_settings, Settings
from .security import (
    verify_password,
    get_password_hash,
    create_access_token,
    decode_access_token
)
from .deps import (
    DatabaseSession,
    get_current_user,
    get_current_user_optional,
    require_role,
    require_employer,
    require_admin
)

__all__ = [
    "get_settings",
    "Settings",
    "verify_password",
    "get_password_hash",
    "create_access_token",
    "decode_access_token",
    "DatabaseSession",
    "get_current_user",
    "get_current_user_optional",
    "require_role",
    "require_employer",
    "require_admin",
]
