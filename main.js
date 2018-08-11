const config = {
  type: Phaser.AUTO,
  width: 1200,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      // debug: true,
      gravity: { x: -200 }
    },
  },
  scene: {
    preload,
    create,
    update,
  }
};

const game = new Phaser.Game(config);

let keys;

let rene;
const meteors = [];
const bonuses = [];
let spaceCollapse;

let delay = 5000;
let spawnEvent;
let bonusEvent;
let spawnCount = 1;
let particles;

function preload() {
  this.load.image('rene', 'assets/rene.png');
  this.load.image('meteor', 'assets/meteor.png');
  this.load.image('spaceCollapse', 'assets/spaceCollapse.png');
  this.load.image('star', 'assets/star.png');
  this.load.image('greenBonus', 'assets/greenBonus.png');
}

function create() {
  keys = this.input.keyboard.addKeys('Z,Q,S,D,SPACE');
  this.physics.world.checkCollision.left = false;
  this.physics.world.checkCollision.right = false;

  particles = this.physics.add.group({ key: 'star', repeat: 80 });
  particles.children.iterate(createParticles, this);


  spaceCollapse = this.physics.add.image(22, 300, 'spaceCollapse')
    .setImmovable()
    .setGravityX(0);
  spaceCollapse.body.allowGravity = false;

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
      const tween = this.tweens.add({
        targets: ren,
        ease: t => --t * t * ((5 + 1) * t + 5) + 1,
        duration: 400,
        scaleX: rene.scaleX + 1,
        scaleY: rene.scaleY + 1
      });
      ren.inventory.push(bon.type);
      bon.destroy();
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
  if (rene.isDead) {
    this.scene.restart();
  }
}

function setReneConfig() {
  rene.setBounce(1, 1)
    .setDrag(0.98, 0.98)
    .setAngularVelocity(120)
    .setMaxVelocity(500, 500)
    .setCollideWorldBounds(true);
  rene.body.useDamping = true;
  rene.inventory = [];
  rene.isDead = false;
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

  const bonus = this.physics.add.image(1500, 300, 'greenBonus')
    .setBounce(1, 1)
    .setAngularVelocity(300)
    .setVelocity(randomXVelocity, randomYVelocity)
    .setCollideWorldBounds(true)
    .setImmovable();
  bonus.body.allowGravity = false;
  bonuses.push(bonus);
}

function spawnObjects() {
  delay -= 1000 / Math.pow(spawnCount, 1.2);
  spawnCount += 1;

  pickSpawn.bind(this)(spawnCount);
  spawnEvent = this.time.addEvent({
    delay, callback: spawnObjects, callbackScope: this
  });
}

function pickSpawn(difficulty) {
  spawnSingleMeteor.bind(this)(difficulty);
}

function spawnSingleMeteor(difficulty) {
  let randomScale = 1 + (Math.random() * (difficulty / 10));
  const randomXVelocity = -(50 + (Math.random() * 100));
  const randomYVelocity = (Math.random() - 0.5) * 600;

  if (randomScale > 5) {
    randomScale = 5;
  }

  const meteor = this.physics.add.image(1500, 300, 'meteor')
    .setBounce(1, 1)
    .setAngularVelocity(20)
    .setVelocity(randomXVelocity, randomYVelocity)
    .setCollideWorldBounds(true)
    .setImmovable()
    .setScale(randomScale, randomScale);

  meteors.push(meteor);

  this.physics.add.collider(rene, meteor);
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
