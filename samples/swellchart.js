(function($) {

  var SwellChart = {
    drawBackground: function() {
      this.canvas.rect(0, 0, 300, 330).attr({stroke: "none", fill: "#eaeaea"});
    },

    plotAmWaveHeights: function() {
      this.dataSet.plot(this.grid, this.canvas);
      this.addAmPmIndicators("am");          
    },
    
    plotPmWaveHeights: function(wave_height_pm) {
      this.settings.barOffset = this.settings.barWidth;
      this.settings.barColor = "#fff";
      this.replaceDataSet(wave_height_pm);
      this.plotCurrentDataSet();
      this.addAmPmIndicators("pm");
    },
    
    drawYAxisSightLines: function() {
      var increment = 1;
      if (this.grid.maxValueYAxis > 10) {
        increment = 2;
      }
      if (this.grid.maxValueYAxis > 20) {
        increment = 3;
      }
      for (var i = 0, ii = (this.grid.maxValueYAxis); i <= ii; i = i + increment) {
        var value = i,
            y     = this.grid.y(value),
            x     = this.grid.leftEdge;
        this.canvas.path({stroke: "#fff"}).moveTo(x,y).lineTo(285, y);
      }
    },
    
    addAmPmIndicators: function(am_or_pm) {
      (function(sg) {
        $.each(sg.dataSet.data, function(i, value) {
          var x = sg.grid.x(i);  
          var color = (am_or_pm == "am") ? "#fff" : "#000";
          sg.canvas.text(x + sg.dataSet.settings.barOffset + 10, 192, am_or_pm.toUpperCase()).attr({"font-family": "Arial", "font-size": "8px", fill: color});
        });            
      })(this);
    },
    
    labelYAxis: function() {
      var increment  = 1;
      var start_from = 1;
      if (this.grid.maxValueYAxis > 10) {
        start_from = 2;
        increment = 2;
      }
      if (this.grid.maxValueYAxis > 20) {
        start_from = 3;
        increment = 3;
      }
      for (var i = start_from, ii = (this.grid.maxValueYAxis); i <= ii; i = i + increment) {
        var value = i,
            y     = this.grid.y(value) + 4,
            x     = this.grid.leftEdge - 15;
        this.canvas.text(x, y, value + "ft").attr(this.settings.yAxisLabelStyle);        
      }
    },
            
    plotSwellDirections: function(swell_direction) {
      // Add the swell direction rectangle
      this.canvas.rect(this.grid.leftEdge, 225, 285 - this.grid.leftEdge, 40).attr({stroke: "none", fill: "#fff"});
      this.canvas.image("images/chart-swell.gif", this.grid.leftEdge - 15, 230, 8, 27);
      // Plot the directions
      (function(sg) {
        $.each(swell_direction, function(i, sdir) {
          var x = sg.grid.x(i);
          sg.canvas.image("images/chart-arrow-" + sdir + ".gif", x + 12, 232, 16, 16);
          sg.canvas.text(x + 20, 259, sdir.toUpperCase()).attr(sg.settings.windDirLabelStyle);
        });                
      })(this);
    },
    
    plotWindDirections: function(wind_direction_am, wind_direction_pm) {
      // Add the wind direction rectangle
      this.canvas.rect(this.grid.leftEdge, 275, 285 - this.grid.leftEdge, 40).attr({stroke: "none", fill: "#fff"});
      this.canvas.image("images/chart-wind.gif", this.grid.leftEdge - 15, 285, 8, 19);
      // Plot the directions
      this.plotWindDirection(wind_direction_am, 2);
      this.plotWindDirection(wind_direction_pm, 22);
    },
    
    plotWindDirection: function(wind_direction, offset) {
      (function(sg) {
        $.each(wind_direction, function(i, sdir) {
          var x = sg.grid.x(i);
          sg.canvas.image("images/chart-arrow-" + sdir + ".gif", x + offset, 283 , 16, 15).toFront();
          sg.canvas.text(x + offset + 8, 310, sdir.toUpperCase()).attr(sg.settings.windDirLabelStyle).toFront();
        });            
      })(this);
    },
    
    draw: function() {
      this.drawBackground();
      this.drawYAxisSightLines();
      this.dataSet.labelXAxis(this.grid, this.canvas);
      this.plotAmWaveHeights();
      this.plotPmWaveHeights(wave_height_pm);
      this.labelYAxis();
      this.plotSwellDirections(swell_direction);
      this.plotWindDirections(wind_direction_am, wind_direction_pm);
    },
    
    defaults: {
      width: 300,
      height: 215,
      drawLine: false,
      drawBars: true,
      barWidth: 20,
      barOffset: 0,
      barColor: "#416A97",
      xAxisLabelOffset: 20,
      // Day labels
      xAxisLabelFont: "Helvetica",
      xAxisLabelColor: "#58595B",
      xAxisLabelFontSize: "11px",
      xAxisLabelFontWeight: "600",
      // Wave height labels (1ft, 2ft...)
      yAxisLabelFont: "Helvetica",
      yAxisLabelColor: "#58595B",
      yAxisLabelFontSize: "11px",
      yAxisLabelFontWeight: "600",
      // Wind direction labels
      windDirLabelFont: "Arial",
      windDirLabelFontSize: "8px",
      windDirLabelStyle: {
        font: "8px Arial"
      }
    }
  };

  var wave_height_am    = [], 
      wave_height_pm    = [],
      swell_direction   = [],
      wind_direction_am = [],
      wind_direction_pm = [],
      forecast_day      = [];

  $(function() {
    gatherData();
    $(".swellgraph .chart").each( function() {
      var canvas = Raphael(this, 300, 330);
      var swellchart = new SimpleGraph(wave_height_am, forecast_day, canvas, $.extend({minYAxisValue: maxWaveHeight()}, $.fn.simplegraph.defaults, SwellChart.defaults));
      $.extend(swellchart, SwellChart);
      swellchart.draw();
    });
    $(".swellgraph table").hide();  
  });
    
  function gatherData() {
    $("table.swelldata td.wave_height_am").each(function () {
        wave_height_am.push($(this).html());
    });

    $("table.swelldata td.wave_height_pm").each(function () {
        wave_height_pm.push($(this).html());
    });

    $("table.swelldata td.swell_direction").each(function () {
        swell_direction.push($(this).html());
    });

    $("table.swelldata td.wind_direction_am").each(function () {
        wind_direction_am.push($(this).html());
    });

    $("table.swelldata td.wind_direction_pm").each(function () {
        wind_direction_pm.push($(this).html());
    });

    $("table.swelldata td.forecast_day").each(function () {
        forecast_day.push($(this).html());
    });
  }
  
  function maxWaveHeight() {
    return Math.ceil(Math.max.apply(Math, wave_height_am.concat(wave_height_pm)));
  }
  
})(jQuery);