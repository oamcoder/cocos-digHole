import * as earcut from 'earcut'
import TestDraw from './TestDraw'
import MeshSprite from './MeshSprite'
import {DrawMesh, GPCTrianglePolygon} from './IGPCType'
import {polygonPolygon} from 'intersects'
import {flattenPoints} from './Util'
import ccclass = cc._decorator.ccclass
import property = cc._decorator.property
import PhysicsBound from "./PhysicsBound";

@ccclass
export default class GPCPolygon extends cc.Component {

    @property({
        displayName: '分割行列数'
    })
    protected blockConfig = cc.v2()

    @property({
        displayName: '允许丢弃的最小面积'
    })
    protected minDiscardArea: number = 10

    @property({
        type: MeshSprite
    })
    protected meshSprite: MeshSprite = null

    @property({
        type: PhysicsBound
    })
    protected physicsBound: PhysicsBound = null

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

    get trianglePolygons() {
        const arr: GPCTrianglePolygon[] = []
        for (let polygon of this.polygons) {
            let data: GPCTrianglePolygon = {
                vertices: [],
                triangles: null
            }
            arr.push(data)
            const inner = polygon.getInnerPolies()
            for (let poly of inner) {
                const len = poly.getNumPoints()
                //todo：不知道为啥还会切出一个点的polygon❓
                if (len < 2) continue
                for (let i = 0; i < len; i++) {
                    const xy = poly.get(i)
                    data.vertices.push(xy.x, xy.y)
                }
            }
            data.triangles = earcut(data.vertices)
        }
        return arr
    }

    mergePolygon(points: gpc.ExternalVertex[], draw = true) {
        const checkBoolPolygons: gpc.Polygon[] = []
        const leftoverPolygons: gpc.Polygon[] = []
        const tempArr1: number[] = []
        const tempArr2: number[] = []
        let hole = gpc.Polygon.fromPoints(points)
        flattenPoints(hole, tempArr1)
        //todo:是否考虑用四叉树寻找进行布尔运算的多边形
        for (let polygon of this.polygons) {
            tempArr2.length = 0
            flattenPoints(polygon, tempArr2)
            polygonPolygon(tempArr1, tempArr2) ?
                checkBoolPolygons.push(polygon) : leftoverPolygons.push(polygon)
        }
        this.polygons.length = 0
        // console.log('待进行bool运算的多边形数量', checkBoolPolygons.length)
        if (checkBoolPolygons.length > 0) {
            for (let checkBoolPolygon of checkBoolPolygons) {
                const polygon = checkBoolPolygon.difference(hole)
                //切出空的多边形、面积过小的多边形直接丢弃
                if (polygon.getNumPoints() != 0 && Math.abs(polygon.getArea()) >= this.minDiscardArea)
                    this.polygons.push(polygon)
            }
        }
        this.polygons = this.polygons.concat(leftoverPolygons)
        if (draw)
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
        this.physicsBound.cleanFixtures()
        this.drawTest()
    }

    protected init() {
        this.polygons = []
        const row = Math.floor(this.blockConfig.x)
        const col = Math.floor(this.blockConfig.y)
        const startX = -this.node.width / 2
        const startY = this.node.height / 2
        const w = this.node.width / col
        const h = this.node.height / row
        for (let i = 0; i < row * col; i++) {
            const rowIndex = Math.floor(i / col)
            const colIndex = i % col
            const x = startX + colIndex * w
            const y = startY - rowIndex * h
            this.polygons.push(gpc.Polygon.fromPoints([
                [x, y],
                [x, y - h],
                [x + w, y - h],
                [x + w, y]
            ]))
        }
        const holeNode = this.node.getChildByName('hole')
        if (holeNode) {
            const polygonCtrls = holeNode.getComponentsInChildren(cc.PolygonCollider)
            const temp: gpc.ExternalVertex[] = []
            for (const ctrl of polygonCtrls) {
                for (let point of ctrl.points) {
                    temp.push([point.x + ctrl.offset.x, point.y + ctrl.offset.y])
                }
                this.mergePolygon(temp, false)
                temp.length = 0
            }
            holeNode.destroy()
        }
    }

    /**可视化mesh------------------------------------------------------------*/

    @property({
        type: TestDraw
    })
    private readonly testDraw: TestDraw = null

    set drawTag(tag: DrawMesh) {
        this._drawTag = tag
        this.drawTest()
    }

    private _drawTag: DrawMesh = DrawMesh.None

    private drawTest() {
        if (this._drawTag == DrawMesh.None) {
            this.testDraw.clean()
            return
        }
        this._drawTag == DrawMesh.Triangles ?
            this.drawTriangles() : this.drawPolygons()
    }

    private drawPolygons() {
        this.testDraw.drawPolygons(this.boundPolygons)
    }

    private drawTriangles() {
        this.testDraw.drawTriangles(this.trianglePolygons)
    }
}
