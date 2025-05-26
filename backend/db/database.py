from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import declarative_base
import os
from pathlib import Path
from dotenv import load_dotenv

dotenv_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path)

Base = declarative_base()
DATABASE_URL = os.getenv("NEON_DATABASE_URL")
# NOTE: we add a pool_pre_ping=True
#  to the engine to ensure that
#  the connection is alive before using it.
#  and to discard any stale connections.
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)