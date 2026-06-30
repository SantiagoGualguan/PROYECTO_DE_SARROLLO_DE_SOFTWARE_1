"""
Integration tests for the raw SQL schema and stored procedures.

These tests validate that the SQL files are syntactically valid by
parsing them with PostgreSQL's psql client (if available) or by
performing static analysis.

They require a running PostgreSQL instance and psql CLI.
"""
import os
import subprocess
import unittest
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DB_NAME = os.environ.get("POSTGRES_DB", "dancelearn_db")
DB_USER = os.environ.get("POSTGRES_USER", "dancelearn_user")
DB_HOST = os.environ.get("DB_HOST", "localhost")
DB_PORT = os.environ.get("DB_PORT", "5432")

SQL_DIR = BASE_DIR / "database"

requires_sql_files = unittest.skipUnless(
    SQL_DIR.is_dir() and (SQL_DIR / "01_ddl.sql").is_file(),
    "SQL files not accessible (database/ directory not in container)",
)


def _psql_available():
    try:
        subprocess.run(
            ["psql", "--version"],
            capture_output=True,
            timeout=5,
        )
        return True
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return False


def _db_reachable():
    try:
        result = subprocess.run(
            [
                "psql",
                "-h", DB_HOST,
                "-p", DB_PORT,
                "-U", DB_USER,
                "-d", DB_NAME,
                "-c", "SELECT 1",
            ],
            capture_output=True,
            timeout=5,
            env={**os.environ, "PGPASSWORD": os.environ.get("POSTGRES_PASSWORD", "")},
        )
        return result.returncode == 0
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return False


requires_psql = unittest.skipUnless(_psql_available(), "psql CLI not available")
requires_db = unittest.skipUnless(_db_reachable(), "PostgreSQL not reachable")


@requires_sql_files
class SQLFileExistsTest(unittest.TestCase):
    """Verify SQL files exist and have expected content."""

    def test_ddl_exists(self):
        path = BASE_DIR / "database" / "01_ddl.sql"
        self.assertTrue(path.exists(), "01_ddl.sql not found")
        content = path.read_text()
        self.assertGreater(len(content), 100, "DDL file seems too short")

    def test_functions_exists(self):
        path = BASE_DIR / "database" / "02_functions.sql"
        self.assertTrue(path.exists(), "02_functions.sql not found")
        content = path.read_text()
        self.assertGreater(len(content), 100, "Functions file seems too short")

    def test_dml_exists(self):
        path = BASE_DIR / "database" / "03_dml.sql"
        self.assertTrue(path.exists(), "03_dml.sql not found")
        content = path.read_text()
        self.assertGreater(len(content), 100, "DML file seems too short")


@requires_sql_files
class DDLTablePresenceTest(unittest.TestCase):
    """Check that critical tables and columns are declared in the DDL."""

    def setUp(self):
        self.ddl = (BASE_DIR / "database" / "01_ddl.sql").read_text()

    def assert_table_exists(self, table_name):
        self.assertIn(f"CREATE TABLE {table_name}", self.ddl)

    def assert_column_exists(self, table_name, column):
        self.assertIn(column, self.ddl,
                      f"Column '{column}' not found in DDL")

    def test_users_table(self):
        self.assert_table_exists("users")
        self.assert_column_exists("users", "u_name")
        self.assert_column_exists("users", "last_name")
        self.assert_column_exists("users", "u_password")
        self.assert_column_exists("users", "u_type")

    def test_profesor_table(self):
        self.assert_table_exists("profesor")
        self.assert_column_exists("profesor", "biography")
        self.assert_column_exists("profesor", "years_of_experience")

    def test_coreography_table(self):
        self.assert_table_exists("coreography")
        self.assert_column_exists("coreography", "c_name")
        self.assert_column_exists("coreography", "dificulty_level")
        self.assert_column_exists("coreography", "price")
        self.assert_column_exists("coreography", "profesor_id")
        self.assert_column_exists("coreography", "status")

    def test_video_table(self):
        self.assert_table_exists("video")
        self.assert_column_exists("video", "video_name")
        self.assert_column_exists("video", "video_url")
        self.assert_column_exists("video", "coreography_id")

    def test_shopping_cart_table(self):
        self.assert_table_exists("shopping_cart")
        self.assert_column_exists("shopping_cart", "s_status")

    def test_cart_item_table(self):
        self.assert_table_exists("cart_item")
        self.assert_column_exists("cart_item", "unit_price")

    def test_purchase_table(self):
        self.assert_table_exists("purchase")
        self.assert_column_exists("purchase", "transaction_id")

    def test_user_coreography_table(self):
        self.assert_table_exists("user_coreography")

    def test_bill_table(self):
        self.assert_table_exists("bill")
        self.assert_column_exists("bill", "total_amount")
        self.assert_column_exists("bill", "payment_method")
        self.assert_column_exists("bill", "email_address")


@requires_sql_files
class DDLConstraintsTest(unittest.TestCase):
    """Check CHECK constraints and default values."""

    def setUp(self):
        self.ddl = (BASE_DIR / "database" / "01_ddl.sql").read_text()

    def test_u_type_check_constraint(self):
        self.assertIn("CHECK (u_type IN", self.ddl)

    def test_dificulty_level_check(self):
        self.assertIn("CHECK (dificulty_level IN", self.ddl)

    def test_cart_status_check(self):
        self.assertIn("CHECK (s_status IN", self.ddl)

    def test_payment_method_check(self):
        self.assertIn("CHECK (payment_method IN", self.ddl)

    def test_coreography_status_default(self):
        self.assertIn("active", self.ddl)


@requires_sql_files
class StoredProceduresTest(unittest.TestCase):
    """Check that all expected stored procedures are declared."""

    def setUp(self):
        self.sql = (BASE_DIR / "database" / "02_functions.sql").read_text()

    def test_create_user_function(self):
        self.assertIn("create_user", self.sql)

    def test_create_profesor_function(self):
        self.assertIn("create_profesor", self.sql)

    def test_create_coreography_function(self):
        self.assertIn("create_coreography", self.sql)

    def test_add_to_cart_function(self):
        self.assertIn("add_to_cart", self.sql)

    def test_create_purchase_function(self):
        self.assertIn("create_purchase", self.sql)


@requires_psql
@requires_db
class SQLSyntaxTest(unittest.TestCase):
    """Validate SQL syntax with psql (requires live PostgreSQL)."""

    def test_ddl_parses(self):
        path = BASE_DIR / "database" / "01_ddl.sql"
        result = subprocess.run(
            [
                "psql",
                "-h", DB_HOST, "-p", DB_PORT, "-U", DB_USER,
                "-d", DB_NAME,
                "-f", str(path),
                "--echo-errors",
            ],
            capture_output=True, text=True, timeout=15,
            env={**os.environ, "PGPASSWORD": os.environ.get("POSTGRES_PASSWORD", "")},
        )
        self.assertEqual(result.returncode, 0,
                         msg=f"DDL parse failed:\n{result.stderr}")

    def test_functions_parse(self):
        path = BASE_DIR / "database" / "02_functions.sql"
        result = subprocess.run(
            [
                "psql",
                "-h", DB_HOST, "-p", DB_PORT, "-U", DB_USER,
                "-d", DB_NAME,
                "-f", str(path),
                "--echo-errors",
            ],
            capture_output=True, text=True, timeout=15,
            env={**os.environ, "PGPASSWORD": os.environ.get("POSTGRES_PASSWORD", "")},
        )
        self.assertEqual(result.returncode, 0,
                         msg=f"Functions parse failed:\n{result.stderr}")


@requires_sql_files
class DMLContentTest(unittest.TestCase):
    """Check that seed data contains expected records."""

    def setUp(self):
        self.dml = (BASE_DIR / "database" / "03_dml.sql").read_text()

    def test_contains_users(self):
        self.assertIn("INSERT INTO users", self.dml)

    def test_contains_emails(self):
        self.assertIn("INSERT INTO user_email", self.dml)

    def test_contains_phones(self):
        self.assertIn("INSERT INTO user_phone_number", self.dml)

    def test_contains_profesors(self):
        self.assertIn("INSERT INTO profesor", self.dml)

    def test_contains_coreographies(self):
        self.assertIn("INSERT INTO coreography", self.dml)

    def test_contains_videos(self):
        self.assertIn("INSERT INTO video", self.dml)

    def test_contains_purchase(self):
        self.assertIn("INSERT INTO purchase", self.dml)

    def test_contains_bill(self):
        self.assertIn("INSERT INTO bill", self.dml)

    def test_admin123_password_present(self):
        self.assertIn("admin123", self.dml)
