function barchart2() {
    let margin = {top: 20, right: 20, left: 50, bottom: 40};
    let width = 450 - margin.left - margin.right;
    let height = 450 - margin.top - margin.bottom;
    let new_data = [];
    let x;
    let xAxis
    let yAxis;
    $.ajax({
        method: "get",
        url: "/data2",
        success: function (data) {

            let map2 = new Map();

            for (let i = 0; i < data.length; i++) {
                if (data[i].cast != undefined) {
                    if (map2.get(data[i].cast) == undefined) {
                        map2.set(data[i].cast, 1);
                    } else {
                        let val = map2.get(data[i].cast);
                        val = val + 1;
                        map2.set(data[i].cast, val);
                    }
                }
            }

            console.log(map2);
            const mapSort = new Map([...map2.entries()].sort((a, b) => b[1] - a[1]));
            console.log(mapSort);
            let new_data = [];
            let item = {};
            let count = 0;
            for (const [key, value] of mapSort.entries()) {
                if (count < 10) {
                    item['key'] = key;
                    item['value'] = value;
                    new_data.push(item);
                    item = {};
                    count = count + 1;
                }
            }
            console.log(new_data);

            svg = d3.select("#cast").append("svg").attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            x = d3.scaleLinear()
                //.domain([0,13000])
                .range([0, width]);

            // Y axis
            y = d3.scaleBand()
            y.domain(new_data.map((d) => d.key))
                .range([0, height]).padding(.1);

            x.domain([0, d3.max(new_data, (d) => d.value)]);


            let bars = svg.selectAll(".bar").data(new_data).enter().append("g")
                .attr("class", "bar").attr("height", y.bandwidth()).attr('transform', d => "translate(0," + y(d.key) + ")")

            bars.append("rect").attr("width", (d) => x(d.value)).attr("height", y.bandwidth())


            xAxis = d3.axisBottom(x);
            yAxis = d3.axisLeft(y);

            svg.append("g").attr("transform", "translate(0," + height + ")").attr("id", "xAxis").call(xAxis)
            svg.append("g").attr("id", "yAxis").call(yAxis).attr("transform", "translate(10,0)");
        }
    });
    function bar2(){
        y.domain(new_data.sort((a,b)=>a.value-b.value).map2((d)=>d.key));
        d3.selectAll(".bar").attr('transform',d=>"translate(0,"+y(d.key)+")");
        d3.select("#yAxis").call(yAxis);
    }
    this.sortChart = function(){
        //console.log("sriya")
        bar2();
    }
}