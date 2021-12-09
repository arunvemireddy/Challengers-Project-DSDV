let bar_margin = {top: 20, right: 20, left: 100, bottom: 40};
let bar_width = $('#barchart').width()-bar_margin.left - bar_margin.right;
let bar_height = $('#barchart').height() - bar_margin.top - bar_margin.bottom;
let bar_svg = d3.select("#barchart")
             .append('svg')
            .attr('width', bar_width+bar_margin.left+bar_margin.right)
            .attr('height', bar_height+bar_margin.top+bar_margin.bottom)
            // .append('g').attr("transform", "translate(" + bar_margin.left + "," + bar_margin.top + ")");
let bar_xScale,bar_yScale,bar_xAxis,bar_yaxis;


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
        console.log(newData);
        bar_xScale = d3.scaleLinear().range([bar_margin.left,width]);
        bar_yScale = d3.scaleBand().range([0,height]);
        bar_xScale.domain([0, d3.max(newData, (d) => d.value)]);
        bar_yScale.domain(newData.map(d=>d.key));

        bar_xAxis = d3.axisBottom(bar_xScale);
        bar_yAxis = d3.axisLeft(bar_yScale);

        bar_svg.append("g").attr("transform", "translate(0," + bar_height + ")").attr("id", "xAxis").call(bar_xAxis)
        bar_svg.append("g").attr("transform", "translate("+ bar_margin.left+",0)").call(bar_yAxis).attr('id','baryAxis');

        let bars = bar_svg.selectAll(".bar").data(newData).enter().append("g")
                .attr("class", "bar").attr("height", bar_yScale.bandwidth()).attr('transform', d => "translate("+ bar_margin.left+"," + bar_yScale(d.key) + ")")
        bars.append("rect").attr("width", (d) => bar_xScale(d.value)).attr("height", bar_yScale.bandwidth()-10)
       
    }
})