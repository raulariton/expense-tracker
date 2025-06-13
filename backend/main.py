from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.exceptions import set_exception_handlers
from api import receipt_scanning_router, auth_router, expenses_router

from api.routes.admin import admin_router

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
    allow_origins=origins,
    # allow sending cookies with requests
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
app.include_router(admin_router,prefix="/admin")



# test endpoint
@app.get("/")
async def root():
    return {"message": "Hello World!"}
