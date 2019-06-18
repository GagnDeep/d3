// // write your code here!
// d3.json('./countries.json', (error,data)=>{
//     if(error) throw error;
//     d3.select('body')
//     .selectAll('h3')
//     .data(data.geonames)
//     .enter()
//     .append('h3')
//     .text(d=>d.countryName)
//     console.log(data)
// })

d3.queue()
    .defer(d3.json, './countries.json')
    .defer(d3.csv, './simplemaps-worldcities-basic.csv', function(row){
        if(+row.pop<10000) return; else return ({
            cityName : row.city,
            countryCode : row.iso2,
            population : +row.pop
        });
    })
    .await((err, countries, cities)=>{
        if(err) throw err;
        let data = countries.geonames.map(country=>{
            country.cities = cities.filter(city => city.countryCode === country.countryCode);
            return country;
        })
        console.log(data);
        console.log(cities)
        let countrySelection = d3.select('body')
                                    .selectAll('div')
                                    .data(data)
                                    .enter()
                                    .append('div')

            countrySelection
                .append('h3')
                .text(d=>d.countryName);
            countrySelection
                .append('ul')
                .html(d=>d.cities.map(city=>{
                    let percentage = city.population/d.population *100;
                    return `<li>${city.cityName} - ${percentage.toFixed(2)}%</li>`
                }).join(''))
    })

// d3.csv('./simplemaps-worldcities-basic.csv', (row)=>row.pop<1000?null:({cityName : row.city, countryCode:row.iso2, population:+row.pop}), (err,data)=>{
//     if(err) throw err;
//     console.log(data)
// })