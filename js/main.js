var loader = new createjs.LoadQueue();
loader.on("fileload", handleFileLoad);
loader.on("complete", handleComplete);

loader.loadManifest([{
    id: "bunny",
    src: "./assets/bunny.png"
}, {
    id: "bullet",
    src: "./assets/bullet_black.png"
}])

loader.load()
var images = {}

function handleFileLoad(o) {
    if (o.item.type === "image") {
        images[o.item.id] = o.result
    }
}

function handleComplete(ev) {
    init()
}

function init() {
    GAME.init()
    var testMap = new Map(100, 100, {
        drawGrid: true
    })
    console.log(testMap)
    GAME.loadMap(testMap)
    testBuilding = new Building(2, 2, 4, 4)
    hm = new Building(6, 2, 4, 0.25)
    dude = new Unit(0,0,10,10,{speed : 5})
    // dude.target = new createjs.Point(1000,700)
        // what = new GameObject(0,0,20,20,{color:'blue'})
        // thefuck = new GameObject(20,20,40,40)
        // srsly = new GameObject(40,40,20,20,{color:'green'})
    GAME.stage.on("stagemousedown", handleMouseDown)
    document.onkeydown = handleKeyDown
    document.onkeyup = handleKeyUp // j'aurais pu mettre stage.on("onkeydown", handleKeyDown) la c une ptite diff te prend pas la tete avec
    document.addEventListener("contextmenu", function(e){
      e.preventDefault();
    }, false);

    createjs.Ticker.framerate = 60; //le ticker c un truc qui va tick a chaue frame donc comme j'ai set fps a 60 tout les 1/60 secondes il va tick
    createjs.Ticker.addEventListener("tick", tickHandler); //la fonction a execute a chaque tick
    init = true

    function tickHandler(e) {

        // Log stuff
        if (!init) GAME.stage.removeChild(text)
        text = new createjs.Text("x:" + GAME.camera.x + " y:" + GAME.camera.y, "14px Arial", "red");
        text.x = 10;
        text.y = 20;
        text.textBaseline = "alphabetic";
        GAME.stage.addChild(text)
        init = false

        if (GAME.gameMap.drawGrid) {
            GAME.gameMap.gridlines.map(line => GAME.stage.removeChild(line))
            GAME.gameMap.gridlines = []
            for (var i = 0; i < GAME.gameMap.tileW; i++) {
                var line = new createjs.Shape()
                line.graphics
                    .setStrokeStyle(0.5)
                    .beginStroke("grey")
                    .beginFill("grey")
                    .moveTo(i * GAME.tileSize - GAME.camera.x, 0)
                    .lineTo(i * GAME.tileSize - GAME.camera.x, GAME.gameMap.tileH * GAME.tileSize)
                GAME.gameMap.gridlines.push(line)
                GAME.stage.addChild(line)
            }
            for (var i = 0; i < GAME.gameMap.tileH; i++) {
                var line = new createjs.Shape()
                line.graphics
                    .setStrokeStyle(0.5)
                    .beginStroke("grey")
                    .beginFill("grey")
                    .moveTo(0, i * GAME.tileSize - GAME.camera.y)
                    .lineTo(GAME.gameMap.tileW * GAME.tileSize, i * GAME.tileSize - GAME.camera.y)
                GAME.gameMap.gridlines.push(line)
                GAME.stage.addChild(line)
            }
        }
        //
        seconds = e.delta / 1000.0
        GAME.objects.map(o => o.update(seconds)) // il parcourt tous les objets du jeu et les update
        GAME.camera.update()
        GAME.stage.update(); //il refresh l'image affichée sur le stage si tu fais pas ca les images vont pas bouger
        GAME.pathfinder.calculate()
    }

    function handleKeyUp(key) { // et donc la ca dit au player de stop move dans la direction de la key quand la keyUp quand ta'rrete d'appuyer dessus
        if (key.code === "ArrowUp") {
            GAME.camera.stopMove("up")
        }
        if (key.code === "ArrowDown") {
            GAME.camera.stopMove("down")
            return
        }
        if (key.code === "ArrowLeft") {
            GAME.camera.stopMove("left")
            return
        }
        if (key.code === "ArrowRight") {
            GAME.camera.stopMove("right")
            return
        }
    }

    function handleKeyDown(key) {

        // et donc la ca dit au player de stop move dans la direction de la key quand la keyUp quand ta'rrete d'appuyer dessus
        if (key.code === "ArrowUp") { // selon la key press ca dit au player de move dans cette direction tant que la key est press
            GAME.camera.move("up")
            return
        }
        if (key.code === "ArrowDown") {
            GAME.camera.move("down")
            return
        }
        if (key.code === "ArrowLeft") {
            GAME.camera.move("left")
            return
        }
        if (key.code === "ArrowRight") {
            GAME.camera.move("right")
            return
        }
    }
    var pathObjects = []
    function handleMouseDown(mouseEvent) {


        var mapX = mouseEvent.stageX +GAME.camera.x
        var mapY = mouseEvent.stageY +GAME.camera.y
        // new GameObject(mouseEvent.stageX+GAME.camera.x,mouseEvent.stageY+GAME.camera.y,20,20,{color : "red"})
        dest = GAME.gameMap.findTile(mapX,mapY)
        if (mouseEvent.nativeEvent.button === 2){

        pathObjects.map(o => o.kill())
        pathObjects = []
        dude.goTo(dest.x,dest.y)
        // GAME.pathfinder.findPath(0, 0, dest.x, dest.y, (path) => {
        //     if (!path) return
        //     window.p = path
        //     path.map(d => pathObjects.push(square =new GameObject(d.x, d.y, 1, 1, {tiled: true,color: "green"})))
        //   })
        }
        if (mouseEvent.nativeEvent.button === 0){
          new Building(dest.x,dest.y,1,1)
        }



    }
}
