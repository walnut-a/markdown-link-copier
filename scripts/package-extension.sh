#!/bin/sh

set -eu

script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
project_root=$(CDPATH= cd -- "$script_dir/.." && pwd)
extension_root="$project_root/chrome-extension"
output_dir="$project_root/dist"
version=$(sed -n 's/.*"version": "\([^"]*\)".*/\1/p' "$extension_root/manifest.json")

if [ -z "$version" ]; then
  echo "无法从 manifest.json 读取版本号" >&2
  exit 1
fi

package_temp=$(mktemp -d "${TMPDIR:-/tmp}/markdown-link-copier.XXXXXX")
package_root="$package_temp/package"
archive_path="$output_dir/markdown-link-copier-$version.zip"

cleanup() {
  rm -rf -- "$package_temp"
}
trap cleanup EXIT INT TERM

mkdir -p "$package_root/icons" "$package_root/_locales" "$output_dir"
cp \
  "$extension_root/manifest.json" \
  "$extension_root/background.js" \
  "$extension_root/page-feedback.js" \
  "$extension_root/i18n.js" \
  "$extension_root/popup.js" \
  "$extension_root/popup.css" \
  "$extension_root/popup.html" \
  "$extension_root/options.html" \
  "$package_root/"
cp \
  "$extension_root/icons/icon16.png" \
  "$extension_root/icons/icon32.png" \
  "$extension_root/icons/icon48.png" \
  "$extension_root/icons/icon128.png" \
  "$package_root/icons/"
cp -R "$extension_root/_locales/en" "$extension_root/_locales/zh_CN" "$package_root/_locales/"

rm -f -- "$archive_path"
(
  cd "$package_root"
  /usr/bin/zip -q -r "$archive_path" .
)

echo "$archive_path"
