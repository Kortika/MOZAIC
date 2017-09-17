const space_math = new SpaceMath();
const visuals = new Visuals();

class Visualizer {

  constructor(log) {
    var turns = this.parseJSON(log);
    this.turn_controller = new TurnController();
    this.turn_controller.init(turns);
    Visuals.Fleets.animateFleets();
  }

  parseJSON(json) {
    var turns = json.trim().split('\n');
    return turns.map(turn => {
      return new Turn(JSON.parse(turn));
    });
  }

  clear() {
    Visuals.clearVisuals();
    this.turn_controller.stopTimer();
  }
}

class TurnController {
  constructor() {
    this.speed = Config.base_speed;
    this.turn = 0;
    this.turns = [];
  }

  init(turns) {
    this.turns = turns;
    Visuals.ResourceLoader.setupPatterns();
    Visuals.clearVisuals();

    var first_turn = this.turns[0];
    first_turn.init();
    first_turn.prepareData();

    visuals.generatePlanetStyles(first_turn.planets);
    visuals.generateViewBox(first_turn.planets);
    visuals.update(first_turn);

    this.planet_map
  }

  nextTurn() {
    return this.showTurn(this.turn + 1);
  }

  showTurn(newTurn) {
    if (newTurn >= this.turns.length) {
      console.log("end of log");
      return false;
    } else {
      var lastTurn = this.turn;
      this.setTurn(newTurn);
      var turn = this.turns[newTurn];
      turn.lastTurn = lastTurn;
      turn.planet_map = this.turns[0].planet_map;
      turn.color_map = this.turns[0].color_map;
      turn.prepareData();
      visuals.update(turn);
      visuals.updateAnimations(turn, this);
      return true;
    }
  }

  toggleTimer() {
    if (!this.turn_timer || this.turn_timer._time === Infinity) {
      this.startTimer();
      return true;
    } else {
      this.stopTimer();
      return false;
    }
  }

  startTimer() {
    var callback = e => {
      // 20 might seem like a magic number
      // D3 docs say it will at least take 15 ms to draw frame
      if (e % this.speed < 20 && !this.nextTurn()) this.stopTimer();
    };
    this.turn_timer = d3.timer(callback);
  }

  stopTimer() {
    if (this.turn_timer) {
      this.turn_timer.stop();
    }
  }

  setTurn(newTurn) {
    this.turn = newTurn;
    d3.select('#turn_slider').property('value', this.turn);
  }

  get maxTurns() {
    return this.turns.length - 1;
  }
}

class Turn {
  constructor(turn) {
    this.players = turn.players;

    this.planets = turn.planets.map(planet => {
      return new Planet(planet);
    });

    this.expeditions = turn.expeditions.map(exp => {
      return new Expedition(exp);
    });

    this.planet_map = {};
  }

  init() {

    // Generate planet_map
    this.planet_map = this.planets.reduce((map, planet) => {
      map[planet.name] = planet;
      return map;
    }, {});

    // Color map
    const color = d3.scaleOrdinal(d3.schemeCategory10);
    this.color_map = this.players.reduce((map, o, i) => {
      map[o] = color(i);
      return map;
    }, {});
    this.color_map[null] = "#d3d3d3";
  }

  prepareData() {
    this.expeditions.map(exp => {
      exp.origin = this.planet_map[exp.origin],
        exp.destination = this.planet_map[exp.destination]
    });

    // Since planet_map is copied from previous turn, we change owner here
    // TODO: Clean up this ugly logic. Turns should make their own map,
    // and then set changed_owner according to transition from previous turn.
    this.planets.map(planet => {
      if (planet.owner != this.planet_map[planet.name].owner) {
        planet.changed_owner = true;
        this.planet_map[planet.name].owner = planet.owner;
      } else {
        planet.changed_owner = false;
      }
    });
  }

}

class Planet {
  constructor(log_planet) {
    this.name = log_planet.name;
    this.x = log_planet.x;
    this.y = log_planet.y;
    this.ship_count = log_planet.ship_count;
    this.owner = log_planet.owner;
  }
}

class Expedition {
  constructor(log_exp) {
    this.id = log_exp.id;
    this.origin = log_exp.origin;
    this.destination = log_exp.destination;
    this.ship_count = log_exp.ship_count;
    this.owner = log_exp.owner;
    this.turns_remaining = log_exp.turns_remaining;
  }

  // TODO: Obsolete?
  relativeCoords() {
    var total_distance = Math.ceil(space_math.euclideanDistance(this.origin, this.destination));
    var mod = this.turns_remaining / total_distance;

    var new_x = this.origin.x - this.destination.x;
    new_x *= mod;
    new_x += this.destination.x;

    var new_y = this.origin.y - this.destination.y;
    new_y *= mod;
    new_y += this.destination.y;

    return {
      'x': new_x,
      'y': new_y
    };
  }

  position(){
    return this.relativeCoords();
    //console.log(this, exp)
  }

  homannPosition(angle) {
    var total_distance = space_math.euclideanDistance(this.origin, this.destination);
    if (!angle) angle = this.homannAngle(this.turns_remaining, total_distance);

    var r1 = (this.origin.size) / 2 + 3;
    var r2 = (this.destination.size) / 2 + 3;

    var a = (total_distance + r1 + r2) / 2;
    var c = a - r1 / 2 - r2 / 2;
    var b = Math.sqrt(Math.pow(a, 2) - Math.pow(c, 2));

    var dx = this.origin.x - this.destination.x;
    var dy = this.origin.y - this.destination.y;
    var w = Math.atan2(dy, dx);

    var center_x = c * Math.cos(w) + this.destination.x;
    var center_y = c * Math.sin(w) + this.destination.y;

    var longest = a;
    var shortest = b;

    longest *= Math.cos(angle);
    shortest *= Math.sin(angle);

    return {
      'x': center_x + longest * Math.cos(w) - shortest * Math.sin(w),
      'y': center_y + longest * Math.sin(w) + shortest * Math.cos(w)
    };
  }

  homannAngle(turn, distance) {
    if (!distance) distance = space_math.euclideanDistance(this.origin, this.destination);
    var mod = turn / distance;
    return mod * (Math.PI * 2) - Math.PI;
  }
}
