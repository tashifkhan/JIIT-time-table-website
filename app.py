from flask import Flask, render_template, request

app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def planner():
    if request.method == 'POST':
        day = request.form['day']
        batch = request.form['batch']
        year = request.form['year']
        electives = request.form['electives']
        return render_template('planner.html', day=day, batch=batch, year=year, electives=electives)
    return render_template('planner.html')

if __name__ == '__main__':
    app.run(debug=True)