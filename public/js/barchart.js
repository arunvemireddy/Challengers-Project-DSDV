let bar_width = $('#barchart').width();
let bar_height = $('#barchart').height();
let bar_svg = d3.select("#barchart")
             .append('svg')
            .attr('width', bar_width+180)
            .attr('height', bar_height+100);
let bar_g = bar_svg.append('g');


$.ajax({
    method: 'post',
    url: '/getCountryData',
    data: JSON.stringify({ 'country': country }),
    dataType: 'json',
    contentType: 'application/json',
    success: function (data) {
        let map = new Map();

        for(let i=0;i<data.length;i++){
            if(data[i].director!=undefined){
            if(map.get(data[i].director)==undefined){
                map.set(data[i].director,1);
            }else{
                let val = map.get(data[i].director);
                val = val+1;
                map.set(data[i].director,val);
            }
            }
        }
       
        console.log('map');
        console.log(map);
        const mapSort = new Map([...map.entries()].sort((a, b) => b[1] - a[1]));
        console.log(mapSort);
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
    }
})