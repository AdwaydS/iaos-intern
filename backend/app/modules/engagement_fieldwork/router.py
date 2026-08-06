import json
import logging
from datetime import datetime
from fastapi import APIRouter, HTTPException, status

from app.api.deps import CurrentUser, DbSession
from app.core.tenancy import tenant_scoped

from .models import Engagement, ScopingMemo, ProgrammeItem, FieldworkTask, TimeLog, QualityReview
from .schemas import (
    EngagementCreate,
    EngagementUpdate,
    EngagementOut,
    ScopingMemoCreate,
    ScopingMemoUpdate,
    ScopingMemoOut,
    ProgrammeItemCreate,
    ProgrammeItemUpdate,
    ProgrammeItemOut,
    FieldworkTaskCreate,
    FieldworkTaskUpdate,
    FieldworkTaskOut,
    TimeLogCreate,
    TimeLogOut,
    QualityReviewInitiate,
    QualityReviewSignOff,
    QualityReviewOut,
)

logger = logging.getLogger("iaos.engagement_fieldwork")

MANIFEST = {
    "name": "engagement_fieldwork",
    "title": "Engagement & Fieldwork Management",
    "description": "Primary workspace for running individual audits from end to end, including scoping memos, audit programs, task tracking, time logging, and quality reviews.",
    "icon": "file-check",
    "group": "Audit Command Center",
    "industry": "",
    "version": "1.0.0",
    "owner": "auditor",
}

router = APIRouter()


# Helper to fetch and verify tenant-scoped engagement
def _get_engagement(engagement_id: int, current_user: CurrentUser, db: DbSession) -> Engagement:
    eng = tenant_scoped(
        db.query(Engagement).filter(Engagement.id == engagement_id), current_user
    ).first()
    if not eng:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Engagement with ID {engagement_id} not found"
        )
    return eng


# --- /engagements (CRUD for audits) ---

@router.get("/engagements", response_model=list[EngagementOut])
def list_engagements(current_user: CurrentUser, db: DbSession):
    query = tenant_scoped(db.query(Engagement), current_user).order_by(Engagement.id.desc())
    return [EngagementOut.model_validate(e) for e in query.all()]


@router.post("/engagements", response_model=EngagementOut, status_code=status.HTTP_201_CREATED)
def create_engagement(body: EngagementCreate, current_user: CurrentUser, db: DbSession):
    eng = Engagement(
        title=body.title,
        description=body.description,
        status="Scoping",
        start_date=body.start_date,
        end_date=body.end_date,
        tenant_id=current_user.tenant_id,
    )
    db.add(eng)
    db.commit()
    db.refresh(eng)
    logger.info(
        "Engagement created",
        extra={
            "engagement_id": eng.id,
            "title": eng.title,
            "tenant_id": current_user.tenant_id,
            "created_by": current_user.email,
        },
    )
    return EngagementOut.model_validate(eng)


@router.get("/engagements/{id}", response_model=EngagementOut)
def get_engagement(id: int, current_user: CurrentUser, db: DbSession):
    eng = _get_engagement(id, current_user, db)
    return EngagementOut.model_validate(eng)


@router.put("/engagements/{id}", response_model=EngagementOut)
def update_engagement(id: int, body: EngagementUpdate, current_user: CurrentUser, db: DbSession):
    eng = _get_engagement(id, current_user, db)

    if body.title is not None:
        eng.title = body.title
    if body.description is not None:
        eng.description = body.description
    if body.status is not None:
        eng.status = body.status
    if body.start_date is not None:
        eng.start_date = body.start_date
    if body.end_date is not None:
        eng.end_date = body.end_date

    db.commit()
    db.refresh(eng)
    logger.info(
        "Engagement updated",
        extra={
            "engagement_id": eng.id,
            "status": eng.status,
            "updated_by": current_user.email,
        },
    )
    return EngagementOut.model_validate(eng)


@router.delete("/engagements/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_engagement(id: int, current_user: CurrentUser, db: DbSession):
    eng = _get_engagement(id, current_user, db)
    db.delete(eng)
    db.commit()
    logger.info(
        "Engagement deleted",
        extra={
            "engagement_id": id,
            "deleted_by": current_user.email,
        },
    )


# --- /engagements/{id}/scoping-memo (Scoping Memo and state transitions) ---

@router.get("/engagements/{id}/scoping-memo", response_model=ScopingMemoOut)
def get_scoping_memo(id: int, current_user: CurrentUser, db: DbSession):
    eng = _get_engagement(id, current_user, db)
    memo = tenant_scoped(
        db.query(ScopingMemo).filter(ScopingMemo.engagement_id == eng.id), current_user
    ).first()
    if not memo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scoping memo not found for this engagement"
        )
    return ScopingMemoOut.model_validate(memo)


@router.post("/engagements/{id}/scoping-memo", response_model=ScopingMemoOut)
def create_or_update_scoping_memo(
    id: int, body: ScopingMemoCreate, current_user: CurrentUser, db: DbSession
):
    eng = _get_engagement(id, current_user, db)
    if eng.status == "Completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot modify scoping memo on a completed engagement"
        )

    memo = tenant_scoped(
        db.query(ScopingMemo).filter(ScopingMemo.engagement_id == eng.id), current_user
    ).first()

    if not memo:
        memo = ScopingMemo(
            engagement_id=eng.id,
            background=body.background,
            scope_limitations=body.scope_limitations,
            objectives_summary=body.objectives_summary,
            status="Draft",
            created_by=current_user.email,
            tenant_id=current_user.tenant_id,
        )
        db.add(memo)
    else:
        memo.background = body.background
        memo.scope_limitations = body.scope_limitations
        memo.objectives_summary = body.objectives_summary

    db.commit()
    db.refresh(memo)
    logger.info(
        "Scoping memo created/updated",
        extra={
            "engagement_id": eng.id,
            "memo_id": memo.id,
            "status": memo.status,
            "updated_by": current_user.email,
        },
    )
    return ScopingMemoOut.model_validate(memo)


@router.post("/engagements/{id}/scoping-memo/submit", response_model=ScopingMemoOut)
def submit_scoping_memo(id: int, current_user: CurrentUser, db: DbSession):
    eng = _get_engagement(id, current_user, db)
    memo = tenant_scoped(
        db.query(ScopingMemo).filter(ScopingMemo.engagement_id == eng.id), current_user
    ).first()
    if not memo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scoping memo not found. Create draft first."
        )

    if memo.status not in ("Draft", "Rejected"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot submit scoping memo in status {memo.status}"
        )

    memo.status = "Under Review"
    db.commit()
    db.refresh(memo)
    logger.info(
        "Scoping memo submitted for review",
        extra={"engagement_id": eng.id, "submitted_by": current_user.email},
    )
    return ScopingMemoOut.model_validate(memo)


@router.post("/engagements/{id}/scoping-memo/approve", response_model=ScopingMemoOut)
def approve_scoping_memo(id: int, body: ScopingMemoUpdate, current_user: CurrentUser, db: DbSession):
    eng = _get_engagement(id, current_user, db)
    memo = tenant_scoped(
        db.query(ScopingMemo).filter(ScopingMemo.engagement_id == eng.id), current_user
    ).first()
    if not memo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scoping memo not found."
        )

    if memo.status != "Under Review":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot approve scoping memo from status {memo.status}. Must be Under Review."
        )

    memo.status = "Approved"
    memo.approved_by = current_user.email
    if body.review_notes:
        memo.review_notes = body.review_notes

    # Advance parent engagement state to Programme Setup
    eng.status = "Programme"

    db.commit()
    db.refresh(memo)
    logger.info(
        "Scoping memo approved",
        extra={"engagement_id": eng.id, "approved_by": current_user.email},
    )
    return ScopingMemoOut.model_validate(memo)


@router.post("/engagements/{id}/scoping-memo/reject", response_model=ScopingMemoOut)
def reject_scoping_memo(id: int, body: ScopingMemoUpdate, current_user: CurrentUser, db: DbSession):
    eng = _get_engagement(id, current_user, db)
    memo = tenant_scoped(
        db.query(ScopingMemo).filter(ScopingMemo.engagement_id == eng.id), current_user
    ).first()
    if not memo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scoping memo not found."
        )

    if memo.status != "Under Review":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot reject scoping memo from status {memo.status}. Must be Under Review."
        )

    memo.status = "Rejected"
    memo.reviewed_by = current_user.email
    memo.review_notes = body.review_notes or "Rejected during review"

    db.commit()
    db.refresh(memo)
    logger.info(
        "Scoping memo rejected",
        extra={"engagement_id": eng.id, "rejected_by": current_user.email},
    )
    return ScopingMemoOut.model_validate(memo)


# --- /engagements/{id}/programme-items (Manage program objectives and procedures) ---

@router.get("/engagements/{id}/programme-items", response_model=list[ProgrammeItemOut])
def list_programme_items(id: int, current_user: CurrentUser, db: DbSession):
    eng = _get_engagement(id, current_user, db)
    items = tenant_scoped(
        db.query(ProgrammeItem).filter(ProgrammeItem.engagement_id == eng.id), current_user
    ).order_by(ProgrammeItem.id.asc()).all()
    return [ProgrammeItemOut.model_validate(i) for i in items]


@router.post("/engagements/{id}/programme-items", response_model=ProgrammeItemOut, status_code=status.HTTP_201_CREATED)
def create_programme_item(
    id: int, body: ProgrammeItemCreate, current_user: CurrentUser, db: DbSession
):
    eng = _get_engagement(id, current_user, db)
    item = ProgrammeItem(
        engagement_id=eng.id,
        objective=body.objective,
        risk_area=body.risk_area,
        procedures=body.procedures,
        tenant_id=current_user.tenant_id,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    logger.info(
        "Programme item added",
        extra={"engagement_id": eng.id, "item_id": item.id, "created_by": current_user.email},
    )
    return ProgrammeItemOut.model_validate(item)


@router.put("/programme-items/{item_id}", response_model=ProgrammeItemOut)
def update_programme_item(
    item_id: int, body: ProgrammeItemUpdate, current_user: CurrentUser, db: DbSession
):
    item = tenant_scoped(
        db.query(ProgrammeItem).filter(ProgrammeItem.id == item_id), current_user
    ).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Programme item not found")

    if body.objective is not None:
        item.objective = body.objective
    if body.risk_area is not None:
        item.risk_area = body.risk_area
    if body.procedures is not None:
        item.procedures = body.procedures

    db.commit()
    db.refresh(item)
    logger.info(
        "Programme item updated",
        extra={"item_id": item.id, "updated_by": current_user.email},
    )
    return ProgrammeItemOut.model_validate(item)


@router.delete("/programme-items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_programme_item(item_id: int, current_user: CurrentUser, db: DbSession):
    item = tenant_scoped(
        db.query(ProgrammeItem).filter(ProgrammeItem.id == item_id), current_user
    ).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Programme item not found")

    db.delete(item)
    db.commit()
    logger.info(
        "Programme item deleted",
        extra={"item_id": item_id, "deleted_by": current_user.email},
    )


# --- /engagements/{id}/tasks (Manage task tracking) ---

@router.get("/engagements/{id}/tasks", response_model=list[FieldworkTaskOut])
def list_tasks(id: int, current_user: CurrentUser, db: DbSession):
    eng = _get_engagement(id, current_user, db)
    tasks = tenant_scoped(
        db.query(FieldworkTask).filter(FieldworkTask.engagement_id == eng.id), current_user
    ).order_by(FieldworkTask.id.asc()).all()
    return [FieldworkTaskOut.model_validate(t) for t in tasks]


@router.post("/engagements/{id}/tasks", response_model=FieldworkTaskOut, status_code=status.HTTP_201_CREATED)
def create_task(id: int, body: FieldworkTaskCreate, current_user: CurrentUser, db: DbSession):
    eng = _get_engagement(id, current_user, db)

    # 1. Fetch scoping memo to validate status against start checks
    memo = tenant_scoped(
        db.query(ScopingMemo).filter(ScopingMemo.engagement_id == eng.id), current_user
    ).first()
    scoping_status = memo.status if memo else "Draft"

    # 2. Trigger schema transition validations by injecting scoping status context
    task_data = body.model_dump()
    task_data["scoping_memo_status"] = scoping_status
    # Revalidate using schema to enforce state transition check
    try:
        validated_body = FieldworkTaskCreate.model_validate(task_data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )

    # Verify programme item if provided
    if validated_body.programme_item_id:
        p_item = tenant_scoped(
            db.query(ProgrammeItem).filter(ProgrammeItem.id == validated_body.programme_item_id),
            current_user,
        ).first()
        if not p_item or p_item.engagement_id != eng.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid programme_item_id or does not belong to this engagement"
            )

    task = FieldworkTask(
        engagement_id=eng.id,
        programme_item_id=validated_body.programme_item_id,
        title=validated_body.title,
        description=validated_body.description,
        assigned_to=validated_body.assigned_to,
        status=validated_body.status,
        doc_link=validated_body.doc_link,
        tenant_id=current_user.tenant_id,
    )
    db.add(task)

    # Move parent engagement status to Fieldwork if a task is set in progress
    if task.status in ("In Progress", "Review Required", "Done") and eng.status == "Programme":
        eng.status = "Fieldwork"

    db.commit()
    db.refresh(task)
    logger.info(
        "Fieldwork task created",
        extra={
            "engagement_id": eng.id,
            "task_id": task.id,
            "status": task.status,
            "created_by": current_user.email,
        },
    )
    return FieldworkTaskOut.model_validate(task)


@router.put("/tasks/{task_id}", response_model=FieldworkTaskOut)
def update_task(task_id: int, body: FieldworkTaskUpdate, current_user: CurrentUser, db: DbSession):
    task = tenant_scoped(
        db.query(FieldworkTask).filter(FieldworkTask.id == task_id), current_user
    ).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fieldwork task not found")

    eng = _get_engagement(task.engagement_id, current_user, db)

    # 1. Fetch scoping memo status
    memo = tenant_scoped(
        db.query(ScopingMemo).filter(ScopingMemo.engagement_id == eng.id), current_user
    ).first()
    scoping_status = memo.status if memo else "Draft"

    # 2. Revalidate update body with status context
    task_data = body.model_dump(exclude_unset=True)
    task_data["scoping_memo_status"] = scoping_status
    # Form a validation body blending existing task state
    validator_input = {
        "status": body.status if body.status is not None else task.status,
        "doc_link": body.doc_link if body.doc_link is not None else task.doc_link,
        "scoping_memo_status": scoping_status,
    }
    try:
        FieldworkTaskUpdate.model_validate(validator_input)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )

    # Apply updates
    if body.programme_item_id is not None:
        p_item = tenant_scoped(
            db.query(ProgrammeItem).filter(ProgrammeItem.id == body.programme_item_id),
            current_user,
        ).first()
        if not p_item or p_item.engagement_id != eng.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid programme_item_id or does not belong to this engagement"
            )
        task.programme_item_id = body.programme_item_id

    if body.title is not None:
        task.title = body.title
    if body.description is not None:
        task.description = body.description
    if body.assigned_to is not None:
        task.assigned_to = body.assigned_to
    if body.status is not None:
        task.status = body.status
    if body.doc_link is not None:
        task.doc_link = body.doc_link

    # Transition parent engagement status to Fieldwork if task begins
    if task.status in ("In Progress", "Review Required", "Done") and eng.status == "Programme":
        eng.status = "Fieldwork"

    db.commit()
    db.refresh(task)
    logger.info(
        "Fieldwork task updated",
        extra={"task_id": task.id, "status": task.status, "updated_by": current_user.email},
    )
    return FieldworkTaskOut.model_validate(task)


@router.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: int, current_user: CurrentUser, db: DbSession):
    task = tenant_scoped(
        db.query(FieldworkTask).filter(FieldworkTask.id == task_id), current_user
    ).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fieldwork task not found")

    db.delete(task)
    db.commit()
    logger.info(
        "Fieldwork task deleted",
        extra={"task_id": task_id, "deleted_by": current_user.email},
    )


# --- /tasks/{id}/time-logs (Manage time logs) ---

@router.get("/engagements/{id}/time-logs", response_model=list[TimeLogOut])
def list_engagement_time_logs(id: int, current_user: CurrentUser, db: DbSession):
    eng = _get_engagement(id, current_user, db)
    logs = tenant_scoped(
        db.query(TimeLog).filter(TimeLog.engagement_id == eng.id), current_user
    ).order_by(TimeLog.date.desc()).all()
    return [TimeLogOut.model_validate(l) for l in logs]


@router.get("/tasks/{task_id}/time-logs", response_model=list[TimeLogOut])
def list_task_time_logs(task_id: int, current_user: CurrentUser, db: DbSession):
    task = tenant_scoped(
        db.query(FieldworkTask).filter(FieldworkTask.id == task_id), current_user
    ).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    logs = tenant_scoped(
        db.query(TimeLog).filter(TimeLog.task_id == task_id), current_user
    ).order_by(TimeLog.date.desc()).all()
    return [TimeLogOut.model_validate(l) for l in logs]


@router.post("/tasks/{task_id}/time-logs", response_model=TimeLogOut, status_code=status.HTTP_201_CREATED)
def create_time_log(task_id: int, body: TimeLogCreate, current_user: CurrentUser, db: DbSession):
    task = tenant_scoped(
        db.query(FieldworkTask).filter(FieldworkTask.id == task_id), current_user
    ).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    # Time cannot be logged on a task that hasn't started yet
    if task.status == "To Do":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot log auditor hours on a task in 'To Do' status. Start the task first."
        )

    log = TimeLog(
        engagement_id=task.engagement_id,
        task_id=task.id,
        auditor_email=current_user.email,
        hours=body.hours,
        date=body.date,
        description=body.description,
        tenant_id=current_user.tenant_id,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    logger.info(
        "Auditor time log created",
        extra={
            "task_id": task.id,
            "log_id": log.id,
            "hours": log.hours,
            "auditor": log.auditor_email,
        },
    )
    return TimeLogOut.model_validate(log)


@router.delete("/time-logs/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_time_log(log_id: int, current_user: CurrentUser, db: DbSession):
    log = tenant_scoped(
        db.query(TimeLog).filter(TimeLog.id == log_id), current_user
    ).first()
    if not log:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Time log entry not found")

    db.delete(log)
    db.commit()
    logger.info(
        "Auditor time log deleted",
        extra={"log_id": log_id, "deleted_by": current_user.email},
    )


# --- /engagements/{id}/quality-reviews (Quality Review and Sign-off Lifecycle) ---

@router.get("/engagements/{id}/quality-reviews", response_model=list[QualityReviewOut])
def list_quality_reviews(id: int, current_user: CurrentUser, db: DbSession):
    eng = _get_engagement(id, current_user, db)
    reviews = tenant_scoped(
        db.query(QualityReview).filter(QualityReview.engagement_id == eng.id), current_user
    ).order_by(QualityReview.id.desc()).all()
    return [QualityReviewOut.model_validate(r) for r in reviews]


@router.post("/engagements/{id}/quality-reviews", response_model=QualityReviewOut, status_code=status.HTTP_201_CREATED)
def initiate_quality_review(
    id: int, body: QualityReviewInitiate, current_user: CurrentUser, db: DbSession
):
    eng = _get_engagement(id, current_user, db)

    # Verify all tasks are completed or at least in Review Required / Done status,
    # or let scoping memo be approved before quality review
    memo = tenant_scoped(
        db.query(ScopingMemo).filter(ScopingMemo.engagement_id == eng.id), current_user
    ).first()
    if not memo or memo.status != "Approved":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot initiate quality review. Scoping memo must be approved first."
        )

    review = QualityReview(
        engagement_id=eng.id,
        reviewer_email=body.reviewer_email or current_user.email,
        status="Pending",
        review_notes=body.review_notes,
        tenant_id=current_user.tenant_id,
        checks_completed="{}",
    )
    db.add(review)

    # Transition parent engagement status to QualityReview
    eng.status = "QualityReview"

    db.commit()
    db.refresh(review)
    logger.info(
        "Quality review initiated",
        extra={
            "engagement_id": eng.id,
            "review_id": review.id,
            "reviewer": review.reviewer_email,
        },
    )
    return QualityReviewOut.model_validate(review)


@router.post("/quality-reviews/{review_id}/sign-off", response_model=QualityReviewOut)
def sign_off_quality_review(
    review_id: int, body: QualityReviewSignOff, current_user: CurrentUser, db: DbSession
):
    review = tenant_scoped(
        db.query(QualityReview).filter(QualityReview.id == review_id), current_user
    ).first()
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quality review not found")

    eng = _get_engagement(review.engagement_id, current_user, db)

    review.status = body.status
    review.reviewer_email = body.reviewer_email
    review.review_notes = body.review_notes
    review.sign_off_date = datetime.utcnow()
    review.checks_completed = json.dumps(body.checks_completed)

    # Handle transitions of the parent engagement status based on review outcome
    if body.status == "Passed":
        eng.status = "Completed"
    else:  # Failed
        eng.status = "Fieldwork"  # Send back to fieldwork phase

    db.commit()
    db.refresh(review)
    logger.info(
        "Quality review sign-off completed",
        extra={
            "engagement_id": eng.id,
            "review_id": review.id,
            "status": review.status,
            "reviewer": review.reviewer_email,
        },
    )
    return QualityReviewOut.model_validate(review)


@router.delete("/quality-reviews/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_quality_review(review_id: int, current_user: CurrentUser, db: DbSession):
    review = tenant_scoped(
        db.query(QualityReview).filter(QualityReview.id == review_id), current_user
    ).first()
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quality review not found")

    db.delete(review)
    db.commit()
    logger.info(
        "Quality review deleted",
        extra={"review_id": review_id, "deleted_by": current_user.email},
    )
