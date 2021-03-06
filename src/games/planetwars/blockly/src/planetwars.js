class PlanetWars {
  constructor(player, state) {
    this.state = state;
    this.player = player;
    this.dispatches = [];
    this.buildPlanetMap();
  }

  buildPlanetMap() {
    this.planet_map = {};
    this.getPlanets().forEach(planet => {
      this.planet_map[planet.name] = planet;
    });
  }
  
  getPlayer() {
    return this.player;
  }

  getPlayers() {
    return this.state['players'];
  }

  getPlanets() {
    return this.state['planets'];
  }

  getPlanet(name) {
    return this.planet_map[name];
  }

  getExpeditions() {
    return this.state['expeditions'];
  }

  dispatch(num_ships, origin, target) {
    this.dispatches.push({
      'ship_count': num_ships,
      'origin': origin['name'],
      'destination': target['name']
    });
  }
}

module.exports = PlanetWars;
