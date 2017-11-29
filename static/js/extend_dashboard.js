var ul = $('ul#side-menu');
$.ajax({
	url : '/static/extend_dashboard_links.html',
	type: "get",
	success : function(response){
		console.log("Load /static/extend_dashboard_links.html");
		ul.append(response);
	}
});

var wrapper = $('div#wrapper');
$.ajax({
	url : '/static/extend_dashboard_pages.html',
	type: "get",
	success : function(response){
		console.log("Load /static/extend_dashboard_pages.html");
		wrapper.append(response);

		// Form submit call goes here.
		$("form#form-input").submit( onInputFormSubmit );
	}
});

/*
  Add functionality to the input page form
*/
function onInputFormSubmit(e){
	e.preventDefault();
	var object_id = "obj-names";
	var stream_id = "stm-form-input";
	// Gather the data
	// and remove any undefined keys
	var data = {};
	$('input',this).each( function(i, v){
		var input = $(v); data[input.attr("name")] = input.val();
	});
	delete data["undefined"];
	//console.log( data );

	var url = '/networks/'+network_id+'/objects/';
	url = url + object_id+'/streams/'+stream_id+'/points';
	var query = {
		"points-value": JSON.stringify( data )
	};

	// Send the request to the Pico server
	$.ajax({
		url : url+'?'+$.param(query),
		type: "post",
		success : function(response){
			var this_form = $("form#form-input");

			if( response['points-code'] == 200 ){
			console.log("Success");
			// Clear the form
			this_form.trigger("reset");
		}
	// Log the response to the console
	console.log(response);
	},
	error : function(jqXHR, textStatus, errorThrown){
		// Do nothing
	}
	});
};

/*
  Add function to get points for report page
*/
function getPoints( the_network_id, the_object_id, the_stream_id, callback ){
	var query_data = {};
	var query_string = '?'+$.param(query_data);
	var url = '/networks/'+the_network_id+'/objects/'+the_object_id;
	url += '/streams/'+the_stream_id+'/points'+query_string;

	// Send the request to the server
	$.ajax({
		url : url,
		type: "get",
		success : function(response){
			//console.log( response );
			if( response['points-code'] == 200 ){
				var num_points = response.points.length
				var most_recent_value = response.points[0].value
				//console.log("Most recent value: "+most_recent_value);
				//console.log("Number of points retrieved: "+num_points);
				//console.log(response.points)
				callback( response.points );
			}
		},
		error : function(jqXHR, textStatus, errorThrown){
			console.log(jqXHR);
		}
	});
}

// Call getPoints if Input or Report is selected
// ...added feature to dynamically update plot as new data becomes available
custom_sidebar_link_callback = function( select ){
	if (select == 'input') {

	}
	else if (select == 'report'){
		var plotCalls = 0;
		var plotTimer = setInterval( function(){
			getPoints('local','arduino-temp','temp-stream', function(points){
				console.log( "The points request was successful!" );
				loadPlot( points, 'content-report' );
			});
			if( plotCalls > 20 ){
				console.log( 'Clear timer' );
				clearInterval( plotTimer );
			}else{
				plotCalls += 1;
			}
		}, 1000);
	}
}

/*
    Function to plot data points using Highcharts
*/
function loadPlot( points, container_name ){
	var plot = $('#'+container_name);
	// Check if plot has a Highcharts element
	if( plot.highcharts() === undefined ){
		// Create a Highcharts element
		plot.highcharts( report_plot_options );
	}
	// Iterate over points to place in Highcharts format
	var datapoints = [];
	for ( var i = 0; i < points.length; i++){
		var at_date = new Date(points[i].at);
		var at = at_date.getTime() - at_date.getTimezoneOffset()*60*1000; datapoints.unshift( [ at, points[i].value] );
	}
	// Update Highcharts plot
	if( plot.highcharts().series.length > 0 ){
		plot.highcharts().series[0].setData( datapoints );
	}else{
		plot.highcharts().addSeries({
			name: "Stream Wattage",
			data: datapoints });
	}
}

var report_plot_options = {
	chart: {
		type: 'spline'
	},
	title: {
		text: 'Watts vs Time'
	},
	xAxis: {
		title: {
			text: 'Time'
		},
		type: 'datetime',
		dateTimeLabelFormats: { // don't display the dummy year
			month: '%e. %b',
			year: '%b'
		},
	},
	yAxis: {
		title: {
			text: 'Watts (W)'
		}
	},
};


/*
// from: http://jsfiddle.net/gh/get/library/pure/highcharts/highcharts/tree/master/samples/highcharts/demo/dynamic-master-detail/
function energyusagedashboard(){
	obj_name = "OBJ-CURR-SENSORS"
	stream_name = "data-curr-sens-three"
	getPoints('local',obj_name,stream_name, function (data) {
		console.log(data);
		tmp = {};
		for (i=0; i<data.length; i++){
			at = data[i].at;
			val = data[i].val;
			tmp[i]= [at, val];
		}
		data = tmp;
		var detailChart;

    // create the detail chart
    function createDetail(masterChart) {

        // prepare the detail chart
        var detailData = [],
            detailStart = data[0][0];

        $.each(masterChart.series[0].data, function () {
            if (this.x >= detailStart) {
                detailData.push(this.y);
            }
        });

        // create a detail chart referenced by a global variable
        detailChart = Highcharts.chart('detail-container', {
            chart: {
                marginBottom: 120,
                reflow: false,
                marginLeft: 50,
                marginRight: 20,
                style: {
                    position: 'absolute'
                }
            },
            credits: {
                enabled: false
            },
            title: {
                text: 'Building Composite Energy Usage'
            },
            subtitle: {
                text: 'Select an \'timebox\' by dragging across the lower chart'
            },
            xAxis: {
                type: 'datetime'
            },
            yAxis: {
                title: {
                    text: null
                },
                maxZoom: 0.1
            },
            tooltip: {
                formatter: function () {
                    var point = this.points[0];
                    return '<b>' + point.series.name + '</b><br/>' + Highcharts.dateFormat('%A %B %e %Y', this.x) + ':<br/>' +
                        '1 USD = ' + Highcharts.numberFormat(point.y, 2) + ' EUR';
                },
                shared: true
            },
            legend: {
                enabled: false
            },
            plotOptions: {
                series: {
                    marker: {
                        enabled: false,
                        states: {
                            hover: {
                                enabled: true,
                                radius: 3
                            }
                        }
                    }
                }
            },
            series: [{
                name: 'USD to EUR',
                pointStart: detailStart,
                pointInterval: 24 * 3600 * 1000,
                data: detailData
            }],

            exporting: {
                enabled: false
            }

        }); // return chart
    }

    // create the master chart
    function createMaster() {
        Highcharts.chart('master-container', {
            chart: {
                reflow: false,
                borderWidth: 0,
                backgroundColor: null,
                marginLeft: 50,
                marginRight: 20,
                zoomType: 'x',
                events: {

                    // listen to the selection event on the master chart to update the
                    // extremes of the detail chart
                    selection: function (event) {
                        var extremesObject = event.xAxis[0],
                            min = extremesObject.min,
                            max = extremesObject.max,
                            detailData = [],
                            xAxis = this.xAxis[0];

                        // reverse engineer the last part of the data
                        $.each(this.series[0].data, function () {
                            if (this.x > min && this.x < max) {
                                detailData.push([this.x, this.y]);
                            }
                        });

                        // move the plot bands to reflect the new detail span
                        xAxis.removePlotBand('mask-before');
                        xAxis.addPlotBand({
                            id: 'mask-before',
                            from: data[0][0],
                            to: min,
                            color: 'rgba(0, 0, 0, 0.2)'
                        });

                        xAxis.removePlotBand('mask-after');
                        xAxis.addPlotBand({
                            id: 'mask-after',
                            from: max,
                            to: data[data.length - 1][0],
                            color: 'rgba(0, 0, 0, 0.2)'
                        });


                        detailChart.series[0].setData(detailData);

                        return false;
                    }
                }
            },
            title: {
                text: null
            },
            xAxis: {
                type: 'datetime',
                showLastTickLabel: true,
                maxZoom: 14 * 24 * 3600000, // fourteen days
                plotBands: [{
                    id: 'mask-before',
                    from: data[0][0],
                    to: data[data.length - 1][0],
                    color: 'rgba(0, 0, 0, 0.2)'
                }],
                title: {
                    text: null
                }
            },
            yAxis: {
                gridLineWidth: 0,
                labels: {
                    enabled: false
                },
                title: {
                    text: null
                },
                min: 0.6,
                showFirstLabel: false
            },
            tooltip: {
                formatter: function () {
                    return false;
                }
            },
            legend: {
                enabled: false
            },
            credits: {
                enabled: false
            },
            plotOptions: {
                series: {
                    fillColor: {
                        linearGradient: [0, 0, 0, 70],
                        stops: [
                            [0, Highcharts.getOptions().colors[0]],
                            [1, 'rgba(255,255,255,0)']
                        ]
                    },
                    lineWidth: 1,
                    marker: {
                        enabled: false
                    },
                    shadow: false,
                    states: {
                        hover: {
                            lineWidth: 1
                        }
                    },
                    enableMouseTracking: false
                }
            },

            series: [{
                type: 'area',
                name: 'USD to EUR',
                pointInterval: 24 * 3600 * 1000,
                pointStart: data[0][0],
                data: data
            }],

            exporting: {
                enabled: false
            }

        }, function (masterChart) {
            createDetail(masterChart);
        }); // return chart instance
    }

    // make the container smaller and add a second container for the master chart
    var $container = $('#containerEnergyUsageComposite')
        .css('position', 'relative');

    $('<div id="detail-container">')
        .appendTo($container);

    $('<div id="master-container">')
        .css({
            position: 'absolute',
            top: 300,
            height: 100,
            width: '100%'
        })
            .appendTo($container);

    // create master and in its callback, create the detail chart
    createMaster();
});
} //end energyusagedashboard() def
*/


//TODO - need to make this usable for different streams and different container names
function energyusagecomponentstream(container_name,obj_name,stream_name){
	var plotCalls = 0;
	var plotTimer = setInterval( function(){
		getPoints('local',obj_name,stream_name, function(points){
			//console.log( "The points request was successful!" );
			loadPlot( points, container_name );
		});
		if( plotCalls > 20 ){
			console.log( 'Clear timer' );
			clearInterval( plotTimer );
		}else{
			plotCalls += 1;
		}
	}, 1000);
}

//energyusagedashboard() //load master detail
energyusagecomponentstream('containerEnergyUsageComposite','OBJ-CURR-SENSORS','data-curr-sens-all')
energyusagecomponentstream('containerEnergyUsageComponent1','OBJ-CURR-SENSORS','data-curr-sens-one') //load one stream
energyusagecomponentstream('containerEnergyUsageComponent2','OBJ-CURR-SENSORS','data-curr-sens-two') //load another stream
energyusagecomponentstream('containerEnergyUsageComponent3','OBJ-CURR-SENSORS','data-curr-sens-three') //load another stream



// from: http://jsfiddle.net/gh/get/library/pure/highcharts/highcharts/tree/master/samples/highcharts/demo/polar-wind-rose/
function loadco2chart() {
	console.log('co2 called');
	// Parse the data from an inline table using the Highcharts Data plugin
	const container_name = 'containerco2impact';
	//var plot = $('#'+container_name);
	var plot = Highcharts.chart(container_name, {
	    data: {
	        table: 'freq',
	        startRow: 1,
	        endRow: 17,
	        endColumn: 7
	    },

	    chart: {
	        polar: true,
	        type: 'column'
	    },

	    title: {
	        text: 'Wind rose for South Shore Met Station, Oregon'
	    },

	    subtitle: {
	        text: 'Source: or.water.usgs.gov'
	    },

	    pane: {
	        size: '85%'
	    },

	    legend: {
	        align: 'right',
	        verticalAlign: 'top',
	        y: 100,
	        layout: 'vertical'
	    },

	    xAxis: {
	        tickmarkPlacement: 'on'
	    },

	    yAxis: {
	        min: 0,
	        endOnTick: false,
	        showLastLabel: true,
	        title: {
	            text: 'Frequency (%)'
	        },
	        labels: {
	            formatter: function () {
	                return this.value + '%';
	            }
	        },
	        reversedStacks: false
	    },

	    tooltip: {
	        valueSuffix: '%'
	    },

	    plotOptions: {
	        series: {
	            stacking: 'normal',
	            shadow: false,
	            groupPadding: 0,
	            pointPlacement: 'on'
	        }
	    }
	});
}

loadco2chart()

function loadgoalschart(){
	Highcharts.chart('containerGoals', {
    chart: {
        zoomType: 'xy'
    },
    title: {
        text: 'Average Monthly Weather Data for Tokyo'
    },
    subtitle: {
        text: 'Source: WorldClimate.com'
    },
    xAxis: [{
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        crosshair: true
    }],
    yAxis: [{ // Primary yAxis
        labels: {
            format: '{value} W',
            style: {
                color: Highcharts.getOptions().colors[2]
            }
        },
        title: {
            text: 'Temperature',
            style: {
                color: Highcharts.getOptions().colors[2]
            }
        },
        opposite: true

    }, { // Secondary yAxis
        gridLineWidth: 0,
        title: {
            text: 'Rainfall',
            style: {
                color: Highcharts.getOptions().colors[0]
            }
        },
        labels: {
            format: '{value} mm',
            style: {
                color: Highcharts.getOptions().colors[0]
            }
        }

    }, { // Tertiary yAxis
        gridLineWidth: 0,
        title: {
            text: 'Sea-Level Pressure',
            style: {
                color: Highcharts.getOptions().colors[1]
            }
        },
        labels: {
            format: '{value} mb',
            style: {
                color: Highcharts.getOptions().colors[1]
            }
        },
        opposite: true
    }],
    tooltip: {
        shared: true
    },
    legend: {
        layout: 'vertical',
        align: 'left',
        x: 80,
        verticalAlign: 'top',
        y: 55,
        floating: true,
        backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
    },
    series: [{
        name: 'Rainfall',
        type: 'column',
        yAxis: 1,
        data: [49.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4],
        tooltip: {
            valueSuffix: ' mm'
        }

    }, {
        name: 'Sea-Level Pressure',
        type: 'spline',
        yAxis: 2,
        data: [1016, 1016, 1015.9, 1015.5, 1012.3, 1009.5, 1009.6, 1010.2, 1013.1, 1016.9, 1018.2, 1016.7],
        marker: {
            enabled: false
        },
        dashStyle: 'shortdot',
        tooltip: {
            valueSuffix: ' mb'
        }

    }, {
        name: 'Temperature',
        type: 'spline',
        data: [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6],
        tooltip: {
            valueSuffix: ' °C'
        }
    }]
});


}

loadgoalschart()


function loadenergypriceschart(){
	/**
 * This is an advanced demo of setting up Highcharts with the flags feature borrowed from Highstock.
 * It also shows custom graphics drawn in the chart area on chart load.
 */


/**
 * Fires on chart load, called from the chart.events.load option.
 */
function onChartLoad() {

    var centerX = 140,
        centerY = 110,
        path = [],
        angle,
        radius,
        badgeColor = Highcharts.Color(Highcharts.getOptions().colors[0]).brighten(-0.2).get(),
        spike,
        empImage,
        big5,
        label,
        left,
        right,
        years,
        renderer;

    if (this.chartWidth < 530) {
        return;
    }

    // Draw the spiked disc
    for (angle = 0; angle < 2 * Math.PI; angle += Math.PI / 24) {
        radius = spike ? 80 : 70;
        path.push(
            'L',
            centerX + radius * Math.cos(angle),
            centerY + radius * Math.sin(angle)
        );
        spike = !spike;
    }
    path[0] = 'M';
    path.push('z');
    this.renderer.path(path)
        .attr({
            fill: badgeColor,
            zIndex: 6
        })
        .add();

    // Employee image overlay
    empImage = this.renderer.path(path)
        .attr({
            zIndex: 7,
            opacity: 0,
            stroke: badgeColor,
            'stroke-width': 1
        })
        .add();

    // Big 5
    big5 = this.renderer.text('5')
        .attr({
            zIndex: 6
        })
        .css({
            color: 'white',
            fontSize: '100px',
            fontStyle: 'italic',
            fontFamily: '\'Brush Script MT\', sans-serif'
        })
        .add();
    big5.attr({
        x: centerX - big5.getBBox().width / 2,
        y: centerY + 14
    });

    // Draw the label
    label = this.renderer.text('Highcharts Anniversary')
        .attr({
            zIndex: 6
        })
        .css({
            color: '#FFFFFF'
        })
        .add();

    left = centerX - label.getBBox().width / 2;
    right = centerX + label.getBBox().width / 2;

    label.attr({
        x: left,
        y: centerY + 44
    });

    // The band
    left = centerX - 90;
    right = centerX + 90;
    this.renderer
        .path([
            'M', left, centerY + 30,
            'L', right, centerY + 30,
            right, centerY + 50,
            left, centerY + 50,
            'z',
            'M', left, centerY + 40,
            'L', left - 20, centerY + 40,
            left - 10, centerY + 50,
            left - 20, centerY + 60,
            left + 10, centerY + 60,
            left, centerY + 50,
            left + 10, centerY + 60,
            left + 10, centerY + 50,
            left, centerY + 50,
            'z',
            'M', right, centerY + 40,
            'L', right + 20, centerY + 40,
            right + 10, centerY + 50,
            right + 20, centerY + 60,
            right - 10, centerY + 60,
            right, centerY + 50,
            right - 10, centerY + 60,
            right - 10, centerY + 50,
            right, centerY + 50,
            'z'
        ])
        .attr({
            fill: badgeColor,
            stroke: '#FFFFFF',
            'stroke-width': 1,
            zIndex: 5
        })
        .add();

    // 2009-2014
    years = this.renderer.text('2009-2014')
        .attr({
            zIndex: 6
        })
        .css({
            color: '#FFFFFF',
            fontStyle: 'italic',
            fontSize: '10px'
        })
        .add();
    years.attr({
        x: centerX - years.getBBox().width / 2,
        y: centerY + 62
    });


    // Prepare mouseover
    renderer = this.renderer;
    if (renderer.defs) { // is SVG
        $.each(this.get('employees').points, function () {
            var point = this,
                pattern;
            if (point.image) {
                pattern = renderer.createElement('pattern').attr({
                    id: 'pattern-' + point.image,
                    patternUnits: 'userSpaceOnUse',
                    width: 400,
                    height: 400
                }).add(renderer.defs);
                renderer.image(
                    'https://www.highcharts.com/images/employees2014/' + point.image + '.jpg',
                    centerX - 80,
                    centerY - 80,
                    160,
                    213
                ).add(pattern);

                Highcharts.addEvent(point, 'mouseOver', function () {
                    empImage
                        .attr({
                            fill: 'url(#pattern-' + point.image + ')'
                        })
                        .animate({ opacity: 1 }, { duration: 500 });
                });
                Highcharts.addEvent(point, 'mouseOut', function () {
                    empImage.animate({ opacity: 0 }, { duration: 500 });
                });
            }
        });
    }
}


var options = {

    chart: {
        events: {
            load: onChartLoad
        }
    },

    xAxis: {
        type: 'datetime',
        minTickInterval: 365 * 24 * 36e5,
        labels: {
            align: 'left'
        },
        plotBands: [{
            from: Date.UTC(2009, 10, 27),
            to: Date.UTC(2010, 11, 1),
            color: '#EFFFFF',
            label: {
                text: '<em>Offices:</em><br> Torstein\'s basement',
                style: {
                    color: '#999999'
                },
                y: 180
            }
        }, {
            from: Date.UTC(2010, 11, 1),
            to: Date.UTC(2013, 9, 1),
            color: '#FFFFEF',
            label: {
                text: '<em>Offices:</em><br> Tomtebu',
                style: {
                    color: '#999999'
                },
                y: 30
            }
        }, {
            from: Date.UTC(2013, 9, 1),
            to: Date.UTC(2014, 10, 27),
            color: '#FFEFFF',
            label: {
                text: '<em>Offices:</em><br> VikØrsta',
                style: {
                    color: '#999999'
                },
                y: 30
            }
        }]

    },

    title: {
        text: 'Highcharts and Highsoft timeline'
    },

    tooltip: {
        style: {
            width: '250px'
        }
    },

    yAxis: [{
        max: 100,
        labels: {
            enabled: false
        },
        title: {
            text: ''
        },
        gridLineColor: 'rgba(0, 0, 0, 0.07)'
    }, {
        allowDecimals: false,
        max: 15,
        labels: {
            style: {
                color: Highcharts.getOptions().colors[2]
            }
        },
        title: {
            text: 'Employees',
            style: {
                color: Highcharts.getOptions().colors[2]
            }
        },
        opposite: true,
        gridLineWidth: 0
    }],

    plotOptions: {
        series: {
            marker: {
                enabled: false,
                symbol: 'circle',
                radius: 2
            },
            fillOpacity: 0.5
        },
        flags: {
            tooltip: {
                xDateFormat: '%B %e, %Y'
            }
        }
    },

    series: [{
        type: 'spline',
        id: 'google-trends',
        dashStyle: 'dash',
        name: 'Google search for <em>highcharts</em>',
        data: [{ x: 1258322400000, /* November 2009 */ y: 0 }, { x: 1260961200000, y: 5 }, { x: 1263639600000, y: 7 }, { x: 1266188400000, y: 5 }, { x: 1268740800000, y: 6 }, { x: 1271368800000, y: 8 }, { x: 1274004000000, y: 11 }, { x: 1276639200000, y: 9 }, { x: 1279274400000, y: 12 }, { x: 1281952800000, y: 13 }, { x: 1284588000000, y: 17 }, { x: 1287223200000, y: 17 }, { x: 1289858400000, y: 18 }, { x: 1292497200000, y: 20 }, { x: 1295175600000, y: 20 }, { x: 1297724400000, y: 27 }, { x: 1300276800000, y: 32 }, { x: 1302904800000, y: 29 }, { x: 1305540000000, y: 34 }, { x: 1308175200000, y: 34 }, { x: 1310810400000, y: 36 }, { x: 1313488800000, y: 43 }, { x: 1316124000000, y: 44 }, { x: 1318759200000, y: 42 }, { x: 1321394400000, y: 47 }, { x: 1324033200000, y: 46 }, { x: 1326711600000, y: 50 }, { x: 1329303600000, y: 57 }, { x: 1331899200000, y: 54 }, { x: 1334527200000, y: 59 }, { x: 1337162400000, y: 62 }, { x: 1339797600000, y: 66 }, { x: 1342432800000, y: 61 }, { x: 1345111200000, y: 68 }, { x: 1347746400000, y: 67 }, { x: 1350381600000, y: 73 }, { x: 1353016800000, y: 63 }, { x: 1355655600000, y: 54 }, { x: 1358334000000, y: 67 }, { x: 1360882800000, y: 74 }, { x: 1363435200000, y: 81 }, { x: 1366063200000, y: 89 }, { x: 1368698400000, y: 83 }, { x: 1371333600000, y: 88 }, { x: 1373968800000, y: 86 }, { x: 1376647200000, y: 81 }, { x: 1379282400000, y: 83 }, { x: 1381917600000, y: 95 }, { x: 1384552800000, y: 86 }, { x: 1387191600000, y: 83 }, { x: 1389870000000, y: 89 }, { x: 1392418800000, y: 90 }, { x: 1394971200000, y: 94 }, { x: 1397599200000, y: 100 }, { x: 1400234400000, y: 100 }, { x: 1402869600000, y: 99 }, { x: 1405504800000, y: 99 }, { x: 1408183200000, y: 93 }, { x: 1410818400000, y: 97 }, { x: 1413453600000, y: 98 }],
        tooltip: {
            xDateFormat: '%B %Y',
            valueSuffix: ' % of best month'
        }
    }, {
        name: 'Revenue',
        id: 'revenue',
        type: 'area',
        data: [[1257033600000, 2], [1259625600000, 3], [1262304000000, 2], [1264982400000, 3], [1267401600000, 4], [1270080000000, 4], [1272672000000, 4], [1275350400000, 4], [1277942400000, 5], [1280620800000, 7], [1283299200000, 6], [1285891200000, 9], [1288569600000, 10], [1291161600000, 8], [1293840000000, 10], [1296518400000, 13], [1298937600000, 15], [1301616000000, 14], [1304208000000, 15], [1306886400000, 16], [1309478400000, 22], [1312156800000, 19], [1314835200000, 20], [1317427200000, 32], [1320105600000, 34], [1322697600000, 36], [1325376000000, 34], [1328054400000, 40], [1330560000000, 37], [1333238400000, 35], [1335830400000, 40], [1338508800000, 38], [1341100800000, 39], [1343779200000, 43], [1346457600000, 49], [1349049600000, 43], [1351728000000, 54], [1354320000000, 44], [1356998400000, 43], [1359676800000, 43], [1362096000000, 52], [1364774400000, 52], [1367366400000, 56], [1370044800000, 62], [1372636800000, 66], [1375315200000, 62], [1377993600000, 63], [1380585600000, 60], [1383264000000, 60], [1385856000000, 58], [1388534400000, 65], [1391212800000, 52], [1393632000000, 72], [1396310400000, 57], [1398902400000, 70], [1401580800000, 63], [1404172800000, 65], [1406851200000, 65], [1409529600000, 89], [1412121600000, 100]],
        tooltip: {
            xDateFormat: '%B %Y',
            valueSuffix: ' % of best month'
        }

    }, {
        yAxis: 1,
        name: 'Highsoft employees',
        id: 'employees',
        type: 'area',
        step: 'left',
        tooltip: {
            headerFormat: '<span style="font-size: 11px;color:#666">{point.x:%B %e, %Y}</span><br>',
            pointFormat: '{point.name}<br><b>{point.y}</b>',
            valueSuffix: ' employees'
        },
        data: [
            { x: Date.UTC(2009, 10, 1), y: 1, name: 'Torstein worked alone', image: 'Torstein' },
            { x: Date.UTC(2010, 10, 20), y: 2, name: 'Grethe joined', image: 'Grethe' },
            { x: Date.UTC(2011, 3, 1), y: 3, name: 'Erik joined', image: null },
            { x: Date.UTC(2011, 7, 1), y: 4, name: 'Gert joined', image: 'Gert' },
            { x: Date.UTC(2011, 7, 15), y: 5, name: 'Hilde joined', image: 'Hilde' },
            { x: Date.UTC(2012, 5, 1), y: 6, name: 'Guro joined', image: 'Guro' },
            { x: Date.UTC(2012, 8, 1), y: 5, name: 'Erik left', image: null },
            { x: Date.UTC(2012, 8, 15), y: 6, name: 'Anne Jorunn joined', image: 'AnneJorunn' },
            { x: Date.UTC(2013, 0, 1), y: 7, name: 'Hilde T. joined', image: null },
            { x: Date.UTC(2013, 7, 1), y: 8, name: 'Jon Arild joined', image: 'JonArild' },
            { x: Date.UTC(2013, 7, 20), y: 9, name: 'Øystein joined', image: 'Oystein' },
            { x: Date.UTC(2013, 9, 1), y: 10, name: 'Stephane joined', image: 'Stephane' },
            { x: Date.UTC(2014, 9, 1), y: 11, name: 'Anita joined', image: 'Anita' },
            { x: Date.UTC(2014, 10, 27), y: 11, name: ' ', image: null }
        ]

    }]
};

// Add flags for important milestones. This requires Highstock.
if (Highcharts.seriesTypes.flags) {
    options.series.push({
        type: 'flags',
        name: 'Cloud',
        color: '#333333',
        shape: 'squarepin',
        y: -80,
        data: [
            { x: Date.UTC(2014, 4, 1), text: 'Highcharts Cloud Beta', title: 'Cloud', shape: 'squarepin' }
        ],
        showInLegend: false
    }, {
        type: 'flags',
        name: 'Highmaps',
        color: '#333333',
        shape: 'squarepin',
        y: -55,
        data: [
            { x: Date.UTC(2014, 5, 13), text: 'Highmaps version 1.0 released', title: 'Maps' }
        ],
        showInLegend: false
    }, {
        type: 'flags',
        name: 'Highcharts',
        color: '#333333',
        shape: 'circlepin',
        data: [
            { x: Date.UTC(2009, 10, 27), text: 'Highcharts version 1.0 released', title: '1.0' },
            { x: Date.UTC(2010, 6, 13), text: 'Ported from canvas to SVG rendering', title: '2.0' },
            { x: Date.UTC(2010, 10, 23), text: 'Dynamically resize and scale to text labels', title: '2.1' },
            { x: Date.UTC(2011, 9, 18), text: 'Highstock version 1.0 released', title: 'Stock', shape: 'squarepin' },
            { x: Date.UTC(2012, 7, 24), text: 'Gauges, polar charts and range series', title: '2.3' },
            { x: Date.UTC(2013, 2, 22), text: 'Multitouch support, more series types', title: '3.0' },
            { x: Date.UTC(2014, 3, 22), text: '3D charts, heatmaps', title: '4.0' }
        ],
        showInLegend: false
    }, {
        type: 'flags',
        name: 'Events',
        color: '#333333',
        fillColor: 'rgba(255,255,255,0.8)',
        data: [
            { x: Date.UTC(2012, 10, 1), text: 'Highsoft won "Entrepeneur of the Year" in Sogn og Fjordane, Norway', title: 'Award' },
            { x: Date.UTC(2012, 11, 25), text: 'Packt Publishing published <em>Learning Highcharts by Example</em>. Since then, many other books are written about Highcharts.', title: 'First book' },
            { x: Date.UTC(2013, 4, 25), text: 'Highsoft nominated Norway\'s Startup of the Year', title: 'Award' },
            { x: Date.UTC(2014, 4, 25), text: 'Highsoft nominated Best Startup in Nordic Startup Awards', title: 'Award' }
        ],
        onSeries: 'revenue',
        showInLegend: false
    });
}

$('#containerEnergyPrices').highcharts(options);
}

loadenergypriceschart()


console.log("Adding toggle functionality");
//registerHandlers();

//function registerHandlers() {
// https://stackoverflow.com/questions/9180087/how-to-handle-change-of-checkbox-using-jquery

$('#btn-1').click(function () {
    $('#actuate-toggle-device-01').prop('checked', !$('#actuate-toggle-device-01').is(':checked'));
});

$('#btn-2').click(function () {
    var chk1 = $('#actuate-toggle-device-01').is(':checked');
    console.log("Value : " + chk1);
});

$('input[type="checkbox"]').change(function () {
    var name = $(this).val();
    var check = $(this).prop('checked');
    console.log("Change: " + name + " to " + check);
		if (check){
			//clicked to true >> turn on device
			console.log('hello brian set to true');
		}else{
			console.log('hello brian set to false');
			//clicked to false >> turn off device
			network_id = "local"
			object_id = "OBJ-PSWITCH-TAIL"
			stream_id = "actuate-pswitch-tail"
			// Send the request to the WCC server
			url = '/networks/'+network_id+'/objects/'+ object_id +'/streams/'+ stream_id +'/points'
/*
			$.post(url,
	    {
	        'points-at': "2017-10-18T07:32:29.243313Z",
	        'points-value': 1
	    },
	    function(data, status){
				message = '';
				for (i = 0; i < Object.keys(data).length; i++) {
				    message += Object.keys(data)[i] + ': ' + data[Object.keys(data)[i]] + ',';
				}
				console.log(message);
        //alert("Data: " + message + "\nStatus: " + status);
	    });
			*/
			$.ajax({
			  url: url,
			  type: "POST",
			  dataType:'json',
			  data: {
		        'points-at': "2017-10-18T07:32:29.243313Z",
		        'points-value': 1
		    },
			  success: function(data){
					message = '';
					for (i = 0; i < Object.keys(data).length; i++) {
							message += Object.keys(data)[i] + ': ' + data[Object.keys(data)[i]] + ',';
					}
			    console.log(message);
			  }
			});
			/*
			// Gather the data
			// and remove undefined keys(buttons)
			network_id = "local"
			object_id = "OBJ-PSWITCH-TAIL"
			stream_id = "actuate-pswitch-tail"
			// Send the request to the WCC server
			$.ajax({
				url : '/networks/'+network_id+'/objects/'+ object_id +'/streams/'+ stream_id +'/points',
				type: "put",
				cache: false,
				query = {
			        'points-value': click,
			        'points-at':
			    },
				success : function(response){
					var this_form = $("input[type='checkbox']");
					var message = $('<div class="alert" style="margin-top:20px"></div>');
					var url_array = this.url.split('?');
					var url = url_array[0]; // URL without '_' parameter
					var req = $('<pre class="language-"><b>GET</b> '+url+'</pre>');

					if( response['stream-code'] == 200 ){
						// Start Success message
						message.addClass('alert-success');
						message.append("<h4>Success!</h4>");
						req.css({ 'color': '#3c763d' });
					}else{
						// Start Danger message
						message.addClass('alert-danger');
						message.append("<h4>Error</h4>");
						req.css({ 'color': '#a94442' });
					}

					// Add Request message
					message.append('<p>Request</p>');
					message.append( req );

					// Add Response message
					message.append('<p>Response</p>');
					var json_code = $('<pre class="language-javascript"><code class="language-javascript">'+JSON.stringify(response,null,4)+'</code></pre>');
					message.append( json_code );

					// Highlight JSON with Prism
					Prism.highlightElement(json_code[0]);

					// Add/Replace Alert message
					if ( $('.alert', this_form).length ) {
						$('.alert', this_form).replaceWith( message );
					}else{
						this_form.append(message);
					}
				},
				error : function(jqXHR, textStatus, errorThrown){
					var this_form = $("input[type='checkbox']");

					// Add Error message
					var message = $('<div class="alert" style="margin-top:20px"></div>');
					message.addClass('alert-danger');
					message.append("<h4>Error</h4>");
					message.append("<p>Status Code: "+jqXHR.status+"</p>");
					message.append("<p>Status Text: "+textStatus+"</p>");

					// Add/Replace Alert message
					if ( $('.alert', this_form).length ) {
						$('.alert', this_form).replaceWith( message );
					}else{
						this_form.append(message);
					}
				}
			});
			*/
		}
});

// $('input[type="checkbox"]').bind('click', function(){
// 	alert("OK");
// })
