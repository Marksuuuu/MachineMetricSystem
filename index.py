import re
from datetime import datetime

import psycopg2
import psycopg2.extras
import requests
from flask import Flask, render_template, request, redirect, url_for, jsonify, json, session
from flask_login import login_user, logout_user, login_required, LoginManager, UserMixin
from flask_socketio import SocketIO
from psycopg2 import Error

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


# ROUTE WITH FUNCTIONS

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
                    (ip_address, id) IN (
                        SELECT ip_address, MAX(id)
                        FROM connected_clients_data_tbl
                        GROUP BY ip_address
                    )
                AND ip_address = %s
            """, (port,))
            rows = cursor.fetchall()

# @app.route('/showAllMatrix', methods=['POST'])
# def showAllMatrix():
#     port = request.form['controllerIp']
#     print(f"==>> port: {port}")
#     print('trigger here')
#     # Using a context manager for the connection and cursor
#     with psycopg2.connect(**db_config) as conn:
#         with conn.cursor() as cursor:
#             cursor.execute("""
#                 SELECT
#                     id as ID,
#                     ip_address as IP,
#                     session as SESSION,
#                     port_name as PORT,
#                     machine_setup as MACHINE_SETUP,
#                     time_added as TIME_ADDED,
#                     start as START,
#                     stop as STOP,
#                     status as STATUS,
#                     area as AREA
#                 FROM
#                     connected_clients_data_tbl
#                 WHERE
#                     (ip_address, id) IN (
#                         SELECT ip_address, MAX(id)
#                         FROM connected_clients_data_tbl
#                         GROUP BY ip_address
#                     )
#                 AND ip_address = %s
#             """, (port,))
#             rows = cursor.fetchall()

#     # Process the results and return the JSON response
#     result = []
#     for row in rows:
#         result.append({
#             'ID': row[0],
#             'IP': row[1],
#             'SESSION': row[2],
#             'PORT': row[3],
#             'MACHINE_SETUP': row[4],
#             'TIME_ADDED': row[5],
#             'STATUS': row[8],
#         })

#     return jsonify({'data': result})


@app.route('/showAllMatrix', methods=['POST'])
def updateTotalResult():
    port = request.form['controllerIp']
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
                    (ip_address, id) IN (
                        SELECT ip_address, MAX(id)
                        FROM connected_clients_data_tbl
                        GROUP BY ip_address
                    )
                AND ip_address = %s
            """, (port,))
            rows = cursor.fetchall()

    external_url = 'http://cmms.teamglac.com/apimachine3.php?id='

    result = []
    for row in rows:
        ID = row[0],
        IP = row[1],
        SESSION = row[2],
        PORT = row[3],
        machine_setup_value = row[4]
        TIME_ADDED = row[5],
        STATUS = row[8],
        full_url = f'{external_url}{machine_setup_value}'
        response = requests.post(full_url)

        if response.status_code == 200:
            response_data = response.json()

            if 'data' in response_data and len(response_data['data']) > 0:
                machno_value = response_data['data'][0]['MACHNO']
                print(f"MACHNO: {machno_value}")

                result.append({
                    'ID': ID,
                    'IP': IP,
                    'SESSION': SESSION,
                    'PORT': PORT,
                    'MACHINE_SETUP': machno_value,
                    'TIME_ADDED': TIME_ADDED,
                    'STATUS': STATUS,
                })

            else:
                print("No 'MACHNO' value found in the response data.")
        else:
            print(f"Request failed with status code: {response.status_code}")

    return jsonify({'data': result})


@app.route('/saveController', methods=['POST'])
def saveController():
    name = request.form['name']
    id_str = request.form['id']
    try:
        id = int(id_str)
    except ValueError:
        return "Invalid ID. Please provide a valid integer for the ID."
    with psycopg2.connect(**db_config) as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT COUNT(*) FROM public.controller_tbl WHERE controller_name = %s", (name,))
            count = cur.fetchone()[0]
            if count == 0:
                cur.execute("""
                            UPDATE 
                                public.controller_tbl
                            SET 
                                controller_name = %s
                            WHERE id = %s""", (name, id))
                msg = "UPDATE SUCCESS"
                conn.commit()
            else:
                msg = "Record with the provided already exists. No update was performed."
    return msg


@app.route('/data-gather-data')
def data_gather_view():
    try:
        conn = psycopg2.connect(**db_config)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT 
                id,
                area, 
                class, 
                emp_no, 
                machine_id, 
                machine_name, 
                mo, 
                running_qty, 
                status, 
                sub_opt_name, 
                photo, 
                start_date, 
                uid, 
                machine_status, 
                from_client, 
                from_client_ip, 
                from_client_sid
            FROM 
                public.machine_data_tbl;
        """)
        rows = cursor.fetchall()
        controllers = []
        for row in rows:
            controllers.append({
                'id': row[0],
                'area': row[1],
                'class': row[2],
                'emp_no': row[3],
                'machine_id': row[4],
                'machine_name': row[5],
                'mo': row[6],
                'running_qty': row[7],
                'status': row[8],
                'sub_opt_name': row[9],
                'photo': row[10],
                'start_date': row[11],
                'uid': row[12],
                'machine_status': row[13],
                'from_client': row[14],
                'from_client_ip': row[15],
                'from_client_sid': row[16],
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


@app.route('/matrixControllers')
def matrixControllers():
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


@app.route('/getMachinesNamesApi')
def getMachinesNamesApi():
    url = 'http://cmms.teamglac.com/apimachine2.php'
    response = requests.get(url)
    data = json.loads(response.text)['data']
    return jsonify(data)


@app.route('/updateClientData', methods=['POST'])
def updateClientData():
    id = request.form['id']
    sessionID = request.form['sessionID']
    print(f"==>> id: {id}")
    selectedArea = request.form['selectedArea']
    selectedMachineName = request.form['selectedMachineName']

    hris = f'http://devapps.teamglac.com/paperless_pt_test/api/api_assigned_pt.php?mach_201={int(selectedMachineName)}'
    response = requests.get(hris)
    data_list = json.loads(response.text)['data']  # Assuming data is a list

    if not data_list:
        res = 'nodata'
        return jsonify({'data': res, 'sessionID': sessionID})
    else:
        # Assuming data_list contains dictionaries, iterate over them
        results = []
        for data in data_list:
            main_opt = data['main_opt']
            sub_opt = data['sub_opt']
            wip_entity_name = data['wip_entity_name']

            # Update client data in the database
            with psycopg2.connect(**db_config) as conn:
                with conn.cursor() as cur:
                    cur.execute("""
                                UPDATE 
                                    public.connected_clients_data_tbl
	                            SET 
                                    machine_setup=%s, area=%s
	                            WHERE id = %s;""", (selectedMachineName, selectedArea, id,))
                    msg = "UPDATE SUCCESS"

            result = {
                'main_opt': main_opt,
                'wip_entity_name': wip_entity_name,
                'sub_opt': sub_opt,
            }
            results.append(result)
        return jsonify({'data': results, 'sessionID': sessionID})


@app.route('/deleteController', methods=['POST'])
def deleteController():
    id = request.form['id']
    print(f"==>> id: {id}")
    with psycopg2.connect(**db_config) as conn:
        with conn.cursor() as cur:
            cur.execute("""
                        DELETE 
                        FROM 
                            public.controller_tbl
	                    WHERE 
                            id = %s""", (id))
            msg = "DELETE SUCCESS"
    return msg


@app.route('/get_emp_id', methods=['POST'])
def get_emp_id():
    emp_id = request.form['emp_id']
    hris = f'http://hris.teamglac.com/api/users/emp-num?empno={emp_id}'
    response = requests.get(hris)
    data = json.loads(response.text)['result']

    if data == False:
        res = 'nodata'
        return jsonify(res)
    else:
        employee_department = data['employee_department']
        employee_position = data['employee_position']
        employee_no = data['employee_no']
        firstname = data['firstname']
        lastname = data['lastname']
        print(data)

        result = [
            employee_department,
            firstname,
            lastname,
            employee_no,
            employee_position
        ]
        return jsonify({'data': result})


@app.route('/', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        form_username = request.form['username']
        form_password = request.form['password']

        if form_username == '' and form_password == '':
            data = 1
            return jsonify({'data': data})
        else:

            url = f"http://hris.teamglac.com/api/users/login?u={form_username}&p={form_password}"
            response = requests.get(url).json()

            if response['result'] == False:
                data = 2
                return jsonify({'data': data})
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
        data = '/index'
        return jsonify({'data': data})

    else:
        # Display the login form
        return render_template('login.html')


# TRIGGER


# SOCKETIO-RESPONSE-FUNCTION

def saveDatabaseClient(data):
    print(f"==>> data: {data}")
    ipAddress = request.remote_addr
    dateAdded = str(datetime.now())
    machineName = data.get('machine_name', '')
    print(f"==>> machineName: {machineName}")
    machineNameNoPy = re.sub('.py', '', machineName)
    session = request.sid
    print(f"==>> session: {session}")
    print(session)
    # print(f"==>> session: {session}")
    msg = ""
    try:
        with psycopg2.connect(**db_config) as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT COUNT(*) FROM public.connected_clients_data_tbl WHERE ip_address = %s",
                    (ipAddress,)
                )
                count = cur.fetchone()[0]
                # print(f"==>> count: {count}")
                if count > 0:  # Record exists, perform an update
                    status = 'CONNECTED'
                    cur.execute(
                        """
                        UPDATE public.connected_clients_data_tbl
                        SET session=%s, port_name=%s, time_added=%s, status=%s
                        WHERE ip_address=%s;
                        """,
                        (session, machineNameNoPy, dateAdded, status, ipAddress,)
                    )
                    msg = "UPDATE SUCCESS"
                    conn.commit()
                    # print('go here')
                else:  # Record doesn't exist, perform an insert
                    status = 'CONNECTED'
                    cur.execute(
                        "INSERT INTO public.connected_clients_data_tbl(ip_address, session, port_name, time_added, status) VALUES (%s, %s, %s, %s, %s)",
                        (ipAddress, session, machineNameNoPy, dateAdded, status)
                    )
                    msg = "INSERT SUCCESS"
                    conn.commit()  # commit the transaction
    except Error as e:
        msg = f"ERROR: {e}"

    return msg


def saveDatabaseDisconnect(data):
    ipAddress = request.remote_addr
    dateAdded = str(datetime.now())
    machineName = data['machine_name']
    machineNameNoPy = re.sub('.py', '', machineName)
    session = request.sid
    with psycopg2.connect(**db_config) as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT COUNT(*) FROM public.connected_clients_data_tbl WHERE ip_address = %s",
                (ipAddress,)
            )
            count = cur.fetchone()[0]
            if count > 0:  # Record exists, perform an update
                cur.execute(
                    """
                    UPDATE public.connected_clients_data_tbl
	                SET  session= %s, time_added= %s, status= %s
	                WHERE ip_address= %s ;
                    """,
                    (session, dateAdded, session, ipAddress)
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


def handleDisconnect():
    print('disconnect')


def saveDatabaseController(data):
    print('go here')
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


def getData():
    try:
        conn = psycopg2.connect(**db_config)
        cursor = conn.cursor()
        cursor.execute("""
                SELECT
                    id as ID,
                    ip_address as IP,
                    session as SESSION,
                    status as STATUS
                FROM
                    public.connected_clients_data_tbl
        """)
        rows = cursor.fetchall()
        controllers = []
        for row in rows:
            controllers.append({
                'ID': row[0],
                'IP': row[1],
                'SESSION': row[2],
                'STATUS': row[3],
            })
        cursor.close()
        conn.close()
        return controllers
    except Exception as e:
        # print("Error executing query:", e)
        return None


@socketio.on('connect')
def connect():
    client_sid = request.sid
    data = getData()
    print(client_sid)
    if data is not None:
        socketio.emit('details',  data)
    else:
        socketio.emit(
            'details', {'error': 'An error occurred while fetching controllers.'})

## SOCKET-IO##


@socketio.on('disconnect')
def disconnect():
    handleDisconnect()


@socketio.on('disconnect_data')
def handle_disconnect(data):
    saveDatabaseDisconnect(data)


@socketio.on('controller')
def handle_controller(data):
    saveDatabaseController(data)


@socketio.on('passActivityData')
def handle_activity(data):
    socketio.emit('passingDataToJs', data)


@socketio.on('client')
def handle_client(data):
    saveDatabaseClient(data)


@socketio.on('sendDataToClient')
def handle_custom_event(data):
    print(f"==>> data: {data}")
    sid = data['sessionID']
    print(f"==>> sid: {sid}")
    dataValue = data['dataToPass']
    print(f"==>> dataValue: {dataValue}")
    socketio.emit('my_message', {'dataToPass': dataValue}, to=sid)


@socketio.on('data')
def handle_data(data, stat_var, uID, result, get_start_date, remove_py):
    # print(f"==>> data: {data}")
    try:
        with psycopg2.connect(**db_config) as conn:
            cur = conn.cursor()
            client_ip = request.remote_addr
            inner_data = next(iter(data.values()))

            ipAddress = request.remote_addr
            fromClient = remove_py
            session = request.sid
            EMP_NO = inner_data['EMP_NO']
            AREA_NAME = inner_data['AREA_NAME']
            CLASS = inner_data['CLASS']
            MACHINE_ID = inner_data['MACHINE_ID']
            MACHINE_NAME = inner_data['MACHINE_NAME']
            MO = inner_data['MO']
            RUNNING_QTY = inner_data['RUNNING_QTY']
            STATUS = inner_data['STATUS']
            SUB_OPT_NAME = inner_data['SUB_OPT_NAME']

            hris = f'http://hris.teamglac.com/api/users/emp-num?empno={EMP_NO}'
            response = requests.get(hris)
            hris_data = json.loads(response.text)['result']

            if hris_data == False or hris_data is None:
                photo = "../static/assets/images/faces/pngegg.png"
            else:
                photo_url = hris_data['photo_url']
                photo = f"http://hris.teamglac.com/{photo_url}"

            start_time = str(get_start_date)
            cur.execute(
                'INSERT INTO machine_data_tbl (area, class, emp_no, machine_id, machine_name, mo, running_qty, status, sub_opt_name, photo, start_date, uid, machine_status, from_client, from_client_ip, from_client_sid) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)',
                (AREA_NAME, CLASS, EMP_NO, MACHINE_ID, MACHINE_NAME, MO, RUNNING_QTY, STATUS, SUB_OPT_NAME, photo,
                 start_time, uID, stat_var, ipAddress, fromClient, session)
            )
            conn.commit()
            return jsonify("Data inserted successfully into the database")
    except psycopg2.Error as e:
        error_message = "Error inserting/updating data in the database: " + \
            str(e)
        conn.rollback()
        return jsonify(error_message)


## ROUTES - AREA / DASHBOARD##

@app.route('/area-wirebond')
def area_wirebond():
    return render_template('area-wirebond.html')


@app.route('/area-end-of-line-1')
def area_end_of_line_1():
    return render_template('area-end-of-line-1.html')


# ROUTES
@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))


@app.route('/controller-info')
@login_required
def controller_info():
    return render_template('controller-info.html')


@app.route('/machine-setup')
@login_required
def machine_setup():
    return render_template('controller-data.html')


@app.route('/matrix-setup')
@login_required
def matrix_setup():
    return render_template('matrix-setup.html')


@app.route('/data-gather')
@login_required
def data_gather():
    return render_template('data-gather.html')


@app.route('/activity-logs')
@login_required
def activity_logs():
    return render_template('activity-logs.html')


@app.route('/dashboard')
@login_required
def dashboard():
    return render_template('dashboard.html')


@app.route('/user-permissions')
@login_required
def user_permissions():
    return render_template('user-permissions.html')


@app.route('/index')
@login_required
def index():
    return render_template('index.html')


if __name__ == '__main__':
    # app.run(host='10.0.2.150', port=8001, debug=True)
    socketio.run(app, host='10.0.2.150', port=9090, debug=True)
