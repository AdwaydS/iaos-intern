"""IAOS — Internal Audit OS API entrypoint (Cap Corporate)."""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import app.models  # noqa: F401  — registers platform tables on Base.metadata
from app.api import admin, auth, modules
from app.bootstrap import create_all_tables, ensure_super_admin
from app.core.config import settings
from app.module_loader import load_modules


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Discover + mount all intern modules (also imports their models).
    app.state.modules = load_modules(app)
    # 2. Now that every table is registered, create the schema.
    create_all_tables()
    # 3. Seed the Cap Corp super admin if missing.
    ensure_super_admin()
    yield


app = FastAPI(
    title="IAOS — Internal Audit OS",
    description="Cap Corporate multi-tenant internal audit platform.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Platform routers
app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(modules.router)

# Custom compliance router for v1 spec
from app.modules.labour_law_pf_esi.router import custom_router
app.include_router(custom_router, prefix="/api/v1/labour-compliance", tags=["labour-compliance-v1"])



@app.get("/api/health", tags=["system"])
def health():
    return {"status": "ok", "app": "IAOS", "brand": "Cap Corporate"}
