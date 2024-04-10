stopwords = new Set("i,me,my,myself,we,us,our,ours,ourselves,you,your,yours,yourself,yourselves,he,him,his,himself,she,her,hers,herself,it,its,itself,they,them,their,theirs,themselves,what,which,who,whom,whose,this,that,these,those,am,is,are,was,were,be,been,being,have,has,had,having,do,does,did,doing,will,would,should,can,could,ought,i'm,you're,he's,she's,it's,we're,they're,i've,you've,we've,they've,i'd,you'd,he'd,she'd,we'd,they'd,i'll,you'll,he'll,she'll,we'll,they'll,isn't,aren't,wasn't,weren't,hasn't,haven't,hadn't,doesn't,don't,didn't,won't,wouldn't,shan't,shouldn't,can't,cannot,couldn't,mustn't,let's,that's,who's,what's,here's,there's,when's,where's,why's,how's,a,an,the,and,but,if,or,because,as,until,while,of,at,by,for,with,about,against,between,into,through,during,before,after,above,below,to,from,up,upon,down,in,out,on,off,over,under,again,further,then,once,here,there,when,where,why,how,all,any,both,each,few,more,most,other,some,such,no,nor,not,only,own,same,so,than,too,very,say,says,said,shall".split(","))

let saved_data;


document.addEventListener("DOMContentLoaded", () => {
    d3.csv('data.csv').then(data => {
        saved_data = data;
        addWordCloud(); // Add the first word cloud on page load
    });
    
    document.getElementById('addWordCloud').addEventListener('click', addWordCloud);
});

function addWordCloud() {
    const index = document.querySelectorAll('.wordCloud').length + 1; // Unique index for each word cloud
    const wordCloudHTML = `
        <div class="wordCloud" id="wordCloud${index}">
            <select class="artist"></select>
            <select class="s_year"></select>
            <select class="e_year"></select>
            <div class="my_dataviz"></div>
        </div>
    `;
    document.getElementById('wordCloudsContainer').insertAdjacentHTML('beforeend', wordCloudHTML);
    populateDropdowns(index);
    filtered(index);
}

function populateDropdowns(index) {
    const container = document.getElementById(`wordCloud${index}`);
    const artistSelect = container.querySelector('.artist');
    const sYearSelect = container.querySelector('.s_year');
    const eYearSelect = container.querySelector('.e_year');

    let artists = Array.from(new Set(saved_data.map(item => item.Artist))).sort();
    let years = Array.from(new Set(saved_data.map(item => item.Year.slice(0, 4)))).sort();

    artists.unshift("All"); // Add "All" option
    years.unshift("All"); // Add "All" option

    artistSelect.innerHTML = artists.map(artist => `<option value="${artist}">${artist}</option>`).join('');
    sYearSelect.innerHTML = years.map(year => `<option value="${year}">${year}</option>`).join('');
    eYearSelect.innerHTML = years.map(year => `<option value="${year}">${year}</option>`).join('');

    artistSelect.addEventListener('change', () => filtered(index));
    sYearSelect.addEventListener('change', () => filtered(index));
    eYearSelect.addEventListener('change', () => filtered(index));
}

function filtered(index) {
    const container = document.getElementById(`wordCloud${index}`);
    const artist = container.querySelector('.artist').value;
    const startYear = container.querySelector('.s_year').value;
    const endYear = container.querySelector('.e_year').value;
    const datavizContainer = container.querySelector('.my_dataviz');

    let lyrics = saved_data.filter(item => 
        (artist === "All" || item.Artist === artist) &&
        (startYear === "All" || item.Year.slice(0, 4) >= startYear) &&
        (endYear === "All" || item.Year.slice(0, 4) <= endYear)
    ).map(item => item.Lyric);

    let words = extractWords(lyrics);
    generateWordCloud(datavizContainer, words, {
        width: 640, // Adjust sizes as needed
        height: 400
    });
}

function extractWords(lyrics) {
    // Flatten all words into a single array
    let words = lyrics.flatMap(lyric => lyric.split(/\s+/)
        .map(w => w.toLowerCase().replace(/[\W_]+/g, ""))
        .filter(w => w && !stopwords.has(w) && w.length > 2));

    // Count frequencies of each word
    let wordCounts = words.reduce((acc, word) => {
        acc[word] = (acc[word] || 0) + 1;
        return acc;
    }, {});

    // Convert counts to an array of objects suitable for the word cloud
    let wordsData = Object.entries(wordCounts).map(([text, size]) => ({
        text,
        size // You can adjust the size here if needed, for example, using a scaling function
    }));

    return wordsData;
}

function generateWordCloud(container, wordsData, { width = 640, height = 400, fontScale = 15 }) {
    // First, sort and limit the wordsData as before
    const data = wordsData.sort((a, b) => b.size - a.size).slice(0, 250);

    // Define the maximum and minimum frequency from the filtered data
    const maxFrequency = data[0].size; // The highest word frequency
    const minFrequency = data[data.length - 1].size; // The lowest word frequency in the top 250 words

    // Dynamic min and max font sizes
    const minFontSize = 10; // Minimum font size
    const maxFontSize = 100; // Maximum font size

    // Logarithmic scale for font sizes
    const fontSizeScale = d3.scaleLog()
                            .domain([Math.max(minFrequency, 1), maxFrequency]) // Avoid domain of 0 for log scale
                            .range([minFontSize, maxFontSize])
                            .clamp(true);

    // Clear any existing content in the container
    d3.select(container).selectAll("*").remove();

    // Create the SVG element inside the container
    const svg = d3.select(container).append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", `0 0 ${width} ${height}`)
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

    // Configuring the cloud layout
    const cloud = d3.layout.cloud()
        .size([width, height])
        .words(data)
        .padding(2) // Adjust padding as needed
        .rotate(() => (~~(Math.random() * 6) - 3) * 30) // Random rotation for variety
        .font("sans-serif")
        .fontSize(d => fontSizeScale(d.size)) // Use the dynamic font size based on our scale
        .on("end", draw);

    cloud.start();

    // Draw function to place words
    function draw(words) {
        svg.selectAll("text")
            .data(words)
            .enter().append("text")
            .style("font-size", d => `${d.size}px`)
            .style("font-family", "sans-serif")
            .attr("text-anchor", "middle")
            .text(d => d.text)
            .attr("transform", d => `translate(${d.x},${d.y}) rotate(${d.rotate})`);
    }
}
