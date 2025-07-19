from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import auth, collection, decks

app = FastAPI()

origins = [
    "http://localhost:5173",
    "https://your-vercel-site.vercel.app"  # Replace with Vercel domain
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth")
app.include_router(collection.router, prefix="/users/me")
app.include_router(decks.router, prefix="/users/me")

@app.get("/")
async def read_root():
    return {"message": "Welcome to the MTG API Backend!"}
