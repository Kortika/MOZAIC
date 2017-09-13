class Controls {
  constructor() {
    this.mod = 3;
    this.speeds = [0.25, 0.33, 0.5, 1, 2, 3, 4];
  }

  attachEvents(visualizer) {
    d3.select('#play').on("click", e => {
      var play_button = d3.select('#play');
      var pause_button = d3.select('#pause');
      visualizer.startTimer();
      play_button.attr("hidden", true);
      pause_button.attr("hidden", null);
    });

    d3.select('#pause').on("click", e => {
      var pause_button = d3.select('#pause');
      var play_button = d3.select('#play');
      visualizer.stopTimer();
      pause_button.attr("hidden", true);
      play_button.attr("hidden", null);
    });


    d3.select('#toggleplay').on("click", e => {
      var button = d3.select('#toggleplay');
      if (visualizer.toggleTimer()) {
        button.node().innerHTML('<img src="res/pause.svg">');
      } else {
        button.node().innerHTML('<img src="res/play.svg">');
      }
    });

    d3.select('#speeddown').on("click", e => {
      if (this.mod > 0) {
        this.mod--;
        visualizer.speed = base_speed / this.speeds[this.mod];
        this.updateSpeed(this.speeds[this.mod]);
      }
    });

    d3.select('#speedup').on("click", e => {
      if (this.mod < this.speeds.length - 1) {
        this.mod++;
        visualizer.speed = base_speed / this.speeds[this.mod];
        this.updateSpeed(this.speeds[this.mod]);
      }
    });

    d3.select('#tostart').on("click", e => {
      visualizer.showTurn(0);
      visualizer.stopTimer();
      var play_button = d3.select('#play');
      var pause_button = d3.select('#pause');
      play_button.attr("hidden", null);
      pause_button.attr("hidden", true);
    });

    d3.select('#toend').on("click", e => {
      visualizer.showTurn(visualizer.maxTurns);
      visualizer.stopTimer();
      var play_button = d3.select('#play');
      var pause_button = d3.select('#pause');
      play_button.attr("hidden", true);
      pause_button.attr("hidden", null);
    });

    d3.select('#hide').on("click", e => {
      var hide = d3.select('#hide');
      var control_bar = d3.select('#controlbar')
      control_bar.attr("hidden", true);
      hide.attr("hidden", null);
    });

    d3.select('#turn_slider')
      .attr('min', 0)
      .attr('max', visualizer.maxTurns)
      .attr('step', 1)
      .on('change', e => {
        visualizer.showTurn(d3.select('#turn_slider').node().value);
      });
    this.updateSpeed(this.speeds[this.mod]);

 
  }

  updateSpeed(val) {
    d3.select('.speed').text("Speed x" + val);
  }
}


var controls = new Controls();
var visualizer = new Visualizer();
