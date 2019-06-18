let height = 700,width = 700, padding = 200,yearData,rScale,fScale;

d3.queue()
    .defer(d3.csv, './Exports/exports.csv',formatter)
    .defer(d3.csv, './imports/imports.csv',formatter)
    .defer(d3.csv, './gdp/gdp.csv',formatter)
    .defer(d3.csv, './population/population.csv',formatter)
    .awaitAll((error, data)=>{
        yearData = formatAllData(data)
        console.log(yearData)

        d3.select('svg')
            .attr('height', height)
            .attr('width', width)
    let maxMin = d3.extent(Object.keys(yearData).map(year=>+year))
makeGraph(maxMin[0]);


d3.select('svg')
    .append('g')
    .attr('transform',`translate(0,${height-padding+30})`)
    .classed('x-axis',true);

d3.select('svg')
    .append('g')
    .attr('transform',`translate(${padding-30}, 0)`)
    .classed('y-axis',true);

d3.select('svg')
    .append('text')
    .attr('x', 30)
    .attr('y', height-30)
    .style('text-anchor','middle')
    .text('imports');
d3.select('input')
    .attr('min',maxMin[0])
    .attr('max',maxMin[1])
    .attr('value',maxMin[0])
    .on('input', ()=>makeGraph(+d3.event.target.value))

    })

function makeGraph(year){
    let yearArr = yearData[year];
    let xScale = d3.scaleLinear()
                    .domain(d3.extent(yearArr,d=>d.exports/10e9))
                    .range([padding,width-padding]);
    let yScale = d3.scaleLinear()
                    .domain(d3.extent(yearArr, d=>d.imports/10e9))
                    .range([height-padding,padding]);

    rScale = d3.scaleLinear()
                    .domain(d3.extent(yearArr, d=>d.gdp/d.population))
                    .range([15,30]);

    fScale = d3.scaleLinear()
                    .domain([0,1])
                    .range(['lightgreen','brown']);
d3.select('.x-axis')
    .call(d3.axisBottom(xScale))

d3.select('.y-axis')
    .call(d3.axisLeft(yScale))

  let update = d3.select('svg')
                    .selectAll('circle')
                    .data(yearArr,d=>d.country)
     update
        .exit()
        .transition()
        .duration(500)
        .attr('r',0)
        .remove()

    update
        .enter()
        .append('circle')
        .attr('cx', d=>xScale(d.exports)/10e9)
        .attr('cy', d=>yScale(d.imports)/10e9)
        .merge(update)
        .transition()
        .delay((d,i)=>i*5)
        .attr('fill', d=>fScale(d.population/1e9))
        .attr('r', d=>rScale(d.gdp/d.population))

}

function  formatAllData(data){
    let yearObj = {};
    data.forEach(arr=>{
        let indicator = arr[0].indicator.split(' ')[0].replace(',','').toLowerCase();
        arr.forEach(obj=>{
            let country = obj.country;
            for(let key in obj){
                if(parseInt(key)){
                    if(!yearObj[key]) yearObj[key] = [];
                    let yearArr = yearObj[key];
                    let countryObj = yearArr.find(el=>el.country ==country);
                    if(countryObj) countryObj[indicator] = obj[key]
                    else{
                        yearArr.push({
                            country : country,
                            [indicator] : obj[key]
                        })
                    }
                }
            }
        })
    })
    for(let key in yearObj){
        yearObj[key] = yearObj[key].filter(validCountry);
        if(yearObj[key].length == 0) delete yearObj[keyy];
    }
    return yearObj;
}
function validCountry(d){
    for(let key in d){
        if(d[key] == null){
            return false;
        }
    }
    return true
}
function formatter(data){
    let obj = {
        country: data['Country Name'],
        indicator: data['Indicator Name']
    };
    for(let key in data){
        if(parseInt(key)) obj[key] = +data[key] || null;
    }
    return obj;
}