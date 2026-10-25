from app.security import hash_password, verify_password, create_access_token, require_admin, get_current_user

import asyncio
import sys

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import engine, Base, get_db
from app import models, schemas
from app.security import hash_password, verify_password, create_access_token, require_admin

app = FastAPI(title="AllLove Logistics API")

@app.on_event("startup")
async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.get("/")
async def root():
    return {"message": "AllLove Logistics API is running"}

# --- Логин ---
@app.post("/auth/login", response_model=schemas.Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(models.User).where(models.User.email == form_data.username))
    user = result.scalar_one_or_none()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Неверный email или пароль")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Учётная запись заблокирована")
    token = create_access_token({"sub": str(user.id), "role": user.role})
    return {"access_token": token, "token_type": "bearer"}

# --- Создание пользователя (только админ) ---
@app.post("/users", response_model=schemas.UserOut, status_code=201)
async def create_user(
    data: schemas.UserCreate,
    db: AsyncSession = Depends(get_db),
    admin: models.User = Depends(require_admin),
):
    result = await db.execute(select(models.User).where(models.User.email == data.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Пользователь с таким email уже существует")
    user = models.User(
        email=data.email,
        full_name=data.full_name,
        hashed_password=hash_password(data.password),
        role=data.role,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

# --- Список пользователей (только админ) ---
@app.get("/users", response_model=list[schemas.UserOut])
async def list_users(
    db: AsyncSession = Depends(get_db),
    admin: models.User = Depends(require_admin),
):
    result = await db.execute(select(models.User))
    return result.scalars().all()

# --- Кто я (проверка токена) ---
from app.security import get_current_user

@app.get("/auth/me", response_model=schemas.UserOut)
async def me(current_user: models.User = Depends(get_current_user)):
    return current_user

from datetime import date
from sqlalchemy import func

def generate_supply_number(last_id: int) -> str:
    return f"SUP-{last_id + 1:04d}"

@app.post("/supplies", response_model=schemas.SupplyOut, status_code=201)
async def create_supply(
    data: schemas.SupplyCreate,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role not in ("client", "admin"):
        raise HTTPException(status_code=403, detail="Создавать поставки может только клиент или админ")

    # Проверим, что ответственный существует и активен
    result = await db.execute(select(models.User).where(models.User.id == data.responsible_id))
    responsible = result.scalar_one_or_none()
    if not responsible or not responsible.is_active:
        raise HTTPException(status_code=400, detail="Ответственный сотрудник не найден или заблокирован")

    # Генерируем номер
    result = await db.execute(select(func.max(models.Supply.id)))
    last_id = result.scalar() or 0
    number = generate_supply_number(last_id)

    supply = models.Supply(
        number=number,
        supplier=data.supplier,
        destination=data.destination,
        planned_date=data.planned_date,
        status="created",
        responsible_id=data.responsible_id,
        created_by_id=current_user.id,
    )
    db.add(supply)
    await db.commit()
    await db.refresh(supply)
    return supply

@app.get("/supplies", response_model=list[schemas.SupplyOut])
async def list_supplies(
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    query = select(models.Supply)
    if current_user.role == "client":
        # Клиент видит только свои (где он создатель или ответственный)
        query = query.where(
            (models.Supply.created_by_id == current_user.id)
            | (models.Supply.responsible_id == current_user.id)
        )
    elif current_user.role == "validator":
        # Валидатор видит поставки на проверке
        query = query.where(models.Supply.status == "on_check")
    # admin видит всё
    result = await db.execute(query.order_by(models.Supply.id.desc()))
    return result.scalars().all()

@app.get("/supplies/{supply_id}", response_model=schemas.SupplyOut)
async def get_supply(
    supply_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    result = await db.execute(select(models.Supply).where(models.Supply.id == supply_id))
    supply = result.scalar_one_or_none()
    if not supply:
        raise HTTPException(status_code=404, detail="Поставка не найдена")

    if current_user.role == "client" and supply.created_by_id != current_user.id and supply.responsible_id != current_user.id:
        raise HTTPException(status_code=403, detail="Нет доступа к этой поставке")
    return supply