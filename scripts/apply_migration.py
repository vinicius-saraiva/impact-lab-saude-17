"""
Aplica uma migration específica no Supabase.

Uso:
    export SUPABASE_DB_URL='postgresql://...'
    python scripts/apply_migration.py db/migrations/006_demo_cache_and_indexes.sql
"""
import os, sys
from pathlib import Path
import psycopg

url = os.environ.get("SUPABASE_DB_URL") or os.environ.get("SUPABASE_DIRECT_URL")
if not url:
    print("ERRO: defina SUPABASE_DB_URL", file=sys.stderr)
    sys.exit(1)

if len(sys.argv) < 2:
    print("Uso: python scripts/apply_migration.py <arquivo.sql>", file=sys.stderr)
    sys.exit(1)

sql = Path(sys.argv[1]).read_text()

with psycopg.connect(url, options="-c statement_timeout=0") as conn:
    conn.autocommit = True
    with conn.cursor() as cur:
        cur.execute(sql)
    print(f"✓ {sys.argv[1]} aplicado com sucesso.")
