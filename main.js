// 6e38
// (c) 2022, Nathan Jenne

const BackgroundColor = '#333';
const ClockColor = '#fff';
const PlayerRadius0 = 80;
const PlayerRadius1 = 60;
const PlayerRadius2 = 40;
const LineWidth = 10;
const Countdown = 2000;
const ListOfColors = [
  '#ff4e50',
  '#fc913a',
  '#f9d423',
  '#ede574',
  '#e1f5c4',
  '#a82743',
  '#e15e32',
  '#c0d23e',
  '#e5f04c',
];
const StateWait = 0;
const StatePicked = 1;

var gbl = {};

function getColor() {
  var i = Math.floor(Math.random() * gbl.colors.length);
  for (var y = 0; gbl.colors[i]; y++) {
    i++;
    if (i >= gbl.colors.length) {
      i = 0;
    }
    if (y >= ListOfColors.length) {
      return false;
    }
  }
  gbl.colors[i] = true;
  console.log(`got color ${ListOfColors[i]}`);
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

function resetCountdown() {
  const n = Object.keys(gbl.players).length;
  if (gbl.state == StatePicked) {
    if (n == 0) {
      gbl.state = StateWait;
      gbl.animations.push({
        fn: drawFade,
        color: gbl.starter.color,
        x: gbl.starter.x,
        y: gbl.starter.y,
        alpha: 0,
        timestamp: new Date(),
      });
      gbl.starter = null;
    }
    return;
  }
  if (n > 1) {
    gbl.timestamp = new Date();
  } else {
    gbl.timestamp = 0;
  }
}

function touchStart(ev) {
  ev.preventDefault();
  ev.stopPropagation();
  for (var n = 0; n < ev.changedTouches.length; n++) {
    const t = ev.changedTouches[n];
    const id = t.identifier;
    const color = getColor();
    if (color == false) {
      return;
    }
    if (id !== undefined) {
      gbl.players[id] = {
        id,
        color,
        x: t.clientX,
        y: t.clientY,
      };
      resetCountdown();
    }
  }
}

function touchMove(ev) {
  ev.preventDefault();
  ev.stopPropagation();
  for (var n = 0; n < ev.changedTouches.length; n++) {
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
  for (var n = 0; n < ev.changedTouches.length; n++) {
    const t = ev.changedTouches[n];
    const id = t.identifier;
    if (id !== undefined) {
      returnColor(gbl.players[id].color);
      delete gbl.players[id];
      resetCountdown();
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
    timestamp: 0,
    state: StateWait,
    starter: null,
    animations: [],
  };

  resize();
  window.addEventListener('resize', resize, false);

  canvas.ontouchstart = touchStart;
  canvas.ontouchmove = touchMove;
  canvas.ontouchend = touchEnd;
}

initAll();

function drawPlayer(player, winner) {
  var ctx = gbl.ctx;
  ctx.strokeStyle = player.color;
  ctx.lineWidth = LineWidth;
  ctx.beginPath();
  ctx.arc(player.x, player.y, PlayerRadius1, 0, Math.PI * 2);
  ctx.stroke();

  // if (winner) {
  //   ctx.fillStyle = '#333';
  //   ctx.beginPath();
  //   ctx.arc(player.x, player.y, PlayerRadius2, 0, Math.PI * 2);
  //   ctx.fill();
  // }
}

function drawPlayers() {
  if (gbl.state == StatePicked) {
    drawPlayer(gbl.starter, true);
  } else {
    for (const key in gbl.players) {
      drawPlayer(gbl.players[key], false);
    }
  }
}

function checkCountdown() {
  if (gbl.timestamp == 0) {
    return false;
  }
  const n = new Date();
  return n - gbl.timestamp >= Countdown;
}

function drawGrow(grow) {
  const ctx = gbl.ctx;
  ctx.fillStyle = grow.color;

  if (grow.r < Math.sqrt(gbl.height * gbl.height + gbl.width * gbl.width) * 0.75) {
    const d = new Date();
    const GrowRate = 3000;
    grow.r += (d - grow.timestamp) / 1000 * GrowRate;
    grow.timestamp = d;

    ctx.beginPath();
    ctx.arc(gbl.width / 2, gbl.height / 2, grow.r, 0, Math.PI * 2);
    ctx.fill();
  } else {
    if (gbl.state != StatePicked) {
      return true;
    }
    ctx.fillRect(0, 0, gbl.width, gbl.height);
  }

  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.arc(grow.x, grow.y, PlayerRadius2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = grow.color;
  ctx.beginPath();
  ctx.arc(grow.x, grow.y, 20, 0, Math.PI * 2);
  ctx.fill();

  return false;
}

function drawFade(fade) {
  const ctx = gbl.ctx;

  ctx.fillStyle = fade.color;
  ctx.fillRect(0, 0, gbl.width, gbl.height);

  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.arc(fade.x, fade.y, PlayerRadius2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = fade.color;
  ctx.beginPath();
  ctx.arc(fade.x, fade.y, 20, 0, Math.PI * 2);
  ctx.fill();

  const d = new Date();
  const FadeRate = 0.1;
  fade.alpha += (d - fade.timestamp) / 1000 * FadeRate;
  if (fade.alpha >= 1) {
    fade.alpha = 1;
  }
  ctx.fillStyle = `rgba(33, 33, 33, ${fade.alpha})`;
  ctx.fillRect(0, 0, gbl.width, gbl.height);
  if (fade.alpha >= 1) {
    return true;
  }
  return false;
}

function pickStartingPlayer() {
  const list = Object.keys(gbl.players);
  const n = Math.floor(Math.random() * list.length);
  const player = gbl.players[list[n]];
  gbl.starter = {
    ...player,
  };
  gbl.state = StatePicked;
  gbl.timestamp = 0;
  gbl.animations.push({
    fn: drawGrow,
    timestamp: new Date(),
    color: player.color,
    x: player.x,
    y: player.y,
    r: 30,
  });
}

function drawCountdown() {
  if (gbl.timestamp == 0) {
    return;
  }

  var x = gbl.width / 2;
  var y = gbl.height / 2;

  var ctx = gbl.ctx;

  ctx.strokeStyle = ClockColor;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y, 30, 0, Math.PI * 2);
  ctx.stroke();

  const n = new Date();
  var ms = n - gbl.timestamp;
  var percent = ms / Countdown;
  var theta = Math.PI * 2 * percent - Math.PI / 2;

  ctx.fillStyle = ClockColor;
  ctx.lineWidth = 30;
  ctx.beginPath();
  ctx.arc(x, y, 15, Math.PI * 3 / 2, theta);
  ctx.stroke();
}

function drawAnimations() {
  var listToRemove = [];
  gbl.animations.forEach((anim, i) => {
    var remove = anim.fn(anim);
    if (remove) {
      listToRemove.push(i);
    }
  });
  for (var i = listToRemove.length - 1; i >= 0; i--) {
    gbl.animations.splice(listToRemove[i], listToRemove[i] + 1);
  }
}

setInterval(() => {
  var ctx = gbl.ctx;
  var width = gbl.width;
  var height = gbl.height;

  ctx.fillStyle = BackgroundColor;
  ctx.fillRect(0, 0, width, height);

  drawAnimations();

  if (checkCountdown()) {
    pickStartingPlayer();
  }

  var current = new Date();
  var dt = (current - gbl.lastUpdate) / 1000;
  if (dt > 10) {
    dt = 0.01; // Pick up where you left off when javascript goes to sleep
  }
  drawPlayers();
  drawCountdown();
  gbl.lastUpdate = current;
}, 1000 / 60);
