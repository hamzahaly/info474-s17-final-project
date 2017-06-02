
$(function() {


  var margin = {top: 20, right: 20, bottom: 30, left: 40},
      width = 960;
      height = 500;






  /* 
   * value accessor - returns the value to encode for a given data object.
   * scale - maps value to a visual display encoding, such as a pixel position.
   * map function - maps from data value to display value
   * axis - sets up axis
   */ 


  var pop = 'Total population'
      mhi = 'Median household income'
      mhv = 'Median home value';

  var demoVariable = mhi;


  // setup x 
  var xValue = function(d) { return d.ZHVI;}, // data -> value
      xScale = d3.scaleLinear().range([0, width]), // value -> display
      xMap = function(d) { return xScale(xValue(d));}, // data -> display
      xAxis = d3.axisBottom().scale(xScale);

  // setup y
  var yValue = function(d) { return d[demoVariable];}, // data -> value
      yScale = d3.scaleLinear().range([height, 0]), // value -> display
      yMap = function(d) { return yScale(yValue(d));}, // data -> display
      yAxis = d3.axisLeft().scale(yScale);

  // setup fill color
  var cValue = function(d) { return d.Manufacturer;},
      color = d3.scaleOrdinal(d3.schemeCategory10);





  // add the graph canvas to the body of the webpage
  var svg = d3.select("#scatter").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


  // add the tooltip area to the webpage
  var tooltip = d3.select("#scatter").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

  // load data
  d3.csv("data/census_prep_data_final2.csv", function(error, data) {
  //d3.csv("data/")

    // change string (from CSV) into number format
    data.forEach(function(d) {
      d.ZHVI = +d.ZHVI;
      d[demoVariable] = + d[demoVariable];
    });

    // don't want dots overlapping axis, so add in buffer to data domain
    xScale.domain([d3.min(data, xValue)-1, d3.max(data, xValue)+1]);
    yScale.domain([d3.min(data, yValue)-1, d3.max(data, yValue)+1]);

    // x-axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
      .append("text")
        .attr("class", "label")
        .attr("x", width)
        .attr("y", -6)
        .style("text-anchor", "end")
        .text("ZHVI");

    // y-axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text(demoVariable);

    // draw dots
    svg.selectAll(".dot")
        .data(data)
      .enter().append("circle")
        .attr("class", "dot")
        .attr("r", 3.5)
        .attr("cx", xMap)
        .attr("cy", yMap)
        .style("fill", function(d) { return color(cValue(d));});

  });
});