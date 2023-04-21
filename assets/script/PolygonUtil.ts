import * as earcut from 'earcut'
import * as polygonClipping from "polygon-clipping";
import TestDraw from './TestDraw'
import MeshSprite from './MeshSprite'
import {DrawMesh, TrianglePolygon} from './IGPCType'
import {polygonPolygon} from 'intersects'
import {flattenPoints} from './Util'
import PhysicsBound from "./PhysicsBound";
import ccclass = cc._decorator.ccclass;
import property = cc._decorator.property;

@ccclass
export default class PolygonUtil extends cc.Component {

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

    protected polygons: polygonClipping.MultiPolygon

    get boundPolygons() {
        const arr: polygonClipping.Ring[] = []
        for (let polygon of this.polygons) {
            for (let ring of polygon) {
                arr.push(ring)
            }
        }
        return arr
    }

    get trianglePolygons() {
        const arr: TrianglePolygon[] = []
        for (let polygon of this.polygons) {
            let data: TrianglePolygon = {
                vertices: [],
                triangles: null
            }
            arr.push(data)
            for (let ring of polygon) {
                for (const point of ring) {
                    data.vertices.push(point[0], point[1])
                }
            }
            data.triangles = earcut(data.vertices)
        }
        return arr
    }

    mergePolygon(hole: polygonClipping.Ring) {
        const checkBoolPolygons: polygonClipping.MultiPolygon = []
        const leftoverPolygons: polygonClipping.MultiPolygon = []
        const tempArr1: number[] = []
        const tempArr2: number[] = []
        flattenPoints(hole, tempArr1)
        //todo:是否考虑用四叉树寻找进行布尔运算的多边形
        for (let polygon of this.polygons) {
            const subjectPolygon = polygon[0]
            tempArr2.length = 0
            flattenPoints(subjectPolygon, tempArr2)
            polygonPolygon(tempArr1, tempArr2) ?
                checkBoolPolygons.push(polygon) : leftoverPolygons.push(polygon)
        }
        // console.log('待进行bool运算的多边形数量', checkBoolPolygons.length)
        if (checkBoolPolygons.length == 0)
            return
        this.polygons.length = 0
        for (let checkBoolPolygon of checkBoolPolygons) {
            const polygon = polygonClipping.difference(checkBoolPolygon, [hole])
            //切出空的多边形、面积过小的多边形直接丢弃
            if (polygon.length != 0)
                this.polygons.push(...polygon)
        }
        this.polygons = this.polygons.concat(leftoverPolygons)
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
        const polygons = []
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
            polygons.push([[
                [x, y],
                [x, y - h],
                [x + w, y - h],
                [x + w, y]
            ]])
        }
        const holeNode = this.node.getChildByName('holeRoot')
        if (holeNode) {
            const holes: polygonClipping.MultiPolygon = []
            for (let node of holeNode.children) {
                const hole: polygonClipping.Polygon = []
                const subjectCol= node.getComponent(cc.PolygonCollider)
                const edge: polygonClipping.Ring = []
                for (let point of subjectCol.points) {
                    edge.push([point.x + subjectCol.offset.x, point.y + subjectCol.offset.y])
                }
                hole.push(edge)
                const cols = node.children[0].getComponentsInChildren(cc.PolygonCollider)
                for (let col of cols) {
                    const arr: polygonClipping.Ring = []
                    for (let point of col.points) {
                        arr.push([point.x + col.offset.x, point.y + col.offset.y])
                    }
                    hole.push(arr)
                }
                holes.push(hole)
            }
            this.polygons = []
            for (let polygon of polygons) {
                this.polygons.push(...polygonClipping.difference(polygon, holes))
            }
            holeNode.destroy()
        } else
            this.polygons = polygons
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
