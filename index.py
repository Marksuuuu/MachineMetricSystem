from flask import Flask, render_template, request, redirect, url_for, jsonify, json, session
from flask_login import LoginManager, login_user, logout_user, current_user, login_required, LoginManager, UserMixin
import psycopg2
import psycopg2.extras
import requests
from flask_socketio import SocketIO, emit
from datetime import datetime, time, date
import re




app = Flask(__name__)
app.secret_key = 'marksuuuu'
socketio = SocketIO(app)
# Database configuration
db_config = {
    'host': 'localhost',
    'port': '5432',
    'dbname': 'machine_metric_system',
    'user': 'flask_user',
    'password': '-clear1125'
}

login_manager = LoginManager()
login_manager.init_app(app)


class User(UserMixin):
    def __init__(self, id, firstname, lastname, username, fullname, employee_department, photo_url):
        self.id = id
        self.firstname = firstname
        self.lastname = lastname
        self.username = username
        self.fullname = fullname
        self.employee_department = employee_department
        self.photo_url = photo_url

    def get_id(self):
        return str(self.id)

    def is_active(self):
        return True


@login_manager.user_loader
def load_user(user_id):
    firstname = session.get('firstname')
    lastname = session.get('lastname')
    username = session.get('username')
    fullname = session.get('fullname')
    employee_department = session.get('employee_department')
    photo_url = session.get('photo_url')

    return User(user_id, firstname, lastname, username, fullname, employee_department, photo_url)

##ROUTE WITH FUNCTIONS

@app.route('/showAll', methods=['POST'])
def showAll():
    port = request.form['controllerIp']
    print(f"==>> port: {port}")
    # Using a context manager for the connection and cursor
    with psycopg2.connect(**db_config) as conn:
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT
                    id as ID,
                    ip_address as IP,
                    session as SESSION,
                    port_name as PORT,
                    machine_setup as MACHINE_SETUP,
                    time_added as TIME_ADDED,
                    start as START,
                    stop as STOP,
                    status as STATUS,
                    area as AREA
                FROM
                    connected_clients_data_tbl
                WHERE
                    (port_name, id) IN (
                        SELECT port_name, MAX(id)
                        FROM connected_clients_data_tbl
                        GROUP BY port_name
                    )
                AND ip_address = %s
            """, (port,))
            rows = cursor.fetchall()

    # Process the results and return the JSON response
    result = []
    for row in rows:
        result.append({
            'ID': row[0],
            'IP': row[1],
            'SESSION': row[2],
            'PORT': row[3],
            'MACHINE_SETUP': row[4],
            'TIME_ADDED': row[5],
            'STATUS': row[8],
            'AREA': row[9]
        })

    return jsonify({'data': result})



@app.route('/saveController', methods=['POST'])
def saveController():
    name = request.form['name']
    id_str = request.form['id']
    print(f"==>> id_str: {id_str}")
    
    # Check if the id_str is a valid integer
    try:
        id = int(id_str)
    except ValueError:
        return "Invalid ID. Please provide a valid integer for the ID."

    with psycopg2.connect(**db_config) as conn:
        with conn.cursor() as cur:
            cur.execute("""
                        UPDATE 
                            public.controller_tbl
                        SET 
                            controller_name = %s
                        WHERE id = %s""", (name, id))
            msg = "UPDATE SUCCESS"
            conn.commit()  # commit the transaction
    return msg


@app.route('/controller')
def controller():
    try:
        conn = psycopg2.connect(**db_config)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT 
                id, 
                ip_address, 
                controller_name, 
                time_added, 
                session
            FROM 
                public.controller_tbl;
        """)
        rows = cursor.fetchall()
        controllers = []
        for row in rows:
            controllers.append({
                'id': row[0],
                'ip_address': row[1],
                'controller_name': row[2],
                'time_added': row[3],
                'session': row[4],
            })
        conn.commit()  # Commit the transaction before closing the cursor
        cursor.close()
        conn.close()
        return jsonify({'data': controllers})
    except Exception as e:
        conn.rollback()  # Rollback the transaction in case of an error
        cursor.close()
        conn.close()
        print("Error executing query:", e)
        return jsonify({'error': 'An error occurred while fetching controllers.'}), 500



@app.route('/', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        form_username = request.form['username']
        form_password = request.form['password']

        if form_username == '' and form_password == '':
            return """<script>
                            alert('Error')
                            </script>"""
        else:

            url = f"http://hris.teamglac.com/api/users/login?u={form_username}&p={form_password}"
            response = requests.get(url).json()

            if response['result'] == False:
                return render_template('login.html')
            else:
                user_data = response["result"]
                session['firstname'] = user_data['firstname']
                session['lastname'] = user_data['lastname']
                session['username'] = user_data['username']
                session['fullname'] = user_data['fullname']
                session['employee_department'] = user_data['employee_department']

                photo_url = session['photo_url'] = user_data['photo_url']

                user_id = user_data['user_id']
                user = User(user_id, user_data['firstname'], user_data['lastname'], user_data['username'],
                            user_data['fullname'], user_data['employee_department'], user_data['photo_url'])

                # Login the user
                login_user(user)

                if photo_url == False or photo_url is None:
                    session['photo_url'] = """assets/logo.png"""
                else:
                    hris = "http://hris.teamglac.com/"
                    session['photo_url'] = hris + user_data['photo_url']

        return redirect(url_for('index', success=True))

    else:
        # Display the login form
        return render_template('login.html')

##TRIGGER

def create_trigger_function():
    with psycopg2.connect(**db_config) as conn:
        with conn.cursor() as cur:
            cur.execute("""
                CREATE OR REPLACE FUNCTION update_connected_clients_data()
                RETURNS TRIGGER AS $$
                BEGIN
                    IF NEW.session_id IS NOT NULL THEN
                        INSERT INTO public.connected_clients_data_tbl (ip_address, session_id, port_name, controller_name, machine_setup, time_added, start, stop, status)
                        VALUES (NEW.ip_address, NEW.session_id, NEW.port_name, NEW.controller_name, NEW.machine_setup, NEW.time_added, NEW.start, NEW.stop, NEW.status);
                    END IF;
                    RETURN NEW;
                END;
                $$ LANGUAGE plpgsql;
            """)
            conn.commit()

def create_trigger():
    with psycopg2.connect(**db_config) as conn:
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TRIGGER after_update_connected_clients_data
                AFTER UPDATE ON public.connected_clients_data_tbl
                FOR EACH ROW
                EXECUTE FUNCTION update_connected_clients_data();
            """)
            conn.commit()



##SOCKETIO-RESPONSE-FUNCTION
    
def saveDatabaseClient(data):
    print(f"==>> data: {data}")
    ipAddress = request.remote_addr
    dateAdded = str(datetime.now())
    machineName = data['machine_name']
    machineNameNoPy = re.sub('.py', '', machineName)
    session = request.sid

    with psycopg2.connect(**db_config) as conn:
        with conn.cursor() as cur:
            status = 'CONNECTED'
            cur.execute(
                    "INSERT INTO public.connected_clients_data_tbl(ip_address, session, port_name, time_added, start, status) VALUES (%s, %s, %s, %s, %s, %s)",
                    (ipAddress, session , machineNameNoPy, dateAdded, dateAdded, status)
            )
            msg = "INSERT SUCCESS"
            conn.commit()  # commit the transaction
    return msg 
    
def saveDatabaseDisconnect(data):
    print(f"==>> data: {data}")
    ipAddress = request.remote_addr
    dateAdded = str(datetime.now())
    machineName = data['machine_name']
    machineNameNoPy = re.sub('.py', '', machineName)
    session = request.sid

    create_trigger_function()  # Create trigger function if not already created
    create_trigger()  # Create trigger if not already created

    with psycopg2.connect(**db_config) as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) FROM public.connected_clients_data_tbl WHERE session = %s", (session,))
            record_count = cur.fetchone()[0]
            if record_count > 0:
                cur.execute(
                    "UPDATE public.connected_clients_data_tbl SET stop=%s WHERE session =%s",
                    (ipAddress, dateAdded, session)
                )
                msg = "UPDATE SUCCESS"
            else:
                status = 'DISCONNECTED'
                cur.execute(
                    "INSERT INTO public.connected_clients_data_tbl(ip_address, session_id, port_name, time_added, stop, status) VALUES (%s, %s, %s, %s, %s, %s)",
                    (ipAddress, session ,dateAdded ,machineNameNoPy, dateAdded, status)
                )
                msg = "INSERT SUCCESS"
            conn.commit()  # commit the transaction
    return msg

def handleDisconnect():
    print('disconnect')
    
def saveDatabaseController(data):
    print(f"==>> data: {data}")
    ipAddress = request.remote_addr
    dateAdded = str(datetime.now())
    machineName = data['machine_name']
    machineNameNoPy = re.sub('.py', '', machineName)
    session = request.sid
    with psycopg2.connect(**db_config) as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT COUNT(*) FROM public.controller_tbl WHERE ip_address = %s",
                (ipAddress,)
            )
            count = cur.fetchone()[0]
            if count > 0:  # Record exists, perform an update
                cur.execute(
                    """
                    UPDATE public.controller_tbl
                    SET time_added = %s, session = %s
                    WHERE ip_address = %s
                    """,
                    (dateAdded, session, ipAddress)
                )
                msg = "UPDATE SUCCESS"
            else:  # Record doesn't exist, perform an insert
                cur.execute(
                    """
                    INSERT INTO public.controller_tbl (ip_address, time_added, session)
                    VALUES (%s, %s, %s)
                    """,
                    (ipAddress, dateAdded, session)
                )
                msg = "INSERT SUCCESS"

            conn.commit()  # commit the transaction

    return msg
    

##SOCKET-IO 

@socketio.on('disconnect')
def disconnect():
    handleDisconnect()
    
@socketio.on('disconnect_data')
def handle_disconnect(data):
    saveDatabaseDisconnect(data)
    
    

@socketio.on('controller')
def handle_controller(data):
    saveDatabaseController(data)

@socketio.on('client')
def handle_client(data):
    saveDatabaseClient(data)
    
    
    
    
##ROUTES
@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

@app.route('/controller-info')
@login_required
def controller_info():
    return render_template('controller-info.html')

@app.route('/controller-data')
@login_required
def controller_data():
    return render_template('controller-data.html')

@app.route('/dashboard')
@login_required
def dashboard():
    return render_template('dashboard.html')

@app.route('/index')
@login_required
def index():
    return render_template('index.html')

if __name__ == '__main__':
    # app.run(host='10.0.2.150', port=8001, debug=True)
    socketio.run(app, host='10.0.2.150', port=8001, debug=True)
 