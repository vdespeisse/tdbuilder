class Unit extends MovingObject{
  constructor(x,y,w,h,options={}){
    super(x,y,w,h,options)
    this.path = []
  }
  goTo(tileX,tileY){
    this.path = []
    this.target = this.rect
    this.game.pathfinder.findPath(this.tile.x,this.tile.y,tileX,tileY, (path) => {
      if (!path) return
      this.target = path[0]
      this.path = path
    })
  }
  update(seconds){
    if (this.path.length === 0) return super.update(seconds)

    if (this.tile.x === this.path[0].x && this.tile.y === this.path[0].y) {
      this.path = this.path.slice(1)
      if (this.path.length === 0) return super.update(seconds)
      this.target = this.game.gameMap.findPos(this.path[0].x,this.path[0].y)
    }
    super.update(seconds)
  }
}

// class Enemy extends 
