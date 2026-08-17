"""
Cache Manager for Global Business Gap Finder.
Persistent SQLite storage for City Metadata, City Snapshot POIs, and Peer Analyses.
"""

import sqlite3
import json
import logging
import time
from typing import Optional, Dict, Any, List

logger = logging.getLogger(__name__)

DB_PATH = "data_cache.db"

def init_cache_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS city_metadata (
        city_key TEXT PRIMARY KEY,
        city TEXT,
        country TEXT,
        data_json TEXT,
        updated_at INTEGER
    )
    """)
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS city_snapshots (
        city_key TEXT PRIMARY KEY,
        data_json TEXT,
        places_count INTEGER,
        release TEXT,
        updated_at INTEGER
    )
    """)
    
    conn.commit()
    conn.close()


def make_city_key(city: str, country: str) -> str:
    return f"{city.strip().lower()}___{country.strip().lower()}"


def get_cached_city_metadata(city: str, country: str, ttl_seconds: int = 86400 * 90) -> Optional[Dict[str, Any]]:
    init_cache_db()
    key = make_city_key(city, country)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT data_json, updated_at FROM city_metadata WHERE city_key = ?", (key,))
    row = cursor.fetchone()
    conn.close()
    if row:
        data_json, updated_at = row
        if time.time() - updated_at <= ttl_seconds:
            return json.loads(data_json)
    return None


def set_cached_city_metadata(city: str, country: str, data: Dict[str, Any]):
    init_cache_db()
    key = make_city_key(city, country)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
    INSERT OR REPLACE INTO city_metadata (city_key, city, country, data_json, updated_at)
    VALUES (?, ?, ?, ?, ?)
    """, (key, city, country, json.dumps(data), int(time.time())))
    conn.commit()
    conn.close()


def get_cached_city_snapshot(city: str, country: str, ttl_seconds: int = 86400 * 30) -> Optional[Dict[str, Any]]:
    init_cache_db()
    key = make_city_key(city, country)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT data_json, updated_at FROM city_snapshots WHERE city_key = ?", (key,))
    row = cursor.fetchone()
    conn.close()
    if row:
        data_json, updated_at = row
        if time.time() - updated_at <= ttl_seconds:
            return json.loads(data_json)
    return None


def set_cached_city_snapshot(city: str, country: str, data: Dict[str, Any]):
    init_cache_db()
    key = make_city_key(city, country)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    places_count = len(data.get("places", []))
    release = data.get("release", "unknown")
    cursor.execute("""
    INSERT OR REPLACE INTO city_snapshots (city_key, data_json, places_count, release, updated_at)
    VALUES (?, ?, ?, ?, ?)
    """, (key, json.dumps(data), places_count, release, int(time.time())))
    conn.commit()
    conn.close()
