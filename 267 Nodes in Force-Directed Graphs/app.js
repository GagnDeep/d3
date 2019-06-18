var width = 600;
var height = 600;

var nodes = [
  { color: "red", size: 15, },
  { color: "orange", size: 20 },
  { color: "yellow", size: 30 },
  { color: "green", size: 35 },
  { color: "blue", size: 40 },
  { color: "purple", size: 50 }
];

var svg = d3.select("svg")
              .attr("width", width)
              .attr("height", height);

var nodeSelection = svg
                      .selectAll("circle")
                      .data(nodes)
                      .enter()
                      .append("circle")
                        .attr("r", d => d.size)
                        .attr("fill", d => d.color);

let simulation = d3.forceSimulation(nodes);

simulation.force('center', d3.forceCenter(width/2, height/2))
          .force('nodes', d3.forceManyBody().strength(+1350))
            .on('tick', ()=>{
              nodeSelection
                .attr('cx', d=>d.x)
                .attr('cy', d=>d.y)
            })