const svg = d3.select('svg');
const width = 960;
const height = 600;
const margin = { top: 40, left: 65, right: 175, bottom: 50 };
const innerHeight = height - margin.top - margin.bottom;
const innerWidth = width - margin.left - margin.right;
const temps = {
  Glob: d => {
    return +d.Glob;
  },
  NHem: d => {
    return +d.NHem;
  },
  SHem: d => {
    return +d.SHem;
  },
};
const labels = {
  Glob: 'Global',
  NHem: 'Northern Hemisphere',
  SHem: 'Southern Hemisphere',
};
const colors = ['#b71d1d', '#eb7819', '#0d8b7a'];
d3.csv('ExcelFormattedGISTEMPData2CSV.csv', function(data) {
  const x = d3.scale.linear().range([0, innerWidth]);
  x.domain(
    d3.extent(data, d => {
      return +d.Year;
    }),
  );
  const y = d3.scale.linear().range([innerHeight, 0]);
  y.domain([
    d3.min(data, d => {
      return d3.min([+d.Glob, +d.NHem, d.SHem]);
    }),
    d3.max(data, d => {
      return d3.max([+d.Glob, +d.NHem, d.SHem]);
    }),
  ]);
  svg
    .append('g')
    .attr('class', 'title')
    .attr(
      'transform',
      'translate(' + (margin.left + innerWidth / 2) + ', ' + 22 + ')',
    )
    .append('text')
    .attr('text-anchor', 'middle')
    .text('Changes in Global and Hemispheric Temperatures');
  svg
    .append('g')
    .attr('transform', 'translate(' + 25 + ', ' + height / 2 + ')')
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('transform', 'rotate(-90)')
    .text('Deviation');
  svg
    .append('g')
    .attr(
      'transform',
      'translate(' + (margin.left + innerWidth / 2) + ', ' + (height - 3) + ')',
    )
    .append('text')
    .text('Year');

  const ordinalScale = d3.scale
    .ordinal()
    .domain(Object.values(labels))
    .range(colors);
  const legend = d3legend()
    .labelFormat('none')
    .cellPadding(5)
    .units('')
    .orientation('vertical')
    .cellWidth(25)
    .cellHeight(18)
    .inputScale(ordinalScale)
    .cellStepping(10);
  svg
    .append('g')
    .attr(
      'transform',
      'translate(' + (margin.left + innerWidth + 15) + ',' + '20' + ')',
    )
    .attr('class', 'legend')
    .call(legend);
  const g = svg
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  const xAxis = d3.svg
    .axis()
    .scale(x)
    .orient('bottom')
    .ticks(16, '.f');
  const yAxis = d3.svg
    .axis()
    .scale(y)
    .orient('left');
  g.selectAll('g.x').remove();
  g.selectAll('g.x')
    .data([data])
    .enter()
    .append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + innerHeight + ')')
    .call(xAxis);
  g.selectAll('g.y').remove();
  g.selectAll('g.y')
    .data([data])
    .enter()
    .append('g')
    .attr('class', 'y axis')
    .call(yAxis);

  const regionTemps = Object.keys(temps).map(tempName => {
    return {
      name: tempName,
      values: data.map(d => {
        return {
          date: d.Year,
          temperature: +d[tempName],
        };
      }),
    };
  });

  const line = d3.svg
    .line()
    .interpolate('basis')
    .x(d => {
      return x(d.date);
    })
    .y(function(d) {
      return y(d.temperature);
    });
  const region = g
    .selectAll('.region')
    .data(regionTemps)
    .enter()
    .append('g')
    .attr('class', 'region');
  region
    .append('path')
    .attr('class', 'line')
    .attr('d', d => {
      return line(d.values);
    })
    .style('stroke', (d, i) => {
      return colors[i];
    });

  const mouseG = g.append('g').attr('class', 'mouse-over-effects');
  mouseG
    .append('path')
    .attr('class', 'mouse-line')
    .style('stroke', 'black')
    .style('stroke-width', '1px')
    .style('opacity', '0');
  const lines = document.getElementsByClassName('line');
  const mousePerLine = mouseG
    .selectAll('.mouse-per-line')
    .data(regionTemps)
    .enter()
    .append('g')
    .attr('class', 'mouse-per-line');
  mousePerLine
    .append('circle')
    .attr('r', 7)
    .style('stroke', (d, i) => {
      return colors[i];
    })
    .style('fill', (d, i) => {
      return colors[i];
    })
    .style('stroke-width', '1px')
    .style('opacity', '0');
  mousePerLine
    .append('rect')
    .attr('transform', 'translate(10,-13)')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', 50)
    .attr('height', 20)
    .style('fill', (d, i) => {
      return colors[i];
    })
    .style('opacity', 0);
  mousePerLine.append('text').attr('transform', 'translate(10,3)');
  mouseG
    .append('svg:rect')
    .attr('width', innerWidth)
    .attr('height', innerHeight)
    .attr('fill', 'none')
    .attr('pointer-events', 'all')
    .on('mouseout', () => mouseMove('0'))
    .on('mouseover', () => mouseMove('1'))
    .on('mousemove', function() {
      const mouse = d3.mouse(this);
      d3.select('.mouse-line').attr('d', () => {
        let d = 'M' + mouse[0] + ',' + innerHeight;
        d += ' ' + mouse[0] + ',' + 0;
        return d;
      });
      d3.selectAll('.mouse-per-line').attr('transform', function(d, i) {
        const xYear = x.invert(mouse[0]),
          bisect = d3.bisector(d => {
            return d.date;
          }).right;
        idx = bisect(d.values, xYear);
        let beginning = 0,
          end = lines[i].getTotalLength(),
          target = null;
        while (true) {
          target = Math.floor((beginning + end) / 2);
          pos = lines[i].getPointAtLength(target);
          if ((target === end || target === beginning) && pos.x !== mouse[0]) {
            break;
          }
          if (pos.x > mouse[0]) end = target;
          else if (pos.x < mouse[0]) beginning = target;
          else break;
        }
        d3.select(this)
          .select('text')
          .text(y.invert(pos.y).toFixed(2));
        return 'translate(' + mouse[0] + ',' + pos.y + ')';
      });
    });
});
let mouseMove = opacity => {
  d3.select('.mouse-line').style('opacity', opacity);
  d3.selectAll('.mouse-per-line circle').style('opacity', opacity);
  d3.selectAll('.mouse-per-line text').style('opacity', opacity);
  d3.selectAll('.mouse-per-line rect').style('opacity', opacity);
};
