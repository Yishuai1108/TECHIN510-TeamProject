declare module '@tensorflow-models/facemesh' {
  export interface FaceMesh {
    estimateFaces(input: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement | ImageData): Promise<{
      scaledMesh: number[][];
      faceInViewConfidence: number;
      boundingBox: {
        topLeft: [number, number];
        bottomRight: [number, number];
      };
    }[]>;
  }

  export function load(): Promise<FaceMesh>;
} 