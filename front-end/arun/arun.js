
let width =960;
let height = 500;
let fill = d3.scaleLog().range(['white','darkblue']);
let svg = d3.select("#mapvis")
            .append('svg')
            .attr('width',width)
            .attr('height',height);

let pop_data ={};
let countries_data;

$.ajax({
    method:'get',
    url:'/getCountries',
    success:function(data){
        countries_data=data; 
    }
})

// world map topograph
d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
    .then(function(map){
    nc = topojson.feature(map,map.objects.countries);

    let projection = d3.geoMercator()
                        .scale(1)
                        .translate([0,0]);
    // path generator
    var path = d3.geoPath()
                .projection(projection);

    // scale and translate 
    var b = path.bounds(nc),
        s = .95/Math.max((b[1][0]-b[0][0])/width,(b[1][1]-b[0][1])/height),
        t = [(width-s*(b[1][0]+b[0][0]))/2,(height-s*(b[1][1]+b[0][1]))/2];
        projection.scale(s).translate(t);

        var csv = URL.createObjectURL(new Blob([countries_data]));
        
        d3.csv(csv).then(function(data){
           

            svg.append('g').attr('class','counties')
            .selectAll('path')
            .data(nc.features)
            .enter().append('path')
            .attr('d',path)
            .style('fill','steelblue')
            .on('click',function(e,d){
                d3.selectAll('.countryClass').style('fill','steelblue');
                d3.select(this).style('fill','#1b3042').attr('class','countryClass');
                console.log(e.target.__data__.properties.name);
                document.getElementById('country').value = e.target.__data__.properties.name;
                
            })
            // .on('mouseleave',function(e,d){
            //     d3.select(this).style('fill','steelblue');
            // })

        })
    })

   