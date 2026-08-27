# Developer Guide

## Content-first architecture

The app imports content from `content/items.json` and difficulty settings from `content/game-config.json`. Keep the UI and game logic generic. A new subject should normally require only:

1. A new content pack
2. New assets
3. A new example README
4. Optional theme or locale text

## Add a new subject

1. Duplicate the content format from `content/items.json`.
2. Use stable, URL-safe IDs.
3. Add images under `public/assets/` and record their credits and licenses.
4. Set the Basic item IDs in `content/game-config.json`.
5. Run `npm run validate:content`, `npm run lint`, and `npm run build`.
6. Test the Remember and Learn views at both difficulty levels.

## Safe AI editing boundary

By default, an AI agent should edit only `content/`, `public/assets/`, `examples/`, `docs/`, and `prompts/`. Changes to `app/`, build configuration, hosting configuration, or secrets require a separate code review.

## Release checklist

- A clean install succeeds
- Content validation passes
- Lint and build pass
- No `.env` files, tokens, or private data are committed
- Image rights and source links are documented
- At least one example is clearly labeled as replaceable sample content
- A release ZIP can be opened by a non-developer
