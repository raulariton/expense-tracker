from pydantic import BaseModel
from typing import Optional
from datetime import date




class UserDataModel(BaseModel):
    """
    Part of the API Response model that sends all available user information
    at the start of the session.
    """
    id: int
    username: str
    email: str
    role: str
    creation_date: date


class TokenWithUserData(BaseModel):
    """
    API Response model used to pass user data on login and registration
    """
    access_token: str
    token_type: str
    user_data: UserDataModel