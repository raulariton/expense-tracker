from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from app.api.exceptions import set_exception_handlers
from app.api import receipt_scanning_router, auth_router, expenses_router

import numpy as np
import cv2

# initialize FastAPI object
app = FastAPI(
    title="ExpenseTracker",
    version="1.0.0"
)

origins = [
    # here we can add the list of domains
    # that are allowed to access the server
    # (anything that will use the API)
    "http://localhost:5173",
]

# add the middleware to the FastAPI object
# to allow CORS, which controls who can access
# the API (in our case, the frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    # allow sending JWT tokens (?)
    allow_credentials=True,
    # allow all methods (GET, POST, PUT, etc.)
    allow_methods=["*"],
    # allow all headers
    allow_headers=["*"],
)

set_exception_handlers(app)

app.include_router(receipt_scanning_router, prefix="/receipt")
app.include_router(auth_router, prefix="/auth")
app.include_router(expenses_router, prefix="/expenses")


# test endpoint
@app.get("/")
async def root():
    return {"message": "Hello World!"}
