import math
import os
import cv2

try:
    from mediapipe.python.solutions import pose as mp_pose
    pose = mp_pose.Pose()
except Exception:
    mp_pose = None
    pose = None


def extract_pose(frame):
    if pose is None:
        return None
    rgb = frame[:, :, ::-1]
    result = pose.process(rgb)
    if result.pose_landmarks:
        return [(lm.x, lm.y, lm.z) for lm in result.pose_landmarks.landmark]
    return None


def _angle(a, b, c):
    ax, ay, _ = a
    bx, by, _ = b
    cx, cy, _ = c
    ab = (ax - bx, ay - by)
    cb = (cx - bx, cy - by)
    ab_norm = math.hypot(ab[0], ab[1])
    cb_norm = math.hypot(cb[0], cb[1])
    if ab_norm == 0 or cb_norm == 0:
        return None
    cos_value = (ab[0] * cb[0] + ab[1] * cb[1]) / (ab_norm * cb_norm)
    cos_value = max(-1.0, min(1.0, cos_value))
    return math.degrees(math.acos(cos_value))


def compute_joint_metrics(landmarks_sequence):
    if mp_pose is None:
        return None
    if not landmarks_sequence:
        return None

    left_knee_angles = []
    right_knee_angles = []
    trunk_angles = []

    lh = mp_pose.PoseLandmark.LEFT_HIP.value
    lk = mp_pose.PoseLandmark.LEFT_KNEE.value
    la = mp_pose.PoseLandmark.LEFT_ANKLE.value
    rh = mp_pose.PoseLandmark.RIGHT_HIP.value
    rk = mp_pose.PoseLandmark.RIGHT_KNEE.value
    ra = mp_pose.PoseLandmark.RIGHT_ANKLE.value
    ls = mp_pose.PoseLandmark.LEFT_SHOULDER.value
    rs = mp_pose.PoseLandmark.RIGHT_SHOULDER.value

    for lm in landmarks_sequence:
        if len(lm) <= max(ls, rs, lh, lk, la, rh, rk, ra):
            continue
        left_knee = _angle(lm[lh], lm[lk], lm[la])
        right_knee = _angle(lm[rh], lm[rk], lm[ra])
        shoulder_mid = (
            (lm[ls][0] + lm[rs][0]) / 2.0,
            (lm[ls][1] + lm[rs][1]) / 2.0,
            (lm[ls][2] + lm[rs][2]) / 2.0,
        )
        hip_mid = (
            (lm[lh][0] + lm[rh][0]) / 2.0,
            (lm[lh][1] + lm[rh][1]) / 2.0,
            (lm[lh][2] + lm[rh][2]) / 2.0,
        )
        vertical = (0.0, -1.0, 0.0)
        torso_vec = (shoulder_mid[0] - hip_mid[0], shoulder_mid[1] - hip_mid[1])
        torso_norm = math.hypot(torso_vec[0], torso_vec[1])
        if torso_norm > 0:
            cos_torso = (torso_vec[0] * vertical[0] + torso_vec[1] * vertical[1]) / (
                torso_norm * math.hypot(vertical[0], vertical[1])
            )
            cos_torso = max(-1.0, min(1.0, cos_torso))
            trunk_angle = math.degrees(math.acos(cos_torso))
        else:
            trunk_angle = None

        if left_knee is not None:
            left_knee_angles.append(left_knee)
        if right_knee is not None:
            right_knee_angles.append(right_knee)
        if trunk_angle is not None:
            trunk_angles.append(trunk_angle)

    if not left_knee_angles and not right_knee_angles and not trunk_angles:
        return None

    def safe_avg(values):
        return sum(values) / len(values) if values else 0.0

    return {
        "left_knee_mean": safe_avg(left_knee_angles),
        "left_knee_min": min(left_knee_angles) if left_knee_angles else 0.0,
        "left_knee_max": max(left_knee_angles) if left_knee_angles else 0.0,
        "right_knee_mean": safe_avg(right_knee_angles),
        "right_knee_min": min(right_knee_angles) if right_knee_angles else 0.0,
        "right_knee_max": max(right_knee_angles) if right_knee_angles else 0.0,
        "trunk_angle_mean": safe_avg(trunk_angles),
        "trunk_angle_max": max(trunk_angles) if trunk_angles else 0.0,
        "frames_analyzed": len(landmarks_sequence),
    }


def analyze_posture_file(path):
    if mp_pose is None:
        return None
    ext = os.path.splitext(path)[1].lower()
    if ext in [".jpg", ".jpeg", ".png"]:
        frame = cv2.imread(path)
        if frame is None:
            return None
        landmarks = extract_pose(frame)
        if not landmarks:
            return None
        return compute_joint_metrics([landmarks])

    cap = cv2.VideoCapture(path)
    if not cap.isOpened():
        return None

    landmarks_sequence = []
    index = 0
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        if index % 3 == 0:
            landmarks = extract_pose(frame)
            if landmarks:
                landmarks_sequence.append(landmarks)
        index += 1

    cap.release()
    return compute_joint_metrics(landmarks_sequence)
