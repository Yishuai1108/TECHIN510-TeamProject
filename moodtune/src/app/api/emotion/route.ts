import { NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'

export async function POST() {
  return new Promise((resolve, reject) => {
    // 启动 Python 进程
    const pythonProcess = spawn('python', [
      path.join(process.cwd(), 'src/utils/emotion_detector.py')
    ])

    let result = ''
    let error = ''

    // 收集 Python 进程的输出
    pythonProcess.stdout.on('data', (data) => {
      result += data.toString()
    })

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString()
    })

    // 处理进程结束
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(NextResponse.json({ error: `Python process exited with code ${code}: ${error}` }, { status: 500 }))
      } else {
        resolve(NextResponse.json({ result: JSON.parse(result) }))
      }
    })
  })
} 