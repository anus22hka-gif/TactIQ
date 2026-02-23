import math
import os
import cv2

try:
    import mediapipe as mp

    mp_pose = mp.solutions.pose
    pose = mp_pose.Pose(
        static_image_mode=True,
        model_complexity=2,
        enable_segmentation=False,
        min_detection_confidence=0.3,
    )
except Exception:
    mp_pose = None
    pose = None


def extract_pose(frame):
    if pose is None:
        return None
    rgb = frame[:, :, ::-1]
    result = pose.process(rgb)
    if not result or not result.pose_landmarks:
        return None

    landmarks = result.pose_landmarks.landmark
    return [(lm.x, lm.y, lm.z) for lm in landmarks]


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

    left_knee_angles = []
    right_knee_angles = []
    trunk_angles = []
    left_shoulder_angles = []
    right_shoulder_angles = []

    lh = mp_pose.PoseLandmark.LEFT_HIP.value
    lk = mp_pose.PoseLandmark.LEFT_KNEE.value
    la = mp_pose.PoseLandmark.LEFT_ANKLE.value
    rh = mp_pose.PoseLandmark.RIGHT_HIP.value
    rk = mp_pose.PoseLandmark.RIGHT_KNEE.value
    ra = mp_pose.PoseLandmark.RIGHT_ANKLE.value
    ls = mp_pose.PoseLandmark.LEFT_SHOULDER.value
    rs = mp_pose.PoseLandmark.RIGHT_SHOULDER.value

    velocities = []
    centers = []

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

        shoulder_vec = (lm[rs][0] - lm[ls][0], lm[rs][1] - lm[ls][1])
        hip_vec = (lm[rh][0] - lm[lh][0], lm[rh][1] - lm[lh][1])

        if hip_vec[0] != 0 or hip_vec[1] != 0:
            hip_angle = math.degrees(math.atan2(hip_vec[1], hip_vec[0]))
        else:
            hip_angle = None

        if shoulder_vec[0] != 0 or shoulder_vec[1] != 0:
            shoulder_angle = math.degrees(math.atan2(shoulder_vec[1], shoulder_vec[0]))
        else:
            shoulder_angle = None

        center = hip_mid
        centers.append(center)

        if left_knee is not None:
            left_knee_angles.append(left_knee)
        if right_knee is not None:
            right_knee_angles.append(right_knee)
        if trunk_angle is not None:
            trunk_angles.append(trunk_angle)
        if shoulder_angle is not None:
            left_shoulder_angles.append(shoulder_angle)
            right_shoulder_angles.append(shoulder_angle)

    def safe_avg(values):
        return sum(values) / len(values) if values else 0.0

    motion_intensity = 0.0
    accel_spikes = 0
    decel_spikes = 0
    cod_events = 0

    body_orientation = 0.0

    if len(centers) >= 2:
        vx_list = []
        vy_list = []
        for i in range(1, len(centers)):
            vx = centers[i][0] - centers[i - 1][0]
            vy = centers[i][1] - centers[i - 1][1]
            speed = math.hypot(vx, vy)
            velocities.append(speed)
            vx_list.append(vx)
            vy_list.append(vy)

        if velocities:
            max_speed = max(velocities)
            avg_speed = safe_avg(velocities)
            motion_intensity = max_speed

            for i in range(1, len(velocities)):
                dv = velocities[i] - velocities[i - 1]
                if dv > max_speed * 0.25:
                    accel_spikes += 1
                if dv < -max_speed * 0.25:
                    decel_spikes += 1

            first = centers[0]
            last = centers[-1]
            move_vec = (last[0] - first[0], last[1] - first[1])
            if move_vec[0] != 0 or move_vec[1] != 0:
                body_orientation = math.degrees(math.atan2(move_vec[1], move_vec[0]))

            for i in range(1, len(vx_list)):
                prev_vec = (vx_list[i - 1], vy_list[i - 1])
                curr_vec = (vx_list[i], vy_list[i])
                prev_norm = math.hypot(prev_vec[0], prev_vec[1])
                curr_norm = math.hypot(curr_vec[0], curr_vec[1])
                if prev_norm == 0 or curr_norm == 0:
                    continue
                dot = prev_vec[0] * curr_vec[0] + prev_vec[1] * curr_vec[1]
                cos_theta = max(-1.0, min(1.0, dot / (prev_norm * curr_norm)))
                angle_deg = math.degrees(math.acos(cos_theta))
                if angle_deg > 30.0:
                    cod_events += 1

    shoulder_tilts = []
    hip_tilts = []
    shoulder_asymmetries = []
    hip_asymmetries = []

    for lm in landmarks_sequence:
        if len(lm) <= max(ls, rs, lh, rh):
            continue
        shoulder_line = (lm[rs][0] - lm[ls][0], lm[rs][1] - lm[ls][1])
        hip_line = (lm[rh][0] - lm[lh][0], lm[rh][1] - lm[lh][1])
        if shoulder_line[0] != 0 or shoulder_line[1] != 0:
            shoulder_tilts.append(
                math.degrees(math.atan2(shoulder_line[1], shoulder_line[0]))
            )
        if hip_line[0] != 0 or hip_line[1] != 0:
            hip_tilts.append(math.degrees(math.atan2(hip_line[1], hip_line[0])))
        shoulder_asymmetries.append(abs(lm[ls][1] - lm[rs][1]))
        hip_asymmetries.append(abs(lm[lh][1] - lm[rh][1]))

    return {
        "left_knee_mean": safe_avg(left_knee_angles),
        "left_knee_min": min(left_knee_angles) if left_knee_angles else 0.0,
        "left_knee_max": max(left_knee_angles) if left_knee_angles else 0.0,
        "right_knee_mean": safe_avg(right_knee_angles),
        "right_knee_min": min(right_knee_angles) if right_knee_angles else 0.0,
        "right_knee_max": max(right_knee_angles) if right_knee_angles else 0.0,
        "trunk_angle_mean": safe_avg(trunk_angles),
        "trunk_angle_max": max(trunk_angles) if trunk_angles else 0.0,
        "shoulder_angle_mean": safe_avg(left_shoulder_angles),
        "hip_tilt_deg": safe_avg(hip_tilts),
        "shoulder_tilt_deg": safe_avg(shoulder_tilts),
        "frames_analyzed": len(landmarks_sequence),
        "relative_motion_intensity": motion_intensity,
        "max_screen_speed": max(velocities) if velocities else 0.0,
        "avg_screen_speed": safe_avg(velocities) if velocities else 0.0,
        "frame_level_accel_proxy": accel_spikes,
        "frame_level_decel_proxy": decel_spikes,
        "change_of_direction_events": cod_events,
        "knee_asymmetry": abs(
            safe_avg(left_knee_angles) - safe_avg(right_knee_angles)
        ),
        "shoulder_asymmetry": safe_avg(shoulder_asymmetries),
        "hip_asymmetry": safe_avg(hip_asymmetries),
        "body_orientation_deg": body_orientation,
    }


def analyze_posture_file(path):
    if mp_pose is None or pose is None:
        return {
            "left_knee_mean": 0.0,
            "left_knee_min": 0.0,
            "left_knee_max": 0.0,
            "right_knee_mean": 0.0,
            "right_knee_min": 0.0,
            "right_knee_max": 0.0,
            "trunk_angle_mean": 0.0,
            "trunk_angle_max": 0.0,
            "shoulder_angle_mean": 0.0,
            "hip_tilt_deg": 0.0,
            "shoulder_tilt_deg": 0.0,
            "frames_analyzed": 0,
            "relative_motion_intensity": 0.0,
            "max_screen_speed": 0.0,
            "avg_screen_speed": 0.0,
            "frame_level_accel_proxy": 0,
            "frame_level_decel_proxy": 0,
            "change_of_direction_events": 0,
            "knee_asymmetry": 0.0,
            "shoulder_asymmetry": 0.0,
            "hip_asymmetry": 0.0,
            "body_orientation_deg": 0.0,
            "fps_used": 0.0,
        }
    ext = os.path.splitext(path)[1].lower()
    if ext in [".jpg", ".jpeg", ".png", ".webp", ".bmp"]:
        frame = cv2.imread(path)
        if frame is None:
            return {
                "left_knee_mean": 0.0,
                "left_knee_min": 0.0,
                "left_knee_max": 0.0,
                "right_knee_mean": 0.0,
                "right_knee_min": 0.0,
                "right_knee_max": 0.0,
                "trunk_angle_mean": 0.0,
                "trunk_angle_max": 0.0,
                "shoulder_angle_mean": 0.0,
                "hip_tilt_deg": 0.0,
                "shoulder_tilt_deg": 0.0,
                "frames_analyzed": 0,
                "relative_motion_intensity": 0.0,
                "max_screen_speed": 0.0,
                "avg_screen_speed": 0.0,
                "frame_level_accel_proxy": 0,
                "frame_level_decel_proxy": 0,
                "change_of_direction_events": 0,
                "knee_asymmetry": 0.0,
                "shoulder_asymmetry": 0.0,
                "hip_asymmetry": 0.0,
                "body_orientation_deg": 0.0,
                "fps_used": 0.0,
            }
        landmarks = extract_pose(frame)
        if not landmarks:
            return {
                "left_knee_mean": 0.0,
                "left_knee_min": 0.0,
                "left_knee_max": 0.0,
                "right_knee_mean": 0.0,
                "right_knee_min": 0.0,
                "right_knee_max": 0.0,
                "trunk_angle_mean": 0.0,
                "trunk_angle_max": 0.0,
                "shoulder_angle_mean": 0.0,
                "hip_tilt_deg": 0.0,
                "shoulder_tilt_deg": 0.0,
                "frames_analyzed": 0,
                "relative_motion_intensity": 0.0,
                "max_screen_speed": 0.0,
                "avg_screen_speed": 0.0,
                "frame_level_accel_proxy": 0,
                "frame_level_decel_proxy": 0,
                "change_of_direction_events": 0,
                "knee_asymmetry": 0.0,
                "shoulder_asymmetry": 0.0,
                "hip_asymmetry": 0.0,
                "body_orientation_deg": 0.0,
                "fps_used": 0.0,
            }
        metrics = compute_joint_metrics([landmarks])
        if not metrics:
            return {
                "left_knee_mean": 0.0,
                "left_knee_min": 0.0,
                "left_knee_max": 0.0,
                "right_knee_mean": 0.0,
                "right_knee_min": 0.0,
                "right_knee_max": 0.0,
                "trunk_angle_mean": 0.0,
                "trunk_angle_max": 0.0,
                "shoulder_angle_mean": 0.0,
                "hip_tilt_deg": 0.0,
                "shoulder_tilt_deg": 0.0,
                "frames_analyzed": 0,
                "relative_motion_intensity": 0.0,
                "max_screen_speed": 0.0,
                "avg_screen_speed": 0.0,
                "frame_level_accel_proxy": 0,
                "frame_level_decel_proxy": 0,
                "change_of_direction_events": 0,
                "knee_asymmetry": 0.0,
                "shoulder_asymmetry": 0.0,
                "hip_asymmetry": 0.0,
                "body_orientation_deg": 0.0,
                "fps_used": 0.0,
            }
        metrics["fps_used"] = 0.0
        return metrics

    cap = cv2.VideoCapture(path)
    if not cap.isOpened():
        return {
            "left_knee_mean": 0.0,
            "left_knee_min": 0.0,
            "left_knee_max": 0.0,
            "right_knee_mean": 0.0,
            "right_knee_min": 0.0,
            "right_knee_max": 0.0,
            "trunk_angle_mean": 0.0,
            "trunk_angle_max": 0.0,
            "shoulder_angle_mean": 0.0,
            "hip_tilt_deg": 0.0,
            "shoulder_tilt_deg": 0.0,
            "frames_analyzed": 0,
            "relative_motion_intensity": 0.0,
            "max_screen_speed": 0.0,
            "avg_screen_speed": 0.0,
            "frame_level_accel_proxy": 0,
            "frame_level_decel_proxy": 0,
            "change_of_direction_events": 0,
            "knee_asymmetry": 0.0,
            "shoulder_asymmetry": 0.0,
            "hip_asymmetry": 0.0,
            "body_orientation_deg": 0.0,
            "fps_used": 0.0,
        }

    fps = cap.get(cv2.CAP_PROP_FPS)
    if not fps or fps <= 1 or fps > 240:
        fps = 30.0

    landmarks_sequence = []
    index = 0
    max_frames = 300

    while True:
        ret, frame = cap.read()
        if not ret or index >= max_frames:
            break

        landmarks = extract_pose(frame)
        if landmarks:
            landmarks_sequence.append(landmarks)

        index += 1

    cap.release()

    if not landmarks_sequence:
        cap_fallback = cv2.VideoCapture(path)
        if not cap_fallback.isOpened():
            return None

        total_frames = int(cap_fallback.get(cv2.CAP_PROP_FRAME_COUNT)) or 0
        target_indices = [0]
        if total_frames > 2:
            target_indices.append(total_frames // 2)
        if total_frames > 4:
            target_indices.append(total_frames - 1)

        fallback_landmarks = []
        current_index = 0
        targets_set = set(target_indices)

        while True:
            ret, frame = cap_fallback.read()
            if not ret:
                break
            if current_index in targets_set:
                landmarks = extract_pose(frame)
                if landmarks:
                    fallback_landmarks.append(landmarks)
            current_index += 1

        cap_fallback.release()

        if fallback_landmarks:
            landmarks_sequence = fallback_landmarks

    if not landmarks_sequence:
        return {
            "left_knee_mean": 0.0,
            "left_knee_min": 0.0,
            "left_knee_max": 0.0,
            "right_knee_mean": 0.0,
            "right_knee_min": 0.0,
            "right_knee_max": 0.0,
            "trunk_angle_mean": 0.0,
            "trunk_angle_max": 0.0,
            "shoulder_angle_mean": 0.0,
            "hip_tilt_deg": 0.0,
            "shoulder_tilt_deg": 0.0,
            "frames_analyzed": 0,
            "relative_motion_intensity": 0.0,
            "max_screen_speed": 0.0,
            "avg_screen_speed": 0.0,
            "frame_level_accel_proxy": 0,
            "frame_level_decel_proxy": 0,
            "change_of_direction_events": 0,
            "knee_asymmetry": 0.0,
            "shoulder_asymmetry": 0.0,
            "hip_asymmetry": 0.0,
            "body_orientation_deg": 0.0,
            "fps_used": fps,
        }

    metrics = compute_joint_metrics(landmarks_sequence)
    if not metrics:
        metrics = {
            "left_knee_mean": 0.0,
            "left_knee_min": 0.0,
            "left_knee_max": 0.0,
            "right_knee_mean": 0.0,
            "right_knee_min": 0.0,
            "right_knee_max": 0.0,
            "trunk_angle_mean": 0.0,
            "trunk_angle_max": 0.0,
            "shoulder_angle_mean": 0.0,
            "hip_tilt_deg": 0.0,
            "shoulder_tilt_deg": 0.0,
            "frames_analyzed": len(landmarks_sequence),
            "relative_motion_intensity": 0.0,
            "max_screen_speed": 0.0,
            "avg_screen_speed": 0.0,
            "frame_level_accel_proxy": 0,
            "frame_level_decel_proxy": 0,
            "change_of_direction_events": 0,
            "knee_asymmetry": 0.0,
            "shoulder_asymmetry": 0.0,
            "hip_asymmetry": 0.0,
            "body_orientation_deg": 0.0,
        }

    metrics["relative_motion_intensity"] *= fps
    metrics["max_screen_speed"] *= fps
    metrics["avg_screen_speed"] *= fps
    metrics["fps_used"] = fps

    return metrics
