"""IAOS — Internal Audit OS API entrypoint (Cap Corporate)."""
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError

import app.models  # noqa: F401 — registers platform tables on Base.metadata
from app.api import admin, auth, modules
from app.shared.audit_framework.router import router as framework_router
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
app.include_router(framework_router, prefix="/api/framework", tags=["framework"]) 


@app.exception_handler(IntegrityError)
async def integrity_error_handler(request: Request, exc: IntegrityError):
    detail = str(exc.orig) if exc.orig else "Database constraint violation"
    if "Duplicate entry" in detail or "duplicate key" in detail:
        # Extract the conflicting value from the error message
        msg = detail.split("'")[1] if "'" in detail else "value already exists"
        return JSONResponse(status_code=409, content={"detail": f"Duplicate entry: {msg} already exists"})
    if "foreign key constraint" in detail.lower():
        return JSONResponse(status_code=400, content={"detail": "Referenced record does not exist"})
    return JSONResponse(status_code=409, content={"detail": "Data constraint violation"})


@app.get("/api/health", tags=["system"])
def health():
    return {"status": "ok", "app": "IAOS", "brand": "Cap Corporate"}
