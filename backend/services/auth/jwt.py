from fastapi.security import OAuth2PasswordBearer
from datetime import timedelta, datetime, timezone
from typing import Annotated
from fastapi import Depends, HTTPException
from starlette import status
import jwt
from dotenv import load_dotenv
from pathlib import Path
import os


# to use the same secret key for hashing
dotenv_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path)

ACCESS_TOKEN_SECRET_KEY = os.getenv("ACCESS_TOKEN_SECRET")
REFRESH_TOKEN_SECRET_KEY = os.getenv("REFRESH_TOKEN_SECRET")
ALGORITHM = 'HS256'
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_MINUTES = 60 * 24 * 3  # 3 days

oauth2_bearer = OAuth2PasswordBearer(tokenUrl="auth/token")

# enum constants
ACCESS_TOKEN_TYPE = "ACCESS"
REFRESH_TOKEN_TYPE = "REFRESH"
USER_ROLE = "user"
ADMIN_USER_ROLE = "admin"


def create_token(
        email: str,
        user_id: int,
        user_role: str,
        token_type: str
):
    """
    Creates a JWT token (access or refresh) for the user.
    :param email: The email of the user
    :param user_id: The ID of the user, acting as a primary key in the database table
    :param user_role: The role of the user ("admin" or "user")
    :param token_type: The type of token to create,
        either `ACCESS_TOKEN_TYPE` or `REFRESH_TOKEN_TYPE`
    :return: The encoded JWT token
    """
    token_expire_delta = (datetime.now(timezone.utc) + timedelta(minutes=(
        ACCESS_TOKEN_EXPIRE_MINUTES if token_type == ACCESS_TOKEN_TYPE
        else REFRESH_TOKEN_EXPIRE_MINUTES
    )))

    return jwt.encode(
        {
            "sub": email,
            "user_id": user_id,
            "role": user_role,
            "exp": token_expire_delta
        },
        ACCESS_TOKEN_SECRET_KEY if token_type == ACCESS_TOKEN_TYPE
        else REFRESH_TOKEN_SECRET_KEY,
        algorithm=ALGORITHM
    )


def verify_token(
        token: Annotated[str, Depends(oauth2_bearer)],
        token_type: str = ACCESS_TOKEN_TYPE,
        expected_user_role: str = USER_ROLE
):
    """
    Verify the JWT token (access or refresh token) by decoding it
    to obtain the user credentials.
    :param token: The JWT token to verify and decode
    :param token_type: The type of token, defaulted to `ACCESS_TOKEN_TYPE`. To
        verify a refresh token, set this to `REFRESH_TOKEN_TYPE`.
    :param expected_user_role: The role of the user, defaulted to `USER_ROLE`. To
        verify that the token belongs to an admin user, set this to `ADMIN_USER_ROLE`.
    """
    try:
        payload = jwt.decode(
            token,
            ACCESS_TOKEN_SECRET_KEY if token_type == ACCESS_TOKEN_TYPE
                else REFRESH_TOKEN_SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        # extract user credentials from the payload
        email: str = payload.get("sub")
        user_id: int = payload.get("user_id")
        user_role: str = payload.get("role")

        # if any of the credentials are missing,
        # or if the user role in the token does not match the expected role,
        # raise an HTTP 403 error (forbidden)
        if (not email or not user_id or not user_role or
                (expected_user_role == ADMIN_USER_ROLE and user_role != "admin")):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                                detail="Could not validate user")

        # return token data
        return {
            "email": email,
            "user_id": user_id,
            "role": user_role
        }
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="Could not validate user")