# Contributor and AI Agent Guide

LearnMatch AI is a reusable educational game template. Keep the game engine separate from subject content.

## Product vocabulary

- Level describes the product output: Starter Game Pack, Classroom Game Pack, Published Learning Site, or Developer Template.
- Mode describes how content is created: Quick Mode or Deep Mode.
- A downloadable HTML/ZIP file is not the same thing as a public URL.

## Safe editing boundary

For a content change, edit only `content/`, `public/assets/`, `examples/`, `docs/`, and `prompts/`. Do not change scoring, game logic, hosting configuration, or secrets unless the task explicitly requests a code change and the diff is reviewed.

## Required checks

```bash
npm run validate:content
npm run lint
npm run build
```

The teacher is the final approver of facts, translations, source links, image credits, and image rights. Never invent missing facts or claim that an unverified image license is cleared.
