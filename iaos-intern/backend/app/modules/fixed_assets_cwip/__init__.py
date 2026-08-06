"""
Fixed Assets & CWIP Module (Module 18)
========================================
Internal Audit Operating System — Intern Project

Domain     : Finance Cycles
Industry   : Manufacturing, Infra, All
Roll No.   : 18

This module covers:
  • 15 signature features (physical verification, depreciation recomp,
    CWIP ageing, disposal review, capex additions, register completeness,
    componentisation, idle assets, impairment indicators, insurance mapping,
    capex-vs-opex, lease-vs-own, asset transfers, scrap/salvage, revaluation)
  • 10 common audit shell features (dashboard, scope, RCM, test rules,
    data sources, sampling, exceptions, working papers, findings, remediation)

Architecture:
  models.py   — SQLAlchemy ORM models (all tenant-scoped)
  schemas.py  — Pydantic request/response schemas
  router.py   — FastAPI routes, auto-mounted at /api/modules/fixed_assets_cwip
"""
