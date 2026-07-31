-- ============================================================================
-- Budgeting & Variance Analysis — Database Schema (MySQL 8)
-- Compatible with the project's shared MySQL database + row-level tenancy.
--
-- Tables are auto-created by SQLAlchemy at startup (Base.metadata.create_all).
-- This script is provided for reference, manual migration, or CI seeding.
-- ============================================================================

-- 1. Budget Exceptions (anomaly / red-flag queue)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mod_budgeting_variance_exceptions (
    id                  INT             NOT NULL AUTO_INCREMENT,
    tenant_id           INT             NOT NULL,
    cost_center         VARCHAR(255)    NOT NULL DEFAULT '',
    budget_owner        VARCHAR(255)    NOT NULL DEFAULT '',
    source_procedure    VARCHAR(255)    NOT NULL DEFAULT '' COMMENT 'e.g. Chronic Overspend, Pre-Approval Timing',
    variance_amount     DOUBLE          NOT NULL DEFAULT 0,
    risk_grade          VARCHAR(20)     NOT NULL DEFAULT 'Medium' COMMENT 'Critical | High | Medium',
    status              VARCHAR(20)     NOT NULL DEFAULT 'Open' COMMENT 'Open | In Review | Resolved',
    disposition_notes   TEXT,
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_budget_exceptions_tenant (tenant_id),
    INDEX idx_budget_exceptions_status (status),
    INDEX idx_budget_exceptions_risk (risk_grade),
    CONSTRAINT fk_budget_exceptions_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- 2. Risk & Control Matrix (RCM)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mod_budgeting_variance_rcm (
    id                  INT             NOT NULL AUTO_INCREMENT,
    tenant_id           INT             NOT NULL,
    risk_id             VARCHAR(50)     NOT NULL DEFAULT '',
    financial_assertion VARCHAR(20)     NOT NULL DEFAULT 'Accuracy' COMMENT 'Accuracy | Occurrence | Completeness',
    control_description TEXT,
    control_owner       VARCHAR(255)    NOT NULL DEFAULT '',
    control_type        VARCHAR(20)     NOT NULL DEFAULT 'Manual' COMMENT 'Automated | Manual',
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_budget_rcm_tenant (tenant_id),
    INDEX idx_budget_rcm_assertion (financial_assertion),
    CONSTRAINT fk_budget_rcm_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- 3. Working Papers & Evidence
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mod_budgeting_variance_working_papers (
    id                      INT             NOT NULL AUTO_INCREMENT,
    tenant_id               INT             NOT NULL,
    attachment_name         VARCHAR(255)    NOT NULL DEFAULT '',
    associated_procedure_id INT             NOT NULL DEFAULT 0,
    upload_date             VARCHAR(30)     NOT NULL DEFAULT '',
    uploaded_by             VARCHAR(255)    NOT NULL DEFAULT '',
    review_status           VARCHAR(20)     NOT NULL DEFAULT 'Pending' COMMENT 'Pending | Reviewed | Signed Off',
    audit_tickmarks         JSON            DEFAULT ('[]') COMMENT 'Array of text markers e.g. ["✓","?"]',
    created_at              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_budget_wp_tenant (tenant_id),
    INDEX idx_budget_wp_status (review_status),
    CONSTRAINT fk_budget_wp_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
