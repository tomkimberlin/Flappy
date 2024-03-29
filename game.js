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
            fps: 240,
        },
    },
    scene: {
        preload,
        create,
        update,
    },
};

const game = new Phaser.Game(config);
let bird, pipes, pipeTimer, score = 0, scoreText, highScore = 0, highScoreText, gameStarted = false, startText;

window.addEventListener('resize', resizeGame);

function preload() {
    this.load.image('bird', 'assets/bird.png');
    this.load.image('pipe', 'assets/pipe.png');
}

function create() {
    createScoreText.call(this);
    createHighScoreText.call(this);
    createBird.call(this);
    pipes = this.physics.add.group();
    createInputListener.call(this);
    createCollisionListener.call(this);
    createStartText.call(this);
}

function update() {
    if (!gameStarted) return;
    checkGameOver.call(this);
    removeOffscreenPipes();
    incrementScore();
    updateBirdRotation();
}

// Utility functions

function resizeGame() {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;
    game.scale.resize(newWidth, newHeight);
    startText.setPosition(newWidth / 2, newHeight / 2);
}

function createScoreText() {
    const fontSize = Math.round(Math.min(config.width, config.height) * 0.03);
    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: `${fontSize}px`, fill: '#000' });
    scoreText.setDepth(1);
}

function createHighScoreText() {
    const fontSize = Math.round(Math.min(config.width, config.height) * 0.03);
    highScore = localStorage.getItem('highScore') || 0; // Get the high score from localStorage, or default to 0
    highScoreText = this.add.text(config.width - 16, 16, `High Score: ${highScore}`, { fontSize: `${fontSize}px`, fill: '#000' });
    highScoreText.setOrigin(1, 0);
    highScoreText.setDepth(1);
}

function createBird() {
    const birdStartingOffset = 40;
    bird = this.physics.add.sprite(birdStartingOffset, config.height / 2, 'bird').setScale(1);
    bird.setCollideWorldBounds(true);
    bird.body.allowGravity = false;
}

function createInputListener() {
    this.input.on('pointerdown', () => {
        if (!gameStarted) {
            startGame.call(this);
        }
        bird.setVelocityY(-350);
    });
}

function createCollisionListener() {
    this.physics.add.collider(bird, pipes, gameOver, null, this);
}

function createStartText() {
    const fontSize = Math.round(Math.min(config.width, config.height) * 0.045);
    startText = this.add.text(config.width / 2, config.height / 2, 'Tap or click to start', { fontSize: `${fontSize}px`, fill: '#000' });
    startText.setOrigin(0.5);
}

function checkGameOver() {
    if (bird.y < 0 || bird.y >= config.height - bird.displayHeight) {
        gameOver.call(this);
    }
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
        const isUpperPipe = pipe.originY === 0;
        if (isUpperPipe && pipe.x + pipe.displayWidth < bird.x && !pipe.scored) {
            pipe.scored = true;
            score++;
            scoreText.setText(`Score: ${score}`);
        }
    });
}

function updateBirdRotation() {
    const birdRotation = Phaser.Math.Clamp(bird.body.velocity.y / 1000, -0.15, 0.6);
    bird.setRotation(birdRotation * Math.PI);
}

function addPipes() {
    const screenWidth = game.scale.width;
    const screenHeight = game.scale.height;
    const pipeHoleHeight = screenHeight * 0.2;
    const minPipeHeight = screenHeight * 0.1;
    const maxPipeHeight = screenHeight * 0.75 - pipeHoleHeight;
    const pipeHeight = Phaser.Math.Between(minPipeHeight, maxPipeHeight);
    const pipeWidth = screenWidth / 8;
    const pipeSpeed = -300; // Decrease to increase speed of pipes
    createPipe(screenWidth, 0, pipeWidth, pipeHeight, pipeSpeed);
    createPipe(screenWidth, screenHeight, pipeWidth, screenHeight - pipeHeight - pipeHoleHeight, pipeSpeed);
}

function createPipe(x, y, width, height, speed) {
    const pipe = pipes.create(x, y, 'pipe');
    pipe.setOrigin(0, y === 0 ? 0 : 1);
    pipe.body.allowGravity = false;
    pipe.setVelocityX(speed);
    pipe.setDisplaySize(width, height);
    return pipe;
}

function startGame() {
    gameStarted = true;
    bird.body.allowGravity = true;
    startText.setVisible(false);
    addPipes.call(this);
    pipeTimer = this.time.addEvent({ delay: 1500, callback: addPipes, callbackScope: this, loop: true });
}

function gameOver() {
    pipeTimer.remove();
    pipes.clear(true, true);
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
        highScoreText.setText(`High Score: ${highScore}`);
    }
    resetBird();
    score = 0;
    scoreText.setText(`Score: ${score}`);
    gameStarted = false;
    startText.setVisible(true);
}

function resetBird() {
    bird.setActive(false);
    bird.body.allowGravity = false;
    bird.setY(config.height / 2);
    bird.setVelocity(0, 0);
    bird.setRotation(0);
}