
let width = $('#mapvis').width();
let height = $('#mapvis').height();
let fill = d3.scaleLog().range(['white', 'darkblue']);
let svg = d3.select("#mapvis")
    .append('svg')
    .attr('width', width)
    .attr('height', height-35);
let g = svg.append('g');

let new_data = {};
let countries_data = [];
let select_type;


$.ajax({
    method: 'get',
    url: '/getCountries',
    success: function (data) {
        for (let i = 0; i < data.length; i++) {
            if (data[i].country === 'United States') {
                data[i].country = 'united states of america';
            }
           if(data[i].country.includes(",")){
            //    console.log(data[i].country);
               let val = data[i].country.split(",");
               for(let i=0;i<val.length;i++){
                if (val[i].country === 'United States') {
                    val[i].country = 'united states of america';
                }
                   countries_data.push(val[i].trim().toLowerCase());
               }
           }else{
                countries_data.push(data[i].country.trim().toLowerCase());
           }
        }

        //console.log(countries_data)

        let new_map = new Map();
        for (let i = 0; i < data.length; i++) {
            data[i].country = data[i].country.trim().toLowerCase();
            if (data[i].country === 'United States') {
                data[i].country = 'united states of america';
            }
           if(data[i].country.includes(",")){
              // console.log(data[i].country);
               let val = data[i].country.split(",");
               for(let i=0;i<val.length;i++){
                if (val[i].trim() === 'United States') {
                    val[i] = 'united states of america';
                }
                   if(new_map.get(val[i].trim())===undefined){
                    new_map.set(val[i].trim(),1);
                   }else{
                       v = new_map.get(val[i].trim());
                       v=v+1;
                       new_map.set(val[i].trim(),v);
                   }
                   
               }
           }else{
            if(new_map.get(data[i].country)===undefined){
                    new_map.set(data[i].country,1);
               }else{
                   v = new_map.get(data[i].country);
                   v=v+1;
                   new_map.set(data[i].country,v);
               }
           }
        }

       //console.log(new_map);
        let mdata=[];
        let item={};
        new_map.forEach((val,key)=>{
            item['value']= parseInt(val);
            item['key']=key;
            mdata.push(item);
            item=[];

        })
        //console.log(mdata)
        let colors = d3.schemeBlues[9]
        colors = colors.slice(1)
        //console.log(colors)
        colors = ['#deebf7', '#9ecae1', '#2171b5', '#08306b']
        let fill = d3.scaleQuantile().range(colors)
        let min = d3.min(mdata,d=>d.value)
        let max = d3.max(mdata,d=>d.value)
        fill.domain([min,max])
        // var colorScale = d3.scaleThreshold()
        //                    .domain([d3.min(mdata,d=>d.value),d3.max(mdata,d=>d.value)])
        //                    // .domain([-110,1000])
        //                     .range(d3.schemeBlues[7]);
        

        d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
        .then(function (map) {
            let Tooltip = d3.select("#mapvis")
            .append("span")
            .style("opacity", 1)
            .style('color','rgb(255, 0, 0)')
            .style('font-weight','bolder')
            .style("background-color", "none")
            .style("border", "solid")
            .style("border-width", "0px")
            .style("border-radius", "0px")
            .style("padding", "5px")
            .style('display','inline')
            .style('position','absolute')
            
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
                    .attr('id', d => d.properties.name.toLowerCase())
                    .style('color', function (d) {
                        let name = d.properties.name.toLowerCase();
                        if (countries_data.includes(name.toString())) {
                            //return colorScale(new_map.get(d.properties.name));
                            //return 'rgb(52, 235, 229)';
                            return fill(new_map.get(name))
                        } else {
                            return 'white';
                        }
                    })
                    .style('fill', function(d) {
                        return document.getElementById(d.properties.name.toLowerCase()).style.color
                    })
                    .on('click', function (e, d) {
                        let name = e.target.__data__.properties.name.trim().toLowerCase()
                        if (new_map.get(name) !== undefined) {
                            d3.selectAll('.countryClass').each(function(d) {
                                d3.select(this).style('fill', function(d) {
                                    return document.getElementById(this.id).style.color
                                })
                            })
                            d3.select(this).style('fill', 'orange').attr('class', 'countryClass');
                            //console.log(this.style.fill);
                        }
                    
                        document.getElementById('country').value = e.target.__data__.properties.name;

                        if(this.style.fill==='orange'){
                            barChart();
                            piedata(e.target.__data__.properties.name);
                            Linechart();
                            $('input[id=radi]').prop('checked', true);
                        }else{
                            alert('There is no data for the selected country. Please select a colored country.');
                        }
                    })
                    .on('mouseover',function(e,d){
                        d3.select(this).style('cursor','pointer');
                    })
                    .on('mousemove',function(e,d){
                    //    d3.select(this).style('fill','black')
                    //    document.getElementById('country').value=e.target.__data__.properties.name;
                        Tooltip.html(e.target.__data__.properties.name)
                        .style("left", (d3.pointer(e)[0]+5) + "px")
                        .style("top",  (d3.pointer(e)[1]-10) + "px")
                        .style('opacity',1);
                        
                    })
                    .on('mouseleave',function(e,d){
                        Tooltip.style('opacity',0)
                     })
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
            let mapAsc = new Map([...map.entries()].sort());
            let newData=[];
            let item={};
            document.getElementById('pievis').innerHTML = '';
            
            mapAsc.forEach((val,key)=>{
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
    let pie_margin ={top:20,right:20,left:45,bottom:30};
    let pie_width = $('#pievis').width()-pie_margin.left-pie_margin.right;
    let pie_height = $('#pievis').height()-pie_margin.top-pie_margin.bottom;
    let pie_svg = d3.select('#pievis')
                    .append('svg')
                    .attr('width', pie_width+pie_margin.left+pie_margin.right)
                    .attr('height', pie_height+pie_margin.top+pie_margin.bottom)
                    .append('g').attr("transform","translate(" + pie_margin.left + " , " + pie_margin.top + ")");;

    let pie_xLabel = 'Type';
    let pie_yLabel = 'Total Shows';

    let pie_xScale = d3.scaleBand().range([0,pie_width]);
    let pie_yScale = d3.scaleLinear().range([pie_height,0]);

    
    pie_xScale.domain(ndata.map(d=>d.key));
    pie_yScale.domain([0,d3.max(ndata,d=>d.value)]);

    let pie_xAxis= d3.axisBottom(pie_xScale);
    let pie_yAxis=d3.axisLeft(pie_yScale);

    pie_svg.append('g')
        .attr("transform","translate("+0+","+(pie_height)+")")
        .attr('id','xAxis')
        .call(pie_xAxis)
        .append('text')
        .attr('class','label')
        .attr('id','xtextValue')
        .attr('x',pie_width)
        .attr('y',15)
        .text(pie_xLabel).attr('fill','black');

    pie_svg.append('g')
        .call(pie_yAxis)
        .append('text')
        .attr('class','label')
        .attr('transform','rotate(-90)')
        .attr('y',15).text(pie_yLabel).attr('fill','black');


    pie_svg.selectAll('rect')
        .data(ndata)
        .enter()
        .append('rect')
        .attr('class','rectangle')
        .attr('fill',function(d){
            if(select_type===d.key){
                return 'orange';
            }
            else{
                return '#9ecae1';
            }
        })
        .attr('x',d=>pie_xScale(d.key)+40)
        .attr('y',d=>pie_yScale(d.value))
        .attr('width',pie_xScale.bandwidth()-80)
        .attr("height",d=>pie_height-pie_yScale(d.value))
        .on('click',function(e,i){
            d3.selectAll('.rectangle').attr('fill','#9ecae1');
            d3.select(this).attr('fill','orange');
            select_type=i.key;
            Linechart();
            barChart();
        })
        .on('mouseover',function(e,i){
            pie_svg.append('text').attr('class','pietext').text(i.value).attr('x',p=>pie_xScale(i.key)+40).attr('y',q=>pie_yScale(i.value)).style('fill','red');
        })
        .on('mouseleave',function(e,i){
            pie_svg.selectAll('.pietext').text('');
        })
    }
}

// function updatePieChart(){
//     pie_svg.selectAll('rect')
//         .data(ndata)
//         .join(
//             (enter)=>{
//                 enter.append('g')
//                 .attr('class','rectangle')
//                 .append('rect')
//                 .attr('x',d=>xScale(d.key)+40)
//                 .attr('y',d=>yScale(d.value))
//                 .transition()
//                 .duration(500)
//                 .attr('width',xScale.bandwidth()-80)
//                 .attr("height",d=>pie_height-yScale(d.value))
//                 .attr('fill',function(d){
//                     if(select_type===d.key){
//                         return 'orange';
//                     }
//                     else{
//                         return '#9ecae1';
//                     }
//                 })
               
//             },
//             (exit)=>{
//                 exit.remove();
//             }
            
//         )
// }

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
                .attr('width',width-margin.left-margin.right)
                .attr('height',height+margin.top+margin.bottom)
                .append('g')
                .attr('transform',"translate("+margin.left+" "+margin.top+")");
        
    let xScale = d3.scaleTime().range([0,width-120]);
    let yScale = d3.scaleLinear().range([height,30]);

    svg.append('text').text('Ratings By Release Year').attr('class', 'ratings-label').attr('x',(width/2)-margin.left).attr('y',10);

    $.ajax({
        method: 'post',
        url: '/getCountryData',
        data: JSON.stringify({ 'country': value }),
        dataType: 'json',
        contentType: 'application/json',
        success: function (data) {
            let ob = [];
            let ty='rating';
            let movieortv =select_type;
            //console.log('movieortv');
            //console.log(movieortv);
       
                for(let i=0;i<data.length;i++){
                    
                    data[i].date_added = new Date(data[i].date_added).getFullYear();
                    if(!isNaN(data[i].date_added)){
                        if(movieortv==data[i].type){
                        if(ob[[data[i].date_added,data[i].rating]]==undefined){
                            ob[[data[i].date_added,data[i].rating]]=1;
                        }else{
                            let val = ob[[data[i].date_added,data[i].rating]];
                            val = val+1;
                            ob[[data[i].date_added,data[i].rating]]=val;
                        }
                    }

                    if(movieortv==undefined){
                        if(ob[[data[i].date_added,data[i].rating]]==undefined){
                            ob[[data[i].date_added,data[i].rating]]=1;
                        }else{
                            let val = ob[[data[i].date_added,data[i].rating]];
                            val = val+1;
                            ob[[data[i].date_added,data[i].rating]]=val;
                        }
                    }
                }
                 }

            
            //console.log(ob);
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
            let color = d3.scaleOrdinal().range(['rgb(255,0,0)','green','yellow','grey','black','brown','orange','blue','steelblue',
            'rgb(168, 50, 168)','rgb(0, 255, 242)','rgb(119, 0, 255)','rgb(81, 255, 0)','rgb(255, 0, 136)']);
           
         
            new_data.sort((a, b) => new Date(a.year) - new Date(b.year))
            xScale.domain(d3.extent(new_data, d => new Date(d.year)));
            yScale.domain([d3.min(new_data,d=>d.count),d3.max(new_data,d=>d.count)]);
            let xAxis = d3.axisBottom(xScale);
            let yAxis = d3.axisLeft(yScale);
            let  dataNest = Array.from(
                d3.group(new_data, d => d.type), ([key, value]) => ({key, value})
              );
            let countline = d3.line().x(function(d) { return xScale(new Date(d.year)); }).y(function(d) { return yScale(d.count); });
        

            svg.append('g')
                .attr("transform","translate(0,"+height+")")
                .call(xAxis).attr('class','xAxisLine')
                .append('text')
                .attr('class','label')
                .attr('x',width-120)
                .attr('y',15)
                .text(xLabel)
                .attr('class','texLabel');

            svg.append('g')
                .call(yAxis)
                .attr('class','yAxisLine')
                .append('text')
                .attr('class','label')
                .attr('transform','rotate(-90)')
                .attr('y',15)
                .attr('x', -30)
                .text(yLabel)
                .attr('class','texLabel');

                    
                dataNest.forEach(function(d,i) { 
                svg.append('path')
                    .attr('fill','none')
                    .attr('stroke',function(){
                        return color(d.key)
                    })
                    .attr("stroke-width", 3.5)
                    .attr('d',countline(d.value))
                    
                });
                let legend= svg.selectAll(".legend")
                                .data(color.domain())
                                .enter().append('g')
                                .attr('class','legend');
                legend.attr('transform',(d,i)=>'translate('+30+','+(30 + 15*i)+')');
                legend.append("rect").attr('width',10).attr('height',10).style('fill',d=>color(d)).attr('class',d=>d);
                legend.append('text').text(d=>d).attr('x',15).attr('y',10).style('fill','black');
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