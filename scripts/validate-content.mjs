import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const contentPath = path.join(root, 'content', 'items.json');
const configPath = path.join(root, 'content', 'game-config.json');
const strict = process.argv.includes('--strict');
const errors = [];
const warnings = [];

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    errors.push(`Cannot read ${path.relative(root, filePath)}: ${error.message}`);
    return null;
  }
}

const items = readJson(contentPath);
const config = readJson(configPath);

if (!Array.isArray(items)) {
  errors.push('content/items.json must contain an array.');
}

if (items && items.length !== 10) {
  errors.push(`Expected 10 Advanced items, found ${items.length}.`);
}

const ids = new Set();
for (const [index, item] of (items ?? []).entries()) {
  const label = `items[${index}]`;
  if (!item || typeof item !== 'object') {
    errors.push(`${label} must be an object.`);
    continue;
  }
  if (!item.id || ids.has(item.id)) errors.push(`${label} has a missing or duplicate id.`);
  ids.add(item.id);
  for (const field of ['title', 'field', 'description', 'facts', 'source']) {
    if (!item[field] || typeof item[field] !== 'object') errors.push(`${label}.${field} is required.`);
  }
  for (const locale of ['th', 'en']) {
    for (const field of ['title', 'field', 'description']) {
      if (!item[field]?.[locale]) errors.push(`${label}.${field}.${locale} is required.`);
    }
    if (!Array.isArray(item.facts?.[locale]) || item.facts[locale].length === 0) {
      errors.push(`${label}.facts.${locale} must contain at least one fact.`);
    }
  }
  if (!/^\/assets\/.+/.test(item.image ?? '')) errors.push(`${label}.image must start with /assets/.`);
  else if (!fs.existsSync(path.join(root, 'public', item.image.slice(1)))) errors.push(`${label}.image file is missing: ${item.image}`);
  try {
    const url = new URL(item.source?.url);
    if (!['http:', 'https:'].includes(url.protocol)) errors.push(`${label}.source.url must use http or https.`);
  } catch {
    errors.push(`${label}.source.url is not a valid URL.`);
  }
  if (!item.imageCredit) errors.push(`${label}.imageCredit is required.`);
  if (!item.imageLicense) errors.push(`${label}.imageLicense is required.`);
  if (item.imageLicense === 'unverified') warnings.push(`${label} has an unverified image license.`);
}

const basicDifficulty = config?.difficulties?.basic;
const advancedDifficulty = config?.difficulties?.advanced;
const basicIds = basicDifficulty?.itemIds;
if (!Array.isArray(basicIds) || basicIds.length !== 6) errors.push('Basic difficulty must contain exactly 6 item IDs.');
if (Array.isArray(basicIds) && new Set(basicIds).size !== basicIds.length) errors.push('Basic difficulty contains duplicate item IDs.');
for (const id of basicIds ?? []) if (!ids.has(id)) errors.push(`Basic item ID is not in content/items.json: ${id}`);

function checkGrid(name, difficulty, expectedCards) {
  if (!difficulty || typeof difficulty !== 'object') {
    errors.push(`${name} difficulty configuration is required.`);
    return;
  }
  if (difficulty.cardCount !== expectedCards) errors.push(`${name} cardCount must be ${expectedCards}.`);
  if (difficulty.rows * difficulty.columns !== difficulty.cardCount) {
    errors.push(`${name} rows x columns must equal cardCount.`);
  }
}

checkGrid('Basic', basicDifficulty, 12);
checkGrid('Advanced', advancedDifficulty, 20);
if (items && advancedDifficulty?.cardCount !== items.length * 2) errors.push('Advanced cardCount must equal item count multiplied by 2.');

const scoring = config?.scoring;
const scoreParts = [scoring?.completion, scoring?.accuracy, scoring?.speed];
if (scoreParts.some((part) => typeof part !== 'number')) errors.push('Scoring completion, accuracy, and speed must be numbers.');
else if (scoreParts.reduce((total, part) => total + part, 0) !== scoring.total) errors.push('Scoring parts must add up to the configured total.');
if (scoring?.total !== 100) errors.push('Scoring total must be 100.');

for (const warning of warnings) console.warn(`Warning: ${warning}`);
if (errors.length) {
  for (const error of errors) console.error(`Error: ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Content validation passed: ${items.length} Advanced items, ${basicIds.length} Basic items.`);
  if (strict && warnings.length) {
    console.error('Strict validation failed because warnings are present.');
    process.exitCode = 1;
  }
}
