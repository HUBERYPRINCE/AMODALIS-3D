#!/bin/bash
cd "$(dirname "$0")"
PORT=8765
echo "正在启动「空象视觉 · AMODALIS 3D 动态知觉引擎」: http://127.0.0.1:${PORT}/"
(sleep 1 && open "http://127.0.0.1:${PORT}/") &
python3 -m http.server ${PORT} --bind 127.0.0.1
