//This file generates the ratings-by-genre bar chart grid visualization.
//Grid is subject to both country selection and content type selection filtering.

let grid_width = $('#barchart-grid').width();
let grid_height = $('#barchart-grid').height()
//Define grid layout dimensions
let grid_sizes = {left_margin: (grid_width/3)*(3/10), plot_width: (grid_width/3)*(7/10), plot_height: (grid_height/3)*(13/20), top_margin: (grid_height/3)/5, bottom_margin: (grid_height/3)*(1/10)}
let grid1 = {x:grid_sizes.left_margin, y:grid_sizes.top_margin + grid_sizes.plot_height}
let grid2 = {x:2*grid_sizes.left_margin + grid_sizes.plot_width, y:grid_sizes.top_margin + grid_sizes.plot_height}
let grid3 = {x:3*grid_sizes.left_margin + 2*grid_sizes.plot_width, y:grid_sizes.top_margin + grid_sizes.plot_height}
let grid4 = {x:grid_sizes.left_margin, y:2*grid_sizes.top_margin + 2*grid_sizes.plot_height + grid_sizes.bottom_margin}
let grid5 = {x:2*grid_sizes.left_margin + grid_sizes.plot_width, y:2*grid_sizes.top_margin + 2*grid_sizes.plot_height + grid_sizes.bottom_margin}
let grid6 = {x:3*grid_sizes.left_margin + 2*grid_sizes.plot_width, y:2*grid_sizes.top_margin + 2*grid_sizes.plot_height + grid_sizes.bottom_margin}
let grid7 = {x:grid_sizes.left_margin, y:3*grid_sizes.top_margin + 3*grid_sizes.plot_height + 2*grid_sizes.bottom_margin}
let grid8 = {x:2*grid_sizes.left_margin + grid_sizes.plot_width, y:3*grid_sizes.top_margin + 3*grid_sizes.plot_height + 2*grid_sizes.bottom_margin}
let grid9 = {x:3*grid_sizes.left_margin + 2*grid_sizes.plot_width, y:3*grid_sizes.top_margin + 3*grid_sizes.plot_height + 2*grid_sizes.bottom_margin}
let grid = [grid1, grid2, grid3, grid4, grid5, grid6, grid7, grid8, grid9]
//Specify number of grids to display (not including the catch-all 'Other' category
let genres_to_display = 8;

barChart();
function barChart(){
document.getElementById("barchart-grid").innerHTML = "";
let gridSVG = d3.select('#barchart-grid').append('svg').attr('width', grid_width + 10).attr('height', grid_height)

//Get currently selected country for country filtering
let country = document.getElementById('country').value;
if(country === '') {
    country = null;
}
    
$.ajax({
    method: 'post',
    url: '/getBarData',
    data: JSON.stringify({ 'country': country }),
    dataType: 'json',
    contentType: 'application/json',
    success: function (data) {
        //Get currently selected content type filter
        let type = select_type;
        let genres_list = {}
        data.forEach(d => {
            if(d.type === type || type === undefined) {
                //Check for multiple genres in the 'Listed In' attribute
                let genre_string = d.listed_in.replaceAll(', ', ',')
                let genres = genre_string.split(',')
                let new_genre_array = [];
                //Add each genre to the count dictionary if undefined, otherwise increment its count
                genres.forEach(g => {
                    if (genres_list[g] === undefined) {
                        genres_list[g] = 1
                    } else {
                        genres_list[g]++
                    }
                    new_genre_array.push(g);
                })
                d.listed_in = new_genre_array;
            }
        })

        //Rearrange genre data into an array for sorting
        let sortable = []
        Object.keys(genres_list).forEach(g => {
            sortable.push([g, genres_list[g]])
        })

        //Sort the genres from most popular to least
        sortable.sort(function (a, b) {
            return b[1] - a[1]
        })

        //Extract the top genres
        let top_genres_list = getGenres(sortable);

        //Check the genre list isn't empty due to filters
        if(top_genres_list.length > 0) {

            let genre;
            let ratings_data = {};
            let isOther = false;
            let ratings_list = []
            //Build ratings counts for each genre inside nested objects
            data.forEach(d => {
                if (!ratings_list.includes(d.rating)) {
                    ratings_list.push(d.rating)
                }
                if (d.type === type || type === undefined) {
                    d.listed_in.forEach(g => {
                        //Flag the genre as an 'Other' title if the genre is not one of the top genres
                        if (!top_genres_list.includes(g)) {
                            genre = 'Other';
                            isOther = true;
                        } else {
                            genre = g;
                        }
                        if (ratings_data[d.rating] === undefined) {
                            ratings_data[d.rating] = {};
                        }
                        if (ratings_data[d.rating][genre] === undefined) {
                            ratings_data[d.rating][genre] = 1;
                        } else {
                            ratings_data[d.rating][genre]++;
                        }
                    })
                }
            })

            //Other is only added if there are more genres than there are available grid plots
            if (isOther) {
                top_genres_list.push('Other')
            }
            //Rearrange data into an array of objects in preparation for their use in bar charts
            let bar_data = [];
            Object.keys(ratings_data).forEach(g => {
                let rating_item = {};
                top_genres_list.forEach(d => {
                    if (ratings_data[g][d] !== undefined) {
                        rating_item[d] = ratings_data[g][d];
                    } else {
                        rating_item[d] = 0;
                    }
                })
                rating_item['rating'] = g;
                //Add a maximum count for each rating, will be used to define the domain of the x-axis
                rating_item['max'] = getMaxCount(rating_item);
                bar_data.push(rating_item);
            })

            //Define y-axis (categorical)
            let y = d3.scaleBand()
                .padding(0.1);
            //Define x-axis (linear)
            let x = d3.scaleLinear()
            y.domain(bar_data.map(r => r.rating));
            x.domain([0, d3.max(bar_data, d => d.max)]);

            //Determine where the axis labels should be placed.
            //Only placed at the bottom of the vis if the number of plots is more than 6, otherwise it needs to be moved up.
            let xlabel_row;
            if (top_genres_list.length < 4) {
                xlabel_row = 0;
            } else if (top_genres_list.length < 7) {
                xlabel_row = 3;
            } else {
                xlabel_row = 6;
            }
            for (let i = 0; i < top_genres_list.length; i++) {
                let vert_spacing;
                if (i < 3) {
                    vert_spacing = 0;
                } else if (i < 6) {
                    vert_spacing = grid[0].y + grid_sizes.bottom_margin;
                } else {
                    vert_spacing = grid[3].y + grid_sizes.bottom_margin;
                }
                if ((i + 1) % 3 === 0) {
                    x.range([grid[i].x, grid_width - 10])
                } else {
                    x.range([grid[i].x, grid[i + 1].x - grid_sizes.left_margin - 10])
                }
                y.range([grid_sizes.top_margin, grid[0].y])
                let xAxis = d3.axisBottom(x)
                let yAxis = d3.axisLeft(y)
                //Restrict axis ticks to 5 integers
                let xAxisTicks = x.ticks(5).filter(tick => Number.isInteger(tick))
                xAxis
                    .tickValues(xAxisTicks)
                    .tickFormat(d3.format('d'))
                //Generate genre labels above each grid plot
                gridSVG.append('text')
                    .attr('transform', 'translate(' + (grid[i].x + .5 * grid_sizes.plot_width) +
                        ', ' + (grid[i].y - grid_sizes.plot_height - 10) + ')')
                    .attr('class', 'subplot-labels')
                    .text(top_genres_list[i])
                //Draw x-axes
                gridSVG.append('g').attr('class', 'axis').attr('transform', 'translate(' + 0 + ', ' + grid[i].y + ')')
                    .call(xAxis);
                //Draw y-axes
                gridSVG.append('g').attr('class', 'axis')
                    .attr('transform', 'translate(' + grid[i].x + ',' +
                        (grid[i].y - grid_sizes.plot_height - grid_sizes.top_margin) + ')')
                    .call(yAxis);
                //Draw bar plot bar groups
                let bars = gridSVG.selectAll('.bar' + i).data(bar_data).enter().append('g')
                    .attr('class', 'bar bar' + i)
                    .attr('transform', d => 'translate(' + grid[i].x + ', ' + (y(d.rating) + vert_spacing) + ')')
                    .on('mouseenter', (e, d) => {
                        //Fill orange on hover and display count
                        let bar = d3.select(e.target);
                        bar.style('fill', 'orange');
                        bar.append('text').attr('class', 'grid-tooltip').text(d[top_genres_list[i]])
                    })
                    .on('mouseleave', e => {
                        //Remove count text and highlighted color on mouse leave
                        d3.select(e.target).style('fill', '#9ecae1')
                        d3.select('.grid-tooltip').remove()
                    })
                //Draw bars
                bars.append('rect').attr('width', d => (x(d[top_genres_list[i]]) - grid[i].x)).attr('height', y.bandwidth())
            }
            //Add y-label
            gridSVG.append('text')
                .attr('x', 0 - (grid[xlabel_row].y / 2 + grid_sizes.bottom_margin))
                .attr('y', grid_sizes.left_margin / 4).attr('class', 'ylabel').text('R A T I N G')
            //Add x-label
            gridSVG.append('text')
                .attr('x', (grid_width + grid_sizes.left_margin) / 2)
                .attr('y', grid[xlabel_row].y + grid_sizes.top_margin)
                .attr('class', 'xlabel').text('NUMBER OF TITLES')
        } else {
            //If no data is present due to filtering, display "NO DATA"
            gridSVG.append('text').attr('x', grid_width/2).attr('y', grid_height/2).attr('class', 'no-data-label').text('NO DATA')
        }
    }
})
}
function getMaxCount(data) {
    //This function calculates the maximum count among rating attributes and returns that max value.
    let maximum = 0;
    let value;
    Object.keys(data).forEach(d => {
        if(d !== 'rating') {
            value = data[d]
            if(value > maximum) {
                maximum = value
            }
        }
    })
    return maximum;
}

//This function takes a sorted Object list and returns an array of the top genres for use in labeling.
//Uses the 'genres_to_display' parameter defined at the top of the file.
function getGenres(genre_array) {
    let num_genres;
    if(genre_array.length < genres_to_display) {
        num_genres = genre_array.length;
    } else {
        num_genres = genres_to_display
    }
    let new_array = [];
    for(let i = 0; i < num_genres; i++) {
        new_array.push(genre_array[i][0]);
    }
    return new_array;
}