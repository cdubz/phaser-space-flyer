var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game-canvas',
    { preload: preload, create: create, update: update, render: render });

function preload() {
    // Load up the assets we will use for this game
    game.load.image('space', 'assets/starfield.png');
    game.load.image('ship', 'assets/ship.png');
    game.load.image('bullet-laser', 'assets/bullet-laser.png');
}

var ship;
var bullets;

var fireRate = 100;
var nextFire = 0;

function create() {
    // Adjust world bound
    game.world.setBounds(-1000, -1000, 2000, 2000);

    // Start arcade physics and add in the background
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.add.tileSprite(-1000, -1000, 2000, 2000, 'space');

    // Set up bullets
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;

    bullets.createMultiple(50, 'bullet-laser');
    bullets.setAll('checkWorldBounds', true);
    bullets.setAll('outOfBoundsKill', true);

    // Set up ship
    ship = game.add.sprite(350, 275, 'ship');
    //ship.fixedToCamera = true;
    ship.anchor.setTo(0.5, 0.5);
    game.physics.arcade.enable(ship);
    ship.body.collideWorldBounds = true;

    // Ship ship properties for acceleration
    ship.body.maxAngular = 100;
    ship.body.angularDrag = 100;
    ship.body.drag = 500;

    // Tell camera to follow the player's ship
    game.camera.follow(ship);

    // Initiate controls
    cursors = game.input.keyboard.createCursorKeys();
    fire = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    fire.onDown.add(fireWeapon, this);
}

function update() {
    // Reset ship movement
    ship.body.velocity.x *= 0.9;
    ship.body.velocity.y *= 0.9;
    ship.body.angularAcceleration = 0;

    if (cursors.left.isDown) {
        ship.body.angularAcceleration -= 200;
    }
    else if (cursors.right.isDown) {
        ship.body.angularAcceleration += 200;
    }
    if (cursors.up.isDown) {
        game.physics.arcade.velocityFromAngle(ship.angle - 90, 300, ship.body.velocity)
    }
}

function render() {
    /*game.debug.cameraInfo(game.camera, 32, 220);
    game.debug.spriteInfo(ship, 32, 32);
    game.debug.text('angularVelocity: ' + ship.body.angularVelocity, 32, 120);
    game.debug.text('angularAcceleration: ' + ship.body.angularAcceleration, 32, 140);
    game.debug.text('angularDrag: ' + ship.body.angularDrag, 32, 160);
    game.debug.text('deltaZ: ' + ship.body.deltaZ(), 32, 180);
    game.debug.text('velocity: (x = ' + ship.body.velocity.x +
        ', y = ' + ship.body.velocity.y + ')', 32, 200);
    game.debug.text('Active Bullets: ' + bullets.countLiving() +
        ' / ' + bullets.total, 32, 300);*/
}

function fireWeapon() {
    if (game.time.now > nextFire && bullets.countDead() > 0) {
        nextFire = game.time.now + fireRate;

        var bullet = bullets.getFirstDead();
        bullet.reset(ship.x, ship.y - 10);

        bullet.angle = ship.angle;
        game.physics.arcade.velocityFromAngle(bullet.angle - 90, 500,
            bullet.body.velocity)
    }
}