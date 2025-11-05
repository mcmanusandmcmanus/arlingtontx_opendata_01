from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .routes import router
from .services import refresh_caches


def create_app() -> FastAPI:
    settings = get_settings()
    @asynccontextmanager
    async def lifespan(app: FastAPI):
        refresh_caches()
        yield

    app = FastAPI(
        title="Public Safety Intelligence API",
        version="0.1.0",
        docs_url=f"{settings.api_prefix}/docs",
        openapi_url=f"{settings.api_prefix}/openapi.json",
        lifespan=lifespan,
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(router, prefix=settings.api_prefix)

    return app


app = create_app()
