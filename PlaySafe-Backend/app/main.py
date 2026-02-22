from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api.routes import router

app = FastAPI(title="PlaySafe AI Backend")

origins = [
    "http://localhost:8080",
    "https://tact-iq-seven.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

app.mount("/processed", StaticFiles(directory="processed"), name="processed")
app.mount("/static", StaticFiles(directory="static"), name="static")
