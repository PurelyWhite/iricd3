function d3FindExtreme(el1, el2, contents) {
  d3.csv(contents, function (data) {
    var xKey = Object.keys(data[0])[0];
    var yKey = Object.keys(data[0])[1];

    // calculate x value range
    var xValues = [];
    data.forEach(function(el) {
      return xValues.push(parseFloat(el[xKey]));
    });
    var xRange = d3.extent(xValues);

    // calculate y value range
    var yValues = [];
    data.forEach(function(el) {
      return yValues.push(parseFloat(el[yKey]));
    });
    var yRange = d3.extent(yValues);

    el1.push(xRange[0]); el1.push(xRange[1]); el2.push(yRange[0]); el2.push(yRange[1])

    return el1, el2;
  })
}

function findExtreme(el, callback) {
  var extremeXAll = [];
  var extremeYAll = [];
  var files = document.getElementById(el).files;

  for (var i = 0; i < files.length; i++) {
    var reader = new FileReader;
    reader.readAsDataURL(files[i]);
    reader.onload = function(d) {
      var contents = d.target.result;
      return callback(extremeXAll, extremeYAll, contents);
    }
  }
  return ([extremeXAll, extremeYAll]);
}

function yStep(el) {
  return parseFloat(document.getElementById(el).value);
}

function xStep(el) {
  return parseFloat(document.getElementById(el).value);
}

function upload_button(el) {

  var list = findExtreme(el, d3FindExtreme);
  var xExtreme = [],
      yExtreme = [];

  setTimeout(function() {
    xExtreme.push(Math.min(...list[0]) - Math.min(...list[0]) % xStep('xStep') - 50); xExtreme.push(Math.max(...list[0]) - Math.max(...list[0]) % xStep('xStep') + 50)
    yExtreme.push(Math.min(...list[1]) - Math.min(...list[1]) % yStep('yStep') - 20); yExtreme.push(Math.max(...list[1]) - Math.max(...list[1]) % yStep('yStep') + 20)
    // xExtreme.push(Math.min(...list[0]) - Math.min(...list[0]) % 5 - 20); xExtreme.push(Math.max(...list[0]) - Math.max(...list[0]) % 5 + 20)
    // yExtreme.push(Math.min(...list[1]) - Math.min(...list[1]) % 5 - 20); yExtreme.push(Math.max(...list[1]) - Math.max(...list[1]) % 5 + 20)
  }, 100);

  setTimeout(function() {
    d3.select('svg').remove();
    var canvasWidth = 1920;
    var canvasHeight =1080;
    var scaleFactor = 0.75;

    // create svg object and set alignment
    var canvas = d3.select('body')
                  .append('svg')
                  .attr('width', canvasWidth)
                  .attr('height', canvasHeight)
                  .append('g')
                  .attr('transform', 'translate(' + 0.5 * (canvasWidth - scaleFactor * canvasWidth) + ', '
                                                    + 0.5 * (canvasHeight - scaleFactor * canvasHeight) + ')');

    var files = document.getElementById(el).files;

    //color setting
    var colorAssign = d3.scaleOrdinal(d3.schemeCategory10);

    for (var i = 0; i < files.length; i++) {
      var reader = new FileReader;
      reader.readAsDataURL(files[i]);
      reader.onload = function(d) {
        var contents = d.target.result;
        d3.csv(contents, function (data) {
          // get keys in data and assign to x-y axis
          var keys = Object.keys(data[0]);
          var xKey = keys[0];
          var yKey = keys[1];

          // // calculate x value range
          // var xValues = [];
          // data.forEach(function(el) {
          //   xValues.push(parseFloat(el[xKey]))
          // });
          // var xRange = d3.extent(xValues);
          //
          // // calculate y value range
          // var yValues = [];
          // data.forEach(function(el) {
          //   yValues.push(parseFloat(el[yKey]))
          // });
          // var yRange = d3.extent(yValues);

          // overall horizontal scale
          var xScale = d3.scaleLinear()
                        .domain(xExtreme)
                        .range([0, scaleFactor * canvasWidth]);

          // overall vertical scale
          var yScale = d3.scaleLinear()
                        .domain(yExtreme)
                        .range([scaleFactor * canvasHeight, 0]);

          // path scale
          var pathLine = d3.line()
                        .x(function(d) { return xScale(d[xKey]); })
                        .y(function(d) { return yScale(d[yKey]); });

          // x-axis scale
          var xAxis = d3.axisBottom(xScale)
                        .tickValues(d3.range(Math.min(...xExtreme), Math.max(...xExtreme), xStep('xStep')))
                        .tickSize(5)
                        .tickFormat(d3.format('.2f'))
                        .tickPadding(5);

          // y-axis scale
          var yAxis = d3.axisLeft(yScale)
                        .tickValues(d3.range(Math.min(...yExtreme), Math.max(...yExtreme), yStep('yStep')))
                        .tickSize(5)
                        .tickFormat(d3.format('.2f'))
                        .tickPadding(5);

          // create path
          var path = canvas.append('g')
                        .attr('class', 'dataPath')
                        .selectAll('.dataPath')
                        .data([data])
                        .enter()
                        .append('path')
                        .attr('d', pathLine)
                        .attr('fill', 'none')
                        .attr('stroke', colorAssign(contents.length))
                        .attr('stroke-width', + scaleFactor / 5 + 'em');

          // x-axis positioning
          canvas.append('g')
                        .attr('transform', 'translate(0, ' + scaleFactor * canvasHeight + ')')
                        .attr('class', 'axis')
                        .call(xAxis);

          // y-axis positioning
          canvas.append('g')
                        .attr('transform', 'translate(0, 0)')
                        .attr('class', 'axis')
                        .call(yAxis);

          // x-axis label
          canvas.append('text')
                        .attr('transform', 'translate(' + 0.5 * scaleFactor * canvasWidth + ', '
                                                        + scaleFactor * canvasHeight + ')')
                        .attr('dy', String(4 * scaleFactor) + 'em')
                        .attr('class', 'label')
                        .style('text-anchor', 'middle')
                        .text(xKey);

          // y-axis label
          canvas.append('text')
                        .attr('transform','rotate(-90)')
                        .attr('dy', String(-6 * scaleFactor) + 'em')
                        .attr('x', - 0.5 * scaleFactor * canvasHeight)
                        .attr('class', 'label')
                        .style('text-anchor', 'middle')
                        .text(yKey);

          var background = canvas.append('rect')
                        .attr('x', 0)
                        .attr('y', 0)
                        .attr('width', scaleFactor * canvasWidth)
                        .attr('height', scaleFactor * canvasHeight)
                        .attr('fill', '#1110');

          // var dataPoint = canvas.append('g')
          //                       .attr('class', 'dataPoint')
          //                       .selectAll('.dataPoint')
          //                       .data(data)
          //                       .enter()
          //                       .append('circle')
          //                       .attr('cx', function(d) {return xScale(d[xKey]); })
          //                       .attr('cy', function(d) {return yScale(d[yKey]); })
          //                       .attr('r', + scaleFactor / 3 + 'em')
          //                       .attr('fill', 'black');
          //
          // var dataPointText = canvas.append('g')
          //                       .attr('class', 'dataPointText')
          //                       .selectAll('.dataPointText')
          //                       .data(data)
          //                       .enter()
          //                       .append('text')
          //                       .attr('x', function(d) {return xScale(d[xKey]); })
          //                       .attr('y', function(d) {return yScale(d[yKey]); })
          //                       .attr('dy', String(-3 * scaleFactor) + 'em')
          //                       .attr('fill', 'black')
          //                       .attr('display', null)
          //                       .style('text-anchor', 'middle')
          //                       .text(function(d) {return parseFloat(d[yKey]).toFixed(2); });
          //
          // var pointer = canvas.append('circle')
          //                     .attr('r', + scaleFactor / 3 + 'em')
          //                     .attr('fill', 'blue')
          //                     .style('display', 'none');
          //
          // var pointerText = canvas.append('text')
          //                     .attr('class', 'pointerText')
          //                     .attr('fill', 'blue')
          //                     .attr('text-anchor', 'middle')
          //                     .attr('dx', String(10 * scaleFactor) + 'em')
          //                     .style('display', 'none');
          //
          // var bisect = d3.bisector(function(d) { return d[xKey];}).right;
          //
          // var pointerXScale = d3.scaleLinear()
          //               .domain([0, scaleFactor * canvasWidth])
          //               .range(xExtreme);
          // var pointerYScale = d3.scaleLinear()
          //               .domain([scaleFactor * canvasHeight, 0])
          //               .range(yExtreme);
          //
          // // mouse cursor tracking
          // background.on('mousemove', function() {
          //
          //                           var pointerValues = [pointerXScale(d3.mouse(this)[0]), pointerYScale(d3.mouse(this)[1])];
          //                           var index = bisect(data, pointerValues[0]);
          //                           var previousX = xValues[index - 1];
          //                           var nextX = xValues[index];
          //                           var previousY = yValues[index - 1];
          //                           var nextY = yValues[index];
          //                           var valueY = previousY + ((pointerValues[0] - previousX) / (nextX - previousX)) * (nextY - previousY);
          //                           pointer.attr('cx', d3.mouse(this)[0]);
          //                           pointer.attr('cy', pointerYScale.invert(valueY));
          //                           pointerText.text('Y:' + parseFloat(valueY).toFixed(3) + ', X:' + parseFloat(pointerValues[0]).toFixed(3) + '');
          //                           pointerText.attr('x', d3.mouse(this)[0]);
          //                           pointerText.attr('y', pointerYScale.invert(valueY));
          //                           })
          //           .on('mouseover', function() {
          //                           pointer.style('display', null);
          //                           pointerText.style('display', null);
          //                           })
          //           .on('mouseout', function() {
          //                           pointer.style('display', 'none');
          //                           pointerText.style('display', 'none');
          //                           });
          //
        });
      }
    }
  }, 200);
}
