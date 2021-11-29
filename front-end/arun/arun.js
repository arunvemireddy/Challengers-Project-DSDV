
let width =960;
let height = 500;
let fill = d3.scaleLog().range(['white','darkblue']);
let svg = d3.select("#mapvis")
            .append('svg')
            .attr('width',width)
            .attr('height',height);

let new_data ={};
let countries_data=[];


$.ajax({
    method:'get',
    url:'/getCountries',
    success:function(data){
        for(let i=0;i<data.length;i++){
            if(data[i].country=='United States'){
                data[i].country='united states of america';
            }
            countries_data[i]=data[i].country.toLowerCase();
        }
       afterdata();
    }
})

// world map topograph
function afterdata(){


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
            .attr('stroke','black')
            .style('fill',function(d){
              d.properties.name = d.properties.name.toLowerCase();
              console.log(d.properties.name);
             if(countries_data.includes(d.properties.name.toString())){
                    return 'red';
                }else{
                    return 'steelblue';
                }
            })
            .on('click',function(e,d){
                if(countries_data.includes(e.target.__data__.properties.name)){
                    d3.selectAll('.countryClass').style('fill','red');
                    d3.select(this).style('fill','orange').attr('class','countryClass');
                }
                document.getElementById('country').value = e.target.__data__.properties.name;
                piedata(e.target.__data__.properties.name);
            })
        })
    })

}

function piedata(value){
    console.log(value);
$.ajax({
    method:'post',
    url:'/getCountryData',
    data: JSON.stringify({'country':value}),
    dataType: 'json',
    contentType: 'application/json',
    success:function(data){
       console.log(data);
       let countTVShow=0;
       let countMovie=0;
       for(let i=0;i<data.length;i++){
           if(data[i].type=='TV Show'){
               countTVShow=countTVShow+1;
           }else{
                countMovie=countMovie+1;
           }
       }
       document.getElementById('pievis').innerHTML='';
       piechart(countMovie,countTVShow);
    } 
})
}
//pie chart

function piechart(m,t){
    document.getElementById('movie').value = m;
    document.getElementById('tvshow').value = t;
    
    let mper=(m/(m+t))*100;
    let tper=(t/(m+t))*100;

console.log(m);
console.log(t);
let width = 300;
let height = 200;
var data = [m,t];
let svg = d3.select('#pievis').append('svg').attr('width',width).attr('height',height);
radius = Math.min(width, height) / 2;
let g=svg.append('g').attr('transform','translate('+width/2+","+height/2+")");
var color = d3.scaleOrdinal(['brown','black']);
var pie = d3.pie();
var arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

        svg.append('rect').attr('x',0).attr('y',10).attr('width',10).attr('height',10).style('fill','brown');
        svg.append('text').text('Movie').style('fill','brown').attr('x',15).attr('y',20).attr('font-size','14px');
        svg.append('rect').attr('x',0).attr('y',25).attr('width',10).attr('height',10).style('fill','black');
        svg.append('text').text('TV Show').style('fill','black').attr('x',15).attr('y',35).attr('font-size','14px');
//Generate groups
var arcs = g.selectAll("arc")
        .data(pie(data))
        .enter()
        .append("g")
        .attr("class", "arc")
        arcs.append("path")
        .attr("fill", function(d, i) {
        return color(i);
        })
        .attr("d", arc);
        }