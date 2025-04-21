#!/usr/bin/env python3

from flask import Flask, jsonify, send_from_directory, abort, request
import mariadb
import os

app = Flask(__name__, static_folder='/var/www/html/students_25/rvboz/Segre-Lab-Metabolic-Data-Explorer/static')
# CORS not needed when frontend is served from same origin

KEY_FILENAME = '/var/www/html/students_25/rvboz/Segre-Lab-Metabolic-Data-Explorer/.key.txt'

# read and store BU credentials
def read_creds(filename):
    with open(filename, 'r') as file:
        lines = file.readlines()

    lines = [line.strip('\n') for line in lines]
    
    creds = {
        "host": "bioed-new.bu.edu",
        "user": lines[0],
        "password": lines[1],
        "database": lines[2],
        "port": int(lines[3])
    }
    
    return creds

@app.route('/api/tables')
def index():
    DB_CONFIG = read_creds(KEY_FILENAME)

    try:
        conn = mariadb.connect(**DB_CONFIG)
        cur = conn.cursor()
        cur.execute("SHOW TABLES;")
        tables = [row[0] for row in cur.fetchall()]
        cur.close()
        conn.close()
        return jsonify(tables)
    except mariadb.Error as e:
        return jsonify({"error": str(e)}), 500
@app.route('/api/add-model', methods=['POST'])
def add_model():
    DB_CONFIG = read_creds(KEY_FILENAME)
    
    data = request.get_json()

    required_fields = [
        'model_id', 'carbon_id', 'species_id', 'media_id', 'experiment_id',
        'gapfill_method', 'annotation_method', 'metabolite_ID', 'platform',
        'biomass_composition', 'date_created', 'control_type', 'notes',
        'parent_model_id', 'model_file'
    ]
    
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing fields in request"}), 400

    try:
        conn = mariadb.connect(**DB_CONFIG)
        cur = conn.cursor()

        query = """
            INSERT INTO model (
                model_id, carbon_id, species_id, media_id, experiment_id,
                gapfill_method, annotation_method, metabolite_ID, platform,
                biomass_composition, date_created, control_type, notes,
                parent_model_id, model_file
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """

        values = (
            data['model_id'], data['carbon_id'], data['species_id'], data['media_id'],
            data['experiment_id'], data['gapfill_method'], data['annotation_method'],
            data['metabolite_ID'], data['platform'], data['biomass_composition'],
            data['date_created'], data['control_type'], data['notes'],
            data['parent_model_id'], data['model_file']
        )

        cur.execute(query, values)
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"message": "Model added successfully"}), 201

    except mariadb.Error as e:
        return jsonify({"error": str(e)}), 500

# serve react frontend
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_static(path):
    full_path = os.path.join(app.static_folder, path)
    if os.path.isfile(full_path):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')


if __name__ == '__main__':
    app.run(debug=True)
