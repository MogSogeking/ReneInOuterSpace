const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      debug: true,
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
let meteor;
let delay = 5000;
let spawnEvent;
let spawnCount = 1;

function preload() {
  this.load.image('rene', 'assets/rene.png');
  this.load.image('meteor', 'assets/meteor.png');
}

function create() {
  keys = this.input.keyboard.addKeys('Z,Q,S,D,SPACE');

  rene = this.physics.add.image(32, 300, 'rene');
  setReneConfig();

  spawnEvent = this.time.addEvent({
    delay, callback: spawnObjects, callbackScope: this
  });

  meteor = this.physics.add.image(600, 300, 'meteor').setBounce(0.5, 0.5).setMass(10).setCircle(32);
  meteor.setAngularVelocity(20);
  meteor.setVelocity(-200, 0);

  this.physics.add.collider(rene, meteor);
}

function update() {
  movingRene();
}

function setReneConfig() {
  rene.setBounce(1, 1)
    .setMass(1)
    .setDrag(0.98, 0.98)
    .setAngularVelocity(120)
    .setMaxVelocity(300, 300)
    .setCircle(32)
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
  spawnCount++;
  console.log(delay);
  spawnEvent = this.time.addEvent({
    delay, callback: spawnObjects, callbackScope: this
  });
}
