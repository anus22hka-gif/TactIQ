import cv2
import numpy as np
import os
import shutil
import subprocess
import math

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


def _update_tracks(tracks, detections, frame_index, prefix, next_id, max_distance):
    for x, y in detections:
        best_track = None
        best_dist = None
        for track in tracks:
            last_frame, last_x, last_y = track["positions"][-1]
            d = math.hypot(x - last_x, y - last_y)
            if best_dist is None or d < best_dist:
                best_dist = d
                best_track = track
        if best_track is not None and best_dist is not None and best_dist <= max_distance:
            best_track["positions"].append((frame_index, x, y))
        else:
            track_id = f"{prefix}{next_id}"
            next_id += 1
            tracks.append({"id": track_id, "positions": [(frame_index, x, y)]})
    return next_id


def _compute_player_metrics(tracks, fps, width, height):
    metrics = []
    if fps <= 0:
        return metrics
    scale = 105.0 / float(width) if width > 0 else 1.0
    base_scale = float(max(width, height)) if max(width, height) > 0 else 1.0
    sprint_threshold = 0.35 * base_scale
    for track in tracks:
        pts = track["positions"]
        if len(pts) < 2:
            continue
        total_dist_px = 0.0
        speeds = []
        prev_frame, prev_x, prev_y = pts[0]
        for frame_index, x, y in pts[1:]:
            dx = x - prev_x
            dy = y - prev_y
            dist = math.hypot(dx, dy)
            dt = (frame_index - prev_frame) / fps
            if dt <= 0:
                dt = 1.0 / fps
            v = dist / dt
            total_dist_px += dist
            speeds.append(v)
            prev_frame, prev_x, prev_y = frame_index, x, y
        if not speeds:
            continue
        total_distance_m = total_dist_px * scale
        max_speed_mps = max(speeds) * scale
        duration_s = (pts[-1][0] - pts[0][0]) / fps if pts[-1][0] > pts[0][0] else len(pts) / fps
        avg_speed_mps = total_distance_m / duration_s if duration_s > 0 else 0.0
        sprint_count = 0
        in_sprint = False
        hard_decelerations = 0
        for i, v in enumerate(speeds):
            if v > sprint_threshold:
                if not in_sprint:
                    sprint_count += 1
                    in_sprint = True
            else:
                in_sprint = False
            if i > 0:
                prev_v = speeds[i - 1]
                if prev_v > sprint_threshold and v < prev_v * 0.55:
                    hard_decelerations += 1
        metrics.append(
            {
                "id": track["id"],
                "total_distance_m": total_distance_m,
                "max_speed_mps": max_speed_mps,
                "avg_speed_mps": avg_speed_mps,
                "sprint_count": sprint_count,
                "hard_decelerations": hard_decelerations,
                "samples": len(pts),
            }
        )
    return metrics


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
    tracks_A = []
    tracks_B = []
    next_id_A = 1
    next_id_B = 1
    max_assign_distance = max(width, height) * 0.08

    frame_count = 0

    while ret:
        frame_count += 1

        maskA, maskB = detect_players_by_color(frame)

        teamA = extract_centroids(maskA)
        teamB = extract_centroids(maskB)
        teamA_positions.extend(teamA)
        teamB_positions.extend(teamB)

        next_id_A = _update_tracks(tracks_A, teamA, frame_count, "A", next_id_A, max_assign_distance)
        next_id_B = _update_tracks(tracks_B, teamB, frame_count, "B", next_id_B, max_assign_distance)

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

    player_metrics_A = _compute_player_metrics(tracks_A, fps, width, height)
    player_metrics_B = _compute_player_metrics(tracks_B, fps, width, height)

    return {
        "teamA_positions": teamA_positions,
        "teamB_positions": teamB_positions,
        "player_metrics": {
            "teamA": player_metrics_A,
            "teamB": player_metrics_B,
        },
        "processed_video": output_path,
    }
