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
let meteor;
let spaceCollapse;

let delay = 5000;
let spawnEvent;
let spawnCount = 1;
let particles;

function preload() {
  this.load.image('rene', 'assets/rene.png');
  this.load.image('meteor', 'assets/meteor.png');
  this.load.image('space_collapse', 'assets/space_collapse.png');
  this.load.image('star', 'assets/star.png');
}

function create() {
  keys = this.input.keyboard.addKeys('Z,Q,S,D,SPACE');
  this.physics.world.checkCollision.left = false;
  this.physics.world.checkCollision.right = false;

  particles = this.physics.add.group({ key: 'star', repeat: 80 });
  particles.children.iterate(createParticles, this);


  spaceCollapse = this.physics.add.image(22, 300, 'space_collapse')
    .setImmovable()
    .setGravityX(0);
  spaceCollapse.body.allowGravity = false;

  rene = this.physics.add.image(100, 300, 'rene');
  setReneConfig();

  spawnEvent = this.time.addEvent({
    delay, callback: spawnObjects, callbackScope: this
  });

  this.physics.add.collider(rene, spaceCollapse, (ren) => {
    ren.destroy();
  });

  this.physics.add.collider(meteors, spaceCollapse, (met) => {
    met.destroy();
  });
}

function update() {
  movingRene();
  this.physics.world.wrap(particles.getChildren());
}

function setReneConfig() {
  rene.setBounce(1, 1)
    .setDrag(0.98, 0.98)
    .setAngularVelocity(120)
    .setMaxVelocity(300, 300)
    .setCollideWorldBounds(true);
  rene.body.useDamping = true;
}

function movingRene() {
  rene.setAccelerationX((keys.D.isDown - keys.Q.isDown) * 1000);
  rene.setAccelerationY((keys.S.isDown - keys.Z.isDown) * 1000);
  if (keys.S.isDown || keys.D.isDown || keys.Q.isDown || keys.Z.isDown) {
    rene.setAngularVelocity(360);
  } else {
    rene.setAngularVelocity(120);
  }
}

function spawnObjects() {
  delay -= 1000 / Math.pow(spawnCount, 1.2);
  spawnCount += 1;
  console.log(delay);

  let randomScale = 1 + (Math.random() * (spawnCount / 10));
  const randomXVelocity = -(50 + (Math.random() * 100));
  const randomYVelocity = (Math.random() - 0.5) * 600;

  console.log(randomScale);

  if (randomScale > 5) {
    randomScale = 5;
  }

  meteor = this.physics.add.image(1500, 300, 'meteor')
    .setBounce(1, 1)
    .setAngularVelocity(20)
    .setVelocity(randomXVelocity, randomYVelocity)
    .setCollideWorldBounds(true)
    .setImmovable()
    .setScale(randomScale, randomScale);

  meteors.push(meteor);

  this.physics.add.collider(rene, meteor);
  spawnEvent = this.time.addEvent({
    delay, callback: spawnObjects, callbackScope: this
  });
}

function pickSpawn(difficulty) {

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
