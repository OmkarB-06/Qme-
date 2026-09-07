# app.py
# Question Me — single Flask server serving both the pages AND the auth API.
#
# Run with:
#   pip install -r requirements.txt
#   python app.py
# Then open http://127.0.0.1:5000/

from flask import Flask, render_template, request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
import re

import db

app = Flask(__name__)

# ⚠️ Change this to a long, random string before putting this online.
# Easiest way: run `python -c "import secrets; print(secrets.token_hex(32))"`
# and paste the result here (or set it as an environment variable).
app.secret_key = "change-this-to-a-long-random-secret-before-going-live"

EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


# ---------------------------------------------------------------- #
# Page routes (unchanged from the original project)
# ---------------------------------------------------------------- #

@app.route("/")
def home():
    return render_template("home.html")


@app.route("/login")
def login():
    return render_template("login.html")


@app.route("/signup")
def signup():
    return render_template("signup.html")


@app.route("/dashboard")
def dashboard():
    return render_template("dashboard.html")


@app.route("/trail")
def trail():
    return render_template("trail.html")


@app.route("/test")
def test():
    level = request.args.get("level", 1, type=int)
    return render_template("test.html", level=level)


@app.route("/result")
def result():
    return render_template("result.html")


@app.route("/calendar")
def calendar():
    return render_template("calendar.html")


@app.route("/about")
def about():
    return render_template("about.html")


@app.route("/help")
def help_page():
    return render_template("help.html")


# ---------------------------------------------------------------- #
# Auth API — these are what login.html / signup.html / auth-guard.js call.
# Sessions use Flask's built-in signed cookie (no extra login library
# needed) — the cookie is httpOnly by default, so page JavaScript can't
# read it directly.
# ---------------------------------------------------------------- #

@app.route("/api/signup", methods=["POST"])
def api_signup():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip()
    password = data.get("password") or ""

    if not name:
        return jsonify({"error": "Please enter your name."}), 400
    if not email or not EMAIL_RE.match(email):
        return jsonify({"error": "Please enter a valid email address."}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters."}), 400

    if db.get_user_by_email(email):
        return jsonify({"error": "An account with this email already exists."}), 409

    password_hash = generate_password_hash(password)
    user = db.create_user(name, email, password_hash)

    session["user_id"] = user["id"]

    return jsonify({
        "message": "Account created successfully.",
        "user": {"id": user["id"], "name": user["name"], "email": user["email"]},
    }), 201


@app.route("/api/login", methods=["POST"])
def api_login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"error": "Please enter both email and password."}), 400

    user = db.get_user_by_email(email)
    if not user or not check_password_hash(user["password_hash"], password):
        return jsonify({"error": "Incorrect email or password."}), 401

    session["user_id"] = user["id"]

    return jsonify({
        "message": "Logged in successfully.",
        "user": {"id": user["id"], "name": user["name"], "email": user["email"]},
    })


@app.route("/api/logout", methods=["POST"])
def api_logout():
    session.pop("user_id", None)
    return jsonify({"message": "Logged out."})


@app.route("/api/me")
def api_me():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Not logged in."}), 401

    user = db.get_user_by_id(user_id)
    if not user:
        return jsonify({"error": "User not found."}), 401

    return jsonify({"user": {"id": user["id"], "name": user["name"], "email": user["email"]}})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
