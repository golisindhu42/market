import os
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
NEWS_API_KEY = os.getenv("NEWS_API_KEY", "")
CORS_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",") if o.strip()]
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
