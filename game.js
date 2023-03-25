const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
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

window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
});

const game = new Phaser.Game(config);
let bird;
let pipes;
let pipeTimer;
let score = 0; // Added score variable
let scoreText; // Added text object variable

function preload() {
    this.load.image('bird', 'assets/bird.png');
    this.load.image('pipe', 'assets/pipe.png');
}

function create() {
    bird = this.physics.add.sprite(100, 250, 'bird').setScale(1);
    bird.setCollideWorldBounds(true);

    pipes = this.physics.add.group();
    pipeTimer = this.time.addEvent({ delay: 2000, callback: addPipes, callbackScope: this, loop: true });

    this.input.on('pointerdown', () => {
        bird.setVelocityY(-350);
    });

    this.physics.add.collider(bird, pipes, gameOver, null, this);

    scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' }); // Added score display text
    scoreText.setDepth(1); // Set the depth of the score text
}

function update() {
    if (bird.y < 0 || bird.y >= config.height - bird.displayHeight) {
        gameOver.call(this);
    }
    removeOffscreenPipes();
    incrementScore(); // Added score increment check
}

function addPipes() {
    const screenWidth = game.scale.width;
    const screenHeight = game.scale.height;

    const pipeHoleHeight = screenHeight * 0.25;
    const minPipeHeight = screenHeight * 0.1;
    const maxPipeHeight = screenHeight * 0.75 - pipeHoleHeight;
    const pipeHeight = Phaser.Math.Between(minPipeHeight, maxPipeHeight);

    const pipeWidth = screenWidth / 8;

    const upperPipe = pipes.create(screenWidth, 0, 'pipe');
    upperPipe.setOrigin(0, 0);
    upperPipe.body.allowGravity = false;
    upperPipe.setVelocityX(-200);
    upperPipe.setDisplaySize(pipeWidth, pipeHeight);

    const lowerPipeY = pipeHeight + pipeHoleHeight;
    const lowerPipeHeight = screenHeight - lowerPipeY;
    const lowerPipe = pipes.create(screenWidth, screenHeight, 'pipe');
    lowerPipe.setOrigin(0, 1); // Set the origin to the bottom left corner
    lowerPipe.body.allowGravity = false;
    lowerPipe.setVelocityX(-200);
    lowerPipe.setDisplaySize(pipeWidth, lowerPipeHeight);
}

function removeOffscreenPipes() {
    pipes.children.each(pipe => {
        if (pipe.x < -pipe.displayWidth) {
            pipes.remove(pipe, true, true);
        }
    });
}

function incrementScore() {
    pipes.children.each(pipe => {
        // Check if the pipe is an upper pipe by comparing its origin
        const isUpperPipe = pipe.originY === 0;
        if (isUpperPipe && pipe.x + pipe.displayWidth < bird.x && !pipe.scored) {
            pipe.scored = true;
            score++;
            scoreText.setText('score: ' + score);
        }
    });
}

function gameOver() {
    pipeTimer.remove();
    pipes.clear(true, true);
    bird.destroy();
    this.scene.restart();
    score = 0; // Reset score
}