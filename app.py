#!/usr/bin/env python3

from flask import Flask, jsonify, send_from_directory, abort
import mariadb
import os

app = Flask(__name__, static_folder='/var/www/html/students_25/bsandi/Segre-Lab-Metabolic-Data-Explorer/static')
# CORS not needed when frontend is served from same origin

KEY_FILENAME = '/var/www/html/students_25/bsandi/Segre-Lab-Metabolic-Data-Explorer/.key.txt'

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

# connect to mariadb using BU creds
def get_db():
    config = read_creds(KEY_FILENAME)

    try:
        conn = mariadb.connect(**config)
        cur = conn.cursor()

        return conn, cur
        
    except mariadb.Error as e:
        return jsonify({"error": str(e)}), 500
    
# testing function, show the tables that are detected in a database
@app.route('/api/tables')
def index():
    conn, cur = get_db()

    try:
        cur.execute("SHOW TABLES;")
        tables = [row[0] for row in cur.fetchall()]
        cur.close()
        conn.close()
        return jsonify(tables)
    except mariadb.Error as e:
        return jsonify({"error": str(e)}), 500
    

@app.route('/api/joined-data')
def get_joined_data():
    try:
        conn, cur = get_db()

        cur.execute("""
            SELECT *
            FROM miRNA;
        """)
        
        columns = [desc[0] for desc in cur.description]
        rows = cur.fetchall()

        cur.close()
        conn.close()

        return jsonify({"columns": columns, "rows": rows})

    except mariadb.Error as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/model/<model_id>')
def get_model_info(model_id):
    try:
        conn, cur = get_db()

        cur.execute("SELECT * FROM miRNA WHERE mid = ?", (model_id,))
        row = cur.fetchone()
        if not row:
            return jsonify({"error": "Model not found"}), 404
        
        columns = [desc[0] for desc in cur.description]
        model_data = dict(zip(columns, row))

        # Placeholder comet plot — replace this later
        plot_data = f"Generated comet plot for model {model_id} (placeholder)"

        cur.close()
        conn.close()

        return jsonify({"model": model_data, "plot": plot_data})

    except mariadb.Error as e:
        return jsonify({"error": str(e)}), 500
    

# serve react frontend
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_static(path):
    # Let /api/* pass through to backend
    if path.startswith('api/'):
        abort(404)

    full_path = os.path.join(app.static_folder, path)
    if os.path.isfile(full_path):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')


if __name__ == '__main__':
    app.run(debug=True)
