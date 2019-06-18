d3.json('sample_geo.json', (err,data)=>{
	if(err) throw err;
	let width = 600,height = 600, path = d3.geoPath()
	d3.select('svg')
		.attr('height', height)
		.attr('width', width)
		.selectAll('path')
		.data(data.features)
		.enter()
		.append('path')
		.attr('d', path)
		.attr('fill', d=>d.properties.color)
})