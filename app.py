from flask import Flask, render_template, request

app = Flask(__name__)


@app.route("/")
def home():
    return render_template("dashboard.html")


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


if __name__ == "__main__":
    app.run(debug=True)