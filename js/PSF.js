var PSF = {

    // Main config elements
    debugMode: false,
    fireRate: 100,
    nextFire: 0,

    preload: function() {
        // Load up the assets we will use for this game
        this.game.load.image('space', 'assets/starfield.png');
        this.game.load.image('ship', 'assets/ship.png');
        this.game.load.image('bullet-laser', 'assets/bullet-laser.png');
        this.game.load.image('fs-button', 'assets/fs-button.png');
        this.game.load.image('crosshair', 'assets/crosshair.png');

        // Load plugins
        this.game.kineticScrolling = this.game.plugins.add(Phaser.Plugin.KineticScrolling);
    },

    create: function() {
        // Start and config Kinetic Scrolling for camera movement
        this.game.kineticScrolling.start();
        this.game.kineticScrolling.configure({
            kineticMovement: true,
            horizontalScroll: true,
            verticalScroll: true,
            horizontalWheel: false
        });

        // Adjust world bound
        game.world.setBounds(0, 0, 5000, 5000);

        // Center the camera
        this.game.camera.x = this.game.world.bounds.halfWidth - this.game.camera.width / 2;
        this.game.camera.y = this.game.world.bounds.halfHeight - this.game.camera.height / 2;

        // Start arcade physics and add in the background
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.game.add.tileSprite(0, 0, 5000, 5000, 'space');

        // Set up ScaleManager options for full screen support
        this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
        fullscreenButton = this.game.add.button(5, 5,
            'fs-button', this.toggleFullscreen, this);
        fullscreenButton.fixedToCamera = true;

        // Set up bullets
        bullets = this.game.add.group();
        bullets.enableBody = true;
        bullets.physicsBodyType = Phaser.Physics.ARCADE;

        bullets.createMultiple(50, 'bullet-laser');
        bullets.setAll('checkWorldBounds', true);
        bullets.setAll('outOfBoundsKill', true);

        // Set up ship
        ship = this.game.add.sprite(this.game.world.bounds.halfWidth,
            this.game.world.bounds.halfHeight, 'ship');
        ship.anchor.setTo(0.5, 0.5);
        this.game.physics.arcade.enable(ship);
        ship.body.collideWorldBounds = true;

        // Ship ship properties for acceleration
        ship.body.maxAngular = 100;
        ship.body.angularDrag = 100;
        ship.body.drag = 500;

        // Initiate controls
        fire = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        fire.onDown.add(this.fireWeapon, this);
        this.game.input.onTap.add(this.moveOnDoubleTap, this);
    },

    // This second parameter is not well documented, but it's there and uses
    // game.input.doubleTapeRate to judge.
    // @see https://github.com/photonstorm/phaser/blob/486c15f16fd7c2f154d55cb0239fa0dbdeaed1f8/src/input/Pointer.js#L930
    moveOnDoubleTap: function(pointer, doubleTap) {
        if (doubleTap) {

            // Destory any existing crosshair
            if (this.movementTarget && this.movementTarget.alive) {
                this.movementTarget.destroy();
            }

            // Create new crosshair
            this.movementTarget = this.game.add.sprite(pointer.worldX,
              pointer.worldY, 'crosshair');
            game.physics.arcade.enable(this.movementTarget);

            // Turn ship towards crosshair
            ship.rotation = this.game.physics.arcade.angleToPointer(ship, pointer) + Math.PI / 2;;

            // Initiate ship movement
            this.game.physics.arcade.moveToPointer(ship, 100);
        }
    },

    update: function() {
        // Check for a movementTarget and update when the ship arrives
        if (this.movementTarget && this.movementTarget.alive) {

          // Stop ship on overlap
          if (game.physics.arcade.overlap(ship, this.movementTarget)) {
              ship.body.velocity.x = 0;
              ship.body.velocity.y = 0;
              this.movementTarget.destroy();
          }
        }
    },

    render: function() {
        if (this.debugMode == true) {
            game.debug.cameraInfo(game.camera, 32, 220);
            game.debug.spriteInfo(ship, 32, 32);
            game.debug.text('angularVelocity: ' + ship.body.angularVelocity, 32, 120);
            game.debug.text('angularAcceleration: ' + ship.body.angularAcceleration, 32, 140);
            game.debug.text('angularDrag: ' + ship.body.angularDrag, 32, 160);
            game.debug.text('deltaZ: ' + ship.body.deltaZ(), 32, 180);
            game.debug.text('velocity: (x = ' + ship.body.velocity.x +
              ', y = ' + ship.body.velocity.y + ')', 32, 200);
            game.debug.text('Active Bullets: ' + bullets.countLiving() +
              ' / ' + bullets.total, 32, 300);
        }
    },

    toggleFullscreen: function() {
        if (game.scale.isFullScreen) {
            game.scale.stopFullScreen();
        }
        else {
            game.scale.startFullScreen(false);
        }
    },

    fireWeapon: function() {
        if (game.time.now > this.nextFire && bullets.countDead() > 0) {
            this.nextFire = game.time.now + this.fireRate;

            var bullet = bullets.getFirstDead();
            bullet.reset(ship.x, ship.y - 10);

            bullet.angle = ship.angle;
            game.physics.arcade.velocityFromAngle(bullet.angle - 90, 500,
                bullet.body.velocity)
        }
    }
};

var game = new Phaser.Game(window.innerWidth * window.devicePixelRatio,
    window.innerHeight * window.devicePixelRatio, Phaser.AUTO, 'game-canvas');
game.state.add('PSF', PSF);
game.state.start('PSF');