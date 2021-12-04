
let width = 1400;
let height = 500;
let fill = d3.scaleLog().range(['white', 'darkblue']);
let svg = d3.select("#mapvis")
    .append('svg')
    .attr('width', width)
    .attr('height', height);
let g = svg.append('g');

let new_data = {};
let countries_data = [];


$.ajax({
    method: 'get',
    url: '/getCountries',
    success: function (data) {
        for (let i = 0; i < data.length; i++) {
            if (data[i].country == 'United States') {
                data[i].country = 'united states of america';
            }
           if(data[i].country.includes(",")){
               console.log(data[i].country);
               let val = data[i].country.split(",");
               for(let i=0;i<val.length;i++){
                if (val[i].country == 'United States') {
                    val[i].country = 'united states of america';
                }
                   countries_data.push(val[i].trim().toLowerCase());
               }
           }else{
                countries_data.push(data[i].country.trim().toLowerCase());
           }
        }

        let new_map = new Map();
        for (let i = 0; i < data.length; i++) {
            data[i].country = data[i].country.trim().toLowerCase();
            if (data[i].country == 'United States') {
                data[i].country = 'united states of america';
            }
           if(data[i].country.includes(",")){
               console.log(data[i].country);
               let val = data[i].country.split(",");
               for(let i=0;i<val.length;i++){
                if (val[i].country == 'United States') {
                    val[i].country = 'united states of america';
                }
                   if(new_map.get(val[i].country)==undefined){
                    new_map.set(val[i].country,1);
                   }else{
                       v = new_map.get(val[i].country);
                       v=v+1;
                       new_map.set(val[i].country,v);
                   }
                   
               }
           }else{
            if(new_map.get(data[i].country)==undefined){
                    new_map.set(data[i].country,1);
               }else{
                   v = new_map.get(data[i].country);
                   v=v+1;
                   new_map.set(data[i].country,v);
               }
           }
        }

        console.log(new_map);
        let mdata=[];
        let item={};
        new_map.forEach((val,key)=>{
            item['value']= parseInt(val);
            item['key']=key;
            mdata.push(item);
            item=[];

        })
        console.log(mdata)
        var colorScale = d3.scaleThreshold()
                           .domain([d3.min(mdata,d=>d.value),d3.max(mdata,d=>d.value)])
                           // .domain([-110,1000])
                            .range(d3.schemeBlues[7]);
        

        d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
        .then(function (map) {

            let Tooltip = d3.select("#mapvis")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 1)
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "2px")
            .style("border-radius", "5px")
            .style("padding", "5px")
            .style('display','inline')
            .style('position','fixed')
            
            nc = topojson.feature(map, map.objects.countries);
            let projection = d3.geoMercator()
                                .scale(1)
                                .translate([0, 0]);
            // path generator
            var path = d3.geoPath()
                        .projection(projection);

            // scale and translate 
            var b = path.bounds(nc),
                s = .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
                t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];
            projection.scale(s).translate(t);
            
            var csv = URL.createObjectURL(new Blob([countries_data]));
            d3.csv(csv).then(function (data) {
                g.attr('class', 'counties')
                    .selectAll('path')
                    .data(nc.features)
                    .enter().append('path')
                    .attr('d', path)
                    .attr('stroke', 'black')
                    .style('fill', function (d) {
                        d.properties.name = d.properties.name.toLowerCase();
                        if (countries_data.includes(d.properties.name.toString())) {
                           //return colorScale(new_map.get(d.properties.name));
                           return 'rgb(52, 235, 229)';
                        } else {
                            return 'white';
                        }
                    })
                    .on('click', function (e, d) {
                        if (countries_data.includes(e.target.__data__.properties.name)) {
                            d3.selectAll('.countryClass').style('fill', function(){
                                //return colorScale(new_map.get(d.properties.name));
                                return 'rgb(52, 235, 229)';
                            });
                            d3.select(this).style('fill', 'orange').attr('class', 'countryClass');
                            console.log(this.style.fill);
                        }
                    
                        document.getElementById('country').value = e.target.__data__.properties.name;

                        if(this.style.fill=='orange'){
                            piedata(e.target.__data__.properties.name);
                            //Linechart();
                            $('input[id=radi]').prop('checked', true);
                        }else{
                            alert('please select colored countries');
                        }
                    })
                    .on('mousemove',function(e,d){
                       // d3.select(this).style('fill','black')
                        Tooltip.html(e.target.__data__.properties.name)
                        .style("left", (d3.pointer(e)[0]+40) + "px")
                        .style("top",  (d3.pointer(e)[1]) + "px")
                        .style('opacity',1);
                    })
            })
        })
        var zoom = d3.zoom()
                    .scaleExtent([1, 8])
                     .on('zoom', function(event) {
                    g.selectAll('path')
                    .attr('transform', event.transform);
        });

        svg.call(zoom);
    }
    
        
})



function piedata(value) {
    $.ajax({
        method: 'post',
        url: '/getCountryData',
        data: JSON.stringify({ 'country': value }),
        dataType: 'json',
        contentType: 'application/json',
        success: function (data) {
            const map = new Map();
            for (let i = 0; i < data.length; i++) {
                if (map.get(data[i].type) == undefined) {
                    map.set(data[i].type,1);
                } else {
                    value = map.get(data[i].type);
                    value = value+1;
                    map.set(data[i].type,value);
                }
            }
            let newData=[];
            let item={};
            document.getElementById('pievis').innerHTML = '';
            map.forEach((val,key)=>{
                item['value']= parseInt(val);
                item['key']=key;
                newData.push(item);
                 item=[];
            })
            piechart(newData);
            
        }
    })
}

//pie chart
function piechart(ndata) {

    if(ndata.length>0){
    let data=[];
    let width = 400;
    let height = 200;
    let svg = d3.select('#pievis')
    .append('svg')
    .attr('width', width)
    .attr('height', height+300);
    radius = Math.min(width, height) / 2;
    let g = svg.append('g')
    .attr('transform', 'translate(' + width / 2 + "," + height / 2 + ")");
    var color = d3.scaleOrdinal(d3.schemeCategory10);
    var pie = d3.pie()
      .value(function(d) {
        return d.value;
      })
      .sort(null);
    var arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

   
    //Generate groups
    var arcs = g.selectAll(".arc")
        .data(pie(ndata))
        .enter()
        .append("g")
        .attr("class", "arc")
    arcs.append("path")
        .attr("fill", function (d, i) {
            return color(i);
        })
        .attr("d", arc);

        let legend = svg.selectAll(".legend")
                    .data(pie(ndata))
                    .enter().append('g')
                    .attr('class','legend')
                    .attr('transform',(d,i)=>'translate('+-10+','+15*i+')');

        legend.append("rect").attr('x',10)
                .attr('width',10).attr('height',10).style('fill',function(d,i){
         
            return color(i);
        });
        legend.append("text")
        .text(function(d){
          return d.data.value + "  " + d.data.key;
        })
        .style("font-size", 12)
        .attr("y", 10)
        .attr("x", 25);
    }
}

Linechart();

function Linechart(){
    document.getElementById('linechart').innerHTML="";
    let xLabel = 'Year';
    let yLabel = 'No of Titles';
    let margin = {top:20,right:20,left:45,bottom:30};
    let width = 500-margin.top-margin.bottom;
    let height = 500-margin.left-margin.right;
    let svg = d3.select('#linechart')
                .append('svg')
                .attr('width',width+margin.left+margin.right)
                .attr('height',height+margin.top+margin.bottom)
                .append('g')
                .attr('transform',"translate("+margin.left+" "+margin.top+")");
        
    let xScale = d3.scaleTime().range([0,width]);
    let yScale = d3.scaleLinear().range([height,0]);

    $.ajax({
        method: 'get',
        url: '/getCountries',
        success: function (data) {
            data.sort((a, b) => new Date(a.date_added) - new Date(b.date_added));
            console.log("line chart");
            console.log(data);
            let line_map = new Map();
            let type_line_map 
            for(let i=0;i<data.length;i++){
            
                if(line_map.get(data[i].date_added)==undefined){
                    let d = new Date(data[i].date_added);
                    let x=d.getFullYear();
                    if(line_map.get(x)==undefined){
                        line_map.set(x,1);
                    }else{
                        let v = line_map.get(x);
                        v=v+1;
                        line_map.set(x,v);
                    }
                }
            }

            for(let i=0;i<data.length;i++){
            
                if(line_map.get(data[i].date_added)==undefined){
                    let d = new Date(data[i].date_added);
                    let x=d.getFullYear();
                    if(line_map.get(x)==undefined){
                        line_map.set(x,1);
                    }else{
                        let v = line_map.get(x);
                        v=v+1;
                        line_map.set(x,v);
                    }
                }
            }

            console.log(line_map)
                let item={};
                let line_data=[];
                line_map.forEach((val,key)=>{
                    item['value']=val;
                    item['key']=key;
                    
                    if(!isNaN(item['key'])){
                        line_data.push(item);
                    }
                    item={};
                })
                line_data.sort((a, b) => new Date(a.key) - new Date(b.key));
                console.log(line_data);
                xScale.domain([d3.min(line_data,d=>d.key),d3.max(line_data,d=>d.key)]);
                yScale.domain([d3.min(line_data,d=>d.value),d3.max(line_data,d=>d.value)]);
                
                let xAxis = d3.axisBottom(xScale); ;
                let yAxis = d3.axisLeft(yScale);

                svg.append('g')
                    .attr("transform","translate(0,"+height+")")
                    .call(xAxis).attr('class','xAxisLine')
                    .append('text')
                    .attr('class','label')
                    .attr('x',width-margin.left-margin.right)
                    .attr('y',-6)
                    .text(xLabel).attr('class','texLabel');

                svg.append('g')
                    .call(yAxis)
                    .attr('class','yAxisLine')
                    .append('text')
                    .attr('class','label')
                    .attr('transform','rotate(-90)')
                    .attr('y',15).text(yLabel).attr('class','texLabel');

                    

                svg.append('path')
                    .attr('fill','none')
                    .datum(line_data)
                    .attr('stroke','black')
                    .attr("stroke-width", 1.5)
                    .attr('d',d3.line().x(d=>xScale(d.key)).y(d=>yScale(d.value)))
                
                    svg.append('path')
                    .attr('fill','none')
                    .datum(line_data)
                    .attr('stroke','black')
                    .attr("stroke-width", 1.5)
                    .attr('d',d3.line().x(d=>xScale(d.key)).y(d=>yScale(d.value)))
                    //.attr('class','pathLine')
                    // .on('mouseenter',(e,d)=>{
                    //   d3.select(e.target).style('stroke','red').attr('class','patClas')
                    // }).on('mouseleave',(e,d)=>{
                    // d3.select(e.target).style('stroke','green').attr('class','patClas')
                    // });

                    }
                })
}



// }

// function piechartratings() {
//     let rad = document.querySelector('input[name="rad"]:checked').value;
//     let country = document.getElementById('country').value;
//     let newData=[];
//     let item={};
//     console.log('arun');
//     console.log(country.length)
//     if(country.length>0){
//     if(rad=='rating'){
//         $.ajax({
//             method: 'post',
//             url: '/getCountryDataRatings',
//             data: JSON.stringify({ 'country': country }),
//             dataType: 'json',
//             contentType: 'application/json',
//             success: function (data) {
//                 const map = new Map();
//                 for(let i=0;i<data.length;i++){
//                      if(map.get(data[i].rating)==undefined){
//                         map.set(data[i].rating,1);
//                      }else{
//                         value = map.get(data[i].rating);
//                         value = value+1;
//                         map.set(data[i].rating,value);
//                      }
//                 }
//                 map.forEach((val,key)=>{
//                     item['value']= parseInt(val);
//                     item['key']=key;
//                     newData.push(item);
//                      item=[];
        
//                 })
//                 document.getElementById('pievis').innerHTML = '';
//                 piechart(newData);
//             }
//         })

//     }else{
//         $.ajax({
//             method: 'post',
//             url: '/getCountryData',
//             data: JSON.stringify({ 'country': country }),
//             dataType: 'json',
//             contentType: 'application/json',
//             success: function (data) {
//                 const map = new Map();
//                 for (let i = 0; i < data.length; i++) {
//                     if (map.get(data[i].type) == undefined) {
//                         map.set(data[i].type,1);
//                     } else {
//                         value = map.get(data[i].type);
//                         value = value+1;
//                         map.set(data[i].type,value);
//                     }
//                 }
//                 document.getElementById('pievis').innerHTML = '';
//                 map.forEach((val,key)=>{
//                     item['value']= parseInt(val);
//                     item['key']=key;
//                     newData.push(item);
//                     item=[];
//                 })
//                 document.getElementById('pievis').innerHTML = '';
//                 piechart(newData);
                
//             }
//         })
//     }
// }
// }