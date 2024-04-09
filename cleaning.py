import numpy as np
import os

files = os.listdir('csv')

Artist = []
Title = []
Album = []
Year = []
Lyric = []
for filename in files:
    with open("csv/" + filename, 'r', encoding="utf-8") as file:
        line = file.readline()
        header = []
        locations = []
        if line:
            header = line.strip().split(',')
            locations = np.zeros(5, dtype=int)
            locations[0] = header.index('Artist')
            locations[1] = header.index('Title')
            locations[2] = header.index('Album')
            locations[3] = header.index('Year')
            locations[4] = header.index('Lyric')
        line = file.readline()
        while line:
            part = line.strip().split(',')
            Artist.append(part[locations[0]])
            Title.append(part[locations[1]])
            Album.append(part[locations[2]])
            Year.append(part[locations[3]])
            Lyric.append(part[locations[4]])
            line = file.readline()


with open("data.csv", 'w', encoding='utf-8') as file:
    file.write("Artist,Title,Album,Year,Lyric\n")
    for i in range(len(Artist)):
        file.write(Artist[i] + "," + Title[i] + "," + Album[i] + "," + Year[i] + "," + Lyric[i] + "\n")