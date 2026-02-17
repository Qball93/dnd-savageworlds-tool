const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

// Put DB in a subfolder (optional but nice)
const dbDir = path.join(__dirname, '..', 'data');
const dbPath = path.join(dbDir, 'dnd_campaign.db');

// Ensure the directory exists (won't throw if it already exists)
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Opening the DB will create the file if it doesn't exist
const db = new Database(dbPath);

db.pragma('foreign_keys = ON');

// Run simple migration(s)
db.exec(`
  CREATE TABLE IF NOT EXISTS type (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type_name TEXT NOT NULL
  );

  CREATE TABLE IF NOT Exists moves (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    move_name TEXT NOT NULL,
    move_type INTEGER NOT NULL,
    move_text TEXT,
    FOREIGN KEY(move_type) REFERENCES type(id)  
  );

  CREATE TABLE IF NOT EXISTS status(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    modifier_name TEXT NOT NULL,
    modifier_text TEXT
  );

  CREATE TABLE IF NOT EXISTS weather(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    weather_name TEXT
  );
`);

module.exports = db;