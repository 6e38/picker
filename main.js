// 6e38
// (c) 2022, Nathan Jenne

const BackgroundColor = '#333';
const PlayerRadius1 = 60;
const PlayerRadius2 = 40;
const LineWidth = 10;
const ListOfColors = [
  '#ff4e50',
  '#fc913a',
  '#f9d423',
  '#ede574',
  '#e1f5c4',
  '#5c323e',
  '#a82743',
  '#e15e32',
  '#c0d23e',
  '#e5f04c',
];

var gbl = {};

function getColor() {
  var i = Math.floor(Math.random() * gbl.colors.length);
  while (gbl.colors[i]) {
    i++;
    if (i >= gbl.colors.length) {
      i = 0;
    }
  }
  gbl.colors[i] = true;
  return ListOfColors[i];
}

function returnColor(color) {
  ListOfColors.forEach((c, i) => {
    if (color == c) {
      gbl.colors[i] = false;
    }
  });
}

function resize() {
  gbl.ctx.canvas.width = window.innerWidth - 20;
  gbl.ctx.canvas.height = window.innerHeight - 20;
  gbl.width = gbl.ctx.canvas.width;
  gbl.height = gbl.ctx.canvas.height;
}

function touchStart(ev) {
  ev.preventDefault();
  ev.stopPropagation();
  for (const n in ev.changedTouches) {
    const t = ev.changedTouches[n];
    const id = t.identifier;
    if (id !== undefined) {
      gbl.players[id] = {
        id,
        color: getColor(),
        x: t.clientX,
        y: t.clientY,
      };
    }
  }
}

function touchMove(ev) {
  ev.preventDefault();
  ev.stopPropagation();
  for (const n in ev.changedTouches) {
    const t = ev.changedTouches[n];
    const id = t.identifier;
    if (id !== undefined) {
      gbl.players[id].x = t.clientX;
      gbl.players[id].y = t.clientY;
    }
  }
}

function touchEnd(ev) {
  ev.preventDefault();
  ev.stopPropagation();
  for (const n in ev.changedTouches) {
    const t = ev.changedTouches[n];
    const id = t.identifier;
    if (id !== undefined) {
      returnColor(gbl.players[id].color);
      delete gbl.players[id];
    }
  }
}

function initAll() {
  const canvas = document.getElementById('canvas');
  var ctx = canvas.getContext('2d');

  var colors = new Array(ListOfColors.length);
  for (var i = 0; i < colors.length; i++) {
    colors[i] = false;
  }

  gbl = {
    ctx,
    lastUpdate: new Date(),
    players: {},
    colors,
  };

  resize();
  window.addEventListener('resize', resize, false);

  canvas.ontouchstart = touchStart;
  canvas.ontouchmove = touchMove;
  canvas.ontouchend = touchEnd;
}

initAll();

function drawPlayer(player) {
  var ctx = gbl.ctx;
  ctx.strokeStyle = player.color;
  ctx.lineWidth = LineWidth;
  ctx.beginPath();
  ctx.arc(player.x, player.y, PlayerRadius1, 0, Math.PI * 2);
  ctx.stroke();

  // ctx.fillStyle = player.color;
  // ctx.beginPath();
  // ctx.arc(player.x, player.y, PlayerRadius2, 0, Math.PI * 2);
  // ctx.fill();
}

function drawPlayers() {
  for (const key in gbl.players) {
    drawPlayer(gbl.players[key]);
  }
}

setInterval(() => {
  var ctx = gbl.ctx;
  var width = gbl.width;
  var height = gbl.height;

  ctx.fillStyle = BackgroundColor;
  ctx.fillRect(0, 0, width, height);

  var current = new Date();
  var dt = (current - gbl.lastUpdate) / 1000;
  if (dt > 10) {
    dt = 0.01; // Pick up where you left off when javascript goes to sleep
  }
  drawPlayers();
  gbl.lastUpdate = current;
}, 1000 / 60);
