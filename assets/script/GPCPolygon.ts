import * as earcut from 'earcut'
import TestDraw from './TestDraw'
import MeshSprite from './MeshSprite'
import { GPCTrianglePolygon } from './IGPCType'
import ccclass = cc._decorator.ccclass
import property = cc._decorator.property
import PhysicsBound from './PhysicsBound'

@ccclass
export default class GPCPolygon extends cc.Component {

    @property({
        type: MeshSprite
    })
    protected meshSprite: MeshSprite = null

    @property({
        type: PhysicsBound
    })
    protected physicsBound: PhysicsBound = null

    protected polygons: { bound: gpc.Polygon, hole?: gpc.Polygon }[]

    get boundPolygons() {
        const arr: Array<gpc.Vertex[]> = []
        const convertFn = (poly: gpc.Polygon) => {
            const temp: gpc.Vertex[] = []
            arr.push(temp)
            for (let i = 0; i < poly.getNumPoints(); i++) {
                temp.push(poly.get(i))
            }
        }
        this.polygons.forEach(item => {
            let execPoly = item.bound.difference(item.hole)
            const execArr = execPoly.explode()
            execArr.forEach(poly => {
                poly.getInnerPolies().forEach(convertFn)
            })
        })
        return arr
    }

    get trianglePolygons() {
        const arr: GPCTrianglePolygon[] = []
        this.polygons.forEach(item => {
            let execPoly = item.bound.difference(item.hole)
            const execArr = execPoly.explode()
            execArr.forEach(polygon => {
                let data: GPCTrianglePolygon
                const holes: number[] = []
                for (let subPolygon of polygon.getInnerPolies()) {
                    if (!subPolygon.isHole) {
                        data = {
                            vertices: [],
                            triangles: null
                        }
                        arr.push(data)
                    } else {
                        holes.push(data.vertices.length / 2)
                    }
                    for (let i = 0; i < subPolygon.getNumPoints(); i++) {
                        const xy = subPolygon.get(i)
                        data.vertices.push(xy.x, xy.y)
                    }
                }
                data.triangles = earcut(data.vertices, holes)
            })
        })
        return arr
    }

    mergePolygon(points: gpc.ExternalVertex[]) {
        let newPolygon = gpc.Polygon.fromPoints(points)
        this.polygons.forEach((item, index) => {
            this.polygons[index].hole = item.hole.union(newPolygon)
        })
        this.draw()
    }

    protected onLoad() {
        this.init()
    }

    protected start() {
        this.draw()
    }

    protected draw() {
        this.meshSprite.stroke(this.trianglePolygons)
        this.physicsBound.createPolygonRigidbody(this.boundPolygons)
        // this.drawTest()
    }

    protected init() {
        const addVerticesFromRect = (node: cc.Node, arr: gpc.ExternalVertex[]) => {
            const w2 = node.width / 2
            const h2 = node.height / 2
            if (w2 == 0 && h2 == 0) throw new Error(`没有cc.PolygonCollider，矩形边不能为0  name:${node.name}`)
            arr.push(
                [w2, h2],
                [-w2, h2],
                [-w2, -h2],
                [w2, -h2],
            )
        }
        this.polygons = []
        const bounds = this.node.children
        if (bounds.length == 0) {
            const arr = []
            addVerticesFromRect(this.node, arr)
            this.polygons.push({ bound: gpc.Polygon.fromPoints(arr) })
        } else {
            const addVerticesFromCtrl = (ctrl: cc.PolygonCollider, arr: gpc.ExternalVertex[], remove: boolean) => {
                ctrl.points.forEach(p => {
                    arr.push([p.x + ctrl.offset.x, p.y + ctrl.offset.y])
                })
                if (remove)
                    ctrl.node.destroy()
            }
            bounds.forEach(node => {
                const bound: gpc.ExternalVertex[] = []
                const holes: Array<gpc.ExternalVertex[]> = []
                const bCtrl = node.getComponent(cc.PolygonCollider)
                if (!bCtrl)
                    addVerticesFromRect(node, bound)
                else
                    addVerticesFromCtrl(bCtrl, bound, false)
                if (node.childrenCount == 1) {
                    const holeNode = node.children[0]
                    const ctrls = holeNode.getComponents(cc.PolygonCollider)
                    if (ctrls.length == 0) {
                        const arr = []
                        addVerticesFromRect(holeNode, arr)
                        holes.push(arr)
                    } else {
                        ctrls.forEach(ctrl => {
                            const arr: gpc.ExternalVertex[] = []
                            holes.push(arr)
                            addVerticesFromCtrl(ctrl, arr, true)
                        })
                    }
                }
                let boundPoly = gpc.Polygon.fromPoints(bound)
                let holePoly: gpc.Polygon
                holes.forEach(hole => {
                    const poly = gpc.Polygon.fromPoints(hole)
                    if (!holePoly)
                        holePoly = poly
                    else
                        holePoly = holePoly.union(poly)
                })
                this.polygons.push({ bound: boundPoly, hole: holePoly })
            })
        }
        // console.log('this.polygons = ', this.polygons)
    }

    /**可视化mesh------------------------------------------------------------*/

    @property({
        type: TestDraw
    })
    private readonly testDraw: TestDraw = null

    private drawTag: boolean

    private drawTest() {
        this.drawTag ? this.drawTriangles() : this.drawPolygons()
    }

    private drawPolygons() {
        if (this.drawTag)
            this.drawTag = false
        this.testDraw.drawPolygons(this.boundPolygons)
    }

    private drawTriangles() {
        if (!this.drawTag)
            this.drawTag = true
        this.testDraw.drawTriangles(this.trianglePolygons)
    }
}
