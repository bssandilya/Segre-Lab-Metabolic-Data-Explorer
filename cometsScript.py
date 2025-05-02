#!/usr/bin/env python3
import os
os.environ['COMETS_HOME'] = '/var/www/html/students_25/Team5/Segre-Lab-Metabolic-Data-Explorer/comets_linux/comets_2.12.3'
import cometspy as c
import mariadb
import cobra
import matplotlib.pyplot as plt
import matplotlib.colors, matplotlib.cm

KEY_FILENAME = '/var/www/html/students_25/Team5/Segre-Lab-Metabolic-Data-Explorer/.key.txt'

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



# Connect to MariaDB using the credentials from read_creds
def get_db():
    config = read_creds(KEY_FILENAME)  # Use the correct path to your key file
    try:
        conn = mariadb.connect(**config)
        cur = conn.cursor()
        return conn, cur
    except mariadb.Error as e:
        print(f"Error: {e}")
        return None, None

# model is path to xml file
# mid is model id for naming
# makes growth curve
def make_line_plot(model, mid):
    # reads in xml/sbml model
    alt_cobra = cobra.io.read_sbml_model(model)
    test_tube = c.layout()

    # assumes media.txt file
    # addes metabolites row by row
    with open('media.txt') as f:
        media = [l.split(', ') for l in f.read().split("\n")]
        for met in media:
            test_tube.set_specific_metabolite(met[0], met[1])

    # params set according to script from GEM-mit repository
    alt = c.model(alt_cobra)
    alt.obj_style = 'MAX_OBJECTIVE_MIN_TOTAL'
    alt.change_bounds('EX_cpd00027_e0', -1000, 1000)
    alt.change_bounds('EX_cpd00029_e0', -1000, 1000)
    alt.initial_pop = [0, 0, 5e-6]
    test_tube.add_model(alt)
    sim_params = c.params()
    sim_params.set_param('defaultVmax', 18.5)
    alt.change_vmax('EX_cpd00007_e0', 10)
    sim_params.set_param('defaultKm', 0.000015)
    sim_params.set_param('maxCycles', 200) # To get a total of 21 hours
    sim_params.set_param('timeStep', 0.01) # In hours
    sim_params.set_param('spaceWidth', 1)
    sim_params.set_param('maxSpaceBiomass', 10)
    sim_params.set_param('minSpaceBiomass', 1e-11)
    sim_params.set_param('writeMediaLog', True)
    sim_params.set_param('writeFluxLog', True)
    sim_params.set_param('FluxLogRate', 1)
    experiment = c.comets(test_tube, sim_params)
    experiment.run()
    ax = experiment.total_biomass.plot(x = 'cycle')
    ax.set_ylabel("Biomass (gr.)")
    plt.savefig(f'cometsplots/model_{mid}_lineplot.png')

def make_grid_plot(model, mid):
    # reads in xml/sbml model
    alt_cobra = cobra.io.read_sbml_model(model)

    grid_size = 50



    # params set according to script from GEM-mit repository
    alt = c.model(alt_cobra)
    alt.initial_pop = [int(grid_size / 2),int(grid_size / 2),1.0]
    alt.add_convection_parameters(packedDensity = 0.5,
                                    elasticModulus = 1.e-4,
                                    frictionConstant = 1.0,
                                    convDiffConstant = 0.0)
    alt.add_noise_variance_parameter(20.)
    ly = c.layout([alt])
    ly.grid = [grid_size, grid_size]

        # assumes media.txt file
    # addes metabolites row by row
    with open('media.txt') as f:
        media = [l.split(', ') for l in f.read().split("\n")]
        for met in media:
            ly.set_specific_metabolite(met[0], met[1])

    alt.obj_style = 'MAX_OBJECTIVE_MIN_TOTAL'
    alt.change_bounds('EX_cpd00027_e0', -1000, 1000)
    alt.change_bounds('EX_cpd00029_e0', -1000, 1000)
  

    sim_params = c.params()
    sim_params.set_param("biomassMotionStyle", "Convection 2D")
    sim_params.set_param('defaultVmax', 18.5)
    alt.change_vmax('EX_cpd00007_e0', 10)
    sim_params.set_param('defaultKm', 0.000015)
    sim_params.set_param('maxCycles', 50) # To get a total of 21 hours
    sim_params.set_param('timeStep', 0.01) # In hours
    sim_params.set_param('spaceWidth', 1)
    sim_params.set_param('maxSpaceBiomass', 10)
    sim_params.set_param('minSpaceBiomass', 1e-11)
    sim_params.set_param('writeMediaLog', True)
    sim_params.set_param('writeFluxLog', True)
    sim_params.set_param('writeBiomassLog', True)
    sim_params.set_param('FluxLogRate', 1)

    experiment = c.comets(ly, sim_params)
    print("experiment ready")
    experiment.run()
    print("experiment complete")
    im = experiment.get_biomass_image(ly.models[0].id, 50)
    my_cmap = matplotlib.cm.get_cmap("copper")
    my_cmap.set_bad((0,0,0))
    plt.imshow(im, norm = matplotlib.colors.LogNorm(), cmap = my_cmap)
    plt.savefig(f'cometsplots/model_{mid}_gridplot.png')
    print("plot saved")

# Function to query the database and pass the results to make_line_plot
def process_models():
    conn, cur = get_db()
    if conn is None or cur is None:
        print("Database connection failed")
        return
    
    try:
        # Query the database for model_id and model_file
        cur.execute("SELECT model_id, model_file FROM model")
        
        # Fetch all the results
        rows = cur.fetchall()
        
        # Iterate over the results and call make_line_plot
        for row in rows:
            model_id, model_file = row

            if os.path.exists(f"cometsplots/model_{model_id}_lineplot.png"):
                print(f"Skipping {f"model_{model_id}_lineplot.png"}, already exists.")
                continue
            make_line_plot(model_file, model_id)

        for row in rows:
            model_id, model_file = row

            if os.path.exists(f"cometsplots/model_{model_id}_gridplot.png"):
                print(f"Skipping {f"model_{model_id}_gridplot.png"}, already exists.")
                continue
            make_grid_plot(model_file, model_id)
        
    except mariadb.Error as e:
        print(f"Error while fetching data: {e}")
    finally:
        # Close the cursor and connection
        cur.close()
        conn.close()

# Run the function to process models
# process_models()
def update_model_file_paths_individually():
    old_prefix = "/var/www/html/students_25/Team5/xml_files/"
    new_prefix = "/var/www/html/students_25/Team5/Segre-Lab-Metabolic-Data-Explorer/xml_files/"

    conn, cur = get_db()
    if not conn or not cur:
        print("Database connection failed.")
        return

    try:
        # Step 1: Fetch all model_id and model_file values
        cur.execute("SELECT model_id, model_file FROM model")
        rows = cur.fetchall()
        print(rows)

        updated_count = 0

        for model_id, model_file in rows:
            if model_file and model_file.startswith(old_prefix):
                new_path = model_file.replace(old_prefix, new_prefix, 1)

                # Step 2: Update that specific row
                cur.execute(
                    "UPDATE model SET model_file = %s WHERE model_id = %s",
                    (new_path, model_id)
                )
                updated_count += 1

        conn.commit()
        print(f"{updated_count} row(s) updated.")
    except mariadb.Error as e:
        print(f"Error during update: {e}")
        conn.rollback()
    finally:
        cur.close()
        conn.close()


update_model_file_paths_individually()

