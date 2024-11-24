export class Vector {
    static multiply(vectorA, value) {
        return {
            x: vectorA.x * (typeof value === 'number' ? value : value.x),
            y: vectorA.y * (typeof value === 'number' ? value : value.y),
            z: vectorA.z * (typeof value === 'number' ? value : value.z)
        };
    }
    static add(vectorA, vectorB) {
        return {
            x: vectorA.x + (vectorB.x ?? 0),
            y: vectorA.y + (vectorB.y ?? 0),
            z: vectorA.z + (vectorB.z ?? 0)
        };
    }
    static subtract(vectorA, vectorB) {
        return {
            x: vectorA.x - (vectorB.x ?? 0),
            y: vectorA.y - (vectorB.y ?? 0),
            z: vectorA.z - (vectorB.z ?? 0)
        };
    }
    static distance(vectorA, vectorB) {
        return Math.sqrt(Math.pow(vectorA.x - vectorB.x, 2)
            + Math.pow(vectorA.y - vectorB.y, 2)
            + Math.pow(vectorA.z - vectorB.z, 2));
    }
}