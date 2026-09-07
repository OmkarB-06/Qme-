# db.py
# A tiny file-based "database" for storing users — the Python/Flask
# equivalent of the earlier Node db.js. Uses a plain JSON file so this
# project runs with zero database installation required.
#
# For production, swap this out for a real database (PostgreSQL, MySQL,
# etc.) — the function signatures below are written so that swap is easy.

import json
import os
import threading
from datetime import datetime

DB_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
DB_FILE = os.path.join(DB_DIR, "users.json")

_lock = threading.Lock()  # keeps concurrent requests from corrupting the file


def _ensure_db_file():
    os.makedirs(DB_DIR, exist_ok=True)
    if not os.path.exists(DB_FILE):
        with open(DB_FILE, "w", encoding="utf-8") as f:
            json.dump({"users": [], "next_id": 1}, f, indent=2)


def _read_db():
    _ensure_db_file()
    try:
        with open(DB_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, FileNotFoundError):
        # If the file is somehow corrupted, reset it rather than crash the server.
        fresh = {"users": [], "next_id": 1}
        _write_db(fresh)
        return fresh


def _write_db(data):
    with open(DB_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


def get_user_by_email(email):
    with _lock:
        db = _read_db()
    normalized = email.strip().lower()
    return next((u for u in db["users"] if u["email"] == normalized), None)


def get_user_by_id(user_id):
    with _lock:
        db = _read_db()
    return next((u for u in db["users"] if u["id"] == user_id), None)


def create_user(name, email, password_hash):
    with _lock:
        db = _read_db()
        user = {
            "id": db["next_id"],
            "name": name.strip(),
            "email": email.strip().lower(),
            "password_hash": password_hash,
            "created_at": datetime.utcnow().isoformat(),
            "reset_token_hash": None,
            "reset_token_expires": None,
        }
        db["users"].append(user)
        db["next_id"] += 1
        _write_db(db)
        return user


def set_reset_token(user_id, token_hash, expires_at):
    with _lock:
        db = _read_db()
        user = next((u for u in db["users"] if u["id"] == user_id), None)
        if not user:
            return None
        user["reset_token_hash"] = token_hash
        user["reset_token_expires"] = expires_at
        _write_db(db)
        return user


def get_user_by_reset_token_hash(token_hash):
    with _lock:
        db = _read_db()
    now = datetime.utcnow().timestamp() * 1000
    return next(
        (
            u for u in db["users"]
            if u.get("reset_token_hash") == token_hash
            and u.get("reset_token_expires")
            and u["reset_token_expires"] > now
        ),
        None,
    )


def update_password(user_id, new_password_hash):
    with _lock:
        db = _read_db()
        user = next((u for u in db["users"] if u["id"] == user_id), None)
        if not user:
            return None
        user["password_hash"] = new_password_hash
        user["reset_token_hash"] = None
        user["reset_token_expires"] = None
        _write_db(db)
        return user
