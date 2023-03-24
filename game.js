const config = {
    type: Phaser.AUTO,
    width: 400,
    height: 600,
    backgroundColor: '#70c5ce',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1000 },
            debug: false,
        },
    },
    scene: {
        preload: preload,
        create: create,
        update: update,
    },
};

const game = new Phaser.Game(config);
let bird;
let pipes;
let pipeTimer;

function preload() {
    this.load.image('bird', 'assets/bird.png');
    this.load.image('pipe', 'assets/pipe.png');
}

function create() {
    bird = this.physics.add.sprite(100, 250, 'bird').setScale(0.1);
    bird.setCollideWorldBounds(true);

    pipes = this.physics.add.group();
    pipeTimer = this.time.addEvent({ delay: 2000, callback: addPipes, callbackScope: this, loop: true });

    this.input.on('pointerdown', () => {
        bird.setVelocityY(-350);
    });

    this.physics.add.collider(bird, pipes, gameOver, null, this);
}

function update() {
    if (bird.y < 0 || bird.y >= config.height - bird.displayHeight) {
        gameOver.call(this);
    }
    removeOffscreenPipes();
}

function addPipes() {
    const pipeHeight = Phaser.Math.Between(100, 300);
    const pipeY = pipeHeight + 100;

    const upperPipe = pipes.create(config.width, pipeHeight, 'pipe').setScale(0.5);
    upperPipe.setOrigin(0, 1);
    upperPipe.body.allowGravity = false;
    upperPipe.setVelocityX(-200);

    const lowerPipe = pipes.create(config.width, pipeY, 'pipe').setScale(0.5);
    lowerPipe.body.allowGravity = false;
    lowerPipe.setVelocityX(-200);
}

function removeOffscreenPipes() {
    pipes.children.each(pipe => {
        if (pipe.x < -pipe.displayWidth) {
            pipes.remove(pipe, true, true);
        }
    });
}

function gameOver() {
    pipeTimer.remove();
    pipes.clear(true, true);
    bird.destroy();
    this.scene.restart();
}