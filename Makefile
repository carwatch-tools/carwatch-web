NODE_PATH := /opt/homebrew/bin
BASE_PATH := /study-manager

.PHONY: dev build preview

dev:
	PATH=$(NODE_PATH):$$PATH npm run dev

build:
	PATH=$(NODE_PATH):$$PATH BASE_PATH=$(BASE_PATH) npm run build

preview: build
	PATH=$(NODE_PATH):$$PATH npm run preview
