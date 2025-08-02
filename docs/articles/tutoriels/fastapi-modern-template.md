---
title: "Template de projet FastAPI moderne"
date: 2025-08-02
tags: [fastapi, python, backend, api, template, architecture, microservices]
author: mooki
excerpt: "Guide complet pour créer un template de projet FastAPI moderne avec les meilleures pratiques 2025 : architecture, sécurité, tests, déploiement et observabilité."
category: tutoriels
---

# Template de projet FastAPI moderne

<Badge type="tip" text="FastAPI 0.115+ & Python 3.12+" />

FastAPI s'est imposé comme le framework de référence pour développer des APIs modernes en Python. Ce guide présente un template complet incorporant les meilleures pratiques 2025 pour créer des applications robustes, scalables et maintenables.

## Architecture du template

### Structure de projet recommandée

```
fastapi-modern-template/
├── app/
│   ├── __init__.py
│   ├── main.py                    # Point d'entrée FastAPI
│   ├── config/
│   │   ├── __init__.py
│   │   ├── settings.py            # Configuration Pydantic
│   │   └── database.py            # Configuration DB
│   ├── core/
│   │   ├── __init__.py
│   │   ├── security.py            # JWT, authentification
│   │   ├── exceptions.py          # Gestionnaires d'erreurs
│   │   ├── middleware.py          # Middleware personnalisés
│   │   └── dependencies.py        # Dépendances réutilisables
│   ├── models/
│   │   ├── __init__.py
│   │   ├── base.py                # Modèle de base SQLAlchemy
│   │   ├── user.py                # Modèles utilisateur
│   │   └── ...
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── user.py                # Schémas Pydantic
│   │   ├── common.py              # Schémas partagés
│   │   └── ...
│   ├── services/
│   │   ├── __init__.py
│   │   ├── user_service.py        # Logique métier
│   │   ├── auth_service.py
│   │   └── ...
│   ├── repositories/
│   │   ├── __init__.py
│   │   ├── base.py                # Repository générique
│   │   ├── user_repository.py     # Accès données
│   │   └── ...
│   ├── api/
│   │   ├── __init__.py
│   │   ├── v1/
│   │   │   ├── __init__.py
│   │   │   ├── router.py          # Router principal v1
│   │   │   ├── endpoints/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── auth.py        # Endpoints auth
│   │   │   │   ├── users.py       # Endpoints users
│   │   │   │   └── ...
│   │   │   └── dependencies.py    # Dépendances v1
│   │   └── v2/                    # Versioning API
│   └── utils/
│       ├── __init__.py
│       ├── logger.py              # Configuration logging
│       ├── cache.py               # Cache Redis
│       └── helpers.py             # Utilitaires
├── tests/
│   ├── __init__.py
│   ├── conftest.py                # Configuration pytest
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── scripts/
│   ├── run_dev.py                 # Script développement
│   ├── migrate.py                 # Migrations DB
│   └── seed_data.py               # Données de test
├── docker/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── docker-compose.prod.yml
├── k8s/                           # Manifestes Kubernetes
├── requirements/
│   ├── base.txt                   # Dépendances de base
│   ├── dev.txt                    # Dépendances développement
│   └── prod.txt                   # Dépendances production
├── pyproject.toml                 # Configuration Python
├── alembic.ini                    # Configuration Alembic
├── .env.example                   # Variables d'environnement
└── README.md
```

### Principes architecturaux

::: info Architecture en couches
- **API Layer** - Endpoints FastAPI, validation, sérialisation
- **Service Layer** - Logique métier, orchestration
- **Repository Layer** - Accès aux données, abstraction DB
- **Model Layer** - Entités métier, validation données
:::

## Configuration moderne avec Pydantic

```python
# app/config/settings.py
from functools import lru_cache
from typing import Any, Dict, List, Optional, Union
from pydantic import (
    BaseSettings, 
    PostgresDsn, 
    RedisDsn, 
    validator,
    Field
)
import secrets

class Settings(BaseSettings):
    # Application
    APP_NAME: str = "FastAPI Modern Template"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = Field(default=False, env="DEBUG")
    API_V1_STR: str = "/api/v1"
    API_V2_STR: str = "/api/v2"
    
    # Security
    SECRET_KEY: str = Field(default_factory=lambda: secrets.token_urlsafe(32))
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 30  # 30 days
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = Field(default=["http://localhost:3000"])
    
    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)
    
    # Database
    POSTGRES_SERVER: str = Field(env="POSTGRES_SERVER")
    POSTGRES_USER: str = Field(env="POSTGRES_USER")
    POSTGRES_PASSWORD: str = Field(env="POSTGRES_PASSWORD")
    POSTGRES_DB: str = Field(env="POSTGRES_DB")
    POSTGRES_PORT: int = Field(default=5432, env="POSTGRES_PORT")
    
    DATABASE_URL: Optional[PostgresDsn] = None
    
    @validator("DATABASE_URL", pre=True)
    def assemble_db_connection(cls, v: Optional[str], values: Dict[str, Any]) -> Any:
        if isinstance(v, str):
            return v
        return PostgresDsn.build(
            scheme="postgresql+asyncpg",
            user=values.get("POSTGRES_USER"),
            password=values.get("POSTGRES_PASSWORD"),
            host=values.get("POSTGRES_SERVER"),
            port=str(values.get("POSTGRES_PORT")),
            path=f"/{values.get('POSTGRES_DB') or ''}",
        )
    
    # Redis
    REDIS_HOST: str = Field(default="localhost", env="REDIS_HOST")
    REDIS_PORT: int = Field(default=6379, env="REDIS_PORT")
    REDIS_PASSWORD: Optional[str] = Field(default=None, env="REDIS_PASSWORD")
    REDIS_DB: int = Field(default=0, env="REDIS_DB")
    
    REDIS_URL: Optional[RedisDsn] = None
    
    @validator("REDIS_URL", pre=True)
    def assemble_redis_connection(cls, v: Optional[str], values: Dict[str, Any]) -> Any:
        if isinstance(v, str):
            return v
        return RedisDsn.build(
            scheme="redis",
            password=values.get("REDIS_PASSWORD"),
            host=values.get("REDIS_HOST"),
            port=str(values.get("REDIS_PORT")),
            path=f"/{values.get('REDIS_DB') or '0'}",
        )
    
    # Monitoring
    SENTRY_DSN: Optional[str] = Field(default=None, env="SENTRY_DSN")
    LOG_LEVEL: str = Field(default="INFO", env="LOG_LEVEL")
    
    # External APIs
    SMTP_TLS: bool = Field(default=True, env="SMTP_TLS")
    SMTP_SSL: bool = Field(default=False, env="SMTP_SSL")
    SMTP_PORT: Optional[int] = Field(default=None, env="SMTP_PORT")
    SMTP_HOST: Optional[str] = Field(default=None, env="SMTP_HOST")
    SMTP_USER: Optional[str] = Field(default=None, env="SMTP_USER")
    SMTP_PASSWORD: Optional[str] = Field(default=None, env="SMTP_PASSWORD")
    EMAILS_FROM_EMAIL: Optional[str] = Field(default=None, env="EMAILS_FROM_EMAIL")
    
    # Performance
    MAX_CONNECTIONS_COUNT: int = Field(default=10, env="MAX_CONNECTIONS_COUNT")
    MIN_CONNECTIONS_COUNT: int = Field(default=10, env="MIN_CONNECTIONS_COUNT")
    
    class Config:
        case_sensitive = True
        env_file = ".env"
        env_file_encoding = "utf-8"

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()
```

## Base de données avec SQLAlchemy 2.0

```python
# app/config/database.py
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool
from typing import AsyncGenerator

from app.config.settings import settings

# Engine asynchrone
engine = create_async_engine(
    str(settings.DATABASE_URL),
    echo=settings.DEBUG,
    poolclass=NullPool,
    pool_pre_ping=True,
)

# Session factory
async_session_maker = sessionmaker(
    engine, 
    class_=AsyncSession, 
    expire_on_commit=False
)

Base = declarative_base()

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await session.close()

# app/models/base.py
from sqlalchemy import Column, DateTime, Integer, func
from sqlalchemy.ext.declarative import declared_attr
from app.config.database import Base

class TimestampMixin:
    """Mixin pour créer des timestamps automatiques"""
    @declared_attr
    def created_at(cls):
        return Column(DateTime, default=func.now(), nullable=False)
    
    @declared_attr
    def updated_at(cls):
        return Column(
            DateTime, 
            default=func.now(), 
            onupdate=func.now(), 
            nullable=False
        )

class BaseModel(Base, TimestampMixin):
    """Modèle de base avec ID et timestamps"""
    __abstract__ = True
    
    id = Column(Integer, primary_key=True, index=True)

# app/models/user.py
from sqlalchemy import Column, String, Boolean, Text
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class User(BaseModel):
    __tablename__ = "users"
    
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_superuser = Column(Boolean, default=False, nullable=False)
    bio = Column(Text, nullable=True)
    
    def __repr__(self) -> str:
        return f"<User(id={self.id}, email='{self.email}')>"
```

## Schémas Pydantic v2

```python
# app/schemas/common.py
from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class BaseSchema(BaseModel):
    """Schéma de base avec configuration v2"""
    model_config = ConfigDict(
        from_attributes=True,
        validate_assignment=True,
        arbitrary_types_allowed=True,
        str_strip_whitespace=True,
    )

class TimestampSchema(BaseSchema):
    """Schéma avec timestamps"""
    created_at: datetime
    updated_at: datetime

class PaginationParams(BaseSchema):
    """Paramètres de pagination"""
    page: int = 1
    size: int = 20
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "page": 1,
                "size": 20
            }
        }
    )

class PaginatedResponse(BaseSchema):
    """Réponse paginée générique"""
    items: list
    total: int
    page: int
    size: int
    pages: int

# app/schemas/user.py
from pydantic import EmailStr, Field, validator
from typing import Optional
from app.schemas.common import BaseSchema, TimestampSchema

class UserBase(BaseSchema):
    """Schéma de base pour User"""
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    full_name: Optional[str] = Field(None, max_length=255)
    bio: Optional[str] = Field(None, max_length=1000)
    is_active: bool = True

class UserCreate(UserBase):
    """Schéma pour création d'utilisateur"""
    password: str = Field(..., min_length=8, max_length=128)
    confirm_password: str
    
    @validator('confirm_password')
    def passwords_match(cls, v, values):
        if 'password' in values and v != values['password']:
            raise ValueError('Passwords do not match')
        return v
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "email": "user@example.com",
                "username": "johndoe",
                "full_name": "John Doe",
                "password": "strongpassword123",
                "confirm_password": "strongpassword123",
                "bio": "Software developer"
            }
        }
    )

class UserUpdate(BaseSchema):
    """Schéma pour mise à jour d'utilisateur"""
    full_name: Optional[str] = Field(None, max_length=255)
    bio: Optional[str] = Field(None, max_length=1000)

class UserInDB(UserBase, TimestampSchema):
    """Schéma pour utilisateur en base"""
    id: int
    is_superuser: bool = False

class UserResponse(UserInDB):
    """Schéma de réponse utilisateur (sans données sensibles)"""
    pass

class UserLogin(BaseSchema):
    """Schéma pour connexion"""
    email: EmailStr
    password: str = Field(..., min_length=1)

class Token(BaseSchema):
    """Schéma pour token JWT"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int

class TokenData(BaseSchema):
    """Données contenues dans le token"""
    user_id: Optional[int] = None
    email: Optional[str] = None
```

## Architecture Repository Pattern

```python
# app/repositories/base.py
from typing import Generic, TypeVar, Type, Optional, List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, func
from sqlalchemy.orm import selectinload
from pydantic import BaseModel

from app.config.database import Base

ModelType = TypeVar("ModelType", bound=Base)
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)

class BaseRepository(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    def __init__(self, model: Type[ModelType], db: AsyncSession):
        self.model = model
        self.db = db
    
    async def get(self, id: int) -> Optional[ModelType]:
        """Récupérer un objet par ID"""
        result = await self.db.execute(select(self.model).where(self.model.id == id))
        return result.scalar_one_or_none()
    
    async def get_multi(
        self, 
        *, 
        skip: int = 0, 
        limit: int = 100,
        filters: Dict[str, Any] = None
    ) -> List[ModelType]:
        """Récupérer plusieurs objets avec pagination"""
        query = select(self.model)
        
        if filters:
            for field, value in filters.items():
                if hasattr(self.model, field):
                    query = query.where(getattr(self.model, field) == value)
        
        query = query.offset(skip).limit(limit)
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def count(self, filters: Dict[str, Any] = None) -> int:
        """Compter les objets avec filtres optionnels"""
        query = select(func.count(self.model.id))
        
        if filters:
            for field, value in filters.items():
                if hasattr(self.model, field):
                    query = query.where(getattr(self.model, field) == value)
        
        result = await self.db.execute(query)
        return result.scalar()
    
    async def create(self, *, obj_in: CreateSchemaType) -> ModelType:
        """Créer un nouvel objet"""
        obj_data = obj_in.model_dump()
        db_obj = self.model(**obj_data)
        self.db.add(db_obj)
        await self.db.commit()
        await self.db.refresh(db_obj)
        return db_obj
    
    async def update(
        self, 
        *, 
        db_obj: ModelType, 
        obj_in: UpdateSchemaType
    ) -> ModelType:
        """Mettre à jour un objet existant"""
        obj_data = obj_in.model_dump(exclude_unset=True)
        
        for field, value in obj_data.items():
            setattr(db_obj, field, value)
        
        await self.db.commit()
        await self.db.refresh(db_obj)
        return db_obj
    
    async def delete(self, *, id: int) -> Optional[ModelType]:
        """Supprimer un objet par ID"""
        obj = await self.get(id)
        if obj:
            await self.db.delete(obj)
            await self.db.commit()
        return obj

# app/repositories/user_repository.py
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.repositories.base import BaseRepository

class UserRepository(BaseRepository[User, UserCreate, UserUpdate]):
    def __init__(self, db: AsyncSession):
        super().__init__(User, db)
    
    async def get_by_email(self, email: str) -> Optional[User]:
        """Récupérer un utilisateur par email"""
        result = await self.db.execute(
            select(self.model).where(self.model.email == email)
        )
        return result.scalar_one_or_none()
    
    async def get_by_username(self, username: str) -> Optional[User]:
        """Récupérer un utilisateur par username"""
        result = await self.db.execute(
            select(self.model).where(self.model.username == username)
        )
        return result.scalar_one_or_none()
    
    async def is_email_taken(self, email: str, exclude_id: Optional[int] = None) -> bool:
        """Vérifier si l'email est déjà utilisé"""
        query = select(self.model).where(self.model.email == email)
        if exclude_id:
            query = query.where(self.model.id != exclude_id)
        
        result = await self.db.execute(query)
        return result.scalar_one_or_none() is not None
    
    async def is_username_taken(self, username: str, exclude_id: Optional[int] = None) -> bool:
        """Vérifier si le username est déjà utilisé"""
        query = select(self.model).where(self.model.username == username)
        if exclude_id:
            query = query.where(self.model.id != exclude_id)
        
        result = await self.db.execute(query)
        return result.scalar_one_or_none() is not None
```

## Services Layer avec logique métier

```python
# app/services/user_service.py
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate, UserResponse
from app.repositories.user_repository import UserRepository
from app.core.security import get_password_hash, verify_password

class UserService:
    def __init__(self, db: AsyncSession):
        self.repository = UserRepository(db)
    
    async def create_user(self, user_data: UserCreate) -> UserResponse:
        """Créer un nouvel utilisateur"""
        # Vérifier si l'email existe déjà
        if await self.repository.is_email_taken(user_data.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Vérifier si le username existe déjà
        if await self.repository.is_username_taken(user_data.username):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
        
        # Hacher le mot de passe
        hashed_password = get_password_hash(user_data.password)
        
        # Créer l'utilisateur (sans confirm_password)
        user_dict = user_data.model_dump(exclude={"password", "confirm_password"})
        user_dict["hashed_password"] = hashed_password
        
        # Utiliser un schéma temporaire pour la création
        from pydantic import BaseModel
        class UserCreateDB(BaseModel):
            email: str
            username: str
            full_name: Optional[str]
            bio: Optional[str]
            hashed_password: str
            is_active: bool = True
        
        user_create_db = UserCreateDB(**user_dict)
        user = await self.repository.create(obj_in=user_create_db)
        
        return UserResponse.model_validate(user)
    
    async def get_user(self, user_id: int) -> Optional[UserResponse]:
        """Récupérer un utilisateur par ID"""
        user = await self.repository.get(user_id)
        if not user:
            return None
        return UserResponse.model_validate(user)
    
    async def get_user_by_email(self, email: str) -> Optional[UserResponse]:
        """Récupérer un utilisateur par email"""
        user = await self.repository.get_by_email(email)
        if not user:
            return None
        return UserResponse.model_validate(user)
    
    async def update_user(self, user_id: int, user_data: UserUpdate) -> UserResponse:
        """Mettre à jour un utilisateur"""
        user = await self.repository.get(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        updated_user = await self.repository.update(db_obj=user, obj_in=user_data)
        return UserResponse.model_validate(updated_user)
    
    async def delete_user(self, user_id: int) -> bool:
        """Supprimer un utilisateur"""
        user = await self.repository.delete(id=user_id)
        return user is not None
    
    async def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """Authentifier un utilisateur"""
        user = await self.repository.get_by_email(email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user
    
    async def get_users(
        self, 
        skip: int = 0, 
        limit: int = 100
    ) -> List[UserResponse]:
        """Récupérer une liste d'utilisateurs"""
        users = await self.repository.get_multi(skip=skip, limit=limit)
        return [UserResponse.model_validate(user) for user in users]
```

## Sécurité et authentification JWT

```python
# app/core/security.py
from datetime import datetime, timedelta, timezone
from typing import Optional, Union, Any
from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import HTTPException, status

from app.config.settings import settings

# Configuration du hachage des mots de passe
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ALGORITHM = "HS256"

def create_access_token(
    subject: Union[str, Any], 
    expires_delta: Optional[timedelta] = None
) -> str:
    """Créer un token d'accès JWT"""
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "type": "access"
    }
    
    encoded_jwt = jwt.encode(
        to_encode, 
        settings.SECRET_KEY, 
        algorithm=ALGORITHM
    )
    return encoded_jwt

def create_refresh_token(
    subject: Union[str, Any], 
    expires_delta: Optional[timedelta] = None
) -> str:
    """Créer un token de rafraîchissement JWT"""
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES
        )
    
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "type": "refresh"
    }
    
    encoded_jwt = jwt.encode(
        to_encode, 
        settings.SECRET_KEY, 
        algorithm=ALGORITHM
    )
    return encoded_jwt

def verify_token(token: str, token_type: str = "access") -> Optional[str]:
    """Vérifier et décoder un token JWT"""
    try:
        payload = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=[ALGORITHM]
        )
        
        # Vérifier le type de token
        if payload.get("type") != token_type:
            return None
        
        # Récupérer le sujet (user_id)
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
        
        return user_id
    except JWTError:
        return None

def get_password_hash(password: str) -> str:
    """Hacher un mot de passe"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Vérifier un mot de passe"""
    return pwd_context.verify(plain_password, hashed_password)

# app/core/dependencies.py
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.core.security import verify_token
from app.models.user import User
from app.repositories.user_repository import UserRepository

# Configuration du schéma de sécurité
security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    """Dépendance pour récupérer l'utilisateur courant"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Vérifier le token
        user_id = verify_token(credentials.credentials)
        if user_id is None:
            raise credentials_exception
    except Exception:
        raise credentials_exception
    
    # Récupérer l'utilisateur
    user_repository = UserRepository(db)
    user = await user_repository.get(int(user_id))
    
    if user is None:
        raise credentials_exception
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    return user

async def get_current_active_superuser(
    current_user: User = Depends(get_current_user),
) -> User:
    """Dépendance pour les utilisateurs admin uniquement"""
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

def get_optional_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    """Dépendance pour récupérer l'utilisateur courant (optionnel)"""
    if not credentials:
        return None
    
    try:
        user_id = verify_token(credentials.credentials)
        if user_id is None:
            return None
        
        user_repository = UserRepository(db)
        return user_repository.get(int(user_id))
    except Exception:
        return None
```

## API Endpoints avec versioning

```python
# app/api/v1/endpoints/auth.py
from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.config.settings import settings
from app.schemas.user import UserCreate, UserResponse, Token
from app.services.user_service import UserService
from app.core.security import create_access_token, create_refresh_token

router = APIRouter()

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Créer un nouveau compte utilisateur.
    """
    user_service = UserService(db)
    return await user_service.create_user(user_data)

@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Connexion utilisateur avec email/password.
    """
    user_service = UserService(db)
    user = await user_service.authenticate_user(form_data.username, form_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = timedelta(minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES)
    
    access_token = create_access_token(
        subject=user.id, 
        expires_delta=access_token_expires
    )
    refresh_token = create_refresh_token(
        subject=user.id, 
        expires_delta=refresh_token_expires
    )
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )

# app/api/v1/endpoints/users.py
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.core.dependencies import get_current_user, get_current_active_superuser
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate
from app.schemas.common import PaginatedResponse, PaginationParams
from app.services.user_service import UserService

router = APIRouter()

@router.get("/me", response_model=UserResponse)
async def read_user_me(
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Récupérer les informations de l'utilisateur courant.
    """
    return UserResponse.model_validate(current_user)

@router.put("/me", response_model=UserResponse)
async def update_user_me(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Mettre à jour les informations de l'utilisateur courant.
    """
    user_service = UserService(db)
    return await user_service.update_user(current_user.id, user_update)

@router.get("/", response_model=PaginatedResponse)
async def read_users(
    pagination: PaginationParams = Depends(),
    current_user: User = Depends(get_current_active_superuser),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Récupérer tous les utilisateurs (admin uniquement).
    """
    user_service = UserService(db)
    
    # Calculer skip à partir de page
    skip = (pagination.page - 1) * pagination.size
    
    users = await user_service.get_users(skip=skip, limit=pagination.size)
    
    # Compter le total (pour la pagination)
    from app.repositories.user_repository import UserRepository
    user_repository = UserRepository(db)
    total = await user_repository.count()
    
    pages = (total + pagination.size - 1) // pagination.size
    
    return PaginatedResponse(
        items=users,
        total=total,
        page=pagination.page,
        size=pagination.size,
        pages=pages
    )

@router.get("/{user_id}", response_model=UserResponse)
async def read_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Récupérer un utilisateur par ID.
    """
    user_service = UserService(db)
    user = await user_service.get_user(user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Vérifier les permissions (utilisateur courant ou admin)
    if current_user.id != user_id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return user

# app/api/v1/router.py
from fastapi import APIRouter
from app.api.v1.endpoints import auth, users

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
```

## Application FastAPI principale

```python
# app/main.py
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError
import time
import logging

from app.config.settings import settings
from app.api.v1.router import api_router as api_v1_router
from app.core.exceptions import setup_exception_handlers
from app.core.middleware import setup_middleware
from app.utils.logger import setup_logging

# Configuration du logging
setup_logging()
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gestionnaire de cycle de vie de l'application"""
    # Startup
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    
    # Initialisation de la base de données
    try:
        from app.config.database import engine
        # Tester la connexion
        async with engine.begin() as conn:
            await conn.execute("SELECT 1")
        logger.info("Database connection established")
    except Exception as e:
        logger.error(f"Failed to connect to database: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("Shutting down application")
    await engine.dispose()

# Création de l'application FastAPI
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Modern FastAPI template with best practices",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan,
)

# Configuration CORS
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Configuration TrustedHost en production
if not settings.DEBUG:
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["localhost", "127.0.0.1", "*.yourdomain.com"]
    )

# Middleware de timing
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

# Gestionnaires d'exceptions
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "Validation error",
            "errors": exc.errors(),
        },
    )

@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    logger.error(f"Database error: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error"},
    )

# Routes principales
app.include_router(api_v1_router, prefix=settings.API_V1_STR)

# Endpoints de santé
@app.get("/health")
async def health_check():
    """Endpoint de vérification de santé"""
    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": "development" if settings.DEBUG else "production"
    }

@app.get("/")
async def root():
    """Endpoint racine"""
    return {
        "message": f"Welcome to {settings.APP_NAME}",
        "version": settings.APP_VERSION,
        "docs": f"{settings.API_V1_STR}/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower()
    )
```

## Tests avec pytest et fixtures

```python
# tests/conftest.py
import asyncio
import pytest
import pytest_asyncio
from typing import AsyncGenerator, Generator
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.config.database import get_db, Base
from app.config.settings import settings

# Configuration de la base de données de test
TEST_DATABASE_URL = "sqlite+aiosqlite:///./test.db"

engine = create_async_engine(
    TEST_DATABASE_URL,
    poolclass=StaticPool,
    connect_args={"check_same_thread": False},
    echo=False,
)

TestingSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

@pytest_asyncio.fixture(scope="session")
async def setup_database():
    """Créer les tables de test"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest_asyncio.fixture
async def db_session(setup_database) -> AsyncGenerator[AsyncSession, None]:
    """Session de base de données pour les tests"""
    async with TestingSessionLocal() as session:
        yield session

@pytest.fixture
def client(db_session: AsyncSession) -> Generator[TestClient, None, None]:
    """Client de test FastAPI"""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest_asyncio.fixture
async def test_user(db_session: AsyncSession):
    """Utilisateur de test"""
    from app.services.user_service import UserService
    from app.schemas.user import UserCreate
    
    user_service = UserService(db_session)
    user_data = UserCreate(
        email="test@example.com",
        username="testuser",
        full_name="Test User",
        password="testpassword123",
        confirm_password="testpassword123"
    )
    return await user_service.create_user(user_data)

@pytest_asyncio.fixture
async def test_superuser(db_session: AsyncSession):
    """Super utilisateur de test"""
    from app.models.user import User
    from app.core.security import get_password_hash
    
    user = User(
        email="admin@example.com",
        username="admin",
        full_name="Admin User",
        hashed_password=get_password_hash("adminpassword123"),
        is_superuser=True,
        is_active=True
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user

@pytest.fixture
def auth_headers(test_user):
    """Headers d'authentification pour les tests"""
    from app.core.security import create_access_token
    
    access_token = create_access_token(subject=test_user.id)
    return {"Authorization": f"Bearer {access_token}"}

# tests/unit/test_user_service.py
import pytest
from unittest.mock import Mock, AsyncMock
from app.services.user_service import UserService
from app.schemas.user import UserCreate

@pytest.mark.asyncio
async def test_create_user_success():
    """Test de création d'utilisateur réussie"""
    # Mock du repository
    mock_repo = Mock()
    mock_repo.is_email_taken = AsyncMock(return_value=False)
    mock_repo.is_username_taken = AsyncMock(return_value=False)
    mock_repo.create = AsyncMock(return_value=Mock(
        id=1,
        email="test@example.com",
        username="testuser",
        full_name="Test User",
        is_active=True,
        is_superuser=False,
        created_at="2023-01-01T00:00:00",
        updated_at="2023-01-01T00:00:00"
    ))
    
    # Service avec mock
    service = UserService(Mock())
    service.repository = mock_repo
    
    # Test
    user_data = UserCreate(
        email="test@example.com",
        username="testuser",
        password="password123",
        confirm_password="password123"
    )
    
    result = await service.create_user(user_data)
    
    assert result.email == "test@example.com"
    assert result.username == "testuser"
    mock_repo.is_email_taken.assert_called_once_with("test@example.com")
    mock_repo.create.assert_called_once()

# tests/integration/test_auth_endpoints.py
import pytest
from fastapi.testclient import TestClient

def test_register_user(client: TestClient):
    """Test d'inscription d'utilisateur"""
    user_data = {
        "email": "newuser@example.com",
        "username": "newuser",
        "full_name": "New User",
        "password": "newpassword123",
        "confirm_password": "newpassword123"
    }
    
    response = client.post("/api/v1/auth/register", json=user_data)
    
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == user_data["email"]
    assert data["username"] == user_data["username"]
    assert "id" in data
    assert "created_at" in data

def test_login_user(client: TestClient, test_user):
    """Test de connexion d'utilisateur"""
    login_data = {
        "username": "test@example.com",  # OAuth2PasswordRequestForm utilise username
        "password": "testpassword123"
    }
    
    response = client.post("/api/v1/auth/login", data=login_data)
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"

def test_login_invalid_credentials(client: TestClient):
    """Test de connexion avec mauvais credentials"""
    login_data = {
        "username": "wrong@example.com",
        "password": "wrongpassword"
    }
    
    response = client.post("/api/v1/auth/login", data=login_data)
    
    assert response.status_code == 401
    assert "Incorrect email or password" in response.json()["detail"]
```

## Déploiement avec Docker

```dockerfile
# docker/Dockerfile
FROM python:3.12-slim

# Variables d'environnement
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Créer un utilisateur non-root
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Répertoire de travail
WORKDIR /app

# Installation des dépendances système
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Installation des dépendances Python
COPY requirements/prod.txt .
RUN pip install --no-cache-dir -r prod.txt

# Copier le code de l'application
COPY --chown=appuser:appuser ./app /app/app

# Changer vers l'utilisateur non-root
USER appuser

# Exposer le port
EXPOSE 8000

# Commande par défaut
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```yaml
# docker/docker-compose.yml
version: '3.8'

services:
  app:
    build:
      context: ..
      dockerfile: docker/Dockerfile
    ports:
      - "8000:8000"
    environment:
      - DEBUG=false
      - DATABASE_URL=postgresql+asyncpg://postgres:password@db:5432/fastapi_app
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - db
      - redis
    volumes:
      - ../app:/app/app
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  db:
    image: postgres:15
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=fastapi_app
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - app

volumes:
  postgres_data:
  redis_data:
```

## Cache et performance

```python
# app/utils/cache.py
import json
import pickle
from typing import Any, Optional, Union
from datetime import timedelta
import redis.asyncio as redis
from app.config.settings import settings

class CacheService:
    def __init__(self):
        self.redis_client = redis.from_url(
            str(settings.REDIS_URL),
            encoding="utf-8",
            decode_responses=True
        )
    
    async def get(self, key: str) -> Optional[Any]:
        """Récupérer une valeur du cache"""
        try:
            value = await self.redis_client.get(key)
            if value is None:
                return None
            return json.loads(value)
        except Exception:
            return None
    
    async def set(
        self, 
        key: str, 
        value: Any, 
        expire: Optional[Union[int, timedelta]] = None
    ) -> bool:
        """Stocker une valeur dans le cache"""
        try:
            serialized_value = json.dumps(value, default=str)
            if expire:
                if isinstance(expire, timedelta):
                    expire = int(expire.total_seconds())
                return await self.redis_client.setex(key, expire, serialized_value)
            else:
                return await self.redis_client.set(key, serialized_value)
        except Exception:
            return False
    
    async def delete(self, key: str) -> bool:
        """Supprimer une valeur du cache"""
        try:
            result = await self.redis_client.delete(key)
            return result > 0
        except Exception:
            return False
    
    async def exists(self, key: str) -> bool:
        """Vérifier si une clé existe"""
        try:
            return await self.redis_client.exists(key) > 0
        except Exception:
            return False

# Décorateur pour mise en cache
from functools import wraps
import hashlib

def cache_result(expire: Union[int, timedelta] = 300, key_prefix: str = ""):
    """Décorateur pour mettre en cache le résultat d'une fonction"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Générer une clé de cache
            cache_key = f"{key_prefix}:{func.__name__}:{_generate_cache_key(args, kwargs)}"
            
            cache_service = CacheService()
            
            # Essayer de récupérer depuis le cache
            cached_result = await cache_service.get(cache_key)
            if cached_result is not None:
                return cached_result
            
            # Exécuter la fonction et mettre en cache le résultat
            result = await func(*args, **kwargs)
            await cache_service.set(cache_key, result, expire)
            
            return result
        return wrapper
    return decorator

def _generate_cache_key(args, kwargs) -> str:
    """Générer une clé de cache basée sur les arguments"""
    key_data = f"{args}:{sorted(kwargs.items())}"
    return hashlib.md5(key_data.encode()).hexdigest()

# Utilisation du cache dans les services
class UserService:
    def __init__(self, db: AsyncSession):
        self.repository = UserRepository(db)
        self.cache = CacheService()
    
    @cache_result(expire=timedelta(minutes=5), key_prefix="user")
    async def get_user(self, user_id: int) -> Optional[UserResponse]:
        """Récupérer un utilisateur avec mise en cache"""
        user = await self.repository.get(user_id)
        if not user:
            return None
        return UserResponse.model_validate(user)
    
    async def update_user(self, user_id: int, user_data: UserUpdate) -> UserResponse:
        """Mettre à jour un utilisateur et invalider le cache"""
        user = await self.repository.get(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        updated_user = await self.repository.update(db_obj=user, obj_in=user_data)
        
        # Invalider le cache
        cache_key = f"user:get_user:{user_id}"
        await self.cache.delete(cache_key)
        
        return UserResponse.model_validate(updated_user)
```

## Monitoring et observabilité

::: tip Observabilité moderne
- **Métriques** - Prometheus pour collecte
- **Logs** - Structured logging avec correlation IDs
- **Tracing** - OpenTelemetry pour distributed tracing
- **Health checks** - Endpoints de santé détaillés
:::

```python
# app/utils/logger.py
import logging
import sys
from typing import Dict, Any
from pythonjsonlogger import jsonlogger
from app.config.settings import settings

class CustomJsonFormatter(jsonlogger.JsonFormatter):
    """Formateur JSON personnalisé avec métadonnées"""
    
    def add_fields(self, log_record: Dict[str, Any], record: logging.LogRecord, message_dict: Dict[str, Any]):
        super().add_fields(log_record, record, message_dict)
        
        # Ajouter des métadonnées
        log_record['service'] = settings.APP_NAME
        log_record['version'] = settings.APP_VERSION
        log_record['environment'] = 'production' if not settings.DEBUG else 'development'
        
        # Ajouter le niveau de log
        log_record['level'] = record.levelname
        
        # Ajouter des informations sur la requête si disponibles
        if hasattr(record, 'request_id'):
            log_record['request_id'] = record.request_id
        if hasattr(record, 'user_id'):
            log_record['user_id'] = record.user_id

def setup_logging():
    """Configuration du logging structuré"""
    
    # Supprimer les handlers existants
    for handler in logging.root.handlers[:]:
        logging.root.removeHandler(handler)
    
    # Configuration du formateur
    formatter = CustomJsonFormatter(
        fmt='%(asctime)s %(name)s %(levelname)s %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # Handler pour stdout
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)
    
    # Configuration du logger racine
    logging.basicConfig(
        level=getattr(logging, settings.LOG_LEVEL.upper()),
        handlers=[handler]
    )
    
    # Configurer les loggers spécifiques
    logging.getLogger("uvicorn.access").disabled = True
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)

# Middleware de logging des requêtes
from fastapi import Request, Response
import time
import uuid

@app.middleware("http")
async def logging_middleware(request: Request, call_next):
    """Middleware pour logger les requêtes"""
    request_id = str(uuid.uuid4())
    start_time = time.time()
    
    # Ajouter l'ID de requête au contexte
    request.state.request_id = request_id
    
    # Logger la requête entrante
    logger = logging.getLogger("api.request")
    logger.info(
        "Request started",
        extra={
            "request_id": request_id,
            "method": request.method,
            "url": str(request.url),
            "user_agent": request.headers.get("user-agent"),
            "ip": request.client.host if request.client else None,
        }
    )
    
    # Traiter la requête
    response = await call_next(request)
    
    # Logger la réponse
    process_time = time.time() - start_time
    logger.info(
        "Request completed",
        extra={
            "request_id": request_id,
            "status_code": response.status_code,
            "process_time": round(process_time, 4),
        }
    )
    
    # Ajouter l'ID de requête aux headers
    response.headers["X-Request-ID"] = request_id
    
    return response
```

## Conclusion

### Checklist du template moderne

::: info Fonctionnalités implémentées
**Architecture**
- [ ] Structure en couches (API, Service, Repository)
- [ ] Configuration Pydantic avec validation
- [ ] Gestion d'erreurs centralisée
- [ ] Versioning d'API

**Base de données**
- [ ] SQLAlchemy 2.0 avec support async
- [ ] Migrations Alembic
- [ ] Repository pattern
- [ ] Modèles avec timestamps automatiques

**Sécurité**
- [ ] Authentification JWT
- [ ] Hachage de mots de passe sécurisé
- [ ] Gestion des permissions
- [ ] Validation des entrées Pydantic

**Performance**
- [ ] Cache Redis intégré
- [ ] Pagination optimisée
- [ ] Connection pooling
- [ ] Middleware de performance

**Tests**
- [ ] Tests unitaires, intégration, E2E
- [ ] Fixtures pytest
- [ ] Mocking approprié
- [ ] Coverage de code

**Déploiement**
- [ ] Containerisation Docker
- [ ] Docker Compose pour développement
- [ ] Configuration multi-environnements
- [ ] Health checks

**Observabilité**
- [ ] Logging structuré JSON
- [ ] Métriques application
- [ ] Correlation IDs
- [ ] Monitoring santé
:::

### Extensions recommandées

Pour étendre ce template selon vos besoins :

- **Celery** pour tâches asynchrones
- **WebSockets** pour temps réel
- **GraphQL** avec Strawberry
- **MinIO** pour stockage de fichiers
- **Prometheus** pour métriques avancées

Ce template constitue une base solide pour développer des APIs modernes avec FastAPI, incorporant les meilleures pratiques 2025 pour la performance, la sécurité et la maintenabilité.