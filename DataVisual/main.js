"use strict"

/* Configuration variables: drawing */
let svgWidth = 1400
let svgHeight = 740


/* Configuration variable: margin */
let margin = {
    top: 10,
    right: 270,
    bottom: 10,
    left: 270
}

/** Configuration variables: traingle */
let originalX = 360;
let originalY = 675;
// let studyH = originalY - 519.6;
let studyH = originalY - 606.2;

/* Create drawing canvas */
let svg = d3.select("#canvas")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)

/* Draw canvas border */
let canvasBorder = svg.append("rect")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .attr("fill", "none")
    .attr("stroke", "black")

/* Draw inner border */
let drawing = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`)

drawing.append("rect")
    .attr("width", svgWidth - (margin.left + margin.right))
    .attr("height", svgHeight - (margin.top + margin.bottom))
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("stroke-dasharray", "5,5")


//Create all global ‘variables
let data, extentMood, extentDone, extentSteps, xAxisline, yAxisline, lineScale, xScale, yScale, rScale, colorScale, arcScale, colorSteps, angleScale, realX, realY, arcXY, rotatePlaneXY, percent, div, divAirplane

//Code from Jay Taylor-Laird
(async function () {
    data = await d3.json("data.json").then(buildVisualization)
})();


/**** function closedPolygon() *****

To close the polygon
--Code from Jay Taylor-Laird

Parameters:
data: args

Returns:
polyString
*****/
function closedPolygon(...args) {
    if (args.length < 2) {
        console.log("WARNING: No points defined")
        return "";
    }
    let polyString = "";
    // grab each pair of points and add to string of points
    for (let i = 0; i < args.length; i++) {
        polyString += args[i];
        polyString += " ";
    }

    polyString += args[0] + " " + args[1];

    return polyString; // send back our completed String
}

/**** function buildVisualization(data) *****

Build my whole visualization on SVG canvas 

Parameters:
data: data from json;
svg: svg canvas

Returns:
renderData: data which is organized
*****/
function buildVisualization(data) {
    let renderData = organizeData(data)
    findExtent(renderData)
    buildScales()
    getRealPosition()
    drawVisualization(renderData, svg)
    return renderData;
}

/**** function organizeData(data) *****

Organize(Sort) raw data from the most happiness to the least happiness
(mood:4-->>--mood:0)

Parameters:
data: data from json

Returns:
organizedp[]: data which is organized
*****/
function organizeData(data) {
    let organized = [];
    organized = data.sort(function (a, b) { return b.mood - a.mood })
    return organized;
}

/**** function find‘Extent(data) *****

Find all extent(max&min) of data

Parameters:
data: data of renderData

Returns:
nothing
*****/
function findExtent(data) {
    extentMood = d3.extent(data, function (value) { return value.mood; }); //Find mood min & max values
    extentDone = d3.extent(data, function (value) { return value.done; }); //Find done min & max values
    extentSteps = d3.extent(data, function (value) { return value.steps; }); //Find steps min & max values
}

/**** function buildScales() *****

Create all scale of data

Parameters:
nothing

Returns:
nothing
*****/
function buildScales() {

    // Scale the x（ do not use!）
    xScale = d3.scaleLinear()
        .domain([0, 100])
        .range([originalX, originalX + 700]);

    // Scale the y（ do not use!）
    yScale = d3.scaleLinear()
        .domain([0, 100])
        .range([originalY, originalY - 606.2]);

    //Create an array "percent" to store all percentage values
    percent = ["0%", "10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "100%"];

    //Scale the percent array to the side lengths of the triangle. 
    /** It was originally intended to be used to write the axes of the three sides of the triangle, but I didn't actually use it in the final visualization. 
     *  This is because it is very complicated to control. When used for the sides I needed to rotate it and it was also difficult to tune it to a very accurate position.
    */
    lineScale = d3.scaleOrdinal()
        .domain(percent)
        .range([0, 70, 140, 210, 280, 350, 420, 490, 560, 630, 700]);

    //Scale the radius of the circle according to the third variable（Happiness Mood）
    rScale = d3.scalePow()
        // .domain([extentMood[0], extentMood[1]])
        .domain([1, 4])
        .range([5, 20]);

    //Scale the color of the circle according to the variable（Happiness Mood)
    colorScale = d3.scaleLinear()
        .domain([extentMood[0], extentMood[1]])
        .range(["#F2CED8", '#AD0D43']);
    //Another function to scale the color
    //colorScale = d3.scaleSequential()
    //     .interpolator(d3.interpolateInferno)
    //     .domain([extentDone[0], extentDone[1]])

    //Scale the length of the arc according to the variable（steps)
    arcScale = d3.scaleLinear()
        .domain([0, 10000])
        .range([0, 100]);

    //Scale the color of the airplane according to the variable（Steps)
    colorSteps = d3.scaleLinear()
        .domain([extentSteps[0], extentSteps[1]])
        .range(["#E3C9EA", '#4D1065']);

    //Scale the angle of the polyline according to the variable（entertainment)
    angleScale = d3.scaleLinear()
        // .domain([extentEntertainment[0], extentEntertainment[1]])//[40,300]
        .domain([0, 10000])
        .range([0, 360]);

}


/**** function getRealPosition() *****

Calculate the real X and real Y of values & Return(translate) them together;
Calculate the angle of airplane by angleScale() & Return them together.

Parameters:
nothing

Returns:
nothing
*****/
function getRealPosition() {

    /** Calculate every value's real X (corresponding to the origin(0,0) ) */
    realX = function (value) {
        return originalX + (value.play + value.goout / 2) * 7;
    }

    realY = function (value) {
        return originalY - value.goout / 2 * 1.732 / 50 / 1.732 * 606.2;
    }

    /** Calculate & Translate every value's real X & Y (corresponding to the origin(0,0) ) */
    arcXY = function (value) {
        let arcX = originalX + (value.play + value.goout / 2) * 7;
        let arcY = originalY - value.goout / 2 * 1.732 / 50 / 1.732 * 606.2;
        return `translate(${arcX},${arcY})`;
    }

    //get & return the angle of rotation of the airplane, the position of the center of the rotation of the airplane(the center of the circle)
    rotatePlaneXY = function (value) {
        let planeX = originalX + (value.play + value.goout / 2) * 7;
        let planeY = originalY - value.goout / 2 * 1.732 / 50 / 1.732 * 606.2;
        let planeAngle = angleScale(value.steps)
        return `rotate(${planeAngle},${planeX},${planeY})`
    }

}


/**** function drawVisualization(data) *****
Draw the visualization on SVG canvas

Parameters:
data: data of renderData
drawing: svg canvas

Returns:
nothing
*****/
function drawVisualization(data, svg) {

    /****** This is an origin-based coordinate system ******/
    /*** When I want to know the real coordinates of the data points, the following code will be used to show the real axes.  
     * When everything(especially data points) are OK, I will comment them out. 
     * There are two ways to show the Axis.**/

    /** Only show line of Axis */
    // xAxisline = svg.append("line")
    //     .attr("x1", originalX)
    //     .attr("y1", originalY)
    //     .attr("x2", originalX + 700)
    //     .attr("y2", originalY)
    //     .attr("stroke", "black");
    // yAxisline = svg.append("line")
    //     .attr("x1", originalX)
    //     .attr("y1", originalY)
    //     .attr("x2", originalX)
    //     .attr("y2", originalY - 606.2)
    //     .attr("stroke", "black");

    /** Show both line and text of Axis */
    // xAxisline = svg.append("g")
    //     .classed("axis", true)
    //     .attr("transform", `translate(0, ${originalY})`)
    //     .call(d3.axisBottom().scale(xScale))
    //     .attr("color", "black");
    // yAxisline = svg.append("g")
    //     .classed("axis", true)
    //     .attr("transform", `translate(${originalX}, 0)`)
    //     .call(d3.axisLeft().scale(yScale))
    //     .attr("color", "black");

    theTriangle(svg) //To draw the big Triangle(including the Triangle, three sets of Parallel lines in it, Text on the vertex, Auxiliary Text outside the edge)
    //individualTri(svg)  //To draw a triangle with one of main activity(interactive)
    plotPoints(data) //To draw all data(plot) points(including circles, "fans"-sectors, "airplanes"-polygons); Also including the helper function
    drawallKeys(svg) //To draw all keys, also including its related helper functions
}

/**** function theTriangle() *****
Draw the triangle(including the border & height of the triangle) on SVG 

Parameters:
drawing: svg canvas

Returns:
nothing
*****/
function theTriangle(svg) {
    /*** Draw the Triangle & the Text of Vertex */
    let triangle = svg.append("g")
    triangle.append('polyline')
        .attr('points', closedPolygon(originalX, originalY, originalX + 700, originalY, originalX + 350, studyH))
        .attr("stroke", 'black')
        .attr("stroke-width", 2)
        .attr("fill", 'none')
        .attr("opacity", 0.5);
    triangle.append("text")
        .text("Study")
        .attr("x", originalX + 350)
        .attr("y", studyH - 30)
        .classed("vertex", true)
        .attr("stroke", "blue")
    triangle.append("text")
        .text("Play at home")
        .attr("x", originalX + 20)
        .attr("y", originalY + 45)
        .classed("vertex", true)
        .attr("stroke", "palevioletred")
    // .attr("transform", `rotate(-30 ${originalX} ${originalY})`)
    triangle.append("text")
        .text("Go outside")
        .attr("x", originalX + 680)
        .attr("y", originalY + 45)
        .attr("stroke", "orange")
        .classed("vertex", true)
    // .attr("transform", `rotate(30 ${originalX + 600} ${originalY})`)

    //Use a for loop to draw all inside lines(connect two points) & texts (near the point)
    for (let i = 0; i <= 10; i++) {
        svg.append("line")
            .attr("x1", originalX + 350 - 35 * i)
            .attr("y1", studyH + 60.62 * i)
            .attr("x2", originalX + 350 + 35 * i)
            .attr("y2", studyH + 60.62 * i)
            // .attr("stroke", "orange")
            // .attr("opacity", 0.17)
            .attr("stroke-width", 2)
            .classed("lineG", true)

        svg.append("line")
            .attr("x1", originalX + 70 * i)
            .attr("y1", originalY)
            .attr("x2", originalX + 35 * i)
            .attr("y2", originalY - 60.62 * i)
            // .attr("stroke", "lightblue")
            // .attr("opacity", 0.4)
            .attr("stroke-width", 2)
            .classed("lineS", true)

        svg.append("line")
            .attr("x1", originalX + 70 * i)
            .attr("y1", originalY)
            .attr("x2", originalX + 350 + 35 * i)
            .attr("y2", studyH + 60.62 * i)
            // .attr("stroke", "palevioletred")
            // .attr("opacity", 0.17)
            .attr("stroke-width", 2)
            .classed("lineP", true)

        svg.append("text")
            .text(percent[i]) //line:159
            .attr("x", originalX - 10 + 70 * i)
            .attr("y", originalY + 20)
            .attr("stroke", "palevioletred")
            .attr("stroke-width", 0.7)

        svg.append("text")
            .text(percent[i]) //line:159
            .attr("x", originalX - 40 + 350 - 35 * i)
            .attr("y", studyH + 60.62 * i)
            .attr("stroke", "blue")
            .attr("stroke-width", 0.7)

        svg.append("text")
            .text(percent[i]) //line:159
            .attr("x", originalX + 700 + 10 - 35 * i)
            .attr("y", originalY - 60.62 * i)
            .attr("stroke", "orange")
            .attr("stroke-width", 0.7)

    }

}


function individualTri(svg) {

    /*** Draw a new white Triangle */
    svg.append('polyline')
        .attr('points', closedPolygon(originalX, originalY, originalX + 700, originalY, originalX + 350, studyH))
        .attr("stroke", 'black')
        .attr("stroke-width", 2)
        .attr("fill", 'white')
        .attr("opacity", 1);

    let newTri = svg.append("g")
    newTri.append("text")
        .text("Study")
        .attr("x", originalX + 350)
        .attr("y", studyH - 30)
        .classed("vertex", true)
        .attr("stroke", "blue")
    for (let i = 0; i <= 10; i++) {
        newTri.append("line")
            .attr("x1", originalX + 70 * i)
            .attr("y1", originalY)
            .attr("x2", originalX + 35 * i)
            .attr("y2", originalY - 60.62 * i)
            .attr("stroke", "lightblue")
            .attr("opacity", 0.4)
            .attr("stroke-width", 2)
        newTri.append("text")
            .text(percent[i]) //line:159
            .attr("x", originalX - 40 + 350 - 35 * i)
            .attr("y", studyH + 60.62 * i)
            .attr("stroke", "blue")
            .attr("stroke-width", 0.5)

        //clear % of other two lines
        newTri.append("rect")
            .attr("x", originalX - 10 + 70 * i)
            .attr("y", originalY + 5)
            .attr("width", 40)
            .attr("height", 20)
            .attr("fill", "white")
        newTri.append("rect")
            .attr("x", originalX + 700 + 10 - 35 * i)
            .attr("y", originalY - 15 - 60.62 * i)
            .attr("width", 40)
            .attr("height", 20)
            .attr("fill", "white")
            .attr("stroke-width", 1)
    }


}




/**** function plotPoints() *****
Draw the data points on SVG 

Parameters:
data:data of renderData

Returns:
nothing
*****/
function plotPoints(data) {

    //the div box for tooltip for circle & hid it now
    div = d3.select("#canvas")
        .append("div")
        .style("position", "absolute")
        .attr("class", "tooltip")
        .style("opacity", 0);
    //the another div box for tooltip for airplane & hid it now
    divAirplane = d3.select("#canvas")
        .append("div")
        .style("position", "absolute")
        .attr("class", "tooltip_2")
        .style("opacity", 0);

    /**** Draw circles ***/
    svg.selectAll("circle")
        .data(data)
        .join("circle")
        .attr("r", function (value) { return rScale(value.mood) }) // line:170
        .attr("cx", function (value) { return realX(value) }) // line:217
        .attr("cy", function (value) { return realY(value) })
        .attr("opacity", 1)//Change the transparency of the circle-->lineL:221
        .attr("stroke", function (value) { return colorScale(value.mood) }) //line:176
        .attr("fill", "white")
        //hover effects
        .on('mouseover', function (event, value) {
            d3.select(this)
                .transition()
                .duration(100)
                .attr("fill", "#cfe2fa") //change color of the circle when mouse over it
                .attr("opacity", 1)
            //Makes the new div appear on hover:
            div.transition()
                .duration(200)
                .style("opacity", 0.9);
            div.html("Mood: " + value.mood + "<br/>" + "Study: " + value.study + "%" + "<br/>" + "Play: " + value.play + "%" + "<br/>" + "Go Out: " + value.goout + "%")//define the text in div
                //define the position of div
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY + 10) + "px");
        })
        .on('mouseout', function () { //remove the hover effects
            d3.select(this)
                .transition()
                .duration(100)
                .attr("fill", "white")
                .attr("opacity", 0.95)
            //Makes the new div disappear:
            div.transition()
                .duration(500)
                .style("opacity", 0)
        })


    /**** Draw paper airplanes ***/
    svg.selectAll("airplane")
        .data(data)
        .join("polyline")
        .attr("transform", function (value) { return rotatePlaneXY(value) }) //rotate the airplane by value-->line:187(rotatePlaneXY function)
        .attr('points', function (value) {
            let planeX = realX(value); // get the cx of the center of airplane
            let planeY = realY(value);// get the cy of the center of airplane
            return closedPolygon(planeX, planeY, planeX + 5, planeY + 27, planeX, planeY + 24, planeX - 5, planeY + 27); // define a triangle in relative terms
        })
        .attr("fill", function (value) { return colorSteps(value.steps) }) //fill the color of airplane-->line:163
        //hover effects
        .on('mouseover', function (event, value) {
            d3.select(this)
                .transition()
                .duration(100)
                .attr('points', function (value) {
                    let planeX = realX(value); // get the cx of the center of airplane-->217
                    let planeY = realY(value);// get the cy of the center of airplane-->221
                    return closedPolygon(planeX, planeY, planeX + 10, planeY + 37, planeX, planeY + 34, planeX - 10, planeY + 37); // define a triangle in relative terms
                })
            //Makes the new div appear on hover:
            divAirplane.transition()
                .duration(200)
                .style("opacity", 0.9);
            divAirplane.html("Mood: " + value.mood + "<br/>" + "Steps: " + value.steps)//define the text in div
                //define the position of div
                .style("left", (event.pageX - 110) + "px")
                .style("top", (event.pageY + 10) + "px");

        })
        .on('mouseout', function () { //remove the hover effects
            d3.select(this)
                .transition()
                .duration(500)
                .attr('points', function (value) {
                    let planeX = realX(value); // get the cx of the center of airplane
                    let planeY = realY(value);// get the cy of the center of airplane
                    return closedPolygon(planeX, planeY, planeX + 5, planeY + 27, planeX, planeY + 24, planeX - 5, planeY + 27); // define a triangle in relative terms
                })
            //Makes the new div disappear:
            divAirplane.transition()
                .duration(500)
                .style("opacity", 0)
        })


    /**** Draw fans(Sectors)
     * I envision drawing as many fans(sectors) as the value of done(tasks) is in that data point.
     * But if I use this logic: 
     *      1）Create a separate function for each done, 
     *      2）and then Draw each sector it needs inside the corresponding each function. I need to     write a lot of repetitive code.
     * So I shifted my drawing logic. 
     *      1）I used each sector as a drawing unit 
     *      2）and Filtered out the data points that needed to be drawn for that sector (meaning that data that did not need to be drawn for that sector was excluded)，
     *      3）so that as long as the data points that needed to draw that sector drew that sector.
     * *****/

    // This is a helper function to draw Fans! To filter value by value.done
    function filterDoneOne(value) {
        return value.done == "1" || value.done == "2" || value.done == "3" || value.done == "4";
    }
    function filterDoneTwo(value) {
        return value.done == "2" || value.done == "3" || value.done == "4";
    }
    function filterDoneThree(value) {
        return value.done == "3" || value.done == "4";
    }
    function filterDoneFour(value) {
        return value.done == "4";
    }

    /**** Draw circle inner arc ***/
    svg.selectAll("path.fan1") //draw the first fan 
        .data(data.filter(filterDoneOne))//When the value.done = 1 or 2 or 3 or 4 (excluded the case of 0), draw the first fan!
        .join("path")
        .attr("transform", function (value) { return arcXY(value) }) //get position of the center of the circle corresponding to the fan
        .attr("d", d3.arc()
            .innerRadius(0)// The inner radius of the fan is from 0(the center of the corresponding circle)
            .outerRadius(function (value) { return rScale(value.mood) }) // get the radius of the outer radius of the fan: use rScale function-->line:148
            .startAngle(2.86)     // 2.86--3.14--3.42(0.28) = 0 degree
            .endAngle(3.42)
        )
        .attr('stroke', function (value) { return colorScale(value.mood) }) //stroke color
        .attr('fill', function (value) { return colorScale(value.mood) }); //arc fill color

    svg.selectAll("path.fan2")//draw the second fan 
        .data(data.filter(filterDoneTwo))//When the value.done = 2 or 3 or 4 (excluded the case of 0 & 1), draw the second fan!
        .join("path")
        .attr("transform", function (value) { return arcXY(value) })
        .attr("d", d3.arc()
            .innerRadius(0)
            .outerRadius(function (value) { return rScale(value.mood) })
            .startAngle(4.43)     // 4.43--4.71--3.42(0.28)  = 45 degree
            .endAngle(4.99)
        )
        .attr('stroke', function (value) { return colorScale(value.mood) }) //stroke color
        .attr('fill', function (value) { return colorScale(value.mood) }); //arc fill color

    svg.selectAll("path.fan3")//draw the third fan 
        .data(data.filter(filterDoneThree))//When the value.done = 3 or 4 (excluded the case of 0 & 1 & 2), draw the third fan!
        .join("path")
        .attr("transform", function (value) { return arcXY(value) })
        .attr("d", d3.arc()
            .innerRadius(0)
            .outerRadius(function (value) { return rScale(value.mood) })
            .startAngle(6)     // 6--6.28--6.56  = 90 degree
            .endAngle(6.56)
        )
        .attr('stroke', function (value) { return colorScale(value.mood) }) //stroke color
        .attr('fill', function (value) { return colorScale(value.mood) }); //arc fill color

    svg.selectAll("path.fan4")//draw the forth fan 
        .data(data.filter(filterDoneFour))//When the value.done = 4 (excluded the case of 0 & 1 & 2 & 3), draw the forth fan!
        .join("path")
        .attr("transform", function (value) { return arcXY(value) })
        .attr("d", d3.arc()
            .innerRadius(0)
            .outerRadius(function (value) { return rScale(value.mood) })
            .startAngle(7.57)     // 7.57--7.85--8.13  = 135 degree（-45 degree）
            .endAngle(8.13)
        )
        .attr('stroke', function (value) { return colorScale(value.mood) }) //stroke color
        .attr('fill', function (value) { return colorScale(value.mood) }); //arc fill color


}



/**** function drawallKeys(svg) *****
Draw all keys(Mood, Done, Steps, Height of Triangle) on SVG 

Parameters:
svg: svg canvas

Returns:
nothing
*****/
function drawallKeys(svg) {

    /************** Happiness Key ***************/
    let keyMood = svg.append('g')
    /* Draw Mood(happiness) Key border. */
    keyMood.append("rect")
        .attr("fill", "none")
        .attr("stroke", "darkgrey")
        .attr("x", svgWidth - margin.right + 1)
        .attr("y", 10)
        .attr("width", 268)
        .attr("height", 118);
    /* Write the Mood(happiness) key title */
    keyMood.append("text")
        .attr("x", svgWidth - margin.right + 135)
        .attr("y", 35)
        .attr("font-size", 16)//Set font size
        .attr("text-anchor", "middle")
        .text("Happiness (1=unhappy, 4=full happy)");
    /* Draw Mood(happiness) Key circles & text. */
    for (let i = 1; i <= 4; i++) {
        svg.append("circle")
            .attr("r", rScale(i))
            .attr("cx", svgWidth - margin.right - 20 + 60 * i)
            .attr("cy", 70)
            .attr("opacity", 0.8)
            .attr("fill", colorScale(i))//Fill color of circle by colorScale

        svg.append("text")
            .attr("x", svgWidth - margin.right - 20 + 60 * i)
            .attr("y", 110)
            .attr("font-size", 16)//Set font size
            .attr("text-anchor", "middle")
            .text(i);
    }


    /************** Done tasks Key ***************/
    let keyDone = svg.append('g')
    /* Draw Done(tasks) Key border. */
    keyDone.append("rect")
        .attr("fill", "none")
        .attr("stroke", "darkgrey")
        .attr("x", svgWidth - margin.right + 1)
        .attr("y", 150)
        .attr("width", 268)
        .attr("height", 118);
    /* Write the Done(tasks) key title */
    keyDone.append("text")
        .attr("x", svgWidth - margin.right + 130)
        .attr("y", 175)
        .attr("font-size", 16)//Set font size
        .attr("text-anchor", "middle")
        .text("Tasks I have done (0-4 pieces)");

    /* Draw Done(tasks) Key circle's fans & text. */
    //This is a helper function to get & return cx & cy of the center of corresponding circle
    let keyFanXY = function (a) {
        let boderCX = svgWidth - margin.right + 50 + 45 * a
        let boderCY = 210
        return `translate(${boderCX},${boderCY})`;
    }
    //Draw circles & texts & fans (use a loop)
    for (let i = 0; i <= 4; i++) {
        //Draw all circle's border
        svg.append("circle")
            .attr("r", 15)
            .attr("cx", svgWidth - margin.right + 50 + 45 * i)
            .attr("cy", 210)
            .attr("opacity", 0.8)
            .attr("stroke", "grey")
            .attr("fill", "none")

        //Draw all texts
        svg.append("text")
            .attr("x", svgWidth - margin.right + 50 + 45 * i)
            .attr("y", 250)
            .attr("font-size", 16)//Set font size
            .attr("text-anchor", "middle")
            .text(i);

        //Draw all fans
        if (i >= 1) { //when i=1/2/3/4, draw this fan
            svg.append("path")
                .attr("transform", keyFanXY((i))) // get the cx & cy of the center -->line:496
                .attr("d", d3.arc()
                    .innerRadius(0)
                    .outerRadius(15)
                    .startAngle(2.86)     // 2.86--3.14--3.42(0.28) = 0 degree
                    .endAngle(3.42)
                )
                .attr('stroke', "grey") //stroke color
                .attr('fill', "grey"); //arc fill color
        }
        if (i >= 2) {//when i=2/3/4, draw this fan
            svg.append("path")
                .attr("transform", keyFanXY((i)))
                .attr("d", d3.arc()
                    .innerRadius(0)
                    .outerRadius(15)
                    .startAngle(4.43)     // 4.43--4.71--3.42(0.28) = 45 degree
                    .endAngle(4.99)
                )
                .attr('stroke', "grey") //stroke color
                .attr('fill', "grey"); //arc fill color
        }
        if (i >= 3) {//when i=3/4, draw this fan
            svg.append("path")
                .attr("transform", keyFanXY((i)))
                .attr("d", d3.arc()
                    .innerRadius(0)
                    .outerRadius(15)
                    .startAngle(6)     // 6--6.28--6.56(0.28) = 90 degree
                    .endAngle(6.56)
                )
                .attr('stroke', "grey") //stroke color
                .attr('fill', "grey"); //arc fill color
        }
        if (i >= 4) {//when i=4, draw this fan
            svg.append("path")
                .attr("transform", keyFanXY((i)))
                .attr("d", d3.arc()
                    .innerRadius(0)
                    .outerRadius(15)
                    .startAngle(7.57)     // 7.57--7.85--8.13(0.28) = 135 degree
                    .endAngle(8.13)
                )
                .attr('stroke', "grey") //stroke color
                .attr('fill', "grey"); //arc fill color
        }
    }


    /************** Steps Key ***************/
    let keySteps = svg.append('g')
    /* Draw Steps Key border. */
    keySteps.append("rect")
        .attr("fill", "none")
        .attr("stroke", "darkgrey")
        .attr("x", svgWidth - margin.right + 1)
        .attr("y", 290)
        .attr("width", 268)
        .attr("height", 318);
    /* Write the Steps key title */
    keySteps.append("text")
        .attr("x", svgWidth - margin.right + 130)
        .attr("y", 315)
        .attr("font-size", 16)//Set font size
        .attr("text-anchor", "middle")
        .text("Steps I have taken (step / K steps)");
    /* Write the Steps key general circle(on the left) */
    keySteps.append("circle")
        .attr("r", 28)
        .attr("cx", svgWidth - margin.right + 130)
        .attr("cy", 375)
        .attr("stroke", "lightgrey")
        .attr("fill", "none")
        .attr("stroke-dasharray", "3,5")


    // This is a helper function to get & return the coordinates(x&y) of the center of rotation, and the angle of rotation
    let keyRotateXY = function (i) {
        let planeX = svgWidth - margin.right + 130
        let planeY = 375
        let planeAngle = angleScale(i)
        return `rotate(${planeAngle},${planeX},${planeY})`
    }

    // Create an array of K Steps (instead of 1000/2000/3000/...)
    let stepsK = ["0K", "1K", "2K", "3K", "4K", "5K", "6K", "7K", "8K", "9K"];

    //Draw all the airplanes & text in one circle(above)
    for (let i = 0; i <= 9000; i = i + 1000) {
        keySteps.append("polyline")
            .attr("transform", keyRotateXY(i))
            .attr('points', function () {
                let planeX = svgWidth - margin.right + 130
                let planeY = 375
                return closedPolygon(planeX, planeY, planeX + 5, planeY + 27, planeX, planeY + 24, planeX - 5, planeY + 27); // define a triangle in relative terms
            })
            .attr("fill", colorSteps(i))

        keySteps.append("text")
            .attr("transform", keyRotateXY(i))
            .attr("x", svgWidth - margin.right + 130)
            .attr("y", 415)
            .attr("font-size", 10)//Set font size
            .attr("text-anchor", "middle")
            .text(stepsK[(i / 1000)]);
    }

    // This is also a helper function to get & return the coordinates(x&y) of the center of rotation, and the angle of rotation.
    /** I devided them from 0-4 & 5-9, because I want to present them in two rows (considered the limited width of the key)
     *  If I compress the spacing to show all of them, they will be too closed to each other and difficult for people to understand.
    */
    let keyPlaneXY = function (i) {
        let planeX = svgWidth - margin.right + 40 + i / 1000 * 50
        let planeY = 450
        let planeAngle = angleScale(i)
        return `rotate(${planeAngle},${planeX},${planeY})`
    }
    //Draw each airplane & text (0-4 in the first row)
    for (let i = 0; i <= 4000; i = i + 1000) {
        //draw each paper airplane
        keySteps.append("polyline")
            .attr("transform", keyPlaneXY(i))//get the angle(of rotation) & coordinate(of the center of rotation)
            // .attr("transform", keyPlaneXY(i))
            .attr('points', function () {
                let planeX = svgWidth - margin.right + 40 + i / 1000 * 50
                let planeY = 450
                return closedPolygon(planeX, planeY, planeX + 5, planeY + 27, planeX, planeY + 24, planeX - 5, planeY + 27); // define a triangle in relative terms
            })
            .attr("fill", colorSteps(i))//fill airplane with corresponding colors -->line:163
        //draw text
        keySteps.append("text")
            .attr("x", svgWidth - margin.right + 40 + i / 1000 * 50)
            .attr("y", 490)
            .attr("font-size", 12)//Set font size
            .attr("text-anchor", "middle")
            .text((i));
    }

    let keyPlaneXYsec = function (i) {
        let planeX = svgWidth - margin.right * 2 + 60 + i / 1000 * 50
        let planeY = 550
        let planeAngle = angleScale(i)
        return `rotate(${planeAngle},${planeX},${planeY})`
    }
    //Draw each airplane & text (5-9 in the second row)
    for (let i = 5000; i <= 9000; i = i + 1000) {
        //draw each paper airplane
        keySteps.append("polyline")
            .attr("transform", keyPlaneXYsec(i))//get the angle(of rotation) & coordinate(of the center of rotation)
            // .attr("transform", keyPlaneXY(i))
            .attr('points', function () {
                let planeX = svgWidth - margin.right * 2 + 60 + i / 1000 * 50
                let planeY = 550
                return closedPolygon(planeX, planeY, planeX + 5, planeY + 27, planeX, planeY + 24, planeX - 5, planeY + 27); // define a triangle in relative terms
            })
            .attr("fill", colorSteps(i))//fill airplane with corresponding colors -->line:163

        //draw text
        keySteps.append("text")
            .attr("x", svgWidth - margin.right * 2 + 60 + i / 1000 * 50)
            .attr("y", 590)
            .attr("font-size", 12)//Set font size
            .attr("text-anchor", "middle")
            .text((i));
    }

    drawTriangleKey(svg); // To draw the main activities Key(the triangle)

}


/**** function drawTriangleKey(svg) *****
Draw keys of Triangle(Explain how to correspond to the data represented by each point) on SVG 

Parameters:
svg: svg canvas

Returns:
nothing
*****/
function drawTriangleKey(svg) {

    /* Draw Main Activity Key border. */
    let keyActivity = svg.append('g')
    keyActivity.append("rect")
        .attr("fill", "none")
        .attr("stroke", "darkgrey")
        .attr("x", 1)
        .attr("y", 10)
        .attr("width", 268)
        .attr("height", 720);

    /* Write Main Activity key title */
    keyActivity.append("text")
        .attr("x", 130)
        .attr("y", 35)
        .attr("font-size", 16)//Set font size
        .attr("text-anchor", "middle")
        .text("Main Activity (0%-100%)");

    /* Write Main Activity key Intro text */
    keyActivity.append("text")
        .attr("x", 135)
        .attr("y", 70)
        .attr("font-size", 13)//Set font size
        .attr("text-anchor", "middle")
        .text("Study + Play at home + Go outside = 100%");

    /******* To Draw three small triangles *******/
    let zeroX = 50;
    let zeroY = 260;

    // Draw the first triangle & Vertex (for Study)
    let StudyKey = svg.append("g")
    StudyKey.append('polyline')
        .attr('points', closedPolygon(zeroX, zeroY, zeroX + 160, zeroY, zeroX + 80, zeroY - 138.56))
        .attr("stroke", 'black')
        .attr("stroke-width", 2)
        .attr("fill", 'none')
        .attr("opacity", 0.3);
    StudyKey.append("text")
        .text("Study")
        .attr("x", zeroX + 80)
        .attr("y", zeroY - 150)
        .attr("stroke", "blue")
        .attr("stroke-width", 0.5)
        .attr("font-size", 18)
        .attr("text-anchor", "middle")
    // Draw parallel lines & Axis Texts for study
    for (let i = 0; i <= 5; i++) {
        svg.append("line")
            .attr("x1", zeroX + 32 * i)
            .attr("y1", zeroY)
            .attr("x2", zeroX + 16 * i)
            .attr("y2", zeroY - 27.712 * i)
            .attr("stroke", "lightblue")
            .attr("opacity", 0.8)
            .attr("stroke-width", 2)
        svg.append("text")
            .text(percent[10 - i * 2])
            .attr("x", zeroX - 25 + 16 * i)
            .attr("y", zeroY + 3 - 27.712 * i)
            .attr("stroke", "blue")
            .attr("font-size", 12)
            .attr("stroke-width", 0.5)
    }

    // Draw the second triangle & Vertex (for Play at home)
    StudyKey.append('polyline')
        .attr('points', closedPolygon(50, 460, 50 + 160, 460, 50 + 80, 460 - 138.56))
        .attr("stroke", 'black')
        .attr("stroke-width", 2)
        .attr("fill", 'none')
        .attr("opacity", 0.3);
    StudyKey.append("text")
        .text("Play at home")
        .attr("x", zeroX + 10)
        .attr("y", zeroY + 230)
        .attr("stroke", "palevioletred")
        .attr("stroke-width", 0.5)
        .attr("font-size", 18)
        .attr("text-anchor", "middle")
    // Draw parallel lines & Axis Texts for Play at home
    for (let i = 0; i <= 5; i++) {
        svg.append("line")
            .attr("x1", zeroX + 32 * i)
            .attr("y1", zeroY + 200)
            .attr("x2", zeroX + 80 + 16 * i)
            .attr("y2", zeroY + 200 - 138.56 + 27.712 * i)
            .attr("stroke", "pink")
            .attr("opacity", 0.8)
            .attr("stroke-width", 2)
        svg.append("text")
            .text(percent[i * 2])
            .attr("x", zeroX - 5 + 32 * i)
            .attr("y", zeroY + 200 + 15)
            .attr("stroke", "palevioletred")
            .attr("font-size", 12)
            .attr("stroke-width", 0.5)
    }

    // Draw the third triangle & Vertex (for Go outside)
    StudyKey.append('polyline')
        .attr('points', closedPolygon(50, 675, 50 + 160, 675, 50 + 80, 675 - 138.56))
        .attr("stroke", 'black')
        .attr("stroke-width", 2)
        .attr("fill", 'none')
        .attr("opacity", 0.3);
    StudyKey.append("text")
        .text("Go outside")
        .attr("x", zeroX + 160)
        .attr("y", zeroY + 435)
        .attr("stroke", "orange")
        .attr("stroke-width", 0.5)
        .attr("font-size", 18)
        .attr("text-anchor", "middle")
    // Draw parallel lines & Axis Texts for Go outside
    for (let i = 0; i <= 5; i++) {
        svg.append("line")
            .attr("x1", zeroX + 16 * i)
            .attr("y1", zeroY + 415 - 27.712 * i)
            .attr("x2", zeroX + 160 - 16 * i)
            .attr("y2", zeroY + 415 - 27.712 * i)
            .attr("stroke", "orange")
            .attr("opacity", 0.45)
            .attr("stroke-width", 2)
        svg.append("text")
            .text(percent[i * 2])
            .attr("x", zeroX + 160 + 4 - 16 * i)
            .attr("y", zeroY + 415 - 27.712 * i)
            .attr("stroke", "orange")
            .attr("font-size", 12)
            .attr("stroke-width", 0.5)
    }

}
