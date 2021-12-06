
let width = $('#mapvis').width();
let height = $('#mapvis').height();
let fill = d3.scaleLog().range(['white', 'darkblue']);
let svg = d3.select("#mapvis")
    .append('svg')
    .attr('width', width+180)
    .attr('height', height+100);
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
            //    console.log(data[i].country);
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
              // console.log(data[i].country);
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

       // console.log(new_map);
        let mdata=[];
        let item={};
        new_map.forEach((val,key)=>{
            item['value']= parseInt(val);
            item['key']=key;
            mdata.push(item);
            item=[];

        })
        //console.log(mdata)
        var colorScale = d3.scaleThreshold()
                           .domain([d3.min(mdata,d=>d.value),d3.max(mdata,d=>d.value)])
                           // .domain([-110,1000])
                            .range(d3.schemeBlues[7]);
        

        d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
        .then(function (map) {

            // let Tooltip = d3.select("#mapvis")
            // .append("div")
            // .attr("class", "tooltip")
            // .style("opacity", 1)
            // .style("background-color", "white")
            // .style("border", "solid")
            // .style("border-width", "2px")
            // .style("border-radius", "5px")
            // .style("padding", "5px")
            // .style('display','inline')
            // .style('position','fixed')
            
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
                            //console.log(this.style.fill);
                        }
                    
                        document.getElementById('country').value = e.target.__data__.properties.name;

                        if(this.style.fill=='orange'){
                            barChart();
                            piedata(e.target.__data__.properties.name);
                            Linechart();
                            $('input[id=radi]').prop('checked', true);
                        }else{
                            alert('please select colored countries');
                        }
                    })
                    // .on('mousemove',function(e,d){
                    //    // d3.select(this).style('fill','black')
                    //     Tooltip.html(e.target.__data__.properties.name)
                    //     .style("left", (d3.pointer(e)[0]+40) + "px")
                    //     .style("top",  (d3.pointer(e)[1]) + "px")
                    //     .style('opacity',1);
                    // })
                    // .on('mouseleave',function(e,d){
                    //     Tooltip.style('opacity',0)
                    //  })
            })
        })
        var zoom = d3.zoom()
                    .scaleExtent([1, 8])
                     .on('zoom', function(event) {
                    g.selectAll('path')
                    .attr('transform', event.transform);
        });

        svg.call(zoom)
            // .attr("transform","translate(100,50)scale(1.5,1)");
    }
    
        
})


piedata();
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
    let width = $('#pievis').width();
    let height = $('#pievis').height();
    let svg = d3.select('#pievis')
    .append('svg')
    .attr('width', width)
    .attr('height', height+300);
    radius = Math.min(width, height) / 2;
    let g = svg.append('g')
    .attr('transform', 'translate(' + (width-20) / 2 + "," + (height+70) / 2 + ")");
    var color = d3.scaleOrdinal(d3.schemeCategory10);
    var pie = d3.pie()
      .value(function(d) {
        return d.value;
      })
      .sort(null);
    var arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius-50);

   
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
    let value=document.getElementById('country').value;
    let xLabel = 'Year';
    let yLabel = 'No of Titles';
    let margin = {top:20,right:20,left:45,bottom:30};
    let width = $('#linechart').width()-margin.top-margin.bottom;
    let height = $('#linechart').height()-margin.left-margin.right;
    let svg = d3.select('#linechart')
                .append('svg')
                .attr('width',width+margin.left+margin.right)
                .attr('height',height+margin.top+margin.bottom)
                .append('g')
                .attr('transform',"translate("+margin.left+" "+margin.top+")");
        
    let xScale = d3.scaleTime().range([0,width]);
    let yScale = d3.scaleLinear().range([height,0]);

    $.ajax({
        method: 'post',
        url: '/getCountryData',
        data: JSON.stringify({ 'country': value }),
        dataType: 'json',
        contentType: 'application/json',
        success: function (data) {
            let ob = [];
            for(let i=0;i<data.length;i++){
                data[i].date_added = new Date(data[i].date_added).getFullYear();
                    if(ob[[data[i].date_added,data[i].type]]==undefined){
                        ob[[data[i].date_added,data[i].type]]=1;
                    }else{
                        let val = ob[[data[i].date_added,data[i].type]];
                        val = val+1;
                        ob[[data[i].date_added,data[i].type]]=val;
                    }
            }
            console.log('arun');
            console.log(ob);
             let item={};
            let new_data=[];
            Object.entries(ob).forEach(d=>{
                let z=d[0].split(',');
                item['year']=z[0];
                item['type']=z[1];
                item['count']=d[1];
                new_data.push(item);
                item={};
            })

         
            new_data.sort((a, b) => new Date(a.year) - new Date(b.year))
            xScale.domain([2010,2020]);
            yScale.domain([d3.min(new_data,d=>d.count),d3.max(new_data,d=>d.count)]);
            let xAxis = d3.axisBottom(xScale); ;
            let yAxis = d3.axisLeft(yScale);
            let  dataNest = Array.from(
                d3.group(new_data, d => d.type), ([key, value]) => ({key, value})
              );
            let countline = d3.line().x(function(d) { return xScale(d.year); }).y(function(d) { return yScale(d.count); });
        

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

                    
                dataNest.forEach(function(d,i) { 
                svg.append('path')
                    .attr('fill','none')
                    .attr('stroke',function(){
                         
                        if(d.key=='TV Show'){
                            return 'orange';
                        }else{
                            return 'steelblue';
                        }
                        return 'black';
                    })
                    .attr("stroke-width", 1.5)
                    .attr('d',countline(d.value))
                    
                });
                
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