import cv2
import numpy as np
from fer import FER
import json
import sys

def detect_emotion():
    try:
        # 初始化检测器
        detector = FER(mtcnn=True)
        
        # 初始化摄像头
        cap = cv2.VideoCapture(0)
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        
        # 读取一帧
        ret, frame = cap.read()
        if not ret:
            return {"error": "无法读取摄像头"}
        
        # 检测情绪
        emotions = detector.detect_emotions(frame)
        
        # 释放摄像头
        cap.release()
        
        if emotions:
            # 获取主要情绪
            dominant_emotion = max(emotions[0]['emotions'].items(), key=lambda x: x[1])[0]
            return {
                "emotion": dominant_emotion,
                "probabilities": emotions[0]['emotions']
            }
        else:
            return {"error": "未检测到面部"}
            
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    result = detect_emotion()
    print(json.dumps(result))
    sys.stdout.flush() 