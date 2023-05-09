import * as PolygonClipping from "polygon-clipping";

export function flattenPoints(polygon: PolygonClipping.Ring, out: number[]) {
    for (const point of polygon) {
        out.push(point[0], point[1])
    }
}

// 判断点是否在多边形内部
function isPointInPolygon(point: PolygonClipping.Pair, polygon: PolygonClipping.Ring) {
    let i, j, c = false
    for (i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        if (((polygon[i][1] > point[1]) != (polygon[j][1] > point[1])) &&
            (point[0] < (polygon[j][0] - polygon[i][0]) * (point[1] - polygon[i][1]) / (polygon[j][1] - polygon[i][1]) + polygon[i][0])) {
            c = !c
        }
    }
    return c
}

// 计算线段上距离点最近的点
function getClosestPointOnSegment(a: PolygonClipping.Pair, b: PolygonClipping.Pair, p: PolygonClipping.Pair): PolygonClipping.Pair {
    const ax = b[0] - a[0]
    const ay = b[1] - a[1]
    const bx = p[0] - a[0]
    const by = p[1] - a[1]
    const ab2 = ax * ax + ay * ay
    const ap_ab = bx * ax + by * ay
    let t = ap_ab / ab2
    if (t < 0)
        t = 0
    else if (t > 1)
        t = 1
    return [a[0] + ax * t, a[1] + ay * t]
}

// 计算两点间距离的平方
function getDistanceSquared(a: PolygonClipping.Pair, b: PolygonClipping.Pair) {
    const dx = b[0] - a[0]
    const dy = b[1] - a[1]
    return dx * dx + dy * dy
}

// 判断多边形和圆是否相交
export function isPolygonIntersectCircle(polygon: PolygonClipping.Ring, cc: PolygonClipping.Pair, cr: number) {
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


