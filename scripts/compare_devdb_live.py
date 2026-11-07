"""
Read-only script to compare accounts in prisma/dev.db against live Neon DB without leaking emails or hashes.
Usage:
  python scripts/compare_devdb_live.py

Requires DATABASE_URL in environment or .env.local (uses psycopg2/asyncpg/or direct read instructions).
Outputs counts only.
"""
import os
import sqlite3
import hashlib
import sys

def sha256_hash(text: str) -> str:
    return hashlib.sha256(text.strip().lower().encode('utf-8')).hexdigest()

def main():
    db_path = os.path.join(os.path.dirname(__file__), '..', 'prisma', 'dev.db')
    if not os.path.exists(db_path):
        print(f"❌ dev.db not found at {db_path}")
        return

    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    try:
        cur.execute("SELECT email, role, status FROM User")
        sqlite_rows = cur.fetchall()
    except Exception as e:
        print(f"❌ Error reading sqlite dev.db: {e}")
        return
    finally:
        conn.close()

    sqlite_hashes = {sha256_hash(row[0]): (row[1], row[2]) for row in sqlite_rows if row[0]}
    print("=" * 60)
    print("READ-ONLY SEC-03 AUDIT: SQLite vs Live Database")
    print("=" * 60)
    print(f"Total SQLite accounts found: {len(sqlite_hashes)}")

    print("\nTo compare with live DB:")
    print("Run this query in Neon SQL Console:")
    print("  SELECT encode(sha256(lower(trim(email))::bytea), 'hex') AS email_hash, role, status FROM \"User\";")
    print("\nCompare the hash set directly without exposing plaintext emails or password hashes.")
    print("=" * 60)

if __name__ == '__main__':
    main()
