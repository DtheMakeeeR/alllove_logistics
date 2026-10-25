Вот готовый **цельный README.md** с пошаговой инструкцией, без разрывов. Копируй всё в файл `README.md` в корне проекта.

```markdown
# AllLove Logistics — Backend

Бэкенд системы отслеживания поставок одежды. Стек: FastAPI + SQLAlchemy + PostgreSQL (Docker) + JWT.

---

## Шаг 0. Что нужно установить

- **Python 3.10+** — проверить: `python --version`
- **Docker Desktop** — проверить: `docker --version`. Должен быть **запущен**.
- **Git** — проверить: `git --version`

Все команды ниже выполняются в **CMD** на Windows.

---

## Шаг 1. Клонировать проект

```cmd
git clone <ССЫЛКА_НА_РЕПОЗИТОРИЙ>
cd alllove_logistics
```

---

## Шаг 2. Поднять базу данных

```cmd
docker-compose up -d
```

Проверить, что контейнер запущен:

```cmd
docker ps
```

В списке должна быть строка с `postgres:16` и портом `0.0.0.0:5433->5432/tcp`.

> Если порт `5433` занят — поменяй в `docker-compose.yml` и `app/config.py` на свободный (например, `5434`), затем снова `docker-compose up -d`.

---

## Шаг 3. Создать виртуальное окружение

```cmd
python -m venv venv
venv\Scripts\activate.bat
```

В начале строки появится `(venv)` — это значит, окружение активно.

---

## Шаг 4. Установить зависимости

```cmd
pip install -r requirements.txt
```

> В `requirements.txt` зафиксирован `bcrypt==4.0.1`. Не обновляй его до 5.x — будет ошибка с `passlib`.

---

## Шаг 5. Создать первого администратора

Запусти Python:

```cmd
python
```

В открывшемся интерпретаторе выполни по одной строке:

```python
from app.database import async_session
from app.models import User
from app.security import hash_password
import asyncio

async def create_admin():
    async with async_session() as db:
        db.add(User(
            email="admin@alllove.ru",
            full_name="Администратор",
            hashed_password=hash_password("admin123"),
            role="admin",
        ))
        await db.commit()
        print("Админ создан")

asyncio.run(create_admin())
exit()
```

Должно вывестись `Админ создан`.

---

## Шаг 6. Запустить сервер

```cmd
uvicorn app.main:app --reload
```

Открыть в браузере: **http://127.0.0.1:8000/docs**

Должна открыться Swagger-страница. Это значит, что бэкенд работает.

---

## Шаг 7. Проверить, что всё работает

1. В Swagger найди `POST /auth/login` → **Try it out**.
2. Введи:
   - `username`: `admin@alllove.ru`
   - `password`: `admin123`
3. Нажми **Execute**. В ответе будет `access_token` — скопируй его (не обязательно, дальше проще).
4. Нажми кнопку **Authorize** (замок справа вверху). Введи те же email/пароль, нажми **Authorize**.
5. Раскрой `GET /auth/me` → **Try it out** → **Execute**. Должен вернуться твой админ:
   ```json
   {"id": 1, "email": "admin@alllove.ru", "full_name": "Администратор", "role": "admin", "is_active": true}
   ```
6. Раскрой `POST /users` → **Try it out** → вставь тело:
   ```json
   {
     "email": "client1@alllove.ru",
     "full_name": "Иванов Иван",
     "password": "client123",
     "role": "client"
   }
   ```
   Нажми **Execute**. Должен вернуться созданный клиент с `id: 2`.

Если все 6 пунктов прошли — бэкенд полностью работает.

---

## Шаг 8. Проверить базу данных

В **новом** окне CMD (сервер не закрывай):

```cmd
docker exec -it alllove_logistics-db-1 psql -U alllove_user -d alllove_db -c "\dt"
```

Должны быть две таблицы: `users` и `supplies`.

Посмотреть пользователей:

```cmd
docker exec -it alllove_logistics-db-1 psql -U alllove_user -d alllove_db -c "SELECT id, email, role FROM users;"
```

Должны быть админ и клиент.

---

## Шаг 9. Как посмотреть базу графически (по желанию)

Установи **DBeaver** (бесплатный) или **pgAdmin** и создай подключение:

- Host: `localhost`
- Port: `5433`
- Database: `alllove_db`
- Username: `alllove_user`
- Password: `alllove_password`

После подключения увидишь таблицы и данные в удобном виде.

---

## Шаг 10. Как работать с Git

Перед началом работы всегда подтягивай изменения:

```cmd
git pull
```

После изменений:

```cmd
git add .
git commit -m "краткое описание, что сделал"
git push
```

Если ставил новые пакеты — обнови `requirements.txt`:

```cmd
pip freeze > requirements.txt
```

И проверь, что строка `bcrypt==4.0.1` осталась в файле.

---

## Частые проблемы

| Симптом | Решение |
|---|---|
| `ConnectionDoesNotExistError` при старте uvicorn | Порт `5432` занят. В `config.py` и `docker-compose.yml` должен быть `5433`. Проверь: `netstat -ano \| findstr :5433` — одна строка (Docker). |
| `module 'bcrypt' has no attribute '__about__'` | `pip install bcrypt==4.0.1` |
| `Ctrl+C` не останавливает uvicorn | Закрой окно CMD крестиком. Проверь: `tasklist \| findstr python`. Если висят процессы: `taskkill /F /IM python.exe`. |
| Docker не стартует | Убедись, что Docker Desktop запущен. Если ругается на WSL — Docker Desktop → Settings → Resources → WSL Integration → включить. |

---

## Важно

⚠️ **Никогда не выполняй `docker-compose down -v`** — флаг `-v` удаляет том с данными, и все пользователи/поставки пропадут. Без `-v` данные сохраняются.

---


```

Теперь это единый файл с поэтапной инструкцией. Если что-то лишнее или не хватает — скажи, поправлю.