#!/bin/sh

set -eu

script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
project_root=$(CDPATH= cd -- "$script_dir/.." && pwd)
source_html="$project_root/docs/promotion/demo.html"
output_gif="$project_root/docs/promotion/markdown-link-copier-demo.gif"
chrome_binary="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
node_binary="/Users/zhaolixing/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"
node_modules="/Users/zhaolixing/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules"
frame_count=48
frame_rate=12

if [ ! -x "$chrome_binary" ]; then
  echo "找不到 Google Chrome：$chrome_binary" >&2
  exit 1
fi

if [ ! -x "$node_binary" ] || [ ! -d "$node_modules/playwright" ]; then
  echo "找不到工作区 Playwright 运行环境" >&2
  exit 1
fi

render_temp=$(mktemp -d "${TMPDIR:-/tmp}/markdown-link-copier-promo.XXXXXX")
cleanup() {
  rm -rf -- "$render_temp"
}
trap cleanup EXIT INT TERM

NODE_PATH="$node_modules" "$node_binary" \
  "$script_dir/render-promotion-frames.cjs" \
  "$chrome_binary" \
  "$source_html" \
  "$render_temp" \
  "$frame_count"

ffmpeg -hide_banner -loglevel error -y \
  -framerate "$frame_rate" \
  -i "$render_temp/frame-%03d.png" \
  -filter_complex "fps=$frame_rate,split[a][b];[a]palettegen=max_colors=128:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=3:diff_mode=rectangle" \
  -loop 0 \
  "$output_gif"

echo "$output_gif"
