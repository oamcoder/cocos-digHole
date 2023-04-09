import * as Quadtree from './lib/quadtree'
import PhysicsObject from './PhysicsObject'
import GPCPolygon from './GPCPolygon'

const {ccclass, property} = cc._decorator

const PTM_RATIO = cc.PhysicsManager.PTM_RATIO

@ccclass
export class PhysicsMgr extends cc.Component {

    @property({
        type: GPCPolygon
    })
    protected gpcPolygon: GPCPolygon = null

    protected world: b2.World
    protected body: b2.Body
    protected chainShapePool: b2.ChainShape[] = []
    protected fixtures: b2.Fixture[] = []
    protected quadTree: Quadtree
    protected vec2Pool: cc.Vec2[] = []
    protected chainPoints: cc.Vec2[] = []

    protected update(dt: number) {
        this.createPolygonRigidbody(this.gpcPolygon.boundPolygons, true)
    }

    createPolygonRigidbody(polygons: gpc.Vertex[][], checkSpeed = false) {
        this.quadTree.clear()
        const physicsObjects = this.node.getComponentsInChildren(PhysicsObject)
        const candidatePolygons: gpc.Vertex[][] = []
        for (let physicsObject of physicsObjects) {
            if (checkSpeed && physicsObject.linearSpeed == 0) continue
            const {x, y} = physicsObject.node.getPosition()
            for (let polygon of polygons) {
                const temp = []
                for (const vertex of polygon) {
                    if (Math.pow(vertex.x - x, 2) + Math.pow(vertex.y - y, 2) <= physicsObject.radius * physicsObject.radius) {
                        temp.push(vertex)
                    }
                }
                if (temp.length >= 2) {
                    candidatePolygons.push(temp)
                }
            }
        }
        //剔除相同的线段


        if (candidatePolygons.length == 0) return

        for (let fixture of this.fixtures) {
            this.body.DestroyFixture(fixture)
        }
        this.fixtures.length = 0

        let v2Index = 0
        for (let i = 0; i < candidatePolygons.length; i++) {
            const polygon = candidatePolygons[i]
            let shape = this.chainShapePool[i]
            if (!shape) {
                shape = new b2.ChainShape
                this.chainShapePool.push(shape)
            }
            this.chainPoints.length = 0
            for (let j = 0; j < polygon.length; j++) {
                const p = polygon[j] as cc.Vec2
                let vec2 = this.vec2Pool[v2Index]
                if (!vec2) {
                    vec2 = cc.v2()
                    this.vec2Pool.push(vec2)
                    v2Index += 2
                } else {
                    v2Index++
                }
                vec2.set(p)
                this.node.convertToWorldSpaceAR(vec2, vec2)
                vec2.x /= PTM_RATIO
                vec2.y /= PTM_RATIO
                this.chainPoints.push(vec2)
            }
            shape.CreateChain(this.chainPoints)
            this.fixtures.push(this.body.CreateFixtureShapeDensity(shape, 0))
        }
    }

    protected onLoad(): void {
        const phyMgr = cc.director.getPhysicsManager()
        phyMgr.enabled = true
        phyMgr.debugDrawFlags = cc.PhysicsManager.DrawBits.e_aabbBit |
            cc.PhysicsManager.DrawBits.e_jointBit |
            cc.PhysicsManager.DrawBits.e_shapeBit
        //@ts-ignore
        this.world = phyMgr._world
        this.body = this.world.CreateBody(new b2.BodyDef())
        this.quadTree = new Quadtree({
            x: this.node.width / 2,
            y: this.node.height / 2,
            width: this.node.width,
            height: this.node.height
        })
    }

    static pointToSegDist(x: number, y: number, x1: number, y1: number, x2: number, y2: number) {
        const cross = (x2 - x1) * (x - x1) + (y2 - y1) * (y - y1)
        if (cross <= 0) return Math.sqrt((x - x1) * (x - x1) + (y - y1) * (y - y1))
        const d2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)
        if (cross >= d2) return Math.sqrt((x - x2) * (x - x2) + (y - y2) * (y - y2))
        const r = cross / d2
        const px = x1 + (x2 - x1) * r
        const py = y1 + (y2 - y1) * r
        return Math.sqrt((x - px) * (x - px) + (py - y) * (py - y))
    }
}
