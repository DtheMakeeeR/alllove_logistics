from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import date, datetime

class UserCreate(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=100)
    password: str = Field(..., min_length=6)
    role: str = Field(default="client", pattern="^(admin|validator|client)$")

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: str
    is_active: bool

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"



class SupplyCreate(BaseModel):
    supplier: str = Field(..., min_length=2, max_length=200)
    destination: str = Field(..., min_length=2, max_length=200)
    planned_date: date
    responsible_id: int

class SupplyOut(BaseModel):
    id: int
    number: str
    supplier: str
    destination: str
    planned_date: date
    status: str
    responsible_id: int
    created_by_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True