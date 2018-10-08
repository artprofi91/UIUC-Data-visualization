const margin = {
  top: 20,
  bottom: 50,
  right: 30,
  left: 50,
};
const width = 960 - margin.left - margin.right;
const height = 700 - margin.top - margin.bottom;
const c10 = d3.scale.category20();
const svgElement = d3
  .select('body')
  .append('svg')
  .attr({
    width: width + margin.left + margin.right,
    height: height + margin.top + margin.bottom,
  })
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
d3.json('../data_visualization_project2/data_GoT.json', dataset => {
  const nodes = dataset.nodes,
    links = dataset.links;
  const force = d3.layout
    .force()
    .size([width, height])
    .nodes(nodes)
    .links(links)
    .gravity(0.05)
    .charge(-200)
    .linkDistance(200);
  const link = svgElement
    .selectAll('.link')
    .data(links)
    .enter()
    .append('line')
    .attr('stroke-width', d => {
      return d.weight / 10;
    })
    .attr('class', 'link');
  const node = svgElement
    .selectAll('.node')
    .data(nodes)
    .enter()
    .append('g')
    .attr('class', 'node')
    .call(force.drag);
  node
    .append('text')
    .attr('dx', 12)
    .attr('dy', '0.35em')
    .attr('font-size', d => {
      return d.influence * 1.5 > 9 ? d.influence * 1.5 : 9;
    })
    .text(d => {
      return d.character;
    });
  node
    .append('circle')
    .attr('r', d => {
      return d.influence / 2 > 5 ? d.influence / 2 : 5;
    })
    .attr('fill', d => {
      return c10(d.zone * 20);
    });
  force.on('tick', function() {
    node
      .attr('r', d => {
        return d.influence;
      })
      .attr('cx', d => {
        return d.x;
      })
      .attr('cy', d => {
        return d.y;
      });
    link.attr('x1', d => {
      return d.source.x;
    });
    link.attr('y1', d => {
      return d.source.y;
    });
    link.attr('x2', d => {
      return d.target.x;
    });
    link.attr('y2', d => {
      return d.target.y;
    });
    node.attr('transform', d => {
      return 'translate(' + d.x + ',' + d.y + ')';
    });
  });
  force.start();
});
