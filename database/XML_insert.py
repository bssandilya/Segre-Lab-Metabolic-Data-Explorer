#!/usr/bin/env python3
import os
import re
import sys
import requests
import logging
from datetime import datetime

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Constants - IMPORTANT: Use a directory you have access to
GITHUB_RAW_CONTENT_BASE = "https://raw.githubusercontent.com/segrelab/GEM-mit1002/dev/modelseedpy_gapfill_per_biomass_cmpt/"
DOWNLOAD_DIR = os.path.join(os.path.expanduser("~/Segre-Lab-Metabolic-Data-Explorer/database"), "xml_files") 
XML_DIRECTORY = DOWNLOAD_DIR  # This is where the files will be stored and referenced in the database

# Database data constants
MEDIA_NAME = "mbm"
GAPFILL_METHOD = "ModelSEED"
ANNOTATION_METHOD = "RAST"
SCIENTIST = "Helen Scott"
SPECIES_NAME = "Alteramonas"
GROWTH_METHOD = "Plate"
PLATFORM = "ModelSEED"

# List of XML files
XML_FILES = [
    "gapfilled_cpd00001_c0.xml", "gapfilled_cpd00002_c0.xml", "gapfilled_cpd00003_c0.xml",
    "gapfilled_cpd00006_c0.xml", "gapfilled_cpd00008_c0.xml", "gapfilled_cpd00009_c0.xml",
    "gapfilled_cpd00010_c0.xml", "gapfilled_cpd00015_c0.xml", "gapfilled_cpd00016_c0.xml",
    "gapfilled_cpd00017_c0.xml", "gapfilled_cpd00028_c0.xml", "gapfilled_cpd00030_c0.xml",
    "gapfilled_cpd00034_c0.xml", "gapfilled_cpd00037_c0.xml", "gapfilled_cpd00042_c0.xml",
    "gapfilled_cpd00048_c0.xml", "gapfilled_cpd00050_c0.xml", "gapfilled_cpd00056_c0.xml",
    "gapfilled_cpd00058_c0.xml", "gapfilled_cpd00063_c0.xml", "gapfilled_cpd00067_c0.xml",
    "gapfilled_cpd00087_c0.xml", "gapfilled_cpd00099_c0.xml", "gapfilled_cpd00104_c0.xml",
    "gapfilled_cpd00118_c0.xml", "gapfilled_cpd00149_c0.xml", "gapfilled_cpd00166_c0.xml",
    "gapfilled_cpd00201_c0.xml", "gapfilled_cpd00205_c0.xml", "gapfilled_cpd00220_c0.xml",
    "gapfilled_cpd00254_c0.xml", "gapfilled_cpd00264_c0.xml", "gapfilled_cpd00345_c0.xml",
    "gapfilled_cpd00557_c0.xml", "gapfilled_cpd01997_c0.xml", "gapfilled_cpd02229_c0.xml",
    "gapfilled_cpd03422_c0.xml", "gapfilled_cpd10515_c0.xml", "gapfilled_cpd10516_c0.xml",
    "gapfilled_cpd11416_c0.xml", "gapfilled_cpd11461_c0.xml", "gapfilled_cpd11462_c0.xml",
    "gapfilled_cpd11463_c0.xml", "gapfilled_cpd11493_c0.xml", "gapfilled_cpd12370_c0.xml",
    "gapfilled_cpd15352_c0.xml", "gapfilled_cpd15432_c0.xml", "gapfilled_cpd15500_c0.xml",
    "gapfilled_cpd15533_c0.xml", "gapfilled_cpd15540_c0.xml", "gapfilled_cpd15560_c0.xml",
    "gapfilled_cpd15665_c0.xml", "gapfilled_cpd15666_c0.xml", "gapfilled_cpd15793_c0.xml"
]

def download_xml_files():
    """Download XML files from GitHub to local directory if not already present"""
    # Create directory if it doesn't exist
    if not os.path.exists(DOWNLOAD_DIR):
        try:
            os.makedirs(DOWNLOAD_DIR)
            logger.info(f"Created directory: {DOWNLOAD_DIR}")
        except Exception as e:
            logger.error(f"Failed to create directory {DOWNLOAD_DIR}: {e}")
            sys.exit(1)
    else:
        logger.info(f"Directory already exists: {DOWNLOAD_DIR}")
    
    downloaded_files = []
    for file_name in XML_FILES:
        local_path = os.path.join(DOWNLOAD_DIR, file_name)
        
        if os.path.exists(local_path):
            logger.info(f"File already exists, skipping download: {file_name}")
            downloaded_files.append(local_path)
            continue
        
        file_url = GITHUB_RAW_CONTENT_BASE + file_name
        try:
            response = requests.get(file_url)
            response.raise_for_status()
            
            with open(local_path, 'wb') as f:
                f.write(response.content)
            
            logger.info(f"Downloaded {file_name} to {local_path}")
            downloaded_files.append(local_path)
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to download {file_name}: {e}")
        except IOError as e:
            logger.error(f"Failed to write file {local_path}: {e}")
    
    logger.info(f"Total files prepared (downloaded or found locally): {len(downloaded_files)}")
    return downloaded_files

def extract_c_source_from_filename(filename):
    """Extract carbon source ID from the filename"""
    match = re.search(r'cpd\d+', filename)
    if match:
        return match.group(0)
    return None

def generate_sql_script(files):
    """Generate SQL script for manual execution"""
    media_id = 1
    experiment_id = 1
    species_id = 1
    
    carbon_sources = {}
    carbon_id_counter = 1
    
    media_insert = f"INSERT INTO media (media_id, minimal_media) VALUES ({media_id}, '{MEDIA_NAME}');"
    species_insert = f"INSERT INTO species (species_id, species_name) VALUES ({species_id}, '{SPECIES_NAME}');"
    exp_insert = f"INSERT INTO experimental_conditions (experiment_id, scientist, growth_method, temperature, date, growth) VALUES ({experiment_id}, '{SCIENTIST}', '{GROWTH_METHOD}', NULL, '{datetime.now().strftime('%Y-%m-%d')}', NULL);"
    
    model_inserts = []
    carbon_inserts = []
    
    for i, file_path in enumerate(files, start=1):
        filename = os.path.basename(file_path)
        c_source = extract_c_source_from_filename(filename)
        
        if c_source:
            if c_source not in carbon_sources:
                carbon_inserts.append(f"INSERT INTO carbon_source (carbon_id, bigg_id, c_source, met_id) VALUES ({carbon_id_counter}, NULL, '{c_source}', NULL);")
                carbon_sources[c_source] = carbon_id_counter
                carbon_id_counter += 1
            
            carbon_id = carbon_sources[c_source]
            model_file_path = os.path.join(XML_DIRECTORY, filename)
            model_inserts.append(f"""
INSERT INTO model (
    model_id, carbon_id, species_id, media_id, experiment_id, 
    gapfill_method, annotation_method, metabolite_ID, platform, 
    biomass_composition, date_created, control_type, notes, parent_model_id, model_file
) VALUES (
    {i}, {carbon_id}, {species_id}, {media_id}, {experiment_id}, 
    '{GAPFILL_METHOD}', '{ANNOTATION_METHOD}', NULL, '{PLATFORM}', 
    NULL, '{datetime.now().strftime('%Y-%m-%d')}', NULL, NULL, NULL, '{model_file_path}'
);""")
    
    all_inserts = [
        "-- Insert into media table",
        media_insert,
        "\n-- Insert into species table",
        species_insert,
        "\n-- Insert into experimental_conditions table",
        exp_insert,
        "\n-- Insert into carbon_source table"
    ] + carbon_inserts + ["\n-- Insert into model table"] + model_inserts
    
    return "\n".join(all_inserts)

def main():
    """Main function to orchestrate the process"""
    try:
        downloaded_files = download_xml_files()
        
        if not downloaded_files:
            logger.error("Failed to download any XML files.")
            sys.exit(1)
        
        sql_statements = generate_sql_script(downloaded_files)
        sql_file_path = os.path.join(DOWNLOAD_DIR, "db_inserts.sql")
        
        try:
            with open(sql_file_path, 'w') as f:
                f.write(sql_statements)
            logger.info(f"SQL script saved to {sql_file_path}")
        except IOError as e:
            logger.error(f"Failed to write SQL file {sql_file_path}: {e}")
        
        logger.info("===== SUMMARY =====")
        logger.info(f"Files downloaded: {len(downloaded_files)}")
        logger.info(f"Files stored in: {DOWNLOAD_DIR}")
        logger.info(f"SQL script generated: {sql_file_path}")
        logger.info("==================")
        
    except Exception as e:
        logger.error(f"An error occurred: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
