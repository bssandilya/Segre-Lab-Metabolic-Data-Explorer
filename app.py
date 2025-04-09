from flask import Flask, jsonify
from flask_cors import CORS
import mariadb

app = Flask(__name__)
CORS(app)


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

@app.route('/')
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

if __name__ == '__main__':
    app.run(debug=True)
