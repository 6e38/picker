// 6e38
// (c) 2022, Nathan Jenne

const Scale = 3;
const MinPlayers = 2;
const BackgroundColor = 'rgb(51, 51, 51)';
const ClockColor = '#fff';
const TransparentClockColor = 'rgba(255, 255, 255, 0.5)';
const PlayerRadius = 100 * Scale;
const PlayerRadius0 = 80 * Scale;
const PlayerRadius1 = 60 * Scale;
const PlayerRadius2 = 40 * Scale;
const PlayerRadius3 = 20 * Scale;
const LineWidth = 10 * Scale;
const Countdown = 2000;
const ListOfColors = [
  '#9AADBF',
  '#6D98BA',
  '#DFCCB9',
  '#C17767',
  '#C7FFAD',
  '#FFFD85',
  '#FFC4C2',
  '#FFA385',
  '#62E48D',
  '#E76B74',
  '#D7AF70',
  '#5DDBFE',
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
  const w = window.innerWidth;
  const h = window.innerHeight;
  const canvas = gbl.ctx.canvas;
  canvas.width = w * Scale;
  canvas.height = h * Scale;
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  gbl.width = w * Scale;
  gbl.height = h * Scale;
}

function resetCountdown() {
  const n = Object.keys(gbl.players).length;
  if (gbl.state == StatePicked) {
    if (n == 0) {
      gbl.state = StateWait;
      gbl.animations1.push({
        fn: drawFade,
        color: gbl.starter.color,
        alpha: 0,
        timestamp: new Date(),
      });
      gbl.starter = null;
    }
    return;
  }
  if (n >= MinPlayers) {
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
    log(`starting touch for ${id}`);
    gbl.startCount++;
    if (id !== undefined) {
      gbl.players[id] = {
        id,
        color,
        x: t.clientX * Scale,
        y: t.clientY * Scale,
      };
      resetCountdown();
    }
  }

  endTouches(ev.touches);
}

function touchMove(ev) {
  ev.preventDefault();
  ev.stopPropagation();
  for (var n = 0; n < ev.changedTouches.length; n++) {
    const t = ev.changedTouches[n];
    const id = t.identifier;
    if (id !== undefined) {
      gbl.players[id].x = t.clientX * Scale;
      gbl.players[id].y = t.clientY * Scale;
    } else {
      log(`touchMove: undefined id ${id}`);
    }
  }
}

function touchEnd(ev) {
  ev.preventDefault();
  ev.stopPropagation();

  endTouches(ev.touches);
}

function endTouches(touches) {
  const defunctTouches = findDefunctTouches(touches);

  for (const id of defunctTouches) {
    if (id !== undefined) {
      log(`ending touch for ${id}`);
      gbl.endCount++;
      if (gbl.state == StatePicked && id == gbl.starter.id) {
        gbl.starter.id = -1;
        gbl.animations2.push({
          fn: fadeStarter,
          alphaTimestamp: new Date(),
          ...gbl.players[id],
        })
      }
      if (gbl.players.hasOwnProperty(id)) {
        returnColor(gbl.players[id].color);
        delete gbl.players[id];
      }
      resetCountdown();
    }
  }
}

function touchCancel(ev) {
  ev.preventDefault();
  ev.stopPropagation();
  gbl.cancelCount++;

  endTouches(ev.touches);
}

function findDefunctTouches(touches) {
  const defunctTouches = [];
  const map = {};
  for (var n = 0; n < touches.length; n++) {
    map[touches[n].identifier] = true;
  }
  const ids = Object.keys(gbl.players);
  for (const id of ids) {
    if (!map.hasOwnProperty(id)) {
      gbl.defunctCount++;
      defunctTouches.push(id);
    }
  }
  return defunctTouches;
}

function click(ev) {
  ev.preventDefault();
  ev.stopPropagation();

  const x = ev.clientX;
  const y = ev.clientY;

  if (gbl.state == StatePicked) {
    touchEnd({
      preventDefault: () => {},
      stopPropagation: () => {},
      touches: {
        length: 0,
      },
    });
    return;
  }

  var id = 0;
  for (const key in gbl.players) {
    const player = gbl.players[key];
    const dx = x * 3 - player.x;
    const dy = y * 3 - player.y;
    if (dx * dx + dy * dy < PlayerRadius1 * PlayerRadius1) {
      id = player.id;
    }
  }
  if (id == 0) {
    id = gbl.fakeTouchId++;
    touchStart({
      preventDefault: () => {},
      stopPropagation: () => {},
      changedTouches: {
        length: 1,
        0: {
          identifier: id,
          clientX: x,
          clientY: y,
        },
      },
      touches: getCurrentTouches({identifier: id, clientX: x, clientY: y}, null),
    });
  } else {
    touchEnd({
      preventDefault: () => {},
      stopPropagation: () => {},
      changedTouches: {
        length: 1,
        0: {
          identifier: id,
          clientX: x,
          clientY: y,
        },
      },
      touches: getCurrentTouches(null, id),
    });
  }
}

function getCurrentTouches(touch, identifierToRemove) {
  const touches = {
    length: 0,
  }
  for (const id in gbl.players) {
    if (id != identifierToRemove) {
      touches[touches.length] = {
        identifier: id,
        clientX: gbl.players[id].x,
        clientY: gbl.players[id].y,
      };
      touches.length++;
    }
  }
  if (touch != null) {
    touches[touches.length] = touch;
    touches.length++;
  }
  return touches;
}

function initAll() {
  const canvas = document.getElementById('canvas');
  var ctx = canvas.getContext('2d');
  ctx.scale(Scale, Scale);

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
    animations1: [],
    animations2: [],
    fakeTouchId: 100,
    cancelCount: 0,
    startCount: 0,
    endCount: 0,
    defunctCount: 0,
    log: ['Log start'],
  };

  resize();
  window.addEventListener('resize', resize, false);

  canvas.ontouchstart = touchStart;
  canvas.ontouchmove = touchMove;
  canvas.ontouchend = touchEnd;
  canvas.ontouchcancel = touchEnd;

  canvas.onclick = click;
}

initAll();

function drawPlayer(player, winner) {
  if (gbl.state == StatePicked) {
    if (player.id == gbl.starter.id) {
      drawStarter(player);
    } else {
      drawLoser(player);
    }
  } else {
    var ctx = gbl.ctx;
    ctx.strokeStyle = player.color;
    ctx.lineWidth = LineWidth;
    ctx.beginPath();
    ctx.arc(player.x, player.y, PlayerRadius1, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawPlayers() {
  for (const key in gbl.players) {
    drawPlayer(gbl.players[key], false);
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
  return false;
}

function drawFade(fade) {
  const ctx = gbl.ctx;

  ctx.fillStyle = fade.color;
  ctx.fillRect(0, 0, gbl.width, gbl.height);

  const d = new Date();
  const FadeRate = 1;
  fade.alpha += (d - fade.timestamp) / 1000 * FadeRate;
  fade.timestamp = d;
  if (fade.alpha >= 1) {
    fade.alpha = 1;
  }
  ctx.fillStyle = `rgba(51, 51, 51, ${fade.alpha})`;
  ctx.fillRect(0, 0, gbl.width, gbl.height);
  if (fade.alpha >= 1) {
    return true;
  }
  return false;
}

function drawStarter(starter) {
  const ctx = gbl.ctx;

  if (!starter.timestamp) {
    starter.timestamp = new Date();
    starter.theta = 0;
  }

  if (starter.alpha === undefined) {
    starter.alpha = 1;
  }

  const d = new Date();
  const SpinRate = Math.PI;
  starter.theta += (d - starter.timestamp) / 1000 * SpinRate;
  starter.timestamp = d;

  ctx.strokeStyle = `rgba(51, 51, 51, ${starter.alpha})`;
  ctx.lineWidth = LineWidth;
  ctx.beginPath();
  ctx.arc(starter.x, starter.y, PlayerRadius0, starter.theta, starter.theta + Math.PI / 5);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(starter.x, starter.y, PlayerRadius0, starter.theta + Math.PI, starter.theta + Math.PI + Math.PI / 5);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(starter.x, starter.y, PlayerRadius, -starter.theta, -starter.theta + Math.PI / 5);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(starter.x, starter.y, PlayerRadius, -starter.theta + Math.PI, -starter.theta + Math.PI + Math.PI / 5);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(starter.x, starter.y, PlayerRadius1, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = `rgba(51, 51, 51, ${starter.alpha})`;
  ctx.beginPath();
  ctx.arc(starter.x, starter.y, PlayerRadius2, 0, Math.PI * 2);
  ctx.fill();
}

function drawLoser(player) {
  // const ctx = gbl.ctx;

  // ctx.fillStyle = `rgb(51, 51, 51)`;
  // ctx.beginPath();
  // ctx.arc(player.x, player.y, PlayerRadius3, 0, Math.PI * 2);
  // ctx.fill();
}

function fadeStarter(starter) {
  const ctx = gbl.ctx;

  const d = new Date();
  const FadeRate = -1;
  starter.alpha += (d - starter.alphaTimestamp) / 1000 * FadeRate;
  starter.alphaTimestamp = d;
  if (starter.alpha < 0) {
    starter.alpha = 0;
  }

  drawStarter(starter);

  if (starter.alpha == 0) {
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
  gbl.animations1.push({
    fn: drawGrow,
    timestamp: new Date(),
    color: player.color,
    r: 30,
  });
  // if (window.navigator.vibrate !== undefined) {
  //   window.navigator.vibrate([50,30,50]);
  // }
}

function drawCountdown() {
  var x = gbl.width / 2;
  var y = gbl.height / 2;

  var ctx = gbl.ctx;

  if (gbl.timestamp == 0) {
    if (gbl.state != StatePicked) {
      ctx.strokeStyle = TransparentClockColor;
      ctx.lineWidth = LineWidth / 2;
      ctx.beginPath();
      ctx.arc(x, y, PlayerRadius2, 0, Math.PI * 2);
      ctx.stroke();
    }
    return;
  }

  ctx.strokeStyle = ClockColor;
  ctx.lineWidth = LineWidth / 2;
  ctx.beginPath();
  ctx.arc(x, y, PlayerRadius2, 0, Math.PI * 2);
  ctx.stroke();

  const n = new Date();
  var ms = n - gbl.timestamp;
  var percent = ms / Countdown;
  var theta = Math.PI * 2 * percent - Math.PI / 2;

  ctx.fillStyle = ClockColor;
  ctx.lineWidth = PlayerRadius2;
  ctx.beginPath();
  ctx.arc(x, y, PlayerRadius2 / 2, Math.PI * 3 / 2, theta);
  ctx.stroke();
}

function drawDebug() {
  const ctx = gbl.ctx;
  ctx.font = '50px monospace';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('player count: ' + Object.keys(gbl.players).length, 10, 50);
  ctx.fillText('cancel count: ' + gbl.cancelCount, 10, 100);
  ctx.fillText('start  count: ' + gbl.startCount, 10, 150);
  ctx.fillText('end    count: ' + gbl.endCount, 10, 200);
  ctx.fillText('defunctcount: ' + gbl.defunctCount, 10, 250);

  var y = 350;
  for (const line of gbl.log) {
    ctx.fillText(line, 10, y);
    y += 50;
  }
}

function log(str) {
  if (gbl.log.length > 20) {
    gbl.log.shift();
  }
  gbl.log.push(str);
}

function drawAnimations(animations) {
  var listToRemove = [];
  animations.forEach((anim, i) => {
    var remove = anim.fn(anim);
    if (remove) {
      listToRemove.push(i);
    }
  });
  for (var i = listToRemove.length - 1; i >= 0; i--) {
    animations.splice(listToRemove[i], listToRemove[i] + 1);
  }
}

function main() {
  var ctx = gbl.ctx;
  var width = gbl.width;
  var height = gbl.height;

  ctx.fillStyle = BackgroundColor;
  ctx.fillRect(0, 0, width, height);

  drawAnimations(gbl.animations1);
  drawAnimations(gbl.animations2);

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
  // drawDebug();
  gbl.lastUpdate = current;
  setTimeout(main, 1000 / 60);
}

main();
