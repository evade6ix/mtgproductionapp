from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from .database import db
from .auth import get_current_user

router = APIRouter()

class Card(BaseModel):
    scryfall_id: str
    name: str
    set_name: str
    image_url: str
    price: float

@router.get("/collection")
async def get_collection(current_user: dict = Depends(get_current_user)):
    email = current_user["email"]
    collection = await db["collections"].find({"user": email}).to_list(1000)
    return collection

@router.post("/collection")
async def add_to_collection(card: Card, current_user: dict = Depends(get_current_user)):
    email = current_user["email"]
    card_doc = card.dict()
    card_doc["user"] = email
    await db["collections"].insert_one(card_doc)
    return {"message": "Card added to collection"}

@router.delete("/collection/{scryfall_id}")
async def remove_from_collection(scryfall_id: str, current_user: dict = Depends(get_current_user)):
    email = current_user["email"]
    result = await db["collections"].delete_one({"user": email, "scryfall_id": scryfall_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Card not found")
    return {"message": "Card removed from collection"}
