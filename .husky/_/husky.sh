#!/usr/bin/env sh
if [ -z "$husky_skip_init" ]; then
  . "$(dirname -- "$0")/../node_modules/husky/husky"
fi
