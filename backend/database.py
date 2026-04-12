import mysql.connector
import os
from pathlib import Path

# ---------------------------------------------------------
# DATABASE CONFIGURATION & INITIALIZATION
# ---------------------------------------------------------

DB_USER = "root" #usually root
DB_PASS = "k123"
DB_HOST = "localhost" #usually localhost
DB_NAME = "grid" #usually grid

def get_base_connection():
    return mysql.connector.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASS
    )

def init_db():
    try:
        conn = get_base_connection()
        cursor = conn.cursor()
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME}")
        conn.commit()
        conn.close()

        # Connect to the specific database
        conn = get_connection()
        cursor = conn.cursor()

        current_dir = Path(__file__).resolve().parent
        sql_file = current_dir / "grid.sql"
        
        if sql_file.exists():
            print(f"[DB] Initializing '{DB_NAME}' from {sql_file.name}...")
            with open(sql_file, 'r') as f:
                sql_commands = f.read().split(';')
                for command in sql_commands:
                    if command.strip():
                        cursor.execute(command)
            conn.commit()
            print("[DB] Initialization Complete.")
        else:
            print(f"[DB ERROR] {sql_file.name} not found! Skipping table creation.")
            
    except Exception as e:
        print(f"[DB ERROR] Initialization failed: {e}")
    finally:
        if 'conn' in locals() and conn.is_connected():
            conn.close()

def get_connection():
    return mysql.connector.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASS,
        database=DB_NAME
    )