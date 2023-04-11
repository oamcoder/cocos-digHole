import GPCPolygon from './GPCPolygon'
import PhysicsBound from './PhysicsBound'

const {ccclass, property} = cc._decorator;

@ccclass
export default class Touch extends cc.Component {

    @property({
        displayName: '圆边数量'
    })
    protected circleCount = 12

    @property({
        displayName: '圆半径'
    })
    protected circleRadius = 40

    @property({
        displayName: '最短移动距离'
    })
    protected minMoveDis = 20

    @property({
        type: GPCPolygon
    })
    protected gpcPolygon: GPCPolygon = null

    @property({
        type: PhysicsBound
    })
    protected physicsBound: PhysicsBound = null

    protected readonly lastTouchPos = cc.v2()
    protected readonly curTouchPos = cc.v2()
    protected readonly dir = cc.v2()
    private readonly tempVec2 = cc.v2()

    protected onLoad(): void {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this)
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this)
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this)
    }

    protected onDisable(): void {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this)
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this)
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this)
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this)
    }

    protected onTouchStart(evt: cc.Event.EventTouch) {
        const location = evt.getLocation()
        this.lastTouchPos.set(location)
        this.createClickPolygon(location)
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this)
    }

    protected onTouchMove(evt: cc.Event.EventTouch) {
        const location = evt.getLocation()
        if (cc.Vec2.distance(location, this.lastTouchPos) < this.minMoveDis) return
        this.createMovePolygon(location)
        this.lastTouchPos.set(location)
    }

    protected onTouchEnd(evt: cc.Event.EventTouch) {
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this)
    }

    protected createClickPolygon(touchPos: cc.Vec2) {
        this.node.convertToNodeSpaceAR(touchPos, this.curTouchPos)
        const polygon: gpc.ExternalVertex[] = []
        for (let i = 0; i < this.circleCount; i++) {
            const r = 2 * Math.PI * i / this.circleCount
            const x = this.curTouchPos.x + this.circleRadius * Math.cos(r)
            const y = this.curTouchPos.y + this.circleRadius * Math.sin(r)
            polygon.push([x, y])
        }
        this.gpcPolygon.mergePolygon(polygon)
    }

    protected createMovePolygon(touchPos: cc.Vec2) {
        this.node.convertToNodeSpaceAR(touchPos, this.curTouchPos)
        this.node.convertToNodeSpaceAR(this.lastTouchPos, this.lastTouchPos)
        this.curTouchPos.sub(this.lastTouchPos, this.dir)
        const polygon: gpc.ExternalVertex[] = []
        for (let index = 0; index < this.circleCount; index++) {
            const r = 2 * Math.PI * index / this.circleCount
            this.tempVec2.x = this.circleRadius * Math.cos(r)
            this.tempVec2.y = this.circleRadius * Math.sin(r)
            const dot = this.dir.dot(this.tempVec2)
            const arr = []
            if (dot > 0) {
                arr.push(this.curTouchPos.x + this.tempVec2.x, this.curTouchPos.y + this.tempVec2.y)
            } else if (dot < 0) {
                arr.push(this.lastTouchPos.x + this.tempVec2.x, this.lastTouchPos.y + this.tempVec2.y)
            } else {
                arr.push(this.curTouchPos.x + this.tempVec2.x, this.curTouchPos.y + this.tempVec2.y)
                arr.push(this.lastTouchPos.x + this.tempVec2.x, this.lastTouchPos.y + this.tempVec2.y)
            }
            polygon.push(arr as gpc.ExternalVertex)
        }
        this.gpcPolygon.mergePolygon(polygon)
    }
}
