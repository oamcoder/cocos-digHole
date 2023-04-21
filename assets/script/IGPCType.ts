export interface TrianglePolygon {
    vertices: Array<number>
    triangles: Array<number>
}

export enum DrawMesh {
    None = 'None',
    Bounds = 'Bounds',
    Triangles = 'Triangles',
}