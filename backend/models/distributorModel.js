const db = require('../config/db');

// List of all known static columns in the 'distributors' table
// NOTE: This list is used to FILTER data from the FE, ensuring only static DB columns are processed.
const STATIC_COLUMNS = [
    'arn', 'arn_holder_name', 'city', 'owner', 'stage', 'aum', 
    'date_added', 'priority', 'linkedIn_url', 'notes_link', 'notes',
    'address', 'pin', 'email', 'telephone_r', 'telephone_o', 
    'arn_valid_from', 'arn_valid_till', 'kyd_compliant', 'euin', 
    'lead_source', 'platform_used', 'follow_up_date',
    'secondary_contact', 'secondary_name', 'first_call_date'
];

// Helper to fetch and merge dynamic fields for a single distributor
const mergeDynamicData = (distributor, callback) => {
    const dynamicValuesQuery = `
        SELECT df.key AS field_key, ddv.field_value
        FROM distributor_dynamic_values ddv
        JOIN dynamic_fields df ON ddv.field_key = df.key
        WHERE ddv.distributor_id = ?
    `;
    db.all(dynamicValuesQuery, [distributor.id], (err, dynamicValues) => {
        if (err) return callback(err);
        
        dynamicValues.forEach(dv => {
            distributor[dv.field_key] = dv.field_value;
        });
        callback(null, distributor);
    });
};

const DistributorModel = {
    // Get all distributors (will fetch dynamic values separately and merge)
    getAllDistributors: (callback) => {
        db.all(`SELECT * FROM distributors`, [], (err, distributors) => {
            if (err) return callback(err);
            
            if (distributors.length === 0) return callback(null, []);

            let completed = 0;
            const results = [];

            distributors.forEach(distributor => {
                mergeDynamicData(distributor, (err, mergedDistributor) => {
                    if (err) return callback(err);
                    results.push(mergedDistributor);
                    completed++;
                    if (completed === distributors.length) {
                        callback(null, results);
                    }
                });
            });
        });
    },

    // Get a single distributor
    getDistributorById: (id, callback) => {
        db.get(`SELECT * FROM distributors WHERE id = ?`, [id], (err, distributor) => {
            if (err) return callback(err);
            if (!distributor) return callback(null, null);
            
            mergeDynamicData(distributor, callback);
        });
    },

    // Create or Update distributor
    saveDistributor: (id, data, callback) => {
        const isUpdate = !!id;
        
        // Separate static fields from dynamic fields
        const staticData = {};
        const dynamicData = {};

        // 1. Separate Static and Dynamic Data
        for (const key in data) {
            if (STATIC_COLUMNS.includes(key)) {
                // FIX: Exclude date_added from being updated, as it should be static after creation.
                if (isUpdate && key === 'date_added') continue; 
                staticData[key] = data[key]; 
            } else if (key === 'dynamicFields') {
                Object.assign(dynamicData, data[key]);
            }
        }
        
        db.serialize(() => {
            db.run("BEGIN TRANSACTION;");

            const saveStaticData = (distributorId, cb) => {
                if (isUpdate) {
                    // Update: Only update the columns explicitly sent in the staticData payload
                    const updateKeys = Object.keys(staticData).filter(key => key !== 'id');
                    const setClauses = updateKeys.map(col => `${col} = ?`).join(', ');
                    const values = updateKeys.map(col => staticData[col]);
                    
                    if (values.length === 0) return cb(null, distributorId);
                    
                    // CRITICAL FIX: Ensure ID is the last parameter for the WHERE clause
                    db.run(`UPDATE distributors SET ${setClauses} WHERE id = ?`, [...values, distributorId], function(err) {
                        cb(err, distributorId);
                    });
                } else {
                    // Insert: Requires all NOT NULL columns to be present
                    const cols = Object.keys(staticData).join(', ');
                    const placeholders = Object.keys(staticData).map(() => '?').join(', ');
                    const values = Object.values(staticData);
                    
                    if (values.length === 0) return cb(new Error("No static data provided for insert."));
                    
                    db.run(`INSERT INTO distributors (${cols}) VALUES (${placeholders})`, values, function(err) {
                        cb(err, this ? this.lastID : null);
                    });
                }
            };
            
            const saveDynamicData = (distributorId, cb) => {
                if (Object.keys(dynamicData).length === 0) return cb(null);

                // 1. Delete existing dynamic values for this distributor first
                db.run(`DELETE FROM distributor_dynamic_values WHERE distributor_id = ?`, [distributorId], function(err) {
                    if (err) return cb(err);
                    
                    // 2. Prepare new values for insertion
                    const dynamicInserts = Object.keys(dynamicData).map(key => [
                        distributorId, key, dynamicData[key] !== null ? String(dynamicData[key]) : ''
                    ]).filter(([_, __, value]) => value !== ''); // Only save non-empty values

                    if (dynamicInserts.length === 0) return cb(null);
                    
                    // 3. Insert new dynamic values
                    const stmt = db.prepare(`INSERT INTO distributor_dynamic_values (distributor_id, field_key, field_value) VALUES (?, ?, ?)`);
                    dynamicInserts.forEach(params => {
                        stmt.run(params);
                    });
                    stmt.finalize(cb);
                });
            };

            const distributorId = isUpdate ? id : null;

            saveStaticData(distributorId, (err, newId) => {
                if (err) {
                    db.run("ROLLBACK;");
                    return callback(err);
                }
                const finalId = isUpdate ? id : newId;
                
                saveDynamicData(finalId, (err) => {
                    if (err) {
                        db.run("ROLLBACK;");
                        return callback(err);
                    }
                    db.run("COMMIT;", (err) => {
                        callback(err, finalId);
                    });
                });
            });
        });
    },

    deleteDistributor: (id, callback) => {
        db.run("DELETE FROM distributors WHERE id = ?", [id], callback);
    }
};

module.exports = DistributorModel;