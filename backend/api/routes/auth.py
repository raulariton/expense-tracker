from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from starlette import status
from fastapi.security import OAuth2PasswordRequestForm
from services.auth.jwt import Token, create_access_token, verify_token, oauth2_bearer
from services.auth.login import authenticate_user
from services.auth.register import UserCreationRequest, create_user, get_user_by_email
from services.auth.utils import db_dependency


router = APIRouter()

# This endpoint is used to log in
@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()], db: db_dependency
):
    """
    Logs in a user and returns an access token (JWT).
    """
    # check if user with matching email and password exists
    user = authenticate_user(form_data.username, form_data.password, db)

    # TODO: Use HTTPExceptions for all server exceptions
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # user exists (match found)
    # create access token
    # NOTE: JWT could be extended by using the refresh token (API calls)
    access_token = create_access_token(user.email, user.id)

    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(user_creation_request: UserCreationRequest, db: db_dependency):
    """
    Registers a new user in the database.
    """
    # check for an existing user, using the entered email
    existing_user = get_user_by_email(user_creation_request.email, db)

    # if user exists, raise exception
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="User already exists"
        )

    user = create_user(db, user_creation_request)

    # create access token
    # JWT will be valid for 30 minutes
    # NOTE: JWT could be extended by using the refresh token (API calls)
    access_token = create_access_token(user.email, user.id)

    return {"access_token": access_token, "token_type": "bearer"}


# NOTE: This endpoint will be used internally
# to get a user object for ORM.
# The token passed is the token received from the request
@router.get("/users/me")
async def get_current_user(token: str = Depends(oauth2_bearer)):
    """
    Verifies the user's token and returns the user.
    """
    user = verify_token(token)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate user",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user