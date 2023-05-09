import {isPolygonIntersectCircle} from "./Util";
import * as PolygonClipping from "polygon-clipping";

const {ccclass, property} = cc._decorator;

const PTM_RATIO = cc.PhysicsManager.PTM_RATIO

@ccclass
export default class PhysicsBound extends cc.Component {

    @property({
        displayName: '物理更新间隔时间',
        tooltip: '数字越大时间间隔越短'
    })
    protected FIXED_TIME_STEP: number = 30

    @property({
        displayName: '速度更新迭代数'
    })
    protected VELOCITY_ITERATIONS: number = 5

    @property({
        displayName: '位置迭代更新数'
    })
    protected POSITION_ITERATIONS: number = 5

    protected world: b2.World
    protected body: b2.Body
    protected vec2Pool: cc.Vec2[] = []
    protected chainShapePool: b2.ChainShape[] = []
    protected chainFixtures: b2.Fixture[] = []
    protected tempVertex: PolygonClipping.Pair = [0, 0]

    cleanFixtures() {
        for (let fixture of this.chainFixtures) {
            this.body.DestroyFixture(fixture)
        }
        this.chainFixtures.length = 0
    }

    createPolygonRigidBody(polygons: PolygonClipping.Ring[], dynamicBody: cc.Node[]) {
        const candidatePolygons = new Array<PolygonClipping.Ring>()
        for (let body of dynamicBody) {
            const x = body.x
            const y = body.y
            const r = Math.max(body.height / 2, body.width / 2)
            this.tempVertex[0] = x
            this.tempVertex[1] = y
            for (const polygon of polygons) {
                const isEmpty = !candidatePolygons.find(poly => poly == polygon)
                const isIntersect = isPolygonIntersectCircle(polygon, this.tempVertex, r)
                if (isEmpty && isIntersect)
                    candidatePolygons.push(polygon)
            }
        }
        // console.log('查看需要生成物理边界的数量:', candidatePolygons.length)
        if (candidatePolygons.length == 0)
            return
        this.cleanFixtures()
        for (let i = 0; i < candidatePolygons.length; i++) {
            const candidatePolygon = candidatePolygons[i]
            let shape = this.chainShapePool[i]
            if (!shape) {
                shape = new b2.ChainShape
                this.chainShapePool.push(shape)
            }
            const chainPoints: cc.Vec2[] = []
            for (let j = 0; j < candidatePolygon.length; j++) {
                let p = candidatePolygon[j]
                let v2 = this.vec2Pool.pop()
                if (!v2)
                    v2 = cc.v2()
                v2.x = p[0]
                v2.y = p[1]
                this.node.convertToWorldSpaceAR(v2, v2)
                v2.x /= PTM_RATIO
                v2.y /= PTM_RATIO
                chainPoints.push(v2)
            }
            shape.CreateLoop(chainPoints)
            for (let chainPoint of chainPoints) {
                this.vec2Pool.push(chainPoint)
            }
            this.chainFixtures.push(this.body.CreateFixtureShapeDensity(shape, 0))
        }
    }

    protected onLoad(): void {
        const phyMgr = cc.director.getPhysicsManager()
        phyMgr.enabled = true
        // phyMgr.enabledAccumulator = true
        // cc.PhysicsManager.FIXED_TIME_STEP = 1 / this.FIXED_TIME_STEP
        // cc.PhysicsManager.VELOCITY_ITERATIONS = this.VELOCITY_ITERATIONS
        // cc.PhysicsManager.POSITION_ITERATIONS = this.POSITION_ITERATIONS
        //@ts-ignore
        this.world = phyMgr._world
        this.body = this.world.CreateBody(new b2.BodyDef())
    }
}
