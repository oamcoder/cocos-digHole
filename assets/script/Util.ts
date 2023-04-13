export function flattenPoints(polygon: gpc.Vertex[], out: number[])
export function flattenPoints(polygon: gpc.Polygon, out: number[])
export function flattenPoints(...args: any) {
    const out = args[1] as number[]
    if (args[0] instanceof gpc.Polygon) {
        const polygon = args[0]
        const len = polygon.getNumPoints()
        for (let i = 0; i < len; i++) {
            const p = polygon.get(i)
            out.push(p.x, p.y)
        }
    } else {
        const polygon = args[0] as gpc.Vertex[]
        for (const p of polygon) {
            out.push(p.x, p.y)
        }
    }
}

const tempVertex1 = {x: 0, y: 0}
const tempVertex2 = {x: 0, y: 0}
const tempVertex3 = {x: 0, y: 0}

// 判断点是否在多边形内部
function isPointInPolygon(point: gpc.Vertex, polygon: gpc.Vertex[]) {
    let i, j, c = false
    for (i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        if (((polygon[i].y > point.y) != (polygon[j].y > point.y)) &&
            (point.x < (polygon[j].x - polygon[i].x) * (point.y - polygon[i].y) / (polygon[j].y - polygon[i].y) + polygon[i].x)) {
            c = !c
        }
    }
    return c
}

// 计算线段上距离点最近的点
function getClosestPointOnSegment(a: gpc.Vertex, b: gpc.Vertex, p: gpc.Vertex) {
    tempVertex1.x = b.x - a.x
    tempVertex1.y = b.y - a.y
    const ab = tempVertex1
    tempVertex2.x = p.x - a.x
    tempVertex2.y = p.y - a.y
    const ap = tempVertex2
    const ab2 = ab.x * ab.x + ab.y * ab.y
    const ap_ab = ap.x * ab.x + ap.y * ab.y
    let t = ap_ab / ab2
    if (t < 0)
        t = 0
    else if (t > 1)
        t = 1
    tempVertex3.x = a.x + ab.x * t
    tempVertex3.y = a.y + ab.y * t
    return tempVertex3
}

// 计算两点间距离的平方
function getDistanceSquared(a: gpc.Vertex, b: gpc.Vertex) {
    const dx = b.x - a.x
    const dy = b.y - a.y
    return dx * dx + dy * dy
}

// 判断多边形和圆是否相交
export function isPolygonIntersectCircle(polygon: gpc.Vertex[], cc: gpc.Vertex, cr: number) {
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


