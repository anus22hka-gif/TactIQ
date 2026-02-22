import cv2
import numpy as np
import os
import shutil
import subprocess

OUTPUT_DIR = os.path.join("static", "processed")
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

    base_name = os.path.basename(video_path)
    name_no_ext, _ = os.path.splitext(base_name)
    frames_dir = os.path.join(OUTPUT_DIR, f"frames_{name_no_ext}")
    os.makedirs(frames_dir, exist_ok=True)

    height, width = frame.shape[:2]
    fps = cap.get(cv2.CAP_PROP_FPS)
    if not fps or fps <= 1 or fps > 240:
        fps = 30

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

        frame_path = os.path.join(frames_dir, f"frame_{frame_count:04d}.png")
        cv2.imwrite(frame_path, frame)

        ret, frame = cap.read()

    cap.release()

    output_file = "processed_" + name_no_ext + ".mp4"
    output_path = os.path.join(OUTPUT_DIR, output_file)

    input_pattern = os.path.join(frames_dir, "frame_%04d.png")
    cmd = [
        "ffmpeg",
        "-y",
        "-framerate",
        str(int(fps)),
        "-i",
        input_pattern,
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        output_path,
    ]

    try:
        subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except Exception:
        shutil.copy(video_path, output_path)

    if os.path.isdir(frames_dir):
        shutil.rmtree(frames_dir, ignore_errors=True)

    if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
        shutil.copy(video_path, output_path)

    return {
        "teamA_positions": teamA_positions,
        "teamB_positions": teamB_positions,
        "processed_video": output_path,
    }
