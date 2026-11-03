#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = 'C:\\Code\\lew42\\monorepo';

// Parse asks.jsonl
function parseAsks() {
  const asksPath = path.join(repoRoot, 'public/framework/ai/asks.jsonl');
  const content = fs.readFileSync(asksPath, 'utf8');
  const asks = {};

  content.split('\n').forEach(line => {
    if (!line.trim()) return;
    try {
      const obj = JSON.parse(line);
      if (obj.ask) {
        const ask = obj.ask;
        const id = ask.id || ask.title?.replace(/[^a-z0-9]+/g, '-').slice(0, 50);
        if (id) {
          if (!asks[id]) asks[id] = {};
          Object.assign(asks[id], ask);
        }
      }
    } catch (e) {}
  });

  return asks;
}

// Get week for a date
function getWeek(dateStr) {
  const date = new Date(dateStr);
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const diff = date - startOfYear;
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  const week = Math.floor(diff / oneWeek) + 1;
  return `${date.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

// Parse task folders
function parseTasks() {
  const aiDir = path.join(repoRoot, 'public/framework/ai');
  const tasks = {};

  // Recursively find task.jsonl files
  function walkDir(dir, depth = 0) {
    if (depth > 3) return; // Only go 3 levels deep
    try {
      const entries = fs.readdirSync(dir);
      for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        if (fs.statSync(fullPath).isDirectory()) {
          if (entry.startsWith('.')) continue;
          const taskFile = path.join(fullPath, 'task.jsonl');
          if (fs.existsSync(taskFile)) {
            const content = fs.readFileSync(taskFile, 'utf8');
            const lines = content.split('\n').filter(l => l.trim());
            if (lines.length > 0) {
              try {
                const first = JSON.parse(lines[0]);
                const taskId = first.task || entry;
                tasks[taskId] = {
                  folder: fullPath.replace(repoRoot, ''),
                  lines: lines.length,
                  launched: first.at,
                  landed: null,
                  status: 'building'
                };
                // Check for landed_at
                for (const taskLine of lines) {
                  try {
                    const obj = JSON.parse(taskLine);
                    if (obj.landed_at) {
                      tasks[taskId].landed = obj.landed_at;
                      tasks[taskId].status = 'landed';
                    }
                  } catch (e) {}
                }
              } catch (e) {}
            }
          }
          walkDir(fullPath, depth + 1);
        }
      }
    } catch (e) {}
  }

  walkDir(aiDir);
  return tasks;
}

// Main
const asks = parseAsks();
const tasks = parseTasks();

// Analyze asks by week
const byWeek = {};
const statusCounts = {};

Object.entries(asks).forEach(([id, ask]) => {
  const date = ask.at || ask.launched || '2026-09-30';
  const week = getWeek(date);

  if (!byWeek[week]) byWeek[week] = {
    landed: 0,
    building: 0,
    queued: 0,
    routed: 0,
    stalled: 0,
    dropped: 0,
    parked: 0,
    other: 0,
    asks: []
  };

  const status = ask.status || 'unknown';
  if (byWeek[week][status] !== undefined) {
    byWeek[week][status]++;
  } else {
    byWeek[week].other++;
  }

  byWeek[week].asks.push({
    id,
    title: ask.title,
    status,
    at: ask.at
  });
});

// Find unbuilt/stopped asks
const unbuilt = [];
Object.entries(asks).forEach(([id, ask]) => {
  if (['stalled', 'dropped', 'parked'].includes(ask.status)) {
    unbuilt.push({
      id,
      title: ask.title,
      status: ask.status,
      words: ask.words,
      why: ask.why,
      at: ask.at,
      owner: ask.owner
    });
  }
});

// Last week analysis
const today = new Date('2026-10-07');
const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
const lastWeekStart = getWeek(weekAgo);

let lastWeekStopped = 0;
Object.entries(asks).forEach(([id, ask]) => {
  if (ask.at && getWeek(ask.at) === lastWeekStart) {
    if (['stalled', 'stopped'].includes(ask.status)) {
      lastWeekStopped++;
    }
  }
});

const output = {
  analyzed_at: new Date().toISOString(),
  by_week: byWeek,
  unbuilt_or_stopped: unbuilt.slice(0, 20),
  summary: {
    total_asks: Object.keys(asks).length,
    landed: unbuilt.filter(a => a.status === 'landed').length,
    stopped_last_week: lastWeekStopped
  }
};

console.log(JSON.stringify(output, null, 2));
