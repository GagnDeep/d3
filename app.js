// let fs = require('fs');
// let d3 = require('d3')
// let createStream = fs.createWriteStream('data.json');
// createStream.end()
let width       = 700,
    height      = 700,
    padding     = 100,
    yearData,xScale,yScale,fScale,rScale;

d3.queue()
  .defer(d3.json, './data.json')
  // .defer(d3.csv, './data/methane/API_EN.ATM.METH.KT.CE_DS2_en_csv_v2.csv', formatter)
  // .defer(d3.csv, './data/renewable/API_EG.FEC.RNEW.ZS_DS2_en_csv_v2.csv', formatter)
  // .defer(d3.csv, './data/population/API_SP.POP.TOTL_DS2_en_csv_v2.csv', formatter)
  // .defer(d3.csv, './data/urban_population/API_SP.URB.TOTL_DS2_en_csv_v2.csv', formatter)
  .awaitAll(function(error, data){
    if(error) throw error;
    yearData = data[0];

    let maxMin = d3.extent(Object.keys(yearData).map(year=>+year));



    rScale  = d3.scaleLinear()
                      .domain([0,1])
                      .range([5,30]);

    fScale  = d3.scaleLinear()
                      .domain([0,100])
                      .range(['black','green']);

    let svg = svgSetup();

    svg
      .append('g')
      .attr('transform', `translate(0, ${width-padding+30})`)
      .classed('x-axis',true);

    svg
      .append('g')
        .attr('transform', `translate(${padding - 30},0)`)
        .classed('y-axis', true);

    svg
      .append('text')
      .text('CO2 emissions (kt per person)')
      .attr('x',width/2)
      .attr('y',height)
      .attr('dy', '-1.5em')
      .style('text-anchor', 'middle');

    svg
      .append('text')
      .text('Methane emission (kt of CO2 equivalent per person)')
      .attr('transform', 'rotate(-90)')
      .attr('x',-width/2)
      .attr('y','1.5em')
      .style('text-anchor', 'middle');

    svg
      .append('text')
      .attr('x', width/2)
      .attr('y', '2em')
      .style('text-anchor','middle')
      .style('font-size', '1.5em')
      .classed('title',true);



    updateGraph(maxMin[0]);

    d3.select('input')
        .attr('min',maxMin[0])
        .attr('max',maxMin[1])
        .attr('value',maxMin[0])
        .on('input',function(){
          updateGraph(+d3.event.target.value)
        })
})
function updateGraph(year){
  let yearArr = yearData[year];
  updateScales(year);
  let update = d3.select('.chart')
                   .selectAll('circle')
                   .data(yearArr, d=>d.region);

      d3.select('.x-axis')
          .call(d3.axisBottom(xScale));;

      d3.select('.y-axis')
          .call(d3.axisLeft(yScale));

      d3.select('.title')
          .text(`Methane vs CO2 emission per capita (${year})`);
      update
        .exit()
        .transition()
        .duration(500)
        .attr('r',0)
        .remove()

      update
        .enter()
        .append('circle')
        .on('mousemove touchstart', showToolTip)
        .on('mouseout touchend', hideToolTip)
        .attr('cx', d=>xScale(d.co2/d.population))
        .attr('cy', d=>yScale(d.methane/d.population))
        .attr('stroke', 'white')
        .attr('stroke-width', 1)
        .on('click', d=>console.log(d.region))
        .merge(update)
        .transition()
        .duration(500)
        .delay((d,i)=>i*5)
        .attr('cx', d=>xScale(d.co2/d.population))
        .attr('cy', d=>yScale(d.methane/d.population))
        .attr('r', d=>rScale(d.urban/d.population))
        .attr('fill', d=>fScale(d.renewable));

}

function showToolTip(d) {
      var tooltip = d3.select('.tooltip');
      tooltip
          .style('opacity', 1)
          .style('left', ( d3.event.pageX - tooltip.node().offsetWidth / 2 - 4) + 'px' )
          .style('top', ( d3.event.pageY +10 ) + 'px')
          .html(`
             <p>Region: ${d.region}</p>
             <p>Methane per capita: ${(d.methane / d.population).toFixed(4)}</p>
             <p>CO2 per capita: ${(d.co2 / d.population).toFixed(4)}</p>
             <p>Renewable energy: ${d.renewable.toFixed(2)}%</p>
             <p>Urban population: ${(d.urban / d.population * 100).toFixed(2)}%</p>
          `)
    }

function hideToolTip(){
    d3.select('.tooltip').style('opacity', 0)
}


function updateScales(year){
    xScale = d3.scaleLinear()
                    .domain(d3.extent(yearData[year], d=>d.co2/d.population))
                    .range([padding, width-padding]);

    yScale = d3.scaleLinear()
                    .domain(d3.extent(yearData[year], d=>d.methane/d.population))
                    .range([height-padding, padding]);
}
function svgSetup(){
  return d3.select('svg')
      .attr('height',height)
      .attr('width', width)
      .classed('chart', true);
}

// function formatAllData(data){
//   let yearObj = {};
//   data.forEach(arr=>{
//     var indicator = arr[0].indicator.split(' ')[0].replace(',', '').toLowerCase()
//     arr.forEach(obj=>{
//       let region = obj.region;
//       for(let year in obj){
//         if(parseInt(year)){
//           if(!yearObj[year]) yearObj[year] = [];
//           let yearArr = yearObj[year];
//           let regionObj = yearArr.find(d=>d.region === region);
//           if(regionObj) regionObj[indicator] = obj[year];
//           else {
//             yearArr.push({
//               region : region,
//               [indicator] : obj[year]
//             })
//           }
//         }
//       }
//     })
//   })
//   for(let year in yearObj){
//     yearObj[year] = yearObj[year].filter(validRegion);
//     if(yearObj[year].length === 0) delete yearObj[year];
//   }
//   return yearObj;
// }
// function validRegion(d){
//   for(let key in d){
//     if(d[key] == null) return false;
//   }
//     return true;
// }

// function formatter(row){
//   let invalidRows = [
//     "Arab World",
//     "Central Europe and the Baltics",
//     "Caribbean small states",
//     "East Asia & Pacific (excluding high income)",
//     "Early-demographic dividend",
//     "East Asia & Pacific",
//     "Europe & Central Asia (excluding high income)",
//     "Europe & Central Asia",
//     "Euro area",
//     "European Union",
//     "Fragile and conflict affected situations",
//     "High income",
//     "Heavily indebted poor countries (HIPC)",
//     "IBRD only",
//     "IDA & IBRD total",
//     "IDA total",
//     "IDA blend",
//     "IDA only",
//     "Not classified",
//     "Latin America & Caribbean (excluding high income)",
//     "Latin America & Caribbean",
//     "Least developed countries: UN classification",
//     "Low income",
//     "Lower middle income",
//     "Low & middle income",
//     "Late-demographic dividend",
//     "Middle East & North Africa",
//     "Middle income",
//     "Middle East & North Africa (excluding high income)",
//     "North America",
//     "OECD members",
//     "Other small states",
//     "Pre-demographic dividend",
//     "Pacific island small states",
//     "Post-demographic dividend",
//     "Sub-Saharan Africa (excluding high income)",
//     "Sub-Saharan Africa",
//     "Small states",
//     "East Asia & Pacific (IDA & IBRD countries)",
//     "Europe & Central Asia (IDA & IBRD countries)",
//     "Latin America & the Caribbean (IDA & IBRD countries)",
//     "Middle East & North Africa (IDA & IBRD countries)",
//     "South Asia (IDA & IBRD)",
//     "Sub-Saharan Africa (IDA & IBRD countries)",
//     "Upper middle income",
//     "World"
//   ];
//   let obj = {
//     region : row['Country Name'],
//     indicator : row['Indicator Name']
//   };
//   if(invalidRows.indexOf(obj.region)>-1) return;
//   for(let key in row){
//     if(parseInt(key)) obj[key] = +row[key] || null;
//   }
//   return obj;
// }