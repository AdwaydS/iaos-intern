import os
import sys
from datetime import date

# Use SQLite file-based database for testing
if os.path.exists("test.db"):
    try:
        os.remove("test.db")
    except Exception:
        pass
os.environ["DATABASE_URL"] = "sqlite:///test.db"

from fastapi.testclient import TestClient
from sqlalchemy import event
from sqlalchemy.engine import Engine

from app.main import app
from app.core.database import Base, engine, SessionLocal
from app.models.tenant import Tenant
from app.models.user import User, UserRole
from app.core.security import create_access_token, hash_password


# Enable foreign key constraints in SQLite for testing
@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()


def run_verification():
    print("======================================================================")
    print("STARTING ENGAGEMENT & FIELDWORK MANAGEMENT MODULE VERIFICATION")
    print("======================================================================")

    # 1. Instantiate FastAPI test client using context manager first.
    # This triggers lifespan startup, initializing database tables, discovering modules, and creating schema.
    with TestClient(app) as client:
        print("\n[Step 1] Database tables initialized via lifespan.")

        # 2. Seed Test Tenants and Users
        print("\n[Step 2] Seeding tenants, users and creating tokens...")
        db = SessionLocal()
        try:
            # Tenant A and its Users
            tenant_a = Tenant(name="Tenant A Corp", slug="tenant-a")
            db.add(tenant_a)
            db.flush()

            auditor_a = User(
                email="auditor_a@tenant-a.com",
                full_name="Auditor Alice",
                hashed_password=hash_password("password"),
                role=UserRole.AUDITOR,
                tenant_id=tenant_a.id,
            )
            admin_a = User(
                email="admin_a@tenant-a.com",
                full_name="Admin Alex",
                hashed_password=hash_password("password"),
                role=UserRole.TENANT_ADMIN,
                tenant_id=tenant_a.id,
            )
            db.add(auditor_a)
            db.add(admin_a)

            # Tenant B and its User
            tenant_b = Tenant(name="Tenant B Corp", slug="tenant-b")
            db.add(tenant_b)
            db.flush()

            auditor_b = User(
                email="auditor_b@tenant-b.com",
                full_name="Auditor Bob",
                hashed_password=hash_password("password"),
                role=UserRole.AUDITOR,
                tenant_id=tenant_b.id,
            )
            db.add(auditor_b)
            db.commit()

            # Generate tokens
            token_a_auditor = create_access_token(auditor_a.id, tenant_a.id, auditor_a.role.value)
            token_a_admin = create_access_token(admin_a.id, tenant_a.id, admin_a.role.value)
            token_b_auditor = create_access_token(auditor_b.id, tenant_b.id, auditor_b.role.value)

        finally:
            db.close()
        headers_a_auditor = {"Authorization": f"Bearer {token_a_auditor}"}
        headers_a_admin = {"Authorization": f"Bearer {token_a_admin}"}
        headers_b_auditor = {"Authorization": f"Bearer {token_b_auditor}"}

        # 4. CRUD Engagement (Tenant Isolation Verification)
        print("\n[Step 3] Testing Engagement CRUD and Tenant isolation...")
        # Create engagement under Tenant A
        res = client.post(
            "/api/modules/engagement_fieldwork/engagements",
            json={"title": "Audit of HR Operations", "description": "Reviewing onboarding and hiring records"},
            headers=headers_a_auditor,
        )
        assert res.status_code == 201, f"Failed: {res.text}"
        eng_a = res.json()
        eng_id = eng_a["id"]
        print(f"  - Created Engagement under Tenant A: '{eng_a['title']}' (ID: {eng_id})")

        # Attempt to read Tenant A's engagement using Tenant B's credentials (should fail with 404)
        res = client.get(
            f"/api/modules/engagement_fieldwork/engagements/{eng_id}",
            headers=headers_b_auditor,
        )
        assert res.status_code == 404, f"Tenant isolation bypassed! Status: {res.status_code}"
        print("  - Tenant isolation verified: Tenant B cannot access Tenant A's engagement (Returns 404)")

        # 5. Verify task creation workflow checks
        print("\n[Step 4] Testing Fieldwork Task workflow rule: 'no started tasks before scoping memo approval'...")
        res = client.post(
            f"/api/modules/engagement_fieldwork/engagements/{eng_id}/tasks",
            json={"title": "Review Background Checks", "status": "In Progress"},
            headers=headers_a_auditor,
        )
        # This should fail because scoping memo is in Draft/None state (not Approved)
        assert res.status_code == 422, f"Failed check: status should be 422 for unapproved scoping memo task start. Got: {res.status_code}"
        print("  - Workflow rule verified: Cannot start task (set to In Progress) if scoping memo is not Approved.")

        # 6. Scoping Memo Lifecycle: Draft -> Submit -> Approve
        print("\n[Step 5] Testing Scoping Memo lifecycle (Draft -> Submit -> Approve)...")
        res = client.post(
            f"/api/modules/engagement_fieldwork/engagements/{eng_id}/scoping-memo",
            json={
                "background": "HR departments processes 100 new hires per year.",
                "scope_limitations": "Excludes contract employee hiring.",
                "objectives_summary": "Validate compliance of hiring documentation.",
            },
            headers=headers_a_auditor,
        )
        assert res.status_code == 200, res.text
        print("  - Scoping memo draft created.")

        # Submit for review
        res = client.post(
            f"/api/modules/engagement_fieldwork/engagements/{eng_id}/scoping-memo/submit",
            headers=headers_a_auditor,
        )
        assert res.status_code == 200, res.text
        assert res.json()["status"] == "Under Review"
        print("  - Scoping memo status advanced to 'Under Review'.")

        # Approve scoping memo
        res = client.post(
            f"/api/modules/engagement_fieldwork/engagements/{eng_id}/scoping-memo/approve",
            json={"review_notes": "All objectives look clear and aligned."},
            headers=headers_a_admin,
        )
        assert res.status_code == 200, res.text
        assert res.json()["status"] == "Approved"
        print("  - Scoping memo approved. Parent Engagement advanced to 'Programme'.")

        # 7. Audit Programme Setup
        print("\n[Step 6] Setting up Audit Programme objectives and procedures...")
        res = client.post(
            f"/api/modules/engagement_fieldwork/engagements/{eng_id}/programme-items",
            json={
                "objective": "Compliance of contracts",
                "risk_area": "Legal liability from non-compliant clauses",
                "procedures": "1. Sample 10 contracts.\n2. Verify legal sign-off.\n3. Check standard clauses.",
            },
            headers=headers_a_auditor,
        )
        assert res.status_code == 201, res.text
        prog_item = res.json()
        prog_item_id = prog_item["id"]
        print(f"  - Program item created: '{prog_item['objective']}' (ID: {prog_item_id})")

        # 8. Start Fieldwork Task (Now allowed as Scoping Memo is Approved)
        print("\n[Step 7] Testing task creation and updates under Approved scoping memo...")
        res = client.post(
            f"/api/modules/engagement_fieldwork/engagements/{eng_id}/tasks",
            json={
                "title": "Review Hiring Folders",
                "description": "Inspect sampled HR files for required docs",
                "status": "In Progress",
                "programme_item_id": prog_item_id,
                "doc_link": "https://sharepoint.tenant-a.com/audit/papers",
            },
            headers=headers_a_auditor,
        )
        assert res.status_code == 201, res.text
        task = res.json()
        task_id = task["id"]
        print(f"  - Fieldwork task successfully started (ID: {task_id}). Document link: {task['doc_link']}")

        # 9. Time Tracking
        print("\n[Step 8] Testing Auditor Time Tracking...")
        # Attempt to log time on a 'To Do' task (should fail)
        todo_res = client.post(
            f"/api/modules/engagement_fieldwork/engagements/{eng_id}/tasks",
            json={"title": "Unstarted Checklist Task", "status": "To Do"},
            headers=headers_a_auditor,
        )
        todo_task_id = todo_res.json()["id"]

        res = client.post(
            f"/api/modules/engagement_fieldwork/tasks/{todo_task_id}/time-logs",
            json={"hours": 2.5, "date": str(date.today()), "description": "Reviewing manuals"},
            headers=headers_a_auditor,
        )
        assert res.status_code == 400, f"Expected 400 but got {res.status_code}"
        print("  - Time log on unstarted task rejected successfully (returns 400)")

        # Log time on 'In Progress' task (should succeed)
        res = client.post(
            f"/api/modules/engagement_fieldwork/tasks/{task_id}/time-logs",
            json={"hours": 4.5, "date": str(date.today()), "description": "Conducted document sampling review"},
            headers=headers_a_auditor,
        )
        assert res.status_code == 201, res.text
        log = res.json()
        print(f"  - Time logged successfully: {log['hours']} hours spent by {log['auditor_email']}")

        # 10. Quality Review Lifecycle
        print("\n[Step 9] Testing Quality Review Lifecycle...")
        res = client.post(
            f"/api/modules/engagement_fieldwork/engagements/{eng_id}/quality-reviews",
            json={"reviewer_email": "admin_a@tenant-a.com", "review_notes": "Final quality checkpoints verification."},
            headers=headers_a_auditor,
        )
        assert res.status_code == 201, res.text
        review = res.json()
        review_id = review["id"]
        print(f"  - Quality review initiated. Status: {review['status']}")

        # Sign off with "Passed" status
        res = client.post(
            f"/api/modules/engagement_fieldwork/quality-reviews/{review_id}/sign-off",
            json={
                "reviewer_email": "admin_a@tenant-a.com",
                "status": "Passed",
                "review_notes": "All checks validated. Clean report.",
                "checks_completed": {
                    "all_procedures_executed": True,
                    "working_papers_referenced": True,
                    "findings_documented": True,
                },
            },
            headers=headers_a_admin,
        )
        assert res.status_code == 200, res.text
        review_final = res.json()
        print(f"  - Quality review sign-off completed: '{review_final['status']}'")

        # Get updated parent engagement to verify transition to "Completed"
        res = client.get(
            f"/api/modules/engagement_fieldwork/engagements/{eng_id}",
            headers=headers_a_auditor,
        )
        assert res.json()["status"] == "Completed", f"Expected 'Completed' but got {res.json()['status']}"
        print(f"  - Parent Engagement successfully transitioned to '{res.json()['status']}' status!")

        print("\n======================================================================")
        print("VERIFICATION COMPLETED SUCCESSFULLY!")
        print("======================================================================")


if __name__ == "__main__":
    try:
        run_verification()
    except AssertionError as e:
        print(f"\n[FAIL] VERIFICATION FAILED: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\n[ERROR] UNEXPECTED ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
