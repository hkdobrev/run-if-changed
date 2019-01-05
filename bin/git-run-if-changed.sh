#!/usr/bin/env bash

if [ $# -lt 2 ]; then
    >&2 echo "usage: git-run-if-changed.sh <file> <commands...>"
    exit 1
fi

git diff-tree --name-only --no-commit-id HEAD@{1} HEAD | grep --quiet "$1" 2> /dev/null

if [ $? -eq 0 ]; then
    echo "$1 changed:"
    shift
    while (($#)); do
        echo "Running '$1'..."
        eval "$1"
        shift
    done

fi
