let margin = {top: 20, right: 40, left: 100, bottom: 40};
let width = 700 + margin.left + margin.right
let height = 550 + margin.top + margin.bottom

console.log('working')
let svg = d3.select('#barchart').append('svg').attr('width', width).attr('height', height)
svg.append('g').attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')')

$.ajax({
    method: 'get',
    url: '/getTitleInfo',
    success: function (data) {
        console.log(data)
        let counts = {};
        data.forEach(d => {
            if(counts[d.race] !== undefined) {
                counts[d.race]++;
            } else {
                counts[d.race] = 1;
            }
        });
        counts['None'] = counts['undefined']
        delete counts['undefined']
        let bar_data = [];
        let sorted_data = Object.entries(counts).sort((a, b) => b[1] - a[1]);
        sorted_data.forEach(object => {
            let item = {'race': object[0], 'count': counts[object[0]]}
            bar_data.push(item)
        });

        let x = d3.scaleBand()
            .range([0, width-margin.right-margin.left])
            .padding(0.1);
        let y = d3.scaleLinear().range([height-margin.bottom, margin.top])
        x.domain(bar_data.map((d)=>d.race));
        y.domain([0, d3.max(bar_data, (d)=>d.count)]);
        let bars = svg.selectAll('.bar').data(bar_data).enter().append('g').attr('class', 'bar').attr('transform',
            d=>'translate(' + (margin.left + x(d.race)) + ', ' + (y(d.count)) + ')')
            .on('mouseenter', (e) => {
                d3.select(e.target).attr('class', 'bar-highlight')
                d3.select(e.target).select('text').attr('class', 'bar-label')
            })
            .on('mouseleave', (e) => {
                d3.select(e.target).attr('class', 'bar')
                d3.select(e.target).select('text').attr('class', 'bar-label-hidden')
            })
        bars.append('rect').attr('width', x.bandwidth()).attr('height', d=> height - margin.bottom - y(d.count))
        bars.append('text').attr('class', 'bar-label-hidden').attr('dy', -5)
            .attr('transform', 'translate(' + (x.bandwidth()/2) + ', 0)').text(d => d.count)

        let xAxis = d3.axisBottom(x);
        let yAxis = d3.axisLeft(y);
        svg.append('g').attr('transform', 'translate(' + margin.left + ', ' + (height-margin.bottom) + ')').call(xAxis);
        svg.append('text').attr('x', width/2).attr('y', height).attr('class', 'xlabel').text('Race')
        svg.append('g').attr('transform', 'translate(' + margin.left + ',0)').call(yAxis);
        svg.append('text').attr('x', 0-(height/2)).attr('y', margin.left/2).attr('class', 'ylabel').text('Number Killed')
    }
})