import * as earcut from 'earcut'
import TestDraw from './TestDraw'
import MeshSprite from './MeshSprite'
import {polygonPolygon} from 'intersects'
import ccclass = cc._decorator.ccclass
import property = cc._decorator.property

@ccclass
export default class GPCPolygon extends cc.Component {

    @property({
        type: MeshSprite
    })
    protected meshSprite: MeshSprite = null

    protected polygons: gpc.Polygon[]

    get boundPolygons() {
        const arr: Array<gpc.Vertex[]> = []
        for (let polygon of this.polygons) {
            const temp: gpc.Vertex[] = []
            arr.push(temp)
            for (let i = 0; i < polygon.getNumPoints(); i++) {
                temp.push(polygon.get(i))
            }
        }
        return arr
    }

    mergePolygon(points: gpc.ExternalVertex[]) {
        if (points.length == 0) return
        let newPolygon = gpc.Polygon.fromPoints(points)
        const tempPolygons: gpc.Polygon[] = []
        const intersectArr: gpc.Polygon[] = []
        const checkArr1: number[] = []
        for (let point of points) {
            checkArr1.push(point[0], point[1])
        }
        const checkArr2: number[] = []
        for (let i = 0; i < this.polygons.length; i++) {
            let polygon = this.polygons[i]
            checkArr2.length = 0
            for (let j = 0; j < polygon.getNumPoints(); j++) {
                const point = polygon.get(j)
                checkArr2.push(point.x, point.y)
            }
            if (polygonPolygon(checkArr1, checkArr2)) {
                intersectArr.push(polygon)
            } else {
                tempPolygons.push(polygon)
            }
        }
        if (checkArr2.length == 0) return
        this.polygons = tempPolygons
        for (let polygon of intersectArr) {
            polygon = polygon.difference(newPolygon)
            const explodes = polygon.explode()
            this.splitTriangles(explodes)
        }
        this.draw()
    }

    protected onLoad() {
        this.init()
    }

    protected start() {
        this.draw()
    }

    protected draw() {
        this.meshSprite.stroke(this.boundPolygons)
        this.node.parent.getComponentInChildren('PhysicsMgr').createPolygonRigidbody(this.boundPolygons)
        this.drawTest()
    }

    protected init() {
        const addVerticesFromCtrl = (ctrl: cc.PolygonCollider, arr: gpc.ExternalVertex[]) => {
            for (let p of ctrl.points) {
                arr.push([p.x + ctrl.offset.x, p.y + ctrl.offset.y])
            }
            ctrl.destroy()
        }
        this.polygons = []
        //边
        const bound: gpc.ExternalVertex[] = []
        addVerticesFromCtrl(this.node.getComponent(cc.PolygonCollider), bound)
        const boundPoly = gpc.Polygon.fromPoints(bound)
        //洞
        let holePoly: gpc.Polygon
        const holeNode = this.node.children[0]
        if (holeNode) {
            const ctrls = holeNode.getComponents(cc.PolygonCollider)
            for (let ctrl of ctrls) {
                const arr: gpc.ExternalVertex[] = []
                addVerticesFromCtrl(ctrl, arr)
                const poly = gpc.Polygon.holeFromPoints(arr)
                if (!holePoly)
                    holePoly = poly
                else
                    holePoly = holePoly.union(poly)
            }
        }
        //计算，生成新的多边形
        const explodes = holePoly ? boundPoly.difference(holePoly).explode() : boundPoly.explode()
        //三角化
        this.splitTriangles(explodes)
        // console.log('this.polygons = ', this.polygons)
    }

    private tempVertices: number[] = []
    private tempHoleIndices: number[] = []
    private tempPoints: gpc.ExternalVertex[] = []

    private splitTriangles(explodes: gpc.Polygon[]) {
        this.tempHoleIndices.length = 0
        for (const explode of explodes) {
            this.tempVertices.length = 0
            const innerPoly = explode.getInnerPolies()
            for (const polygon of innerPoly) {
                const len = polygon.getNumPoints()
                if (polygon.isHole)
                    this.tempHoleIndices.push(this.tempVertices.length / 2)
                for (let i = 0; i < len; i++) {
                    const xy = polygon.get(i)
                    this.tempVertices.push(xy.x, xy.y)
                }
            }
            const triangleIndices = earcut(this.tempVertices, this.tempHoleIndices)
            for (const index of triangleIndices) {
                this.tempPoints.push([this.tempVertices[index * 2], this.tempVertices[index * 2 + 1]])
                if (this.tempPoints.length == 3) {
                    this.polygons.push(gpc.Polygon.fromPoints(this.tempPoints))
                    this.tempPoints.length = 0
                }
            }
        }
    }

    /**可视化mesh------------------------------------------------------------*/

    @property({
        type: TestDraw
    })
    private readonly testDraw: TestDraw = null

    private drawTest() {
        this.testDraw.drawPolygons(this.boundPolygons)
    }
}