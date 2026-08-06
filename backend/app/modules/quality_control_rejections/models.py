"""Module data models for Quality Control & Rejections (Module 47).

RULES for zero-conflict, tenant-safe modules:
  1. Prefix every table with `mod_quality_control_rejections_`
  2. Inherit `TenantMixin` on anything tenant-owned.
"""
from datetime import date, datetime
from typing import Optional
from sqlalchemy import String, Text, Boolean, Float, Integer, Date, DateTime
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.core.tenancy import TenantMixin


class InspectionRecord(Base, TenantMixin):
    __tablename__ = "mod_quality_control_rejections_inspections"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    lot_number: Mapped[str] = mapped_column(String(100), index=True)
    inspector: Mapped[str] = mapped_column(String(150))
    percentage_inspected: Mapped[float] = mapped_column(Float, default=100.0)
    passed_qty: Mapped[float] = mapped_column(Float, default=0.0)
    rejected_qty: Mapped[float] = mapped_column(Float, default=0.0)
    stage: Mapped[str] = mapped_column(String(50))  # incoming, in-process, final
    status: Mapped[str] = mapped_column(String(50), default="Pending")  # Passed, Rejected, Pending


class RejectionLog(Base, TenantMixin):
    __tablename__ = "mod_quality_control_rejections_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    item_code: Mapped[str] = mapped_column(String(100), index=True)
    vendor_name: Mapped[str] = mapped_column(String(150))
    production_line: Mapped[str] = mapped_column(String(100))
    defect_category: Mapped[str] = mapped_column(String(100))
    quantity: Mapped[float] = mapped_column(Float, default=0.0)
    cost: Mapped[float] = mapped_column(Float, default=0.0)
    disposition: Mapped[str] = mapped_column(String(50))  # rework, scrap


class COARecord(Base, TenantMixin):
    __tablename__ = "mod_quality_control_rejections_coa"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    vendor: Mapped[str] = mapped_column(String(150))
    raw_material: Mapped[str] = mapped_column(String(150))
    coa_present: Mapped[bool] = mapped_column(Boolean, default=True)
    valid_until: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    matching_specs: Mapped[bool] = mapped_column(Boolean, default=True)


class CustomerComplaintLink(Base, TenantMixin):
    __tablename__ = "mod_quality_control_rejections_complaints"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    complaint_id: Mapped[str] = mapped_column(String(100), index=True)
    customer_name: Mapped[str] = mapped_column(String(150))
    defect_description: Mapped[str] = mapped_column(Text)
    linked_qc_lot_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)


class NonConformanceReport(Base, TenantMixin):
    __tablename__ = "mod_quality_control_rejections_ncr"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    ncr_number: Mapped[str] = mapped_column(String(100), index=True)
    description: Mapped[str] = mapped_column(Text)
    severity: Mapped[str] = mapped_column(String(50))  # Minor, Major, Critical
    status: Mapped[str] = mapped_column(String(50), default="Open")  # Open, Under Investigation, Closed
    corrective_action: Mapped[str] = mapped_column(Text, default="")
    closed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
