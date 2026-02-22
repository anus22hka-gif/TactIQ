from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router

app = FastAPI(title="PlaySafe AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],  # 👈 IMPORTANT
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

from fastapi.staticfiles import StaticFiles

app.mount("/processed", StaticFiles(directory="processed"), name="processed")

from fastapi.staticfiles import StaticFiles

app.mount("/static", StaticFiles(directory="static"), name="static")
