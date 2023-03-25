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
let score = 0;
let scoreText;
let gameStarted = false; // Added gameStarted variable
let startText; // Added startText variable

function preload() {
    this.load.image('bird', 'assets/bird.png');
    this.load.image('pipe', 'assets/pipe.png');
}

function create() {
    bird = this.physics.add.sprite(100, config.height / 2, 'bird').setScale(1);
    bird.setCollideWorldBounds(true);
    bird.body.allowGravity = false; // Disable gravity initially

    pipes = this.physics.add.group();

    this.input.on('pointerdown', () => {
        if (!gameStarted) {
            gameStarted = true;
            addPipes.call(this);
            bird.body.allowGravity = true; // Enable gravity when the game starts
            startText.setVisible(false); // Hide startText
            pipeTimer = this.time.addEvent({ delay: 2000, callback: addPipes, callbackScope: this, loop: true }); // Start pipeTimer after the game starts
        }
        bird.setVelocityY(-350);
    });

    this.physics.add.collider(bird, pipes, gameOver, null, this);

    const fontSize = Math.round(Math.min(config.width, config.height) * 0.03); // Calculate the font size
    scoreText = this.add.text(16, 16, 'score: 0', { fontSize: fontSize + 'px', fill: '#000' });
    scoreText.setDepth(1);

    // Added startText
    startText = this.add.text(config.width / 2, config.height / 2, 'Tap or click to start', { fontSize: fontSize * 1.5 + 'px', fill: '#000' });
    startText.setOrigin(0.5); // Center the startText
}

function update() {
    if (!gameStarted) {
        return;
    }

    if (bird.y < 0 || bird.y >= config.height - bird.displayHeight) {
        gameOver.call(this);
    }
    removeOffscreenPipes();
    incrementScore();

    const birdRotation = Phaser.Math.Clamp(bird.body.velocity.y / 1000, -0.15, 0.6);
    bird.setRotation(birdRotation * Math.PI);
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
    bird.setActive(false);
    bird.body.allowGravity = false; // Disable gravity after game over
    bird.setY(config.height / 2); // Center the bird vertically after game over
    bird.setVelocity(0, 0); // Reset bird's velocity
    bird.setRotation(0); // Reset bird's rotation
    score = 0;
    scoreText.setText('score: ' + score); // Update score display text
    gameStarted = false; // Reset gameStarted
    startText.setVisible(true); // Show startText
}