import mediapipe as mp

mp_pose = mp.solutions.pose
pose = mp_pose.Pose()

def extract_pose(frame):
    rgb = frame[:, :, ::-1]
    result = pose.process(rgb)

    if result.pose_landmarks:
        return [(lm.x, lm.y, lm.z) for lm in result.pose_landmarks.landmark]
    return None
