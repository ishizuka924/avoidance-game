window.gLocalAssetContainer["main"] = function(g) { (function(exports, require, module, __filename, __dirname) {
const tl = require("@akashic-extension/akashic-timeline");
const al = require("@akashic-extension/akashic-label");

// ゲーム設定
const XCenter = g.game.width / 2;
const boxW = 30;
const boxH = 30;
const boxSpeed = 1700;
const boxInterval = 200;
const throughScore = 100;

let score = 0;

function createRect(scene, color, width, height, x, y) {
  return new g.FilledRect({
    scene: scene,
    cssColor: color,
    width: width,
    height: height,
    x: x,
    y: y,
  })
}

function createRectRandomly(scene) {
  const columns = [81, 113, 145, 177, 209];
  const idx = Math.floor(g.game.random.generate() * columns.length);
  return createRect(scene, "#777", boxW, boxH, columns[idx], -32);
}

function createGameBackground(scene) {
  const background = new g.E({scene: scene});
  const floor = createRect(scene, "#333", g.game.width, g.game.height, 0, 0);
  const leftWall = createRect(scene, "#888", 2, g.game.height, XCenter - 82, 0);
  const rightWall = createRect(scene, "#888", 2, g.game.height, XCenter + 80, 0);
  background.append(floor);
  background.append(leftWall);
  background.append(rightWall);
  scene.append(background);
}

function createGameScene() {
  return new g.Scene({
    game: g.game,
  });
}

function gameStart(gameScene) {
  gameScene.onLoad.add(() => {
    var font = new g.DynamicFont({
      game: g.game,
      fontFamily: "sans-serif",
      size: 30
    });

    const timeline = new tl.Timeline(gameScene);
    createGameBackground(gameScene);

    score = 0;
    const scoreLabel = new al.Label({
      scene: gameScene,
      font: font,
      text: `SCORE\r${score}`,
      lineGap: 2,
      textColor: "#ede4db",
      fontSize: 16,
      width: 64,
      x: 10,
      y: 10
    })
    gameScene.append(scoreLabel);

    const player = createRect(gameScene, "#ede4db", boxW, boxH, XCenter - (boxW / 2), g.game.height - 96);
    gameScene.append(player);

    const boxList = [];
    gameScene.setInterval(() => {
      const box = createRectRandomly(gameScene);
      boxList.push(box);
      gameScene.append(box);
      timeline.create(box)
      .moveY(g.game.height + 32, boxSpeed)
      .call(() => {
        score += throughScore;
        scoreLabel.text = `SCORE\r${score}`;
        scoreLabel.invalidate();
        boxList.shift();
        box.destroy();
      });
    }, boxInterval);

    // 箱の当たり判定更新
    gameScene.onUpdate.add(() => {
      boxList.forEach((box) => {
        if (g.Collision.intersectAreas(player, box)) {
          const gameOverScene = createGameOverScene();
          gameOver(gameOverScene);
        }
      })
    })

    // 操作可能範囲判定
    player.onUpdate.add(() => {
      if(player.x < 81 || player.x > 209) {
        console.log("gameover");
        const gameOverScene = createGameOverScene();
        gameOver(gameOverScene);
      }
    })
    
    // プレイヤー操作
    gameScene.onPointUpCapture.add((e) => {
      if (Math.abs(e.startDelta.x) < 20) {
        if (e.button === 0) {
          player.x -= 32;
          player.modified();
        } else if (e.button === 2) {
          player.x += 32;
          player.modified();
        }
      } else {
        if (e.button === 0) {
          player.x -= 64;
          player.modified();
        } else if (e.button === 2) {
          player.x += 64;
          player.modified();
        }
      }
    })
  });

  g.game.pushScene(gameScene);
}

function createGameOverScene() {
  return new g.Scene({
    game: g.game,
  });
}

function gameOver(gameOverScene) {
  gameOverScene.onLoad.add(() => {
    var font = new g.DynamicFont({
      game: g.game,
      fontFamily: "sans-serif",
      size: 30
    });
    
    const background = createRect(gameOverScene, "#333", g.game.width, g.game.height, 0, 0);
    gameOverScene.append(background);

    const gameOverLabel = new g.Label({
      scene: gameOverScene,
      font: font,
      text: "GAMEOVER",
      fontSize: 28,
      textColor: "#ede4db",
      textAlign: "center",
      width: g.game.width,
      widthAutoAdjust: false,
      x: 0,
      y: g.game.height / 2 - 56,
    });
    gameOverScene.append(gameOverLabel);

    const resultLabel = new al.Label({
      scene: gameOverScene,
      font: font,
      text: `SCORE\r${score}`,
      lineGap: 5,
      fontSize: 20,
      textColor: "#ede4db",
      textAlign: "center",
      width: g.game.width,
      widthAutoAdjust: false,
      x: 0,
      y: g.game.height / 2,
    })
    gameOverScene.append(resultLabel);
  })

  gameOverScene.setTimeout(() => {    
    gameOverScene.onPointUpCapture.add(() => {
      const gameScene = createGameScene();
      gameStart(gameScene, gameOverScene);
    });
  }, 1000);

  g.game.replaceScene(gameOverScene);
}

function main() {
  const gameScene = createGameScene();
  gameStart(gameScene);
}
module.exports = main;

})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);
}