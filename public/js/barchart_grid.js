let grid_width = 740
let grid_height = 650
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
let genres_to_display = 8;

barChart();
function barChart(){
document.getElementById("barchart-grid").innerHTML = "";
let gridSVG = d3.select('#barchart-grid').append('svg').attr('width', grid_width + 10).attr('height', grid_height)

let type = 'Movie'    
let country = document.getElementById('country').value;
if(country === '') {
    country = null;
}
console.log(country)
    
$.ajax({
    method: 'post',
    url: '/getBarData',
    data: JSON.stringify({ 'country': country }),
    dataType: 'json',
    contentType: 'application/json',
    success: function (data) {
        console.log(data)
        let genres_list = {}
        data.forEach(d => {
            if(d.type === type) {
                let genre_string = d.listed_in.replaceAll(', ', ',')
                let genres = genre_string.split(',')
                let new_genre_array = [];
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

        let sortable = []
        Object.keys(genres_list).forEach(g => {
            sortable.push([g, genres_list[g]])
        })

        sortable.sort(function (a, b) {
            return b[1] - a[1]
        })

        let top_genres_list = getGenres(sortable);

        console.log(top_genres_list)

        let genre;
        let ratings_data = {};
        let isOther = false;
        let ratings_list = []
        data.forEach(d => {
            if(!ratings_list.includes(d.rating)) {
                ratings_list.push(d.rating)
            }
            if(d.rating === undefined) {
                console.log('Undefined', d)
            }
            if(d.type === type) {
                d.listed_in.forEach(g => {
                    if (!top_genres_list.includes(g)) {
                        genre = 'Other';
                        isOther = true;
                    } else {
                        genre = g;
                    }
                    if(d.rating === 'undefined') {
                        console.log('Undefined', d)
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
        console.log(ratings_list)
        if(isOther) {
            top_genres_list.push('Other')
        }
        console.log('Ratings', ratings_data)
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
            rating_item['rating'] =  g;
            rating_item['max'] = getMaxCount(rating_item);
            bar_data.push(rating_item);
        })

        console.log('Data', bar_data)
        let y = d3.scaleBand()
            .padding(0.1);
        let x = d3.scaleLinear()
        y.domain(bar_data.map(r=>r.rating));
        x.domain([0, d3.max(bar_data, d => d.max)]);

        let ylabel_row;
        let xlabel_row;
        if(top_genres_list.length < 4) {
            xlabel_row = 0;
        } else if(top_genres_list.length < 7) {
            xlabel_row = 3;
        } else {
            xlabel_row = 6;
        }
        for(let i = 0; i < top_genres_list.length; i++) {
            let vert_spacing;
            if(i < 3) {
                vert_spacing = 0;
            } else if(i < 6) {
                vert_spacing = grid[0].y + grid_sizes.bottom_margin;
            } else {
                vert_spacing = grid[3].y + grid_sizes.bottom_margin;
            }
            if((i+1) % 3 === 0) {
                x.range([grid[i].x, grid_width - 10])
            } else {
                x.range([grid[i].x, grid[i+1].x - grid_sizes.left_margin - 10])
            }
            console.log(bar_data[0][top_genres_list[i]])
            y.range([grid_sizes.top_margin, grid[0].y])
            let xAxis = d3.axisBottom(x);
            let yAxis = d3.axisLeft(y);
            let xAxisTicks = x.ticks(5).filter(tick => Number.isInteger(tick))
            xAxis
                .tickValues(xAxisTicks)
                .tickFormat(d3.format('d'))
            gridSVG.append('text').attr('transform', 'translate(' + (grid[i].x + .5 * grid_sizes.plot_width) + ', ' + (grid[i].y - grid_sizes.plot_height - 10) + ')').attr('class', 'subplot-labels').text(top_genres_list[i])
            gridSVG.append('g').attr('class', 'axis').attr('transform', 'translate(' + 0 + ', ' + grid[i].y + ')').call(xAxis);
            gridSVG.append('g').attr('class', 'axis').attr('transform', 'translate(' + grid[i].x + ',' + (grid[i].y - grid_sizes.plot_height - grid_sizes.top_margin) + ')').call(yAxis);
            let bars = gridSVG.selectAll('.bar' + i).data(bar_data).enter().append('g').attr('class', 'bar' + i).attr('transform',
                d=>'translate(' + grid[i].x + ', ' + (y(d.rating) + vert_spacing) + ')')
            bars.append('rect').attr('width', d=> (x(d[top_genres_list[i]]) - grid[i].x)).attr('height', y.bandwidth())
        }
        console.log(xlabel_row, grid_sizes.plot_height)
        gridSVG.append('text').attr('x', 0-(grid[xlabel_row].y/2 + grid_sizes.bottom_margin)).attr('y', grid_sizes.left_margin/4).attr('class', 'ylabel').text('R A T I N G')
        gridSVG.append('text').attr('x', (grid_width + grid_sizes.left_margin)/2).attr('y', grid[xlabel_row].y + grid_sizes.top_margin).attr('class', 'xlabel').text('NUMBER OF TITLES')

        // let legend = svg.selectAll('.legend').data(color.domain()).enter().append('g').attr('class', 'legend')
        //     .attr('transform', (d, i) => 'translate(' + (width - margin.right) + ', ' + 15 * i + ')');
        // legend.append('rect').attr('width', 10).attr('height', 10)
        //     .attr('transform', 'translate(0, 10)').style('fill', d => color(d));
        // legend.append('text').text(d => d.replace('-', ' ')).attr('x', 15).attr('y',  20)
    }
})
}
function getMaxCount(data) {
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

function getGenres(genre_array) {
    let num_genres;
    if(genre_array.length < genres_to_display) {
        num_genres = genre_array.length;
    } else {
        num_genres = genres_to_display
    }
    console.log(genre_array)
    let new_array = [];
    for(let i = 0; i < num_genres; i++) {
        new_array.push(genre_array[i][0]);
    }
    return new_array;
}