from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from .database import db
from .auth import get_current_user

router = APIRouter()

class Deck(BaseModel):
    name: str
    cards: list

@router.get("/decks")
async def get_decks(current_user: dict = Depends(get_current_user)):
    email = current_user["email"]
    decks = await db["decks"].find({"user": email}).to_list(100)
    return decks

@router.post("/decks")
async def create_deck(deck: Deck, current_user: dict = Depends(get_current_user)):
    email = current_user["email"]
    deck_doc = deck.dict()
    deck_doc["user"] = email
    await db["decks"].insert_one(deck_doc)
    return {"message": "Deck created"}

@router.delete("/decks/{deck_id}")
async def delete_deck(deck_id: str, current_user: dict = Depends(get_current_user)):
    email = current_user["email"]
    result = await db["decks"].delete_one({"user": email, "_id": deck_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Deck not found")
    return {"message": "Deck deleted"}
