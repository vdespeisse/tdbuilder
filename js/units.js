class Unit extends MovingObject{
  constructor(x,y,w,h,options={}){
    super(x,y,w,h,options)
    this.path = []
  }
  goTo(tile){
    this.path = []
    this.targetPos = this.rect
    this.game.pathfinder.findPath(this.tile.x,this.tile.y,tile.x,tile.y, (path) => {
      if (!path) return
      if (path.length === 0) return
      console.log(path)
      this.targetPos = path[0]
      this.path = path
    })
  }
  update(seconds){
    if (this.path.length === 0) return super.update(seconds)

    if (this.tile.x === this.path[0].x && this.tile.y === this.path[0].y) {
      this.path = this.path.slice(1)
      if (this.path.length === 0) return super.update(seconds)

      this.targetPos = this.game.gameMap.findPos(this.path[0].x,this.path[0].y)
    }
    super.update(seconds)
  }
}

class Enemy extends Unit{
  constructor(x,y,w,h,options={}){
    super(x,y,w,h,options)
    this.behaviorCD = 0.4
    this.timeLastBehaviorCompute = this.behaviorCD
    this.target = (options.target) ? options.target : null
  }
  update(seconds){
    this.timeLastBehaviorCompute += seconds
    if (this.timeLastBehaviorCompute >= this.behaviorCD) this.computeBehavior()

    super.update(seconds)
  }
  computeBehavior(seconds){
    this.timeLastBehaviorCompute = 0.0
    // console.log(this.tile, this._target.tile, this.rect.x)
    if (!this._target) return
    this.goTo(this._target.tile)
  }
  set target(object){
    this._target = object
    this.timeLastBehaviorCompute = this.behaviorCD
  }
  get target(){
    return this._target
  }
}

class Spawner {
  constructor(x,y,unitType = Enemy, options={}){
    this.pos = new createjs.Point(x,y)
    GAME.add(this)
    this.cd = (options.cd) ? options.cd : 2.0
    this.number = (options.number) ? options.number : 20
    this.unitType = unitType
    this.unitOptions = (options.unitOptions) ? options.unitOptions : {w : 1, h :1, tiled : true, color : "red"}
    this.timeSinceSpawn = this.cd
    this.i = 0
  }
  update(seconds){
    if (this.number === 0) return
    this.timeSinceSpawn += seconds
    if (this.timeSinceSpawn >= this.cd){
      this.number -=1
      this.timeSinceSpawn = 0.0
      new this.unitType(this.pos.x,this.pos.y, 0.5, 0.5, this.unitOptions)
    }
  }

}
