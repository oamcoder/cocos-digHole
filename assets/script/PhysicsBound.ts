import {circlePolygon} from "intersects";
import {flattenPoints} from "./Util";

const {ccclass, property} = cc._decorator;

const PTM_RATIO = cc.PhysicsManager.PTM_RATIO

@ccclass
export default class PhysicsBound extends cc.Component {

    protected world: b2.World
    protected body: b2.Body
    protected vec2Pool: cc.Vec2[] = []
    protected chainShapePool: b2.ChainShape[] = []
    protected chainFixtures: b2.Fixture[] = []

    cleanFixtures() {
        for (let fixture of this.chainFixtures) {
            this.body.DestroyFixture(fixture)
        }
        this.chainFixtures.length = 0
    }

    createPolygonRigidBody(polygons: gpc.Vertex[][], dynamicBody: cc.Node[]) {
        //todo:考虑是否使用四叉树查找
        const temp: number[] = []
        const candidatePolygons = new Array<gpc.Vertex[]>()
        for (let body of dynamicBody) {
            const x = body.x
            const y = body.y
            const r = Math.max(body.height / 2, body.width / 2)
            for (const polygon of polygons) {
                flattenPoints(polygon, temp)
                if (!candidatePolygons.find(poly => poly == polygon) && circlePolygon(x, y, r, temp)) {
                    candidatePolygons.push(polygon)
                }
                temp.length = 0
            }
        }
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
                v2.set(p as cc.Vec2)
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
        //@ts-ignore
        this.world = phyMgr._world
        this.body = this.world.CreateBody(new b2.BodyDef())
    }
}
