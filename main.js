const config = {
  type: Phaser.AUTO,
  width: 1200,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      // debug: true,
    },
  },
  audio: {
    override: false,
  },
  scene: {
    preload,
    create,
    update,
  }
};

const game = new Phaser.Game(config);

let keys;
let space;

const items = {
  shot: 1,
  time: 2,
  gaz: 3,
};

let rene;
const meteors = [];
const bonuses = [];
const indestructiballs = [];
let spaceCollapse;
let spaceCollapseBack;

let delay = 5000;
let spawnEvent;
let bonusEvent;
let spawnCount = 1;
let difficulty = 1;
let particles;
let slots;
let itemImages;
let score = 0;
let scoreText;
let bestScore = 0;
let bestScoreText;
let reneOuilleSound;
let reneBonusSound;
let reneLazorSound;
let renePewSound;
let reneDeathSound;
let objectBoomSound;
let indestructitingSound;
let smallBurpSound;
let mediumBurpSound;
let bigBurpSound;
let watchSound;
let bonusDeathSound;
let bgm;

function preload() {
  this.load.image('rene', 'assets/rene.png');
  this.load.image('meteor', 'assets/meteor.png');
  this.load.image('meteorBoom', 'assets/meteorBoom.png');
  this.load.image('spaceCollapse', 'assets/spaceCollapse.png');
  this.load.image('star', 'assets/star.png');
  this.load.image('bonus', 'assets/bonus.png');
  this.load.spritesheet('power', 'assets/power.png', { frameWidth: 128, frameHeight: 128 });
  this.load.image('slot', 'assets/slot.png');
  this.load.image('lazor', 'assets/lazor.png');
  this.load.image('indestructiball', 'assets/indestructiball.png');
  this.load.image('bonusDeath', 'assets/bonusDeath.png');

  this.load.audio('reneOuille', 'sounds/reneOuille.mp3');
  this.load.audio('reneBonus', 'sounds/reneBonus.mp3');
  this.load.audio('reneLazor', 'sounds/reneLazor.mp3');
  this.load.audio('renePew', 'sounds/renePew.mp3');
  this.load.audio('reneDeath', 'sounds/reneDeath.mp3');
  this.load.audio('objectBoom', 'sounds/objectBoom.mp3');
  this.load.audio('indestructiting', 'sounds/indestructiting.mp3');
  this.load.audio('smallBurp', 'sounds/smallBurp.mp3');
  this.load.audio('mediumBurp', 'sounds/mediumBurp.mp3');
  this.load.audio('bigBurp', 'sounds/bigBurp.mp3');
  this.load.audio('watch', 'sounds/watch.mp3');
  this.load.audio('bonusDeath', 'sounds/bonusDeath.mp3');
  this.load.audio('bgm', 'sounds/bgm.mp3');
}

function create() {
  reneOuilleSound = this.sound.add('reneOuille');
  reneBonusSound = this.sound.add('reneBonus');
  reneLazorSound = this.sound.add('reneLazor');
  renePewSound = this.sound.add('renePew');
  reneDeathSound = this.sound.add('reneDeath');
  objectBoomSound = this.sound.add('objectBoom');
  indestructitingSound = this.sound.add('indestructiting');
  smallBurpSound = this.sound.add('smallBurp');
  mediumBurpSound = this.sound.add('mediumBurp');
  bigBurpSound = this.sound.add('bigBurp');
  watchSound = this.sound.add('watch');
  bonusDeathSound = this.sound.add('bonusDeath');
  bgm = this.sound.add('bgm');
  bgm.setLoop(true);
  bgm.play();

  this.sound.override = false;

  keys = this.input.keyboard.addKeys('Z,Q,S,D');
  space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  this.physics.world.checkCollision.left = false;
  this.physics.world.checkCollision.right = false;
  scoreText = this.add.text(64, 16, 'Score: 0');
  bestScoreText = this.add.text(64, 48, `Previous best: ${bestScore}`);

  particles = this.physics.add.group({ key: 'star', repeat: 80 });
  particles.children.iterate(createParticles, this);

  slots = this.add.group({
    key: 'slot',
    repeat: 2,
    setXY: {
      x: 784,
      y: 96,
      stepX: 160,
    }
  });

  itemImages = this.add.group({
    key: 'power',
    repeat: 2,
    frame: 0,
    setXY: {
      x: 784,
      y: 96,
      stepX: 160,
    }
  });

  spaceCollapse = this.add.image(0, 300, 'spaceCollapse').setAngle(-2);
  spaceCollapseBack = this.add.image(0, 300, 'spaceCollapse').setAlpha(0.3);

  slots.setDepth(1);
  itemImages.setDepth(1);
  scoreText.setDepth(2);
  bestScoreText.setDepth(2);
  spaceCollapse.setDepth(1);
  spaceCollapseBack.setFlipY(true);

  this.tweens.add({
    targets: spaceCollapse,
    loop: -1,
    x: {
      value: 48, duration: 2000, ease: 'Quad.easeInOut', yoyo: true
    },
    angle: {
      value: 2, duration: 1800, ease: 'Quad.easeInOut', yoyo: true
    },
    alpha: {
      value: 0.3, duration: 1600, ease: 'Quad.easeInOut', yoyo: true
    }
  });

  this.tweens.add({
    targets: spaceCollapseBack,
    loop: -1,
    x: {
      value: 48, duration: 1500, ease: 'Quad.easeInOut', yoyo: true
    },
    angle: {
      value: -4, duration: 1300, ease: 'Quad.easeInOut', yoyo: true
    },
    alpha: {
      value: 1, duration: 1600, ease: 'Quad.easeInOut', yoyo: true
    }
  });

  rene = this.physics.add.image(100, 300, 'rene');
  setReneConfig();

  spawnEvent = this.time.addEvent({
    delay, callback: spawnObjects, callbackScope: this
  });

  bonusEvent = this.time.addEvent({
    delay: 7000, callback: spawnBonus, callbackScope: this, loop: true
  });

  this.physics.add.overlap(rene, bonuses, (ren, bon) => {
    if (ren.inventory.length < 3) {
      if (!this.tweens.isTweening(ren)) {
        this.tweens.add({
          targets: ren,
          ease: t => --t * t * ((5 + 1) * t + 5) + 1,
          duration: 400,
          scaleX: rene.scaleX + 1,
          scaleY: rene.scaleY + 1
        });
        ren.inventory.push(bon.type);
        bon.destroy();
        reneBonusSound.play();
        updateInventoryDisplay();
        score += 1000;
        if (!this.tweens.isTweening(scoreText)) {
          this.tweens.add(({
            targets: scoreText,
            ease: 'Quad.easeInOut',
            yoyo: true,
            duration: 100,
            scaleX: 1.3,
            scaleY: 1.3
          }));
        }
      }
    }
  });
}

function update() {
  movingRene();
  this.physics.world.wrap(particles.getChildren());
  meteors.forEach((met) => {
    if (met.x < -met.width) {
      met.destroy();
    }
  });
  indestructiballs.forEach((ball) => {
    if (ball.x < -ball.width) {
      ball.destroy();
    }
  });
  bonuses.forEach((bon) => {
    if (bon.x < -bon.width) {
      const bonusDeath = this.add.image(32, bon.y, 'bonusDeath');
      bonusDeath.setTint(bon.tintBottomLeft);
      this.tweens.add({
        targets: bonusDeath,
        alpha: { value: 0, duration: 1000, ease: 'Quad.easeOut', },
        onComplete: ({ targets }) => targets[0].destroy()
      });
      bon.destroy();
      spawnCount += 20;
      bonusDeathSound.play();
      bon.x = 500;
      // this.cameras.main.shake(200, 0.01);
    }
  });

  if (Phaser.Input.Keyboard.JustDown(space)) {
    if (rene.inventory.length > 0) {
      if (!this.tweens.isTweening(rene)) {
        const shot = rene.inventory.shift();
        this.tweens.add({
          targets: rene,
          ease: t => --t * t * ((5 + 1) * t + 5) + 1,
          duration: 400,
          scaleX: rene.scaleX - 1,
          scaleY: rene.scaleY - 1
        });
        updateInventoryDisplay();
        shoot.bind(this)(shot, rene.inventory.length + 1);
      }
    }
  }

  score += 1;
  scoreText.setText(`Score: ${score}`);

  if (rene.isDead) {
    if (bestScore < score) {
      bestScore = score;
    }
    spawnCount = 1;
    difficulty = 1;
    score = 0;
    delay = 5000;
    bgm.stop();
    reneDeathSound.play();
    this.scene.restart();
  }
}

function setReneConfig() {
  rene.setBounce(1, 1)
    .setDrag(0.98, 0.98)
    .setAngularVelocity(120)
    .setMaxVelocity(500, 500)
    .setSize(32, 32)
    .setCollideWorldBounds(true);
  rene.body.useDamping = true;
  rene.inventory = [];
  rene.isDead = false;
  rene.setGravityX(-200);
}

function movingRene() {
  rene.setMaxVelocity(500 * (1 + (rene.scaleX - 1) / 2), 500 * (1 + (rene.scaleY - 1) / 2));
  rene.setAccelerationX((keys.D.isDown - keys.Q.isDown) * 1000);
  rene.setAccelerationY((keys.S.isDown - keys.Z.isDown) * 1000);
  if (keys.S.isDown || keys.D.isDown || keys.Q.isDown || keys.Z.isDown) {
    rene.setAngularVelocity(360);
  } else {
    rene.setAngularVelocity(120);
  }

  if (rene.x > 1200) {
    rene.setVelocityX(0);
    rene.setAccelerationX(-1000);
  }
  if (rene.x < -rene.width * rene.scaleX) {
    rene.isDead = true;
  }
}

function spawnBonus() {
  const randomXVelocity = -(200 + (Math.random() * 100));
  const randomYVelocity = (Math.random() - 0.5) * 800;
  const randomBonus = Math.random();
  let bonus;

  if (randomBonus > 0.9) {
    bonus = this.physics.add.image(1500, 300, 'bonus');
    bonus.type = 'time';
    bonus.setTint(0x0000ff);
  } else if (randomBonus > 0.7) {
    bonus = this.physics.add.image(1500, 300, 'bonus');
    bonus.type = 'shot';
    bonus.setTint(0x00ff00);
  } else {
    bonus = this.physics.add.image(1500, 300, 'bonus');
    bonus.type = 'gaz';
    bonus.setTint(0x888888);
  }

  bonus.setBounce(1, 1)
    .setAngularVelocity(300)
    .setVelocity(randomXVelocity, randomYVelocity)
    .setCollideWorldBounds(true)
    .setImmovable();
  bonus.body.allowGravity = false;
  bonuses.push(bonus);
}

function spawnObjects() {
  delay -= 1000 / Math.pow(difficulty, 1.2);
  spawnCount += 1;
  difficulty += 1;

  pickSpawn.bind(this)(spawnCount / 100);
  spawnEvent = this.time.addEvent({
    delay, callback: spawnObjects, callbackScope: this
  });
  console.log('meteor:', meteors[0], meteors.length);

  while (meteors[0] && !meteors[0].active) {
    meteors.shift();
  }
  while (indestructiballs[0] && !indestructiballs[0].active) {
    indestructiballs.shift();
  }
  while (bonuses[0] && !bonuses[0].active) {
    bonuses.shift();
  }
}

function pickSpawn(diff) {
  const trueDifficulty = Math.tanh(diff);

  const pickMeteorField = (Math.random() * trueDifficulty) > 0.95;
  const pickBall = (Math.random() > 0.7 && trueDifficulty > 0.2);

  if (pickMeteorField) {
    spawnMeteorField.bind(this)(trueDifficulty);
  } else if (pickBall) {
    spawnBalls.bind(this)(trueDifficulty);
  } else {
    spawnMeteors.bind(this)(trueDifficulty);
  }

  console.log('difficulty:', diff, Math.tanh(diff));
}

function spawnBalls(trueDifficulty) {
  const ballNumber = Math.ceil(trueDifficulty * Math.random() * 3);
  const randomVelocity = -(50 + (Math.random() * 150));

  const collide = () => {
    this.cameras.main.shake(100, 0.002);
    if (!reneOuilleSound.isPlaying) {
      reneOuilleSound.play();
    }
  };

  if (ballNumber === 1) {
    let indestructiball;
    const ballPattern = Math.random();
    if (ballPattern < 0.33) {
      const isHigh = Math.random() > 0.5;
      if (isHigh) {
        indestructiball = this.physics.add.image(1300, 48, 'indestructiball');
      } else {
        indestructiball = this.physics.add.image(1300, 552, 'indestructiball');
      }
    } else if (ballPattern < 0.66) {
      indestructiball = this.physics.add.image(1300, (Math.random() * 300) + 150, 'indestructiball');
    } else {
      indestructiball = this.physics.add.image(1300, rene.y, 'indestructiball');
    }
    indestructiballs.push(indestructiball);

    indestructiball.body.setAllowGravity(false);
    indestructiball.setImmovable()
      .setVelocityX(randomVelocity);

    this.physics.add.collider(rene, indestructiball, collide);
  } else if (ballNumber === 2) {
    const indestructiballz = [];
    const ballPattern = Math.random();
    if (ballPattern < 0.33) {
      indestructiballz.push(this.physics.add.image(1300, 48, 'indestructiball'));
      indestructiballz.push(this.physics.add.image(1300, 552, 'indestructiball'));
    } else if (ballPattern < 0.66) {
      indestructiballz.push(this.physics.add.image(1300, 150, 'indestructiball'));
      indestructiballz.push(this.physics.add.image(1300, 450, 'indestructiball'));
    } else {
      indestructiballz.push(this.physics.add.image(1300, 225, 'indestructiball'));
      indestructiballz.push(this.physics.add.image(1300, 375, 'indestructiball'));
    }

    for (let i = 0; i < 2; i += 1) {
      indestructiballs.push(indestructiballz[i]);
      indestructiballz[i].body.setAllowGravity(false);
      indestructiballz[i].setImmovable()
        .setVelocityX(randomVelocity);

      this.physics.add.collider(rene, indestructiballz[i], collide);
    }
  } else {
    const indestructiballz = [];
    const ballPattern = Math.random();
    if (ballPattern > 0.5) {
      indestructiballz.push(this.physics.add.image(1300, 48, 'indestructiball'));
      indestructiballz.push(this.physics.add.image(1300, 552, 'indestructiball'));
      indestructiballz.push(this.physics.add.image(1300, 300, 'indestructiball'));
    } else {
      indestructiballz.push(this.physics.add.image(1300, 150, 'indestructiball'));
      indestructiballz.push(this.physics.add.image(1300, 450, 'indestructiball'));
      indestructiballz.push(this.physics.add.image(1300, 300, 'indestructiball'));
    }

    for (let i = 0; i < 3; i += 1) {
      indestructiballs.push(indestructiballz[i]);
      indestructiballz[i].body.setAllowGravity(false);
      indestructiballz[i].setImmovable()
        .setVelocityX(randomVelocity);

      this.physics.add.collider(rene, indestructiballz[i], collide);
    }
  }
}

function spawnMeteors(trueDifficulty) {
  const meteorNumber = Math.ceil(Math.random() * trueDifficulty * 3);

  const collide = () => {
    this.cameras.main.shake(100, 0.002);
    if (!reneOuilleSound.isPlaying) {
      reneOuilleSound.play();
    }
  };

  for (let i = 0; i < meteorNumber; i += 1) {
    let randomScale = 1 + (Math.random() * trueDifficulty * 4);
    const randomXVelocity = -(20 + (Math.random() * 50));
    const randomYVelocity = (Math.random() - 0.5) * 600;
    if (randomScale > 5) {
      randomScale = 5;
    }
    const meteor = this.physics.add.image(1300, 300, 'meteor')
      .setBounce(1, 1)
      .setAngularVelocity(20)
      .setVelocity(randomXVelocity, randomYVelocity)
      .setCollideWorldBounds(true)
      .setImmovable()
      .setSize(48, 48)
      .setScale(randomScale, randomScale);

    meteor.setGravityX(-100 / meteor.scaleX);

    meteors.push(meteor);
    this.physics.add.collider(rene, meteor, collide);
  }
}

function spawnMeteorField() {
  const collide = () => {
    this.cameras.main.shake(100, 0.002);
    if (!reneOuilleSound.isPlaying) {
      reneOuilleSound.play();
    }
  };

  const prepareMeteor = (meteor) => {
    meteor.setBounce(1, 1)
      .setAngularVelocity(20)
      .setVelocity(randomXVelocity, 0)
      .setImmovable()
      .setSize(48, 48);
    meteor.setGravityX(-10);

    meteors.push(meteor);
    this.physics.add.collider(rene, meteor, collide);
  };

  const randomXVelocity = 32 + (Math.random() * 64);

  for (let i = 0; i < 9; i += 1) {
    const randomX = (Math.random() - 0.5) * 64;
    const randomY = (Math.random() - 0.5) * 64;
    const randomScale = 0.5 + Math.random();

    const meteor = this.physics.add.image(randomX + 1300 + (Math.floor(i / 3) * 256), randomY + 64 + ((i % 3) * 236), 'meteor')
      .setScale(randomScale, randomScale);

    prepareMeteor(meteor);
  }

  for (let i = 0; i < 4; i += 1) {
    const randomX = (Math.random() - 0.5) * 64;
    const randomY = (Math.random() - 0.5) * 64;
    const randomScale = 0.5 + Math.random();

    const meteor = this.physics.add.image(randomX + 1300 + 128 + (Math.floor(i / 2) * 256), randomY + 64 + 118 + ((i % 2) * 236), 'meteor')
      .setScale(randomScale, randomScale);

    prepareMeteor(meteor);
  }
}

function destroyMeteor(meteor) {
  const meteorBoom = this.add.image(meteor.x, meteor.y, 'meteorBoom');
  meteorBoom.setScale(meteor.scaleX, meteor.scaleY);
  this.tweens.add({
    targets: meteorBoom,
    alpha: { value: 0, duration: 1000, ease: 'Quad.easeOut' },
    onComplete: ({ targets }) => targets[0].destroy()
  });
  meteor.destroy();
}

function createParticles(particle) {
  const x = Phaser.Math.Between(64, 1200);
  const y = Phaser.Math.Between(64, 600);

  const tint = (Phaser.Math.Between(0x66, 0xff) * 0x10000) + (Phaser.Math.Between(0x66, 0xff) * 0x100) + Phaser.Math.Between(0x66, 0xff);
  particle.x = x;
  particle.y = y;

  particle.zAxis = Phaser.Math.Between(1, 5);
  particle.setImmovable();
  particle.body.allowGravity = false;
  particle.setTint(tint);

  particle.setVelocity(Math.pow(particle.zAxis, 2) * -3, 0);
  particle.setScale(particle.zAxis / 10, particle.zAxis / 10);
}

function updateInventoryDisplay() {
  for (let i = 0; i < 3; i += 1) {
    if (!rene.inventory[i]) {
      itemImages.getChildren()[i].setFrame(0);
    } else {
      itemImages.getChildren()[i].setFrame(items[rene.inventory[i]]);
    }
  }
}

function shoot(type, size) {
  if (type === 'shot') {
    if (size === 1) {
      const shot = this.physics.add.image(rene.x, rene.y, 'power', 1);
      shot.setScale(0.2, 0.2)
        .setVelocityX(400);

      shot.body.allowGravity = false;
      renePewSound.play();
      this.physics.add.overlap(shot, meteors, (sho, met) => {
        sho.destroy();
        destroyMeteor.bind(this)(met);
        objectBoomSound.play();

        addScore.bind(this)(1000);
      });

      this.physics.add.overlap(shot, indestructiballs, (sho) => {
        sho.destroy();
        if (!indestructitingSound.isPlaying) {
          indestructitingSound.play();
        }
      });
    } else if (size === 2) {
      const shots = this.physics.add.group({
        key: 'power',
        repeat: 2,
        frame: 1,
        setXY: {
          x: rene.x,
          y: rene.y,
        },
        setRotation: {
          value: 0.2,
          step: -0.2,
        },
        setScale: {
          x: 0.2,
          y: 0.2
        }
      });
      shots.setVelocityX(400, 0);
      shots.setVelocityY(150, -100);

      shots.getChildren().forEach((shot) => { shot.body.allowGravity = false; });
      renePewSound.play();
      this.physics.add.overlap(shots, meteors, (met, sho) => {
        sho.destroy();
        destroyMeteor.bind(this)(met);
        objectBoomSound.play();
        addScore.bind(this)(1000);
      });
      this.physics.add.overlap(shots, indestructiballs, (ball, sho) => {
        sho.destroy();
        if (!indestructitingSound.isPlaying) {
          indestructitingSound.play();
        }
      });
    } else {
      const lazor = this.physics.add.image(rene.x + 600, rene.y, 'lazor');
      lazor.body.allowGravity = false;
      lazor.setVelocity(20, 20);
      reneLazorSound.play();
      this.tweens.add({
        targets: lazor,
        alpha: { value: 0, duration: 1000, ease: t => Math.pow(t, 0.01), },
        onComplete: ({ targets }) => targets[0].destroy()
      });
      this.cameras.main.shake(250, 0.02);
      this.physics.add.overlap(lazor, meteors, (laz, met) => {
        destroyMeteor.bind(this)(met);
        objectBoomSound.play();
        addScore.bind(this)(1000);
      });
      this.physics.add.overlap(lazor, indestructiballs, () => {
        if (!indestructitingSound.isPlaying) {
          indestructitingSound.play();
        }
      });
    }
  } else if (type === 'time') {
    if (size === 1) {
      meteors.forEach((meteor) => {
        if (meteor.body) {
          meteor.setAccelerationX(-meteor.body.velocity.x);
          meteor.setAccelerationY(-meteor.body.velocity.y);
          this.time.addEvent({
            delay: 1000,
            callback: () => {
              if (meteor && meteor.body) {
                meteor.setAccelerationX(0);
                meteor.setAccelerationY(0);
              }
            },
            callbackScope: this
          });
        }
      });
      watchSound.play();
    } else if (size === 2) {
      meteors.forEach((meteor) => {
        if (meteor.body) {
          meteor.storedVelocity = { x: meteor.body.velocity.x, y: meteor.body.velocity.y };
          meteor.setVelocityX(0);
          meteor.setVelocityY(0);
          meteor.setAngularVelocity(0);
          meteor.body.allowGravity = false;
        }
        this.time.addEvent({
          delay: 4000,
          callback: () => {
            if (meteor && meteor.body) {
              meteor.setVelocityX(meteor.storedVelocity.x);
              meteor.setVelocityY(meteor.storedVelocity.y);
              meteor.setAngularVelocity(20);
              meteor.body.allowGravity = true;
            }
          },
          callbackScope: this
        });
      });
      watchSound.play();
    } else {
      difficulty = 1;
      delay = 5000;
      watchSound.play();
    }
  } else if (type === 'gaz') {
    if (size === 1) {
      smallBurpSound.play();
      this.cameras.main.shake(100, 0.002);
    } else if (size === 2) {
      mediumBurpSound.play();
      this.cameras.main.shake(150, 0.004);
    } else {
      bigBurpSound.play();
      this.cameras.main.shake(200, 0.01);
    }
  }
}

function addScore(points) {
  score += points;
  if (!this.tweens.isTweening(scoreText)) {
    this.tweens.add(({
      targets: scoreText,
      ease: 'Quad.easeInOut',
      yoyo: true,
      duration: 100,
      scaleX: 1.3,
      scaleY: 1.3
    }));
  }
}
