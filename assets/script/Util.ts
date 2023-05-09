import * as PolygonClipping from "polygon-clipping";

export function flattenPoints(polygon: PolygonClipping.Ring, out: number[]) {
    for (const point of polygon) {
        out.push(point[0], point[1])
    }
}

const tempVertex1 = {x: 0, y: 0}
const tempVertex2 = {x: 0, y: 0}
const tempVertex3 = {x: 0, y: 0}

// 判断点是否在多边形内部
function isPointInPolygon(point: gpc.Vertex, polygon: PolygonClipping.Ring) {
    let i, j, c = false
    for (i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        if (((polygon[i][1] > point.y) != (polygon[j][1] > point.y)) &&
            (point.x < (polygon[j][0] - polygon[i][0]) * (point.y - polygon[i][1]) / (polygon[j][1] - polygon[i][1]) + polygon[i][0])) {
            c = !c
        }
    }
    return c
}

// 计算线段上距离点最近的点
function getClosestPointOnSegment(a: PolygonClipping.Pair, b: PolygonClipping.Pair, p: gpc.Vertex) {
    tempVertex1.x = b[0] - a[0]
    tempVertex1.y = b[1] - a[1]
    const ab = tempVertex1
    tempVertex2.x = p.x - a[0]
    tempVertex2.y = p.y - a[1]
    const ap = tempVertex2
    const ab2 = ab.x * ab.x + ab.y * ab.y
    const ap_ab = ap.x * ab.x + ap.y * ab.y
    let t = ap_ab / ab2
    if (t < 0)
        t = 0
    else if (t > 1)
        t = 1
    tempVertex3.x = a[0] + ab.x * t
    tempVertex3.y = a[1] + ab.y * t
    return tempVertex3
}

// 计算两点间距离的平方
function getDistanceSquared(a: gpc.Vertex, b: gpc.Vertex) {
    const dx = b.x - a.x
    const dy = b.y - a.y
    return dx * dx + dy * dy
}

// 判断多边形和圆是否相交
export function isPolygonIntersectCircle(polygon: PolygonClipping.Ring, cc: gpc.Vertex, cr: number) {
    let i, len = polygon.length
    for (i = 0; i < len; i++) {
        const edge = polygon[i]
        const nextEdge = polygon[(i + 1) % len]
        const closestPoint = getClosestPointOnSegment(edge, nextEdge, cc)
        const distanceSquared = getDistanceSquared(closestPoint, cc)
        if (distanceSquared < cr * cr) {
            return true
        }
    }
    return isPointInPolygon(cc, polygon)
}


