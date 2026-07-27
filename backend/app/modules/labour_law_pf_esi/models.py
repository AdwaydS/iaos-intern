from sqlalchemy import String, Text, Float
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.core.tenancy import TenantMixin


class LabourComplianceRegistry(Base, TenantMixin):
    __tablename__ = "mod_labour_compliance_registry"

    id: Mapped[int] = mapped_column(primary_key=True)
    registry_type: Mapped[str] = mapped_column(String(50))  # 'APPLICABILITY', 'LICENCE', 'REGISTERS', 'NOTICES'
    title: Mapped[str] = mapped_column(String(255))
    identifier: Mapped[str] = mapped_column(String(255), default="")
    status: Mapped[str] = mapped_column(String(50), default="Pending")
    date_value: Mapped[str] = mapped_column(String(50), default="")  # expiry date, filing date, etc.
    remarks: Mapped[str] = mapped_column(Text, default="")


class ContractWorker(Base, TenantMixin):
    __tablename__ = "mod_contract_workers"

    id: Mapped[int] = mapped_column(primary_key=True)
    worker_name: Mapped[str] = mapped_column(String(255))
    contractor_name: Mapped[str] = mapped_column(String(255))
    trade: Mapped[str] = mapped_column(String(100), default="")
    date_of_joining: Mapped[str] = mapped_column(String(50), default="")
    wage_rate: Mapped[float] = mapped_column(Float, default=0.0)
    pf_status: Mapped[str] = mapped_column(String(50), default="Pending")
    esi_status: Mapped[str] = mapped_column(String(50), default="Pending")
    compliance_status: Mapped[str] = mapped_column(String(50), default="Compliant")


class ComplianceException(Base, TenantMixin):
    __tablename__ = "mod_compliance_exceptions"

    id: Mapped[int] = mapped_column(primary_key=True)
    sub_page: Mapped[str] = mapped_column(String(100))
    rule_violated: Mapped[str] = mapped_column(String(255))
    severity: Mapped[str] = mapped_column(String(50), default="Medium")  # 'Low', 'Medium', 'High'
    status: Mapped[str] = mapped_column(String(50), default="Open")      # 'Open', 'Under Review', 'Resolved'
    notes: Mapped[str] = mapped_column(Text, default="")
