from datetime import date, datetime
from sqlalchemy import String, Text, ForeignKey, Integer, Float, Date, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.core.tenancy import TenantMixin


class Engagement(Base, TenantMixin):
    __tablename__ = "mod_engagement_fieldwork_engagements"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(50), default="Scoping")  # Scoping, Programme, Fieldwork, QualityReview, Completed
    start_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)

    # Relationships
    scoping_memo: Mapped["ScopingMemo | None"] = relationship(
        back_populates="engagement", cascade="all, delete-orphan", uselist=False
    )
    programme_items: Mapped[list["ProgrammeItem"]] = relationship(
        back_populates="engagement", cascade="all, delete-orphan"
    )
    tasks: Mapped[list["FieldworkTask"]] = relationship(
        back_populates="engagement", cascade="all, delete-orphan"
    )
    time_logs: Mapped[list["TimeLog"]] = relationship(
        back_populates="engagement", cascade="all, delete-orphan"
    )
    quality_reviews: Mapped[list["QualityReview"]] = relationship(
        back_populates="engagement", cascade="all, delete-orphan"
    )


class ScopingMemo(Base, TenantMixin):
    __tablename__ = "mod_engagement_fieldwork_scoping_memos"

    id: Mapped[int] = mapped_column(primary_key=True)
    engagement_id: Mapped[int] = mapped_column(
        ForeignKey("mod_engagement_fieldwork_engagements.id", ondelete="CASCADE"),
        unique=True,
        index=True
    )
    background: Mapped[str] = mapped_column(Text, default="")
    scope_limitations: Mapped[str] = mapped_column(Text, default="")
    objectives_summary: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(50), default="Draft")  # Draft, Under Review, Approved, Rejected
    review_notes: Mapped[str] = mapped_column(Text, default="")
    created_by: Mapped[str] = mapped_column(String(255))
    reviewed_by: Mapped[str | None] = mapped_column(String(255), nullable=True)
    approved_by: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # Relationships
    engagement: Mapped["Engagement"] = relationship(back_populates="scoping_memo")


class ProgrammeItem(Base, TenantMixin):
    __tablename__ = "mod_engagement_fieldwork_programme_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    engagement_id: Mapped[int] = mapped_column(
        ForeignKey("mod_engagement_fieldwork_engagements.id", ondelete="CASCADE"),
        index=True
    )
    objective: Mapped[str] = mapped_column(String(255))
    risk_area: Mapped[str] = mapped_column(String(255))
    procedures: Mapped[str] = mapped_column(Text, default="")

    # Relationships
    engagement: Mapped["Engagement"] = relationship(back_populates="programme_items")
    tasks: Mapped[list["FieldworkTask"]] = relationship(
        back_populates="programme_item", cascade="all, delete-orphan"
    )


class FieldworkTask(Base, TenantMixin):
    __tablename__ = "mod_engagement_fieldwork_tasks"

    id: Mapped[int] = mapped_column(primary_key=True)
    engagement_id: Mapped[int] = mapped_column(
        ForeignKey("mod_engagement_fieldwork_engagements.id", ondelete="CASCADE"),
        index=True
    )
    programme_item_id: Mapped[int | None] = mapped_column(
        ForeignKey("mod_engagement_fieldwork_programme_items.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text, default="")
    assigned_to: Mapped[str | None] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="To Do")  # To Do, In Progress, Review Required, Done
    doc_link: Mapped[str | None] = mapped_column(String(512), nullable=True)

    # Relationships
    engagement: Mapped["Engagement"] = relationship(back_populates="tasks")
    programme_item: Mapped["ProgrammeItem | None"] = relationship(back_populates="tasks")
    time_logs: Mapped[list["TimeLog"]] = relationship(
        back_populates="task", cascade="all, delete-orphan"
    )


class TimeLog(Base, TenantMixin):
    __tablename__ = "mod_engagement_fieldwork_time_logs"

    id: Mapped[int] = mapped_column(primary_key=True)
    engagement_id: Mapped[int] = mapped_column(
        ForeignKey("mod_engagement_fieldwork_engagements.id", ondelete="CASCADE"),
        index=True
    )
    task_id: Mapped[int] = mapped_column(
        ForeignKey("mod_engagement_fieldwork_tasks.id", ondelete="CASCADE"),
        index=True
    )
    auditor_email: Mapped[str] = mapped_column(String(255))
    hours: Mapped[float] = mapped_column(Float)
    date: Mapped[date] = mapped_column(Date)
    description: Mapped[str] = mapped_column(Text, default="")

    # Relationships
    engagement: Mapped["Engagement"] = relationship(back_populates="time_logs")
    task: Mapped["FieldworkTask"] = relationship(back_populates="time_logs")


class QualityReview(Base, TenantMixin):
    __tablename__ = "mod_engagement_fieldwork_quality_reviews"

    id: Mapped[int] = mapped_column(primary_key=True)
    engagement_id: Mapped[int] = mapped_column(
        ForeignKey("mod_engagement_fieldwork_engagements.id", ondelete="CASCADE"),
        index=True
    )
    reviewer_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="Pending")  # Pending, Passed, Failed
    review_notes: Mapped[str] = mapped_column(Text, default="")
    sign_off_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    checks_completed: Mapped[str] = mapped_column(Text, default="{}")  # JSON string representing checks completed

    # Relationships
    engagement: Mapped["Engagement"] = relationship(back_populates="quality_reviews")
