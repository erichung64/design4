stopwords = new Set("i,me,my,myself,we,us,our,ours,ourselves,you,your,yours,yourself,yourselves,he,him,his,himself,she,her,hers,herself,it,its,itself,they,them,their,theirs,themselves,what,which,who,whom,whose,this,that,these,those,am,is,are,was,were,be,been,being,have,has,had,having,do,does,did,doing,will,would,should,can,could,ought,i'm,you're,he's,she's,it's,we're,they're,i've,you've,we've,they've,i'd,you'd,he'd,she'd,we'd,they'd,i'll,you'll,he'll,she'll,we'll,they'll,isn't,aren't,wasn't,weren't,hasn't,haven't,hadn't,doesn't,don't,didn't,won't,wouldn't,shan't,shouldn't,can't,cannot,couldn't,mustn't,let's,that's,who's,what's,here's,there's,when's,where's,why's,how's,a,an,the,and,but,if,or,because,as,until,while,of,at,by,for,with,about,against,between,into,through,during,before,after,above,below,to,from,up,upon,down,in,out,on,off,over,under,again,further,then,once,here,there,when,where,why,how,all,any,both,each,few,more,most,other,some,such,no,nor,not,only,own,same,so,than,too,very,say,says,said,shall".split(","))

let saved_data;
let artist_state;
let start_year_state;
let end_year_state;

d3.csv('data.csv').then(data => {
    saved_data = data;
    PopulateDropdowns()
    Filtered(data, artist_state, start_year_state, end_year_state);
});

function PopulateDropdowns() {
    const art_select = d3.select("#artist");
    const start_year_select = d3.select("#s_year");
    const end_year_select = d3.select("#e_year");
    let artists = [];
    let years = [];
    
    // Extract artists and years
    for (let i = 0; i < saved_data.length; i++) {
        let included = false;
        for (let j = 0; j < artists.length; j++) {
            if (artists[j] == saved_data[i].Artist) {
                included = true;
                break;
            }
        }
        if (!included) {
            artists.push(saved_data[i].Artist);
        }

        included = false;
        for (let j = 0; j < years.length; j++) {
            if (years[j] == saved_data[i].Year.slice(0, 4)) {
                included = true;
                break;
            }
        }
        if (!included) {
            let year_clipped = saved_data[i].Year.slice(0, 4);
            if (!isNaN(year_clipped) && Number(year_clipped) < 2025 && Number(year_clipped) > 1900) {
                years.push(saved_data[i].Year);
            }
            
        }
    }
    years = years.sort();
    years = ["All"].concat(years);

    // Initialize states
    artist_state = artists[0];
    start_year_state = years[0];
    end_year_state = years[0];

    // Create dropdown options
    art_select.selectAll("option")
        .data(artists)
        .join("option")
            .attr("label", artist => artist);
    
    start_year_select.selectAll("option")
        .data(years)
        .join("option")
            .attr("label", year => year);

    end_year_select.selectAll("option")
        .data(years)
        .join("option")
            .attr("label", year => year);

    // Implement changing values
    art_select.on("change", changeEvent => {
        artist_state = artists[changeEvent.target.selectedIndex];
        Filtered(saved_data, artist_state, start_year_state, end_year_state);
    });

    start_year_select.on("change", changeEvent => {
        start_year_state = years[changeEvent.target.selectedIndex];
        Filtered(saved_data, artist_state, start_year_state, end_year_state);
    });

    end_year_select.on("change", changeEvent => {
        end_year_state = years[changeEvent.target.selectedIndex];
        Filtered(saved_data, artist_state, start_year_state, end_year_state);
    })
}

function Filtered(data, artist, start_year, end_year) {
    let lyrics = [];
    for (let i = 0; i < data.length; i++) {
        const artist_data = data[i].Artist;
        const year_data = data[i].Year.slice(0, 4);
        if (artist_data === artist
                && ((start_year === "All") || (!isNaN(year_data) && Number(year_data) >= Number(start_year)))
                && ((end_year === "All") || (!isNaN(year_data) && Number(year_data) <= Number(end_year)))) {
            lyrics.push(data[i].Lyric);
        }
    }

    let words = [];
    for (let i = 0; i < lyrics.length; i++) {
        words = words.concat(lyrics[i].split(/[\s.]+/g)
            .map(w => w.replace(/[0123456789]+/g, ""))
            .map(w => w.replace(/^[“‘"\-—()\[\]{}]+/g, ""))
            .map(w => w.replace(/[;:.!?()\[\]{},"'’”\-—]+$/g, ""))
            .map(w => w.replace(/['’]s$/g, ""))
            .map(w => w.substring(0, 30))
            .map(w => w.toLowerCase())
            .filter(w => w && !stopwords.has(w) && w.length > 2))
    }

    WordCloud(words, {
        width: 1500,
        height: 750,
        maxWords: 100000
    });
}

function WordCloud(text, {
    size = group => group.length, // Given a grouping of words, returns the size factor for that word
    word = d => d, // Given an item of the data array, returns the word
    marginTop = 0, // top margin, in pixels
    marginRight = 0, // right margin, in pixels
    marginBottom = 0, // bottom margin, in pixels
    marginLeft = 0, // left margin, in pixels
    width = 640, // outer width, in pixels
    height = 400, // outer height, in pixels
    maxWords = 250, // maximum number of words to extract from the text
    fontFamily = "sans-serif", // font family
    fontScale = 15, // base font size
    fill = null, // text color, can be a constant or a function of the word
    padding = 0, // amount of padding between the words (in pixels)
    rotate = 0, // a constant or function to rotate the words
    invalidation // when this promise resolves, stop the simulation
  } = {}) {
    const words = typeof text === "string" ? text.split(/\W+/g) : Array.from(text);
    
    const data = d3.rollups(words, size, w => w)
        .sort(([, a], [, b]) => d3.descending(a, b))
        .slice(0, maxWords)
        .map(([key, size]) => ({text: word(key), size}));
    
    d3.select("#my_dataviz").html("");
    
    const svg = d3.select("#my_dataviz")
        .append("svg")
        .attr("viewBox", [0, 0, width, height])
        .attr("width", width)
        .attr("font-family", fontFamily)
        .attr("text-anchor", "middle")
        .attr("style", "max-width: 100%; height: auto; height: intrinsic;");
  
    const g = svg.append("g").attr("transform", `translate(${marginLeft},${marginTop})`);
  
    const cloud = d3.layout.cloud()
        .size([width - marginLeft - marginRight, height - marginTop - marginBottom])
        .words(data)
        .padding(padding)
        .rotate(rotate)
        .font(fontFamily)
        .fontSize(d => Math.sqrt(d.size) * fontScale)
        .on("word", ({size, x, y, rotate, text}) => {
          g.append("text")
              .datum(text)
              .attr("font-size", size)
              .attr("fill", fill)
              .attr("transform", `translate(${x},${y}) rotate(${rotate})`)
              .text(text);
        });
  
    cloud.start();
    invalidation && invalidation.then(() => cloud.stop());
    return svg.node();
  }

