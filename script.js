function updateWordCloud(songTitle) {
    const imageUrl = `/wordcloud/${encodeURIComponent(songTitle)}`;
    document.getElementById('wordCloudImage').src = imageUrl;
}

// Example of updating the word cloud for 'God's Plan'
updateWordCloud("God's Plan");
