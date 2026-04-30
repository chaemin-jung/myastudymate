"""Run this once to reset the DB with new character image data."""
import sqlite3, os
DB_PATH = "studywithmya.db"
if os.path.exists(DB_PATH):
    os.remove(DB_PATH)
    print("✅ DB deleted. Restart the backend to recreate with new characters.")
else:
    print("No DB found.")
