d3.queue()
    .defer(d3.json, '//unpkg.com/world-atlas@1.1.4/world/50m.json')
    .defer(d3.csv, './country_data.csv', formatter)
    .await((err, mapData, populationData)=>{
        if(err) throw err;

        let geoData = topojson.feature(mapData, mapData.objects.countries).features;
        populationData.forEach(row=>{
            let countries = geoData.filter(d=>d.id == row.countryCode);
            countries.forEach(country=>country.properties = row);
        })

        let height = 600, width = 960, projection = d3.geoMercator().scale(123).translate([width/2, height/1.4]),
        path = d3.geoPath().projection(projection);

        d3.select('svg')
            .attr('height', height)
            .attr('width', width)
              .selectAll('path')
              .data(geoData)
              .enter()
              .append('path')
              .classed('country', true)
              .attr('d', path)
        d3.select('select').on('change',d=>{
            console.log(d3.event.target.value);
            setColor(d3.event.target.value)
        });

        setColor(d3.select('select').property('value'));

        function setColor(val){
            var colorRanges = {
                population: ["white", "purple"],
                populationDensity: ["white", "red"],
                medianAge: ["white", "black"],
                fertilityRate: ["black", "orange"]
            };
            let scale = d3.scaleLinear()
                            .domain([0, d3.max(populationData, d=>d[val])])
                            .range(colorRanges[val]);

                d3.selectAll('.country')
                    .transition()
                    .duration(750)
                    .ease(d3.easeBackIn)
                    .attr('fill', d=>{
                        let data = d.properties[val]
                        return data ? scale(data) : '#ccc';
                    })
            }


    })


function formatter(row){
    return {
            population : +row.population,
            populationDensity : +row.population/+row.landArea,
            fertilityRate : +row.fertilityRate,
            medianAge : +row.medianAge,
            country : row.country,
            countryCode : +row.countryCode
        }
}