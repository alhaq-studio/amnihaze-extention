# AmnGaze-Extention Workspace Agent Configuration

This repository (`AmnGaze-Extention` / `alhaq-studio/amngaze-extention`) is part of the **Amn Product Family**.

## Active Agent Profile: `amn-ecosystem-agent`
- Full Architecture, Roadmap, and Product Specifications: `~/.gemini/config/agents/amn-ecosystem-agent.md`

## Key Technical Specs
- **Manifest Version**: Manifest V3 cross-browser extension (Chrome, Edge, Brave, Firefox, Firefox Android).
- **AI Engine**: TensorFlow.js (WebGL/WASM) local model execution in offscreen context (`dist/offscreen.js`).
- **DOM Scripting**: `amngaze-content.js` dynamic image and video element inspection & blur overlay application.
- **Build Pipeline**: `scripts/build-firefox.js` for dynamic Gecko manifest translation.
