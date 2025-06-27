import re

from fastapi import APIRouter, Depends, HTTPException
from starlette import status
from starlette.responses import JSONResponse
from api.routes.auth import get_current_user
from services.auth.utils import db_dependency
from models.dbmodels import UserInfo
from typing import Dict


router = APIRouter()



@router.post("/modify-settings")
async def change_username(
        data: Dict[str, str],
        db: db_dependency,
        current_user: dict = Depends(get_current_user)
):

    new_username = data["username"]

    #USERNAME STRING VALIDATION IS DONE ON FRONTEND

    # Verify if username is taken
    if db.query(UserInfo.username).filter(UserInfo.username == new_username).first():
        raise HTTPException(status_code=400, detail="Username taken")


    # Update database
    user_id = current_user.get("user_id")
    user_data = db.query(UserInfo).filter(UserInfo.id_user == user_id).first()

    if user_data:
        user_data.username = new_username
        db.commit()
        return True
    else:
        return False










