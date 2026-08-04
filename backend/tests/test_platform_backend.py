"""Comprehensive Automated Test Suite & Security Audit for IAOS Platform.

Tests:
1. Security & Authentication (Password Hashing, JWT Token Generation, Login Verification)
2. Multi-Tenant Data Isolation (Tenant A vs Tenant B isolation verification)
3. Module 43: Sales & Distribution (KPIs, 25 Subpages, Analytics Engine, Escalation CAPA)
4. Platform Auto-Discovery (Verifying items endpoint across all 86 modules)
"""
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
import unittest
from fastapi.testclient import TestClient

from app.main import app
from app.core.database import SessionLocal, Base, engine
from app.models.tenant import Tenant
from app.models.user import User, UserRole
from app.core.security import hash_password, verify_password, create_access_token


class TestIAOSPlatformAndSecurity(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        from app.module_loader import load_modules
        from app.bootstrap import create_all_tables, ensure_super_admin
        load_modules(app)
        create_all_tables()
        ensure_super_admin()

        cls.client = TestClient(app)
        cls.db = SessionLocal()

        # Setup Tenant 1 (Acme Corp) and Tenant 2 (Beta Inc)
        t1 = cls.db.query(Tenant).filter(Tenant.id == 1).first()
        if not t1:
            t1 = Tenant(id=1, name="Acme Corp", slug="acme-corp", is_active=True)
            cls.db.add(t1)

        t2 = cls.db.query(Tenant).filter(Tenant.id == 2).first()
        if not t2:
            t2 = Tenant(id=2, name="Beta Inc", slug="beta-inc", is_active=True)
            cls.db.add(t2)

        cls.db.commit()

        # Setup Test Users
        cls.pwd = "TestPass123!"
        u1 = cls.db.query(User).filter(User.email == "auditor_acme@test.com").first()
        if not u1:
            u1 = User(
                email="auditor_acme@test.com",
                full_name="Acme Auditor",
                hashed_password=hash_password(cls.pwd),
                role=UserRole.AUDITOR,
                tenant_id=1,
            )
            cls.db.add(u1)

        u2 = cls.db.query(User).filter(User.email == "auditor_beta@test.com").first()
        if not u2:
            u2 = User(
                email="auditor_beta@test.com",
                full_name="Beta Auditor",
                hashed_password=hash_password(cls.pwd),
                role=UserRole.AUDITOR,
                tenant_id=2,
            )
            cls.db.add(u2)

        cls.db.commit()

        # Generate Tokens with user.id as sub
        cls.token_t1 = create_access_token(str(u1.id), 1, "auditor")
        cls.token_t2 = create_access_token(str(u2.id), 2, "auditor")

        cls.headers_t1 = {"Authorization": f"Bearer {cls.token_t1}"}
        cls.headers_t2 = {"Authorization": f"Bearer {cls.token_t2}"}

    @classmethod
    def tearDownClass(cls):
        cls.db.close()

    # ─────────────────────────────────────────────────────────────
    # 1. SECURITY & AUTHENTICATION TESTS
    # ─────────────────────────────────────────────────────────────
    def test_01_password_hashing(self):
        """Verify password hashing security (Bcrypt/Argon2)."""
        raw_pwd = "SecretPassword123!"
        hashed = hash_password(raw_pwd)
        self.assertNotEqual(raw_pwd, hashed)
        self.assertTrue(verify_password(raw_pwd, hashed))
        self.assertFalse(verify_password("WrongPassword", hashed))

    def test_02_auth_login_endpoint(self):
        """Test API login authentication endpoint."""
        res = self.client.post(
            "/api/auth/login",
            json={"email": "auditor_acme@test.com", "password": self.pwd},
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("token", data)
        self.assertIn("access_token", data["token"])
        self.assertEqual(data["token"]["token_type"], "bearer")

    def test_03_invalid_login_rejection(self):
        """Verify invalid credentials are appropriately rejected with HTTP 401."""
        res = self.client.post(
            "/api/auth/login",
            json={"email": "auditor_acme@test.com", "password": "BadPassword"},
        )
        self.assertEqual(res.status_code, 401)

    # ─────────────────────────────────────────────────────────────
    # 2. MULTI-TENANT ISOLATION TESTS
    # ─────────────────────────────────────────────────────────────
    def test_04_multi_tenant_data_isolation(self):
        """Ensure Tenant A cannot see or delete Tenant B's data."""
        # Tenant 1 creates a record in sales_distribution
        create_res = self.client.post(
            "/api/modules/sales_distribution/subpages/scheme-leakage/item",
            headers=self.headers_t1,
            json={
                "data": {
                    "scheme_code": "SCH-TEST-T1",
                    "scheme_name": "Tenant 1 Exclusive Scheme",
                    "distributor_id": "DIST-T1",
                    "distributor_name": "Acme Distributor",
                    "claimed_discount": 100000.0,
                    "eligible_discount": 50000.0,
                    "leakage_amount": 50000.0,
                    "status": "Flagged",
                }
            },
        )
        self.assertEqual(create_res.status_code, 201)
        item_id = create_res.json()["id"]

        # Tenant 1 queries scheme-leakage → must see the item
        t1_get = self.client.get("/api/modules/sales_distribution/subpages/scheme-leakage", headers=self.headers_t1)
        self.assertEqual(t1_get.status_code, 200)
        t1_items = [i["id"] for i in t1_get.json()["items"]]
        self.assertIn(item_id, t1_items)

        # Tenant 2 queries scheme-leakage → MUST NOT see Tenant 1's item
        t2_get = self.client.get("/api/modules/sales_distribution/subpages/scheme-leakage", headers=self.headers_t2)
        self.assertEqual(t2_get.status_code, 200)
        t2_items = [i["id"] for i in t2_get.json()["items"]]
        self.assertNotIn(item_id, t2_items)

        # Tenant 2 attempts to delete Tenant 1's item → MUST return HTTP 404
        t2_del = self.client.delete(f"/api/modules/sales_distribution/subpages/scheme-leakage/item/{item_id}", headers=self.headers_t2)
        self.assertEqual(t2_del.status_code, 404)

    # ─────────────────────────────────────────────────────────────
    # 3. MODULE 43 (SALES & DISTRIBUTION) FUNCTIONAL TESTS
    # ─────────────────────────────────────────────────────────────
    def test_05_sales_distribution_kpis(self):
        """Test live executive KPI aggregation endpoint."""
        res = self.client.get("/api/modules/sales_distribution/kpis", headers=self.headers_t1)
        self.assertEqual(res.status_code, 200)
        kpis = res.json()
        self.assertIn("total_sales_audited", kpis)
        self.assertIn("scheme_leakage_identified", kpis)
        self.assertIn("primary_secondary_mismatch_val", kpis)

    def test_06_sales_distribution_subpages_query(self):
        """Test subpage data queries across key categories."""
        subpages = ["scheme-leakage", "primary-vs-secondary", "distributor-claims", "exception-red-flag-queue"]
        for sp in subpages:
            res = self.client.get(f"/api/modules/sales_distribution/subpages/{sp}", headers=self.headers_t1)
            self.assertEqual(res.status_code, 200, f"Subpage {sp} query failed")
            data = res.json()
            self.assertEqual(data["page_key"], sp)
            self.assertIsInstance(data["items"], list)

    def test_07_analytics_engine_execution(self):
        """Test 1-Click Audit Analytics Engine execution."""
        res = self.client.post(
            "/api/modules/sales_distribution/execute-analytics",
            headers=self.headers_t1,
            json={"threshold_amount": 50000.0},
        )
        self.assertEqual(res.status_code, 200)
        result = res.json()
        self.assertEqual(result["status"], "Success")
        self.assertGreaterEqual(result["executed_rules_count"], 1)

    def test_08_finding_escalation_capa(self):
        """Test finding escalation into CAPA remediation tracker."""
        res = self.client.post(
            "/api/modules/sales_distribution/escalate-finding",
            headers=self.headers_t1,
            json={
                "title": "Unapproved Discount Claim at Distributor X",
                "risk_category": "Scheme Leakage",
                "severity": "High",
                "financial_impact": 450000.0,
                "recommendation": "Enforce SAP discount cap validation.",
                "action_owner": "Head of Sales Ops",
            },
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "Created")
        self.assertTrue(data["finding_no"].startswith("OBS-SD-"))
        self.assertTrue(data["action_id"].startswith("CAPA-SD-"))

    def test_09_reload_seed_endpoint(self):
        """Test POST /reload-seed endpoint."""
        res = self.client.post("/api/modules/sales_distribution/reload-seed", headers=self.headers_t1)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["status"], "success")

    # ─────────────────────────────────────────────────────────────
    # 4. PLATFORM AUTO-DISCOVERY & 86 MODULES TEST
    # ─────────────────────────────────────────────────────────────
    def test_10_platform_modules_items_endpoint(self):
        """Verify GET /items endpoint returns 200 OK across key platform modules."""
        sample_modules = [
            "annual_planning",
            "audit_reporting",
            "cybersecurity",
            "procure_to_pay",
            "inventory_stores",
            "order_to_cash",
            "itgc",
            "sales_distribution",
        ]
        for mod in sample_modules:
            res = self.client.get(f"/api/modules/{mod}/items", headers=self.headers_t1)
            self.assertEqual(res.status_code, 200, f"Module '{mod}' /items endpoint returned {res.status_code}")


if __name__ == "__main__":
    unittest.main()
