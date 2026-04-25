"""init tables

Revision ID: 0001_init
Revises: 
Create Date: 2026-04-23
"""

from alembic import op
import sqlalchemy as sa

revision = "0001_init"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("username", sa.String(length=120), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("role", sa.String(length=32), nullable=False, server_default="patient"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_users_username", "users", ["username"], unique=True)

    op.create_table(
        "consents",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("consent_type", sa.String(length=64), nullable=False),
        sa.Column("granted", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("meta", sa.JSON(), nullable=False, server_default=sa.text("'{}'::json")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_consents_user_id", "consents", ["user_id"])

    op.create_table(
        "audit_logs",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("actor_user_id", sa.String(length=36), nullable=True),
        sa.Column("action", sa.String(length=128), nullable=False),
        sa.Column("target_user_id", sa.String(length=36), nullable=True),
        sa.Column("data", sa.JSON(), nullable=False, server_default=sa.text("'{}'::json")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_audit_logs_actor_user_id", "audit_logs", ["actor_user_id"])
    op.create_index("ix_audit_logs_target_user_id", "audit_logs", ["target_user_id"])

    op.create_table(
        "prescriptions",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("extracted", sa.JSON(), nullable=False, server_default=sa.text("'{}'::json")),
        sa.Column("raw_text", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_prescriptions_user_id", "prescriptions", ["user_id"])

    op.create_table(
        "emergencies",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False, server_default="triggered"),
        sa.Column("location", sa.JSON(), nullable=False, server_default=sa.text("'{}'::json")),
        sa.Column("phc_result", sa.JSON(), nullable=False, server_default=sa.text("'{}'::json")),
        sa.Column("whatsapp_result", sa.JSON(), nullable=False, server_default=sa.text("'{}'::json")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_emergencies_user_id", "emergencies", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_emergencies_user_id", table_name="emergencies")
    op.drop_table("emergencies")

    op.drop_index("ix_prescriptions_user_id", table_name="prescriptions")
    op.drop_table("prescriptions")

    op.drop_index("ix_audit_logs_target_user_id", table_name="audit_logs")
    op.drop_index("ix_audit_logs_actor_user_id", table_name="audit_logs")
    op.drop_table("audit_logs")

    op.drop_index("ix_consents_user_id", table_name="consents")
    op.drop_table("consents")

    op.drop_index("ix_users_username", table_name="users")
    op.drop_table("users")

