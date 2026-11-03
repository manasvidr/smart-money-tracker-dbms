from sqlalchemy import create_engine, event, text
from sqlalchemy.orm import sessionmaker

from config import DATABASE_URL, BASE_DIR

_is_sqlite = DATABASE_URL.startswith("sqlite")
engine = create_engine(
    DATABASE_URL,
    echo=False,
    connect_args={"check_same_thread": False} if _is_sqlite else {},
)

if _is_sqlite:
    @event.listens_for(engine, "connect")
    def _enable_sqlite_foreign_keys(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db(reset: bool = False):
    """Initialize the current prototype schema from sql/schema.sql."""
    schema_path = BASE_DIR / "sql" / "schema.sql"
    schema_sql = schema_path.read_text(encoding="utf-8")
    drop_statements = [
        "DROP TABLE IF EXISTS insider_transactions",
        "DROP TABLE IF EXISTS sec_filings",
        "DROP TABLE IF EXISTS daily_prices",
        "DROP TABLE IF EXISTS companies",
    ]
    with engine.begin() as conn:
        if reset:
            for statement in drop_statements:
                conn.execute(text(statement))
        statements = [stmt.strip() for stmt in schema_sql.split(";") if stmt.strip()]
        for statement in statements:
            conn.execute(text(statement))
    print("Prototype database schema initialized.")
