let bar_margin = {top: 20, right: 20, left: 120, bottom: 40};
let bar_width = $('#barchart').width()-bar_margin.left - bar_margin.right;
let bar_height = $('#barchart').height() - bar_margin.top - bar_margin.bottom;
let bar_svg = d3.select("#barchart")
             .append('svg')
            .attr('width', bar_width+bar_margin.left+bar_margin.right)
            .attr('height', bar_height+bar_margin.top+bar_margin.bottom)
            // .append('g').attr("transform", "translate(" + bar_margin.left + "," + bar_margin.top + ")");
let bar_xScale,bar_yScale,bar_xAxis,bar_yaxis;

barChartDirector();
function barChartDirector(){
    let country = document.getElementById('country').value;
$.ajax({
    method: 'post',
    url: '/getCountryData',
    data: JSON.stringify({ 'country': country }),
    dataType: 'json',
    contentType: 'application/json',
    success: function (data) {
        let bar_map = new Map();

        for (let i = 0; i < data.length; i++) {
            if (data[i].director != undefined) {
                if(data[i].director.includes(",")) {
                    let names = data[i].director.split(",");
                    for (let i = 0; i < names.length; i++) {
                        let name= names[i].trim()
                        if (bar_map.get(name) == undefined) {
                            bar_map.set(name, 1);
                        } else {
                            let val = bar_map.get(name);
                            val = val + 1;
                            bar_map.set(name, val);
                        }
                    }
                } else
                {
                    if (bar_map.get(data[i].director) == undefined) {
                        bar_map.set(data[i].director, 1);
                    } else {
                        let val = bar_map.get(data[i].director);
                        val = val + 1;
                        bar_map.set(data[i].director, val);
                    }

                }

            }
        }
        
        const mapSort = new Map([...bar_map.entries()].sort((a, b) => b[1] - a[1]));
        //console.log(mapSort);
        let newData=[];
        let item={};
        let count=0;
        for (const [key, value] of mapSort.entries()) {
            if(count<10){
                item['key']=key;
                item['value']=value;
                newData.push(item);
                item={};
                count=count+1;
            }
        }
        bar_xScale = d3.scaleLinear()
            .range([bar_margin.left,bar_width+bar_margin.left]);
        bar_yScale = d3.scaleBand()
            .range([0,bar_height])
            .padding(0.1);
        bar_xScale.domain([0, d3.max(newData, (d) => d.value)]);
        bar_yScale.domain(newData.map(d=>d.key));

        bar_xAxis = d3.axisBottom(bar_xScale);
        bar_yAxis = d3.axisLeft(bar_yScale);
        let tickValues = bar_xScale.ticks().filter(tick => {
            return (((tick*10) % 10) === 0)
        })
        bar_xAxis.tickValues(tickValues)
            .tickFormat(d3.format('.0f'))

        bar_svg.append("g").attr('id','barxAxis').attr("transform", "translate(0," + bar_height + ")").call(bar_xAxis)
        bar_svg.append("g").attr('id','baryAxis').attr("transform", "translate("+ bar_margin.left+",0)").call(bar_yAxis);

        let bars = bar_svg.selectAll(".bar").data(newData).enter().append("g")
                .attr("class", "bar").attr('transform', d => "translate("+ bar_margin.left+"," + bar_yScale(d.key) + ")")
        bars.append("rect").attr("width", (d) => bar_xScale(d.value)-bar_margin.left).attr("height", bar_yScale.bandwidth())
       
    }
})
}


function updatebarChartDirector(value){
    let country = document.getElementById('country').value;
    if(value != 'cast'){
        $.ajax({
            method: 'post',
            url: '/getCountryData',
            data: JSON.stringify({ 'country': country }),
            dataType: 'json',
            contentType: 'application/json',
            success: function (data) {
                let type = select_type;
                let bar_map = new Map();

                for (let i = 0; i < data.length; i++) {
                    if (data[i].type === type || type === undefined) {
                        if (data[i].director !== undefined) {
                            if (data[i].director.includes(",")) {
                                let names = data[i].director.split(",");
                                for (let i = 0; i < names.length; i++) {
                                    let name = names[i].trim()
                                    if (bar_map.get(name) == undefined) {
                                        bar_map.set(name, 1);
                                    } else {
                                        let val = bar_map.get(name);
                                        val = val + 1;
                                        bar_map.set(name, val);
                                    }
                                }
                            } else {
                                if (bar_map.get(data[i].director) == undefined) {
                                    bar_map.set(data[i].director, 1);
                                } else {
                                    let val = bar_map.get(data[i].director);
                                    val = val + 1;
                                    bar_map.set(data[i].director, val);
                                }

                            }

                        }
                    }
                }

                const mapSort = new Map([...bar_map.entries()].sort((a, b) => b[1] - a[1]));
            
                let newData=[];
                let item={};
                let count=0;
                for (const [key, value] of mapSort.entries()) {
                    if(count<10){
                        item['key']=key;
                        item['value']=value;
                        newData.push(item);
                        item={};
                        count=count+1;
                    }
                }
                //bar_xScale.domain([d3.min(newData,d=>d.value),d3.max(newData,d=>d.value)]);
                bar_xScale.domain([0, d3.max(newData, (d) => d.value)]);
                let tickValues = bar_xScale.ticks().filter(tick => {
                    return (((tick*10) % 10) === 0)
                })
                bar_xAxis.tickValues(tickValues)
                    .tickFormat(d3.format('.0f'))
                d3.select('#barxAxis').call(bar_xAxis);
                bar_yScale.domain(newData.map(d=>d.key));
                d3.select("#baryAxis").call(bar_yAxis);

                bar_svg.selectAll('.bar')
                    .data(newData)
                    .join(
                        (enter)=>{
                            enter.append('g')
                            .attr('class','bar')
                                .attr('transform', d => "translate("+ bar_margin.left+"," + bar_yScale(d.key) + ")")
                            .append('rect')
                            // .transition()
                            // .duration(500)
                            .attr('width',d=>bar_xScale(d.value)-bar_margin.left)
                            .attr('height',bar_yScale.bandwidth());
                        },
                        (update)=>{
                            update.attr('transform', d => "translate("+ bar_margin.left+"," + bar_yScale(d.key) + ")")
                           .select('rect')
                           .attr('width',d=>bar_xScale(d.value)-bar_margin.left)
                           .attr('height',bar_yScale.bandwidth())
                        },
                        (exit)=>{
                            exit.remove();
                        }
                    )
            }
            })
    }else{
    
        $.ajax({
            method: 'post',
            url: '/getCountryData',
            data: JSON.stringify({ 'country': country }),
            dataType: 'json',
            contentType: 'application/json',
            success: function (data) {
                let type = select_type;
                let bar_map = new Map();

                for (let i = 0; i < data.length; i++) {
                    if (data[i].type === type || type === undefined) {
                        if (data[i].cast != undefined) {
                            if (data[i].cast.includes(",")) {
                                let names = data[i].cast.split(",");
                                for (let i = 0; i < names.length; i++) {
                                    let name = names[i].trim()
                                    if (bar_map.get(name) == undefined) {
                                        bar_map.set(name, 1);
                                    } else {
                                        let val = bar_map.get(name);
                                        val = val + 1;
                                        bar_map.set(name, val);
                                    }
                                }
                            } else {
                                if (bar_map.get(data[i].cast) == undefined) {
                                    bar_map.set(data[i].cast, 1);
                                } else {
                                    let val = bar_map.get(data[i].cast);
                                    val = val + 1;
                                    bar_map.set(data[i].cast, val);
                                }

                            }

                        }
                    }
                }
               
                
                const mapSort = new Map([...bar_map.entries()].sort((a, b) => b[1] - a[1]));
                //console.log(mapSort);
                let newData=[];
                let item={};
                let count=0;
                for (const [key, value] of mapSort.entries()) {
                    if(count<10){
                        item['key']=key;
                        item['value']=value;
                        newData.push(item);
                        item={};
                        count=count+1;
                    }
                }
                //bar_xScale.domain([d3.min(newData,d=>d.value),d3.max(newData,d=>d.value)]);
                bar_xScale.domain([0, d3.max(newData, (d) => d.value)]);
                let tickValues = bar_xScale.ticks().filter(tick => {
                    return (((tick*10) % 10) === 0)
                })
                bar_xAxis.tickValues(tickValues)
                    .tickFormat(d3.format('.0f'))
                d3.select('#barxAxis').call(bar_xAxis);
                bar_yScale.domain(newData.map(d=>d.key));
                d3.select("#baryAxis").call(bar_yAxis);

                bar_svg.selectAll('.bar')
                    .data(newData)
                    .join(
                        (enter)=>{
                            enter.append('g')
                            .attr('class','bar')
                                .attr('transform', d => "translate("+ bar_margin.left+"," + bar_yScale(d.key) + ")")
                            .append('rect')
                            .attr('width',d=>bar_xScale(d.value)-bar_margin.left)
                            .attr('height',bar_yScale.bandwidth());
                        },
                        (update)=>{
                            update.attr('transform', d => "translate("+ bar_margin.left+"," + bar_yScale(d.key) + ")")
                           .select('rect')
                           // .transition()
                           // .duration(500)
                           .attr('width',d=>bar_xScale(d.value)-bar_margin.left)
                           .attr('height',bar_yScale.bandwidth())
                        },
                        (exit)=>{
                            exit.remove();
                        }
                    )
            }
        })
    }
   
}