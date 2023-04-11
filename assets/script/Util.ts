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