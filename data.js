/**
 * Data.js - Map Data (Nodes and Roads)
 * 
 * This simulates the road network data that Google Maps uses.
 * In reality, Google Maps has millions of nodes and edges covering
 * the entire world. For this simulation, we use a small subset.
 * 
 * Nodes represent locations (intersections, landmarks, etc.)
 * Edges represent roads connecting these locations.
 */

/**
 * Nodes (Locations) with GPS coordinates
 * 
 * In real Google Maps:
 * - Nodes are intersections, landmarks, POIs
 * - GPS coordinates come from satellite data
 * - Millions of nodes worldwide
 */
export const nodes = {
  A: {
    lat: 10.762622,
    lng: 106.660172,
    name: "Điểm A"
  },
  B: {
    lat: 10.772622,
    lng: 106.680172,
    name: "Điểm B"
  },
  C: {
    lat: 10.752622,
    lng: 106.670172,
    name: "Điểm C"
  },
  D: {
    lat: 10.782622,
    lng: 106.690172,
    name: "Điểm D"
  },
  E: {
    lat: 10.792622,
    lng: 106.700172,
    name: "Điểm E"
  },
  F: {
    lat: 10.742622,
    lng: 106.660172,
    name: "Điểm F"
  },
  G: {
    lat: 10.802622,
    lng: 106.710172,
    name: "Điểm G"
  },
  H: {
    lat: 10.812622,
    lng: 106.720172,
    name: "Điểm H"
  },
  I: {
    lat: 10.732622,
    lng: 106.650172,
    name: "Điểm I"
  },
  J: {
    lat: 10.722622,
    lng: 106.640172,
    name: "Điểm J"
  },
  K: {
    lat: 10.752622,
    lng: 106.630172,
    name: "Điểm K"
  },
  L: {
    lat: 10.792622,
    lng: 106.650172,
    name: "Điểm L"
  },
  M: {
    lat: 10.812622,
    lng: 106.680172,
    name: "Điểm M"
  },
  N: {
    lat: 10.822622,
    lng: 106.700172,
    name: "Điểm N"
  },
  O: {
    lat: 10.742622,
    lng: 106.690172,
    name: "Điểm O"
  },
  P: {
    lat: 10.772622,
    lng: 106.640172,
    name: "Điểm P"
  }
};

/**
 * Edges (Roads) connecting nodes
 * 
 * In real Google Maps:
 * - Edges represent actual roads, highways, streets
 * - Traffic data updates in real-time
 * - Edge weights change based on current traffic
 * 
 * Traffic status:
 * - 'green': Light traffic, normal speed
 * - 'yellow': Moderate traffic, slower speed
 * - 'red': Heavy traffic, very slow speed
 */
export const edges = [
  {
    from: "A",
    to: "B",
    distance: 2.5,
    roadType: "main",
    trafficStatus: "green"
  },
  {
    from: "A",
    to: "C",
    distance: 1.8,
    roadType: "local",
    trafficStatus: "yellow"
  },
  {
    from: "A",
    to: "I",
    distance: 2.2,
    roadType: "local",
    trafficStatus: "green"
  },
  {
    from: "B",
    to: "D",
    distance: 1.5,
    roadType: "main",
    trafficStatus: "green"
  },
  {
    from: "B",
    to: "E",
    distance: 3.2,
    roadType: "highway",
    trafficStatus: "green"
  },
  {
    from: "B",
    to: "L",
    distance: 2.8,
    roadType: "main",
    trafficStatus: "yellow"
  },
  {
    from: "C",
    to: "D",
    distance: 2.8,
    roadType: "local",
    trafficStatus: "red"
  },
  {
    from: "C",
    to: "F",
    distance: 2.0,
    roadType: "local",
    trafficStatus: "yellow"
  },
  {
    from: "C",
    to: "K",
    distance: 1.5,
    roadType: "local",
    trafficStatus: "green"
  },
  {
    from: "D",
    to: "G",
    distance: 2.2,
    roadType: "main",
    trafficStatus: "green"
  },
  {
    from: "D",
    to: "O",
    distance: 1.8,
    roadType: "local",
    trafficStatus: "yellow"
  },
  {
    from: "E",
    to: "H",
    distance: 1.8,
    roadType: "highway",
    trafficStatus: "green"
  },
  {
    from: "E",
    to: "M",
    distance: 2.0,
    roadType: "main",
    trafficStatus: "green"
  },
  {
    from: "F",
    to: "G",
    distance: 3.5,
    roadType: "local",
    trafficStatus: "red"
  },
  {
    from: "F",
    to: "I",
    distance: 1.2,
    roadType: "local",
    trafficStatus: "green"
  },
  {
    from: "G",
    to: "H",
    distance: 2.0,
    roadType: "main",
    trafficStatus: "yellow"
  },
  {
    from: "G",
    to: "N",
    distance: 2.5,
    roadType: "main",
    trafficStatus: "green"
  },
  {
    from: "H",
    to: "N",
    distance: 1.5,
    roadType: "highway",
    trafficStatus: "green"
  },
  {
    from: "I",
    to: "J",
    distance: 1.3,
    roadType: "local",
    trafficStatus: "yellow"
  },
  {
    from: "I",
    to: "K",
    distance: 2.0,
    roadType: "local",
    trafficStatus: "green"
  },
  {
    from: "J",
    to: "K",
    distance: 1.8,
    roadType: "local",
    trafficStatus: "red"
  },
  {
    from: "K",
    to: "P",
    distance: 2.2,
    roadType: "local",
    trafficStatus: "yellow"
  },
  {
    from: "L",
    to: "P",
    distance: 1.5,
    roadType: "main",
    trafficStatus: "green"
  },
  {
    from: "M",
    to: "N",
    distance: 1.2,
    roadType: "main",
    trafficStatus: "green"
  },
  {
    from: "O",
    to: "F",
    distance: 1.0,
    roadType: "local",
    trafficStatus: "yellow"
  }
];
