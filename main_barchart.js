let margin = {top: 20, right: 240, left: 100, bottom: 40};
let width = 900 + margin.left + margin.right
let height = 550 + margin.top + margin.bottom

console.log('working')
let svg = d3.select('#barchart').append('svg').attr('width', width).attr('height', height)
svg.append('g').attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')')
let country_data;
let genres_to_display = 9;
let type = 'Movie'
let country = 'United States';

$.ajax({
    method: 'get',
    url: '/getTitleInfo',
    success: function (data) {
        console.log(data)
        let country_ratings = {};
        let genres_list = {};
        data.forEach(d => {
            let country_string = d.country.replaceAll(', ', ',')
            let country_names = country_string.split(',')
            country_names.forEach(a => {
                if(a !== '') {
                    if (country_ratings[a] === undefined) {
                        country_ratings[a] = {}
                    }
                    if(d.type === type) {
                        if (country_ratings[a][d.rating] === undefined) {
                            country_ratings[a][d.rating] = {}
                        }
                        let genre_string = d.listed_in.replaceAll(', ', ',')
                        let genres = genre_string.split(',')
                        genres.forEach(g => {
                            if (genres_list[g] === undefined) {
                                genres_list[g] = 1
                            } else {
                                genres_list[g]++
                            }
                            if (country_ratings[a][d.rating][g] === undefined) {
                                country_ratings[a][d.rating][g] = {}
                                country_ratings[a][d.rating][g]['count'] = 1
                            } else {
                                country_ratings[a][d.rating][g]['count']++
                            }
                        })
                    }
                }
            })
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

        country_data = country_ratings[country];
        let ratings_data = [];
        Object.keys(country_data).forEach(d => {
            let rating_item = {};
            Object.keys(genres_list).forEach(g => {
                if (country_data[d][g] !== undefined) {
                    rating_item[g] = country_data[d][g]['count'];
                } else {
                    rating_item[g] = 0;
                }
            })
            rating_item['rating'] =  d;
            rating_item['total'] = getRatingCount(rating_item);
            ratings_data.push(rating_item);
        })

        console.log('Ratings', ratings_data)
        ratings_data = getDataWithOther(top_genres_list, ratings_data)
        console.log('Ratings', ratings_data)

        let stackGenerator = d3.stack().keys(top_genres_list).order(d3.StackOrderReverse)

        let stackedData = stackGenerator(ratings_data)
        console.log(stackedData)
        let x = d3.scaleBand()
            .range([0, width-margin.right-margin.left])
            .padding(0.1);
        let y = d3.scaleLinear().range([height-margin.bottom, margin.top])
        let color = d3.scaleOrdinal(d3.schemeCategory10)
            .domain(top_genres_list)
        x.domain(ratings_data.map(r=>r.rating));
        y.domain([0, d3.max(ratings_data, d => d.total)]);
        let bars = svg.selectAll('.bar').data(stackedData).enter().append('g').style('fill', d => color(d.key)).attr('transform', d=>'translate(' + (margin.left) + ', 0)')
        bars.selectAll('rect').data(d => d).enter().append('rect').attr('width', x.bandwidth()).attr('height', d => (y(d[0]) - y(d[1]))).attr('transform',
                d=>'translate(' + x(d.data.rating) + ', ' + y(d[1]) + ')')
        let xAxis = d3.axisBottom(x);
        let yAxis = d3.axisLeft(y);
        svg.append('g').attr('transform', 'translate(' + margin.left + ', ' + (height-margin.bottom) + ')').call(xAxis);
        svg.append('text').attr('x', (width-margin.right)/2).attr('y', height).attr('class', 'xlabel').text('Rating')
        svg.append('g').attr('transform', 'translate(' + margin.left + ',0)').call(yAxis);
        svg.append('text').attr('x', 0-(height/2)).attr('y', margin.left/2).attr('class', 'ylabel').text('Number of Titles')

        let legend = svg.selectAll('.legend').data(color.domain()).enter().append('g').attr('class', 'legend')
            .attr('transform', (d, i) => 'translate(' + (width - margin.right) + ', ' + 15 * i + ')');
        legend.append('rect').attr('width', 10).attr('height', 10)
            .attr('transform', 'translate(0, 10)').style('fill', d => color(d));
        legend.append('text').text(d => d.replace('-', ' ')).attr('x', 15).attr('y',  20)
    }
})

function getRatingCount(rating) {
    let total = 0;
    Object.keys(rating).forEach(g => {
        if(g !== 'rating') {
            total += rating[g];
        }
    })
    return total;
}

function getGenres(genre_array) {
    let new_array = [];
    for(let i = 0; i < genres_to_display; i++) {
        new_array.push(genre_array[i][0]);
    }
    new_array.push('Other')
    return new_array;
}

function getDataWithOther(top_genres, data) {
    let new_data = [];
    data.forEach(d => {
        let new_item = {'Other': 0};
        Object.keys(d).forEach(g => {
            if(!top_genres.includes(g) && g !== 'rating' && g !== 'total') {
                new_item['Other'] += d[g]
            }
            else {
                new_item[g] = d[g]
            }
        })
        new_data.push(new_item)
    })
    return new_data
}