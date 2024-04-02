from flask import Flask, send_file, jsonify, request
import pandas as pd
from wordcloud import WordCloud
import os

app = Flask(__name__)
df = pd.read_csv('Drake.csv')  # Make sure to use your actual CSV path here

# Function to generate a word cloud image
def generate_word_cloud(lyrics):
    wordcloud = WordCloud(width=800, height=400, background_color='white').generate(lyrics)
    image_path = '/mnt/data/wordcloud.png'
    wordcloud.to_file(image_path)
    return image_path

# Route to get the word cloud for a specific song title
@app.route('/wordcloud', methods=['GET'])
def serve_word_cloud():
    song_title = request.args.get('song', '')
    if song_title:
        # Select lyrics for the song
        lyrics_data = df.loc[df['Title'].str.lower() == song_title.lower(), 'Lyric']
        if not lyrics_data.empty:
            lyrics = lyrics_data.iloc[0]
            image_path = generate_word_cloud(lyrics)
            return send_file(image_path, mimetype='image/png')
        else:
            return jsonify({"error": "Song not found"}), 404
    else:
        return jsonify({"error": "No song title provided"}), 400

# Route to get a list of all song titles
@app.route('/songs', methods=['GET'])
def list_songs():
    songs = df['Title'].dropna().unique().tolist()
    return jsonify(songs)

if __name__ == '__main__':
    app.run(debug=True)
