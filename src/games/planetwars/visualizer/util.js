class SpaceMath {
  toRadians(angle) {
    return angle * (Math.PI / 180);
  }

  toDegrees(angle) {
    return angle * (180 / Math.PI);
  }

  euclideanDistance(e1, e2) {
    return Math.sqrt(Math.pow(e1.x - e2.x, 2) + Math.pow(e1.y - e2.y, 2));
  }

  manhattenDistance(p1, p2) {
    return p1.x - p2.x + p1.y - p2.y;
  }

  randomIntBetween(min, max) {
    return Math.floor(this.randomBetween(min, max));
  }

  randomBetween(min, max) {
    return Math.random() * (max - min + 1) + min;
  }

  clamp(value, min, max) {
    var r_val = value;
    if (r_val > max) r_val = max;
    if (r_val < min) r_val = min;
    return r_val;
  }

  // TODO replace with a NN algotithm, d3 has quadtrees might be nice to use here
  findClosest(point, points) {
    var closest = Infinity;
    points.map(p => {
      var dist = Math.abs(this.euclideanDistance(p, point));
      if (dist !== 0 && dist < closest) closest = dist;
    });
    return closest;
  }

  weighted_middle(p1, p2){
    var w1 = p1.weight || 1;
    var w2 = p2.weight || 1;
    var weight_sum = w1 + w2;
    return new Point((p1.x*w2 + p2.x*w1)/weight_sum, (p1.y*w2 + p2.y*w1)/weight_sum);
  }

  turning_right(p1, p2, p3){
    var x = (p2.x-p1.x)*(p3.y-p1.y) - (p2.y-p1.y)*(p3.x-p1.x);
    return x < 0;
  }

  mod(i, mod){
    return (i+mod)%mod;
  }
  getPath(points){
    var point_strings = [];
    points.forEach(p => point_strings.push(p.x+","+p.y));
    var out = "M"+point_strings[1];
    for (var i = 3; i < point_strings.length; i+= 2) {
      out += "Q"+point_strings[i-1]+" "+point_strings[i];
    }
    out+= "Q"+point_strings[0]+" "+point_strings[1];
    return "M"+point_strings.join("L")+"Z";
    //return out;
  }
}

class Point {
  constructor(x,y, weight, owner, name){
    for(var p of Point.made){
      var dx = Math.abs(p.x - x);
      var dy = Math.abs(p.y - y);
      var border = 0.0000000000001;
      if((dx < border && dy < border)){
        return p;
      }
    }
    this.x = x;
    this.y = y;
    this.weight = weight;
    this.owner = owner;
    this.name = name;

    Point.made.push(this);
  }

  toString() {
    return "Point: {x: "+this.x+", y: "+this.y+"}";
  }

  equals(obj) {
    if(! (obj instanceof Point)){
      console.log(obj+" is not a point");
      return false;
    }
    return obj.x === this.x && obj.y === this.y;
  }
}

Point.made = [];

class Line {
  constructor(p1, p2, is_line_bisector){
    this.p1 = p1;
    this.p2 = p2;
    this.is_line_bisector = is_line_bisector;
    this.init_a_and_b(p1, p2);
    if(is_line_bisector){
      var middle = space_math.weighted_middle(p1, p2);

      var sub = this.a;
      this.a = -this.b;
      this.b = sub;

      this.init_c(middle);
    }else{
      this.init_c(p1);
    }
  }

  init_a_and_b(p1, p2){
    this.a = p2.y - p1.y;
    this.b = p1.x - p2.x;
  }

  init_c(p){
    this.c = -this.a*p.x - this.b*p.y;
  }

  intersect(other_line){
    if(! (other_line instanceof Line)){
      return;
    }
    if(this.b === 0){
      var x = -this.c / this.a;
      var y = (-other_line.c - other_line.a * x)/other_line.b;
      return new Point(x,y);
    }
    if(other_line.b === 0){
      return other_line.intersect(this);
    }
    var a = -this.a / this.b;
    var c = -this.c / this.b;
    var b = -other_line.a / other_line.b;
    var d = -other_line.c / other_line.b;

    return new Point((d-c)/(a-b), (a*d-b*c)/(a-b));
  }

  length(){
    return space_math.euclideanDistance(this.p1, this.p2);
  }

  cos() {
    var dx = this.p1.x - this.p2.x;
    return dx / this.length();
  }
  sin() {
    var dy = this.p1.y - this.p2.y;
    return dy / this.length();
  }
}

class DataBinder {
  constructor(initial) {
    this.value = initial;
    this.callbacks = [];
  }

  registerCallback(callback) {
    this.callbacks.push(callback);
  }

  update(value) {
    this.value = value;
    this._propagate();
  }

  _propagate() {
    this.callbacks.forEach(c => c(this.value));
  }
}
