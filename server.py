from flask import Flask, render_template, send_from_directory, jsonify
import pandas as pd
import os

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/styles.css')
def styles():
    return send_from_directory('static', 'styles.css')

@app.route('/script.js')
def script():
    return send_from_directory('static', 'script.js')

@app.route('/data.csv')
def get_data():
    # Assuming you have already merged your data into a single data.csv file
    # in the root directory of your Flask application.
    # If it's generated dynamically, you would merge it here instead.
    return send_from_directory('.', 'data.csv')

@app.route('/api/lyrics', methods=['GET'])
def get_lyrics():
    # This is a placeholder for any API endpoint you might want to implement
    # for fetching data dynamically via AJAX calls from your front-end
    # For example, to filter data based on user input without reloading the page.
    pass

if __name__ == '__main__':
    app.run(debug=True)
