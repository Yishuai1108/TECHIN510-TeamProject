import { NextResponse } from 'next/server'
import * as tf from '@tensorflow/tfjs'
import * as facemesh from '@tensorflow-models/facemesh'

// 加载模型
let faceMeshModel: facemesh.FaceMesh | null = null

export async function POST() {
  try {
    // 如果模型未加载，则加载模型
    if (!faceMeshModel) {
      await tf.ready()
      faceMeshModel = await facemesh.load()
    }

    // 模拟情绪检测结果（暂时使用模拟数据，后续可以替换为实际检测）
    const emotions = ['happy', 'sad', 'angry', 'neutral', 'surprised', 'fear', 'disgust']
    const probabilities = emotions.reduce((acc, emotion) => {
      acc[emotion] = Math.random()
      return acc
    }, {} as Record<string, number>)

    // 选择概率最高的情绪
    const maxEmotion = Object.entries(probabilities).reduce((max, [emotion, prob]) => {
      return prob > max.prob ? { emotion, prob } : max
    }, { emotion: 'neutral', prob: 0 })

    return NextResponse.json({
      result: {
        emotion: maxEmotion.emotion,
        probabilities
      }
    })
  } catch (error) {
    console.error('Error in emotion detection:', error)
    return NextResponse.json(
      { error: 'Failed to detect emotion' },
      { status: 500 }
    )
  }
}
