const w = 1500,
  h = 600,
  padding = 75,
  temperatureAxisWidth = 300,
  tempSquareHeight = 40;

const tooltip = d3.select('#container').append('div').attr('id', 'tooltip');
const row1 = tooltip.append('p').html('row1');
const row2 = tooltip.append('p').html('row2');
const row3 = tooltip.append('p').html('row3');

const svg = d3
  .select('#container')
  .append('svg')
  .attr('width', w)
  .attr('height', h);

svg
  .append('text')
  .text('Monthly Global Land-Surface Temperature')
  .attr('x', '50%')
  .attr('text-anchor', 'middle')
  .attr('id', 'title')
  .attr('y', 25);

svg
  .append('text')
  .text('1753 - 2015: base temperature 8.66℃')
  .attr('x', '50%')
  .attr('text-anchor', 'middle')
  .attr('id', 'description')
  .attr('y', 45);

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const colors = [
  ['313695', 1.7],
  ['313695', 2.8],
  ['4575b4', 3.9],
  ['74add1', 5.0],
  ['abd9e9', 6.1],
  ['e0f3f8', 7.2],
  ['ffffbf', 8.3],
  ['fee090', 9.5],
  ['fdae61', 10.6],
  ['f46d43', 11.7],
  ['d73027', 12.8],
  ['a50026', 13.9],
];

function setColor(t) {
  if (t < 2.8) {
    return colors[1][0];
  } else if (t < 3.9) {
    return colors[2][0];
  } else if (t < 5) {
    return colors[3][0];
  } else if (t < 6.1) {
    return colors[4][0];
  } else if (t < 7.2) {
    return colors[5][0];
  } else if (t < 8.3) {
    return colors[6][0];
  } else if (t < 9.5) {
    return colors[7][0];
  } else if (t < 10.6) {
    return colors[8][0];
  } else if (t < 11.7) {
    return colors[9][0];
  } else if (t < 12.8) {
    return colors[10][0];
  } else {
    return colors[11][0];
  }
}

d3.json(
  'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json'
).then((obj) => generateHeatMap(obj));

function generateHeatMap(obj) {
  const yearMin = d3.min(obj.monthlyVariance, (d) => d.year);
  const yearMax = d3.max(obj.monthlyVariance, (d) => d.year);
  const years = yearMax - yearMin + 1;
  const yearsArray = obj.monthlyVariance.map((d) => d.year);

  const barWidth = (w - padding * 2) / years;
  const barHeight = (h - padding * 2) / 12;

  const xScale = d3
    .scaleBand()
    .domain(yearsArray)
    .range([0, w - padding * 2])
    .padding(0);

  const xAxis = d3
    .axisBottom(xScale)
    .tickValues(xScale.domain().filter((d) => d % 10 === 0))
    .tickSizeOuter(0)
    .tickFormat(d3.format('d'));

  const yScale = d3
    .scaleBand()
    .domain(months)
    .range([0, h - padding * 2]);

  const yAxis = d3.axisLeft(yScale).tickSizeOuter(0);

  svg
    .selectAll('rect')
    .data(obj.monthlyVariance)
    .enter()
    .append('rect')
    .attr('width', barWidth)
    .attr('height', barHeight)
    .attr(
      'fill',
      (d) =>
        '#' + setColor(Math.round((obj.baseTemperature + d.variance) * 10) / 10)
    )
    .attr('x', (d) => xScale(d.year) + padding)
    .attr('y', (d) => yScale(months[d.month - 1]) + padding)
    .attr('class', 'cell')
    .attr('data-month', (d) => d.month - 1)
    .attr('data-year', (d) => d.year)
    .attr('data-temp', (d) => d.variance)
    .on('mouseover', (d) => {
      row1.html(d.year + ' - ' + months[d.month - 1]);
      row2.html(Math.round((obj.baseTemperature + d.variance) * 10) / 10 + '℃');
      row3.html(Math.round(d.variance * 10) / 10 + '℃');
      tooltip
        .attr('data-year', d.year)
        .style(
          'left',
          xScale(d.year) +
            padding +
            barWidth / 2 -
            tooltip.node().getBoundingClientRect().width / 2 +
            'px'
        )
        .style(
          'top',
          yScale(months[d.month - 1]) +
            padding -
            tooltip.node().getBoundingClientRect().height -
            5 +
            'px'
        )
        .attr('class', 'visible');
    })
    .on('mouseleave', (d) => {
      tooltip.attr('class', '');
    });

  svg
    .append('g')
    .attr('transform', 'translate(' + padding + ', ' + (h - padding) + ')')
    .attr('id', 'x-axis')
    .call(xAxis);

  svg
    .append('g')
    .attr('transform', 'translate(' + padding + ', ' + padding + ')')
    .attr('id', 'y-axis')
    .call(yAxis);

  const temperatureScale = d3
    .scaleLinear()
    .domain([1.7, 13.9])
    .range([0, temperatureAxisWidth]);

  const temperatureTicks = colors.map((d) => d[1]).slice(1, colors.length - 1);

  const temperatureAxis = d3
    .axisBottom(temperatureScale)
    .tickValues(temperatureTicks)
    .tickFormat(d3.format('.1f'));

  svg
    .append('g')
    .attr('id', 'legend')
    .attr('transform', 'translate(' + padding + ', ' + (h - padding / 4) + ')')
    .append('g')
    .call(temperatureAxis);

  d3.select('#legend')
    .selectAll('rect')
    .data(colors.slice(0, 11))
    .enter()
    .append('rect')
    .attr('width', temperatureAxisWidth / 11)
    .attr('height', temperatureAxisWidth / 11)
    .attr('y', (temperatureAxisWidth / 11) * -1)
    .attr('x', (d, i) => (temperatureAxisWidth / 11) * i)
    .attr('fill', (d) => '#' + setColor(d[1]));
}
