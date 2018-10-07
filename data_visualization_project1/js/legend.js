d3legend = function() {
  let legendValues = [];
  let cellWidth = 30;
  let cellHeight = 20;
  let labelFormat = d3.format('.01f');
  let labelUnits = 'units';
  let changeValue = 1;
  let orientation = 'horizontal';
  let cellPadding = 0;

  function legend(g) {
    function redraw() {
      g.selectAll('g.legendCells')
        .data(legendValues)
        .exit()
        .remove();
      g.selectAll('g.legendCells')
        .select('rect')
        .style('fill', d => {
          return d.color;
        });
      if (orientation == 'vertical') {
        g.selectAll('g.legendCells')
          .select('text.breakLabels')
          .style('display', 'block')
          .style('text-anchor', 'start')
          .attr('x', cellWidth + cellPadding)
          .attr('y', 5 + cellHeight / 2)
          .text(d => {
            return (
              labelFormat(d.stop[0]) +
              (d.stop[1].length > 0 ? ' - ' + labelFormat(d.stop[1]) : '')
            );
          });
        g.selectAll('g.legendCells').attr('transform', (d, i) => {
          return 'translate(0,' + i * (cellHeight + cellPadding) + ')';
        });
      } else {
        g.selectAll('g.legendCells').attr('transform', (d, i) => {
          return 'translate(' + i * cellWidth + ',0)';
        });
        g.selectAll('text.breakLabels')
          .style('text-anchor', 'middle')
          .attr('x', 0)
          .attr('y', -7)
          .style('display', (d, i) => {
            return i == 0 ? 'none' : 'block';
          })
          .text(d => {
            return labelFormat(d.stop[0]);
          });
      }
    }
    g.selectAll('g.legendCells')
      .data(legendValues)
      .enter()
      .append('g')
      .attr('class', 'legendCells')
      .attr('transform', (d, i) => {
        return 'translate(' + i * (cellWidth + cellPadding) + ',0)';
      });

    g.selectAll('g.legendCells')
      .append('rect')
      .attr('height', cellHeight)
      .attr('width', cellWidth)
      .style('fill', d => {
        return d.color;
      })
      .style('stroke', 'black')
      .style('stroke-width', '2px');

    g.selectAll('g.legendCells')
      .append('text')
      .attr('class', 'breakLabels')
      .style('pointer-events', 'none');

    g.append('text')
      .text(labelUnits)
      .attr('y', -7);

    redraw();
  }

  legend.inputScale = function(newScale) {
    if (!arguments.length) return scale;
    scale = newScale;
    legendValues = [];
    if (scale.invertExtent) {
      scale.range().forEach(el => {
        let cellObject = { color: el, stop: scale.invertExtent(el) };
        legendValues.push(cellObject);
      });
    } else {
      scale.domain().forEach(el => {
        let cellObject = { color: scale(el), stop: [el, ''] };
        legendValues.push(cellObject);
      });
    }
    return this;
  };

  legend.cellWidth = function(newCellSize) {
    if (!arguments.length) return cellWidth;
    cellWidth = newCellSize;
    return this;
  };

  legend.cellHeight = function(newCellSize) {
    if (!arguments.length) return cellHeight;
    cellHeight = newCellSize;
    return this;
  };

  legend.cellPadding = function(newCellPadding) {
    if (!arguments.length) return cellPadding;
    cellPadding = newCellPadding;
    return this;
  };

  legend.cellExtent = function(incColor, newExtent) {
    let selectedStop = legendValues.filter(el => {
      return el.color == incColor;
    })[0].stop;
    if (arguments.length == 1) return selectedStop;
    legendValues.filter(el => {
      return el.color == incColor;
    })[0].stop = newExtent;
    return this;
  };

  legend.cellStepping = function(incStep) {
    if (!arguments.length) return changeValue;
    changeValue = incStep;
    return this;
  };

  legend.units = function(incUnits) {
    if (!arguments.length) return labelUnits;
    labelUnits = incUnits;
    return this;
  };

  legend.orientation = function(incOrient) {
    if (!arguments.length) return orientation;
    orientation = incOrient;
    return this;
  };

  legend.labelFormat = function(incFormat) {
    if (!arguments.length) return labelFormat;
    labelFormat = incFormat;
    if (incFormat == 'none') {
      labelFormat = function(inc) {
        return inc;
      };
    }
    return this;
  };
  return legend;
};
