class Camera extends createjs.Rectangle {
  constructor(x,y,w,h,game){
    super(x,y,w,h)
    this.game= game
    this.moving = {}
    this.speed = 3
  }
  move(dir){
    this.moving[dir] = true
  }
  stopMove(dir){
    this.moving[dir] = false
  }
  update(){

    if (this.moving.up) this.y = (this.y - this.speed <= 0) ? 0 : this.y - this.speed
    if (this.moving.down) this.y = (this.y + this.speed >= this.game.gameMap.height - this.height) ?
        this.game.gameMap.height - this.height : this.y + this.speed
    if (this.moving.down) this.y += this.speed
    if (this.moving.left) this.x = (this.x - this.speed <= 0) ? 0 : this.x - this.speed
    if (this.moving.right) this.x = (this.x + this.speed >= this.game.gameMap.width - this.width) ?
        this.game.gameMap.width - this.width : this.x + this.speed
  }
}

class Game { // c'est une classe game c'est lengine en gros qui vas gerer toutes les unit objets etc
    constructor() {
        this.stage = null//stage c'est l'écran de jeu en gros
        this.objects = [] // je fais une liste vide dans laquelle je vais metre tous les objets du jeu
        this.ids = 0
    }
    init(w=800,h=600) {
      var canvas = document.createElement('canvas')
      canvas.width = w;
      canvas.height = h;
      document.body.appendChild(canvas)
      this.tileSize = parseInt(w/40)
      this.stage = new createjs.Stage(canvas)
      this.canvas = this.stage.canvas //canvas c'est lobjet html qui contient l'écran de jeu
      this.camera = new Camera(0,0,w,h,this)
      this.pathfinder = new EasyStar.js()
    }
    loadMap(gameMap) {
      this.gameMap = gameMap
      this.pathfinder.setGrid(this.gameMap.navgrid)
      this.pathfinder.setAcceptableTiles([0])
      this.pathfinder.enableDiagonals()
      this.pathfinder.setIterationsPerCalculation(1000) //Not sure if needed
    }
    updateNav(){
      this.pathfinder.setGrid(this.gameMap.navgrid)
    }
    add(object) { // a chaque fois qu'un objet s'initialise il va s'ajouter a l'engine avec cette fonction
        object.id = this.ids
        this.ids += 1
        if (object.sprite) this.stage.addChild(object.sprite)
        this.objects.push(object)
    }
    remove(object) { //ca c'est quand un objet die/disparait tu fait game.remove(objet)
        if (object.sprite) this.stage.removeChild(object.sprite) // ca ca vire l'image du screen(du stage donc)
        this.objects = this.objects.filter(o => o.id !== object.id) // ca ca vire l'objet de la liste d'objets
    }
}
GAME = new Game()

class GameObject {
  constructor(x =0 ,y = 0,w =10,h=10, options={}){
    // x/=2
    // y/=2
    if (options.tiled) {
      x *= GAME.tileSize
      y *= GAME.tileSize
      w *= GAME.tileSize
      h *= GAME.tileSize
    }

    if (options.image) this.sprite = new createjs.Bitmap(images[options.image])
    else { var color = (options.color) ? options.color : "black"
      this.sprite =  new createjs.Shape()
      this.sprite.graphics.beginFill(color).moveTo(x,y).drawRect(0,0,w,h)
    }
    this.game = GAME
    this.game.add(this)
    this.image = options.image
    this.rect = (options.sizeAuto) ? this.sprite.getTransformedBounds() : new createjs.Rectangle(x,y,w,h)
    this.tile = this.game.gameMap.findTile(this.rect.x,this.rect.y)
    this.sprite.x = this.rect.x - this.game.camera.x
    this.sprite.y = this.rect.y - this.game.camera.y

  }
  kill(){
    this.game.remove(this)
  }
  update(seconds){
    // console.log(this.rect.x)
    this.sprite.x = this.rect.x - this.game.camera.x
    this.sprite.y = this.rect.y - this.game.camera.y
  }
}

class MovingObject extends GameObject {
  constructor(x=0,y=0,w=10,h=10,options){
    super(x,y,w,h,options)
    this.speed = (options.speed) ? options.speed : 0
    this._moving = false
    this.targetPos = this.rect
  }
  set targetPos(point){
    this._targetPos = point
    this._vector = normalize([this._targetPos.x-this.rect.x, this._targetPos.y-this.rect.y])
    this._moving = true
  }
  get targetPos() {
    return this._targetPos
  }
  set speed(val) {
      this._speed = val
      this._maxStep = Math.sqrt(Math.pow(val, 2) * 2)
  }
  get speed() {
      return this._speed
  }
  update(seconds){
    if (this._moving) {
      var dist = distance(this._targetPos, this.rect)
      if (dist <= this._maxStep) {
        this._moving = false
        this.rect.x = this._targetPos.x
        this.rect.y = this._targetPos.y
      } else {
      this.rect.x += this._vector.x*this._speed
      this.rect.y += this._vector.y*this._speed
      }
      this.tile = this.game.gameMap.findTile(this.rect.x,this.rect.y)
    }
    super.update(seconds)
  }
}

class Building extends GameObject {
  constructor(tileX,tileY,tileW=4,tileH=4,options={}){
    options.tiled = true
    super(tileX,tileY,tileW,tileH,options)
    this.tileRect = new createjs.Rectangle(tileX,tileY,tileW,tileH)
    this.walkable = (options.walkable) ? options.walkable : 1
    this.game.gameMap.add(this)

  }

}

class Map {
  constructor(w,h, options={}){
    this.grid = Array.apply(null, {length: w}).map(d => Array.apply(null, {length: h}).map(d => 0))
    this.navgrid = Array.apply(null, {length: w}).map(d => Array.apply(null, {length: h}).map(d => 0))
    this.width = w*GAME.tileSize
    this.height = h*GAME.tileSize
    this.tileW = w
    this.tileH = h
    this.drawGrid = options.drawGrid
    this.gridlines = []

  }
  add(object){
    if (!object.tileRect) return console.log("object had no tileRect")
    for (var i = object.tileRect.x; i < object.tileRect.x+object.tileRect.width; i++) {
      for (var j = object.tileRect.y; j < object.tileRect.y+object.tileRect.height; j++) {
        this.grid[i][j] = object
        this.navgrid[j][i] = object.walkable
      }
    }
    GAME.updateNav()
  }
  findTile(mapX,mapY){
    var tileX = Math.floor(mapX/GAME.tileSize)
    var tileY = Math.floor(mapY/GAME.tileSize)
    return new createjs.Point(tileX,tileY)
  }
  findPos(tileX,tileY){
    return new createjs.Point(tileX*GAME.tileSize,tileY*GAME.tileSize)
  }
}
