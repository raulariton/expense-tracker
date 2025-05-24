from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from datetime import timedelta, datetime, timezone
from typing import Annotated
from fastapi import Depends, HTTPException
from starlette import status
import jwt



# to use the same secret key for hashing
# TODO: change this to a more secure key :)
#  and store it in a secure place
SECRET_KEY = 'expensetrackeristhebest69420'
ALGORITHM = 'HS256'
ACCESS_TOKEN_EXPIRE_MINUTES = 999 # for testing purposes

oauth2_bearer = OAuth2PasswordBearer(tokenUrl="auth/token")

class Token(BaseModel):
    access_token: str
    token_type: str

def create_access_token(email: str, user_id: int, user_role: str, expires_delta: timedelta | None = None):
    """
    Creates a JWT token for the user.
    :param email: The email of the user
    :param user_id: The ID of the user, acting as a primary key in the database table
    :param user_role: The role of the user ("admin" or "user")
    :param expires_delta: The expiration time of the token
    :return: An encoded JWT token
    """
    # create JWT token
    # the (decoded) token will contain the email, user_id, and role
    to_encode = {
        "sub": email,
        "user_id": user_id,
        "role": user_role
    }

    # if expires_delta is not None, add it to the token
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    # update JSON token with expiration time
    to_encode.update({"exp": expire})

    # encode the token with the secret key and algorithm
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    return encoded_jwt

def verify_token(token: Annotated[str, Depends(oauth2_bearer)]):
    """
    Get the current user by decoding the JWT token.
    This function is used as a dependable, to get a dependency (user) instance.
    :param token: The JWT token to decode
    :return: The decoded token, containing the user credentials
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        user_id: int = payload.get("user_id")
        if email is None or user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                                detail="Could not validate user")

        # return token data
        return {"email": email, "user_id": user_id}
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Could not validate user")

def verify_admin_token(token: Annotated[str, Depends(oauth2_bearer)]):
    """
    Authorize user to access admin routes by decoding the JWT token.
    This function is used as a dependable, to get a dependency (user) instance.
    :param token: The JWT token to decode
    :return: The decoded token, containing the user credentials (including role)
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        user_id: int = payload.get("user_id")
        user_role: str = payload.get("role")
        if email is None or user_id is None or user_role != "admin":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                                detail="Could not validate user")

        # return token data
        return {"email": email, "user_id": user_id}
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Could not validate user")