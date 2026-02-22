import cv2
import numpy as np
import os

OUTPUT_DIR = "processed"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def detect_players_by_color(frame):
    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)

    # Example: Team A (orange/red jerseys)
    lower_red = np.array([0, 100, 100])
    upper_red = np.array([15, 255, 255])
    mask_red = cv2.inRange(hsv, lower_red, upper_red)

    # Team B (blue/green jerseys)
    lower_blue = np.array([90, 50, 50])
    upper_blue = np.array([130, 255, 255])
    mask_blue = cv2.inRange(hsv, lower_blue, upper_blue)

    return mask_red, mask_blue


def extract_centroids(mask):
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    centers = []

    for cnt in contours:
        if cv2.contourArea(cnt) > 200:
            x, y, w, h = cv2.boundingRect(cnt)
            centers.append((x + w // 2, y + h // 2))

    return centers


def process_video(video_path):
    cap = cv2.VideoCapture(video_path)

    if not cap.isOpened():
        return {
            "teamA_positions": [],
            "teamB_positions": [],
            "processed_video": video_path,
        }

    ret, frame = cap.read()
    if not ret:
        cap.release()
        return {
            "teamA_positions": [],
            "teamB_positions": [],
            "processed_video": video_path,
        }

    height, width = frame.shape[:2]
    fps = cap.get(cv2.CAP_PROP_FPS) or 30

    output_path = os.path.join(OUTPUT_DIR, "processed_" + os.path.basename(video_path))
    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

    teamA_positions = []
    teamB_positions = []

    frame_count = 0
    max_frames = 200

    while ret and frame_count < max_frames:
        frame_count += 1

        maskA, maskB = detect_players_by_color(frame)

        teamA = extract_centroids(maskA)
        teamB = extract_centroids(maskB)

        teamA_positions.extend(teamA)
        teamB_positions.extend(teamB)

        for c in teamA:
            cv2.circle(frame, c, 8, (0, 0, 255), -1)

        for c in teamB:
            cv2.circle(frame, c, 8, (255, 0, 0), -1)

        if len(teamA) > 1:
            for i in range(len(teamA) - 1):
                cv2.line(frame, teamA[i], teamA[i + 1], (0, 255, 255), 2)

        border_color = (255, 0, 0)
        cv2.rectangle(frame, (0, 0), (width - 1, height - 1), border_color, 4)

        banner_height = int(0.1 * height)
        overlay = frame.copy()
        cv2.rectangle(
            overlay,
            (0, 0),
            (width, banner_height),
            (0, 0, 0),
            -1,
        )
        alpha = 0.6
        frame = cv2.addWeighted(overlay, alpha, frame, 1 - alpha, 0)

        cv2.putText(
            frame,
            "TactIQ Analysis Overlay",
            (20, int(banner_height * 0.7)),
            cv2.FONT_HERSHEY_SIMPLEX,
            1.0,
            (255, 255, 255),
            2,
            cv2.LINE_AA,
        )

        out.write(frame)

        ret, frame = cap.read()

    cap.release()
    out.release()

    return {
        "teamA_positions": teamA_positions,
        "teamB_positions": teamB_positions,
        "processed_video": output_path,
    }
