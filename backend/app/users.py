from fastapi import APIRouter, Depends, HTTPException, status
from bson.objectid import ObjectId
from fastapi.security import OAuth2PasswordBearer
from .database import db
from .models import Card, Deck, DECKS_COLLECTION, USERS_COLLECTION
from .utils import decode_access_token

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# Helper: Get current user from JWT
async def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user = await db[USERS_COLLECTION].find_one({"email": payload.get("sub")})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/me/collection")
async def get_user_collection(current_user=Depends(get_current_user)):
    email = current_user["email"]
    user_collection = await db["collections"].find({"email": email}).to_list(length=1000)
    return user_collection

@router.post("/me/collection")
async def add_to_collection(card: Card, current_user=Depends(get_current_user)):
    email = current_user["email"]
    card_data = card.dict()
    card_data["email"] = email
    await db["collections"].insert_one(card_data)
    return {"message": f"{card.name} added to your collection."}

@router.delete("/me/collection/{scryfall_id}")
async def delete_from_collection(scryfall_id: str, current_user=Depends(get_current_user)):
    email = current_user["email"]
    result = await db["collections"].delete_one({"email": email, "scryfall_id": scryfall_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Card not found in collection")
    return {"message": "Card removed from your collection."}

@router.get("/me/decks")
async def get_user_decks(current_user=Depends(get_current_user)):
    user_id = current_user["_id"]
    decks = await db[DECKS_COLLECTION].find({"user_id": user_id}).to_list(length=100)
    return decks

@router.post("/me/decks")
async def create_deck(deck: Deck, current_user=Depends(get_current_user)):
    deck_data = deck.dict()
    deck_data["user_id"] = current_user["_id"]
    result = await db[DECKS_COLLECTION].insert_one(deck_data)
    return {"id": str(result.inserted_id), "message": "Deck created successfully"}

@router.get("/me/decks/{deck_id}")
async def get_single_deck(deck_id: str, current_user=Depends(get_current_user)):
    deck = await db[DECKS_COLLECTION].find_one({"_id": ObjectId(deck_id), "user_id": current_user["_id"]})
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")
    deck["_id"] = str(deck["_id"])
    return deck


@router.post("/me/decks/{deck_id}/cards")
async def add_card_to_deck(deck_id: str, card: Card, current_user=Depends(get_current_user)):
    result = await db[DECKS_COLLECTION].update_one(
        {"_id": ObjectId(deck_id), "user_id": current_user["_id"]},
        {"$push": {"cards": card.dict()}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Deck not found or not updated")
    return {"message": f"{card.name} added to deck."}


@router.delete("/me/decks/{deck_id}/cards/{scryfall_id}")
async def remove_card_from_deck(deck_id: str, scryfall_id: str, current_user=Depends(get_current_user)):
    result = await db[DECKS_COLLECTION].update_one(
        {"_id": ObjectId(deck_id), "user_id": current_user["_id"]},
        {"$pull": {"cards": {"scryfall_id": scryfall_id}}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Card not found or deck not updated")
    return {"message": "Card removed from deck."}

from fastapi import Body

@router.patch("/me/decks/{deck_id}")
async def rename_deck(deck_id: str, new_name: str = Body(...), current_user=Depends(get_current_user)):
    result = await db[DECKS_COLLECTION].update_one(
        {"_id": ObjectId(deck_id), "user_id": current_user["_id"]},
        {"$set": {"name": new_name}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Deck not found")
    return {"message": "Deck renamed successfully"}

@router.delete("/me/decks/{deck_id}")
async def delete_deck(deck_id: str, current_user=Depends(get_current_user)):
    result = await db[DECKS_COLLECTION].delete_one(
        {"_id": ObjectId(deck_id), "user_id": current_user["_id"]}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Deck not found")
    return {"message": "Deck deleted successfully"}
