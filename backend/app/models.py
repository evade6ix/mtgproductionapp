from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional

# ----- Pydantic Models -----

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: str
    email: EmailStr

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class Card(BaseModel):
    scryfall_id: str
    name: str
    set_name: str
    image_url: str
    price: Optional[float] = 0.0

class Deck(BaseModel):
    name: str
    cards: List[Card]

# ----- MongoDB Collection Names -----
USERS_COLLECTION = "users"
DECKS_COLLECTION = "decks"
