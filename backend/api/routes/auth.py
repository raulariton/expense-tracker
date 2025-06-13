from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Response, Request, Cookie
from starlette import status
from fastapi.security import OAuth2PasswordRequestForm
from services.auth.login import authenticate_user
from services.auth.register import UserCreationRequest, create_user, get_user_by_email
from services.auth.utils import db_dependency
from services.auth.jwt import (
    create_token, verify_token, oauth2_bearer,
    ACCESS_TOKEN_TYPE, REFRESH_TOKEN_TYPE, USER_ROLE,
    REFRESH_TOKEN_EXPIRE_MINUTES
)


router = APIRouter()

# This endpoint is used to log in and obtain an access token.
@router.post("/token")
async def login_for_access_token(
        form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
        db: db_dependency,
        response: Response
):
    """
    Logs in a user and returns an access JWT token
    (as a JSON response) and a refresh JWT token (as a cookie).
    """
    # check if user with matching email and password exists
    user = authenticate_user(form_data.username, form_data.password, db)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # user exists (match found)
    # get role
    user_role = user.role.role # for readability

    # create tokens
    access_token = create_token(
        user.email, user.id, user_role,
        token_type=ACCESS_TOKEN_TYPE
    )
    refresh_token = create_token(
        user.email, user.id, user_role,
        token_type=REFRESH_TOKEN_TYPE
    )

    # set the refresh token as a cookie
    # NOTE: secure because httpOnly cookies
    #  are not accessible via javascript
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        max_age=REFRESH_TOKEN_EXPIRE_MINUTES * 60,  # minutes to seconds
        # httponly=True,
        # secure=True, TODO: Set to True in production
        samesite="lax",
        path="/",
        domain="localhost"
    )

    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(
        user_creation_request: UserCreationRequest,
        db: db_dependency,
        response: Response
):
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

    # get role of created user
    user_role = user.role.role  # for readability

    # create tokens
    access_token = create_token(
        user.email, user.id, user_role,
        token_type=ACCESS_TOKEN_TYPE
    )
    refresh_token = create_token(
        user.email, user.id, user_role,
        token_type=REFRESH_TOKEN_TYPE
    )

    # set the refresh token as a cookie
    # NOTE: secure because httpOnly cookies
    #  are not accessible via javascript
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        max_age=REFRESH_TOKEN_EXPIRE_MINUTES * 60,  # minutes to seconds
        # httponly=True,
        # secure=True, TODO: Set to True in production
        samesite="lax",
        path="/",
        domain="localhost"
    )

    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/refresh")
async def refresh_access_token(
        refresh_token: Annotated[str | None, Cookie()],
        expected_user_role: str = USER_ROLE
):
    """
    Issues a new access token using the refresh token
    (received from cookie).
    If the refresh token is valid, a new access token is returned.
    If the refresh token is invalid or expired,
    an HTTP 401 Unauthorized error is raised, which the frontend
    interprets as a need for the user to log in again.
    :param expected_user_role: The expected role of the user,
        defaulted to `USER_ROLE`. For admin users, set this to
        `ADMIN_USER_ROLE`.
    """
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token is missing",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # verify the refresh token
    user = verify_token(
        refresh_token,
        token_type=REFRESH_TOKEN_TYPE,
        expected_user_role=expected_user_role
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_token(
        user["email"], user["user_id"], user["role"],
        token_type=ACCESS_TOKEN_TYPE
    )

    return {"access_token": access_token, "token_type": "bearer"}


# NOTE: This endpoint is used internally,
#  through dependency injection
#  to get a  object from ORM.
#  The token passed is the token received from the request
async def get_current_user(
        token: str = Depends(oauth2_bearer),
        expected_user_role: str = USER_ROLE
):
    """
    Verifies the JWT access token
    and returns a dictionary containing the user information
    encoded in the token.
    :param token: The token to verify
    :param expected_user_role: The expected role of the user,
        defaulted to `USER_ROLE`. For admin users, set this to
        `ADMIN_USER_ROLE`.
        If the token does not match the expected user role, an
        HTTP 403 Forbidden error is raised.
    """
    user = verify_token(token, expected_user_role=expected_user_role)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate user",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user

# test endpoint
# TODO: delete when finished
@router.get("/check_refresh_token")
async def check_refresh_token(
        request: Request,
):
    refresh_token = request.cookies.get("refresh_token")
    return {"refresh_token_exists": refresh_token is not None}