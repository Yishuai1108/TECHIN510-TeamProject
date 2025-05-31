declare module 'face-api.js' {
  export interface TinyFaceDetectorOptions {
    inputSize?: number;
    scoreThreshold?: number;
  }

  export interface FaceDetection {
    box: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    score: number;
  }

  export interface FaceLandmarks {
    positions: Array<{ x: number; y: number }>;
  }

  export interface FaceExpressions {
    neutral: number;
    happy: number;
    sad: number;
    angry: number;
    fearful: number;
    disgusted: number;
    surprised: number;
  }

  export interface FaceDetectionWithExpressions extends FaceDetection {
    expressions: FaceExpressions;
    landmarks: FaceLandmarks;
  }

  export namespace nets {
    export const tinyFaceDetector: {
      loadFromUri(uri: string): Promise<void>;
    };
    export const faceLandmark68Net: {
      loadFromUri(uri: string): Promise<void>;
    };
    export const faceExpressionNet: {
      loadFromUri(uri: string): Promise<void>;
    };
  }

  export function detectSingleFace(
    input: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement,
    options?: TinyFaceDetectorOptions
  ): {
    withFaceLandmarks(): {
      withFaceExpressions(): Promise<FaceDetectionWithExpressions | null>;
    };
  };
} 