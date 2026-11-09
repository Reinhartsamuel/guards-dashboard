import cv2
import time
import requests

DASHBOARD_URL = "https://guards-dashboard.vercel.app/api/reports"
DEVICE_API_KEY = "kunci-...-env"
DISTRACTION_THRESHOLD = 4.0
MAX_WIDTH = 640
IMAGE_QUALITY = 75

import mediapipe as mp
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(
    static_image_mode=False,
    max_num_faces=1,
    refine_landmarks=True,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5,
)

cap = cv2.VideoCapture(0)
distraction_start = None

def resize_frame(frame, max_width=MAX_WIDTH):
    h, w = frame.shape[:2]
    if w > max_width:
        scale = max_width / w
        return cv2.resize(frame, (max_width, int(h * scale)))
    return frame

def estimate_status(frame):
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    res = face_mesh.process(rgb)
    if not res.multi_face_landmarks:
        return "Not Focus"
    lm = res.multi_face_landmarks[0].landmark
    h, w = frame.shape[:2]
    nose = lm[1]
    chin = lm[152]
    left_eye = lm[33]
    right_eye = lm[263]
    nose_x = nose.x * w
    eye_cx = ((left_eye.x + right_eye.x) / 2) * w
    offset_x = nose_x - eye_cx
    if abs(offset_x) > w * 0.12:
        return "Not Focus"
    if (nose.y * h) < (chin.y * h * 0.75):
        return "Not Focus"
    return "Focus"

while True:
    ret, frame = cap.read()
    if not ret:
        break
    frame = resize_frame(frame)
    status = estimate_status(frame)
    now = time.monotonic()
    if status == "Not Focus":
        if distraction_start is None:
            distraction_start = now
        elif now - distraction_start >= DISTRACTION_THRESHOLD:
            ts = time.strftime("%Y-%m-%dT%H:%M:%S")
            small = resize_frame(frame)
            ok, jpg = cv2.imencode('.jpg', small, [cv2.IMWRITE_JPEG_QUALITY, IMAGE_QUALITY])
            if ok:
                try:
                    requests.post(
                        DASHBOARD_URL,
                        headers={"X-Device-Key": DEVICE_API_KEY},
                        data={"time": ts, "status": "distracted"},
                        files={"image": ("snapshot.jpg", jpg.tobytes(), "image/jpeg")},
                        timeout=10,
                    )
                    print("Report sent:", ts)
                except Exception as e:
                    print("Failed to send:", e)
            distraction_start = None
    else:
        distraction_start = None
    cv2.imshow("GUARDS Monitor", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
