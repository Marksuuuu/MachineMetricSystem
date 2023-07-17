from flask import Flask, render_template, request, redirect, url_for, jsonify, json, session
from flask_login import LoginManager, login_user, logout_user, current_user, login_required, LoginManager, UserMixin
import psycopg2
import psycopg2.extras
import requests



app = Flask(__name__)
app.secret_key = 'marksuuuu'

# Database configuration
db_config = {
    'host': 'localhost',
    'port': '5432',
    'dbname': 'inventory_system_flask',
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
                return render_template('auth-login.html')
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
                    session['photo_url'] = """assets/compiled/jpg/1.jpg"""
                else:
                    hris = "http://hris.teamglac.com/"
                    session['photo_url'] = hris + user_data['photo_url']

        return redirect(url_for('index', success=True))

    else:
        # Display the login form
        return render_template('login.html')
    
@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login', success=True))

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
    app.run(host='127.0.0.1', port=8000, debug=True)
 