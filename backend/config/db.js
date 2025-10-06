const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Determine the database file path
const DB_PATH = path.resolve(__dirname, '..', 'db', 'creso_crm.db'); // Using the consistent name

const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error('Error connecting to SQLite database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Initialize tables
db.serialize(() => {
    // ⚠️ CRITICAL FIX: Force all tables to be DROPPED on every startup during development.
    db.run(`DROP TABLE IF EXISTS distributor_dynamic_values`);
    db.run(`DROP TABLE IF EXISTS dynamic_fields`);
    db.run(`DROP TABLE IF EXISTS distributors`);
    
    // 1. Main Distributors table - Contains ALL required static columns
    db.run(`CREATE TABLE distributors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        arn TEXT NOT NULL UNIQUE,
        arn_holder_name TEXT NOT NULL,
        city TEXT,
        owner TEXT,
        stage TEXT,
        aum INTEGER,
        date_added TEXT,
        priority TEXT,
        linkedIn_url TEXT,
        notes_link TEXT,
        notes TEXT,
        
        -- Additional static columns
        address TEXT,
        pin TEXT,
        email TEXT,
        telephone_r TEXT,
        telephone_o TEXT,
        arn_valid_from TEXT,
        arn_valid_till TEXT,
        kyd_compliant TEXT,
        euin TEXT,
        lead_source TEXT,
        platform_used TEXT,
        follow_up_date TEXT,
        secondary_contact TEXT,
        secondary_name TEXT,
        first_call_date TEXT
    )`);

    // 2. Dynamic fields tables (unchanged)
    db.run(`CREATE TABLE dynamic_fields (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT NOT NULL UNIQUE,
        displayName TEXT NOT NULL,
        type TEXT NOT NULL,
        options TEXT
    )`);

    // 3. Table to store values for dynamic fields for each distributor
    db.run(`CREATE TABLE distributor_dynamic_values (
        distributor_id INTEGER NOT NULL,
        field_key TEXT NOT NULL,
        field_value TEXT,
        FOREIGN KEY (distributor_id) REFERENCES distributors(id) ON DELETE CASCADE,
        FOREIGN KEY (field_key) REFERENCES dynamic_fields(key) ON DELETE CASCADE,
        PRIMARY KEY (distributor_id, field_key)
    )`);
});

module.exports = db;
