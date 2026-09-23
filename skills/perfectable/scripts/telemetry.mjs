/**
 * Workbench Telemetry
 * 
 * Opt-in anonymous usage statistics for improving the skill.
 * No PII is collected. All data is aggregated and anonymous.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TELEMETRY_DIR = path.join(process.cwd(), '.perfectable', 'telemetry');
const TELEMETRY_FILE = path.join(TELEMETRY_DIR, 'telemetry.json');
const CONSENT_FILE = path.join(TELEMETRY_DIR, 'consent.json');

// Event types
export enum TelemetryEventType {
  DETECT_RUN = 'detect_run',
  CRITIQUE_RUN = 'critique_run',
  AUDIT_RUN = 'audit_run',
  INIT_RUN = 'init_run',
  DOCUMENT_RUN = 'document_run',
  HOOK_ENABLED = 'hook_enabled',
  HOOK_DISABLED = 'hook_disabled',
  PLATFORM_DETECTED = 'platform_detected',
  SHELL_DETECTED = 'shell_detected',
  FINDING_REPORTED = 'finding_reported',
  RULE_IGNORED = 'rule_ignored',
  FILE_IGNORED = 'file_ignored',
  ERROR_OCCURRED = 'error_occurred',
  COMMAND_RUN = 'command_run',
}

// Consent management
export function getConsent(): boolean {
  try {
    if (!fs.existsSync(CONSENT_FILE)) return false;
    const data = JSON.parse(fs.readFileSync(CONSENT_FILE, 'utf8'));
    return data.consent === true;
  } catch {
    return false;
  }
}

export function setConsent(consent: boolean): void {
  fs.mkdirSync(TELEMETRY_DIR, { recursive: true });
  fs.writeFileSync(CONSENT_FILE, JSON.stringify({ consent, timestamp: new Date().toISOString() }, null, 2));
}

export function promptForConsent(): boolean {
  // In a real implementation, this would show a prompt
  // For now, return false (opt-in required)
  return false;
}

// Event recording
interface TelemetryEvent {
  event: TelemetryEventType;
  timestamp: string;
  sessionId: string;
  platform?: string;
  shell?: string;
  command?: string;
  findingId?: string;
  ruleId?: string;
  fileCount?: number;
  findingCount?: number;
  durationMs?: number;
  error?: string;
  version: string;
}

let sessionId: string | null = null;

function getSessionId(): string {
  if (!sessionId) {
    // Generate anonymous session ID
    sessionId = crypto.randomBytes(16).toString('hex');
  }
  return sessionId;
}

export function recordEvent(event: Omit<TelemetryEvent, 'timestamp' | 'sessionId' | 'version'>): void {
  if (!getConsent()) return;
  
  try {
    const telemetryEvent: TelemetryEvent = {
      ...event,
      timestamp: new Date().toISOString(),
      sessionId: getSessionId(),
      version: '2.2.0',
    };
    
    // Append to telemetry file
    fs.mkdirSync(TELEMETRY_DIR, { recursive: true });
    
    let events: TelemetryEvent[] = [];
    if (fs.existsSync(TELEMETRY_FILE)) {
      try {
        events = JSON.parse(fs.readFileSync(TELEMETRY_FILE, 'utf8'));
      } catch {
        events = [];
      }
    }
    
    events.push(telemetryEvent);
    
    // Keep only last 1000 events
    if (events.length > 1000) {
      events = events.slice(-1000);
    }
    
    fs.writeFileSync(TELEMETRY_FILE, JSON.stringify(events, null, 2));
  } catch (error) {
    // Silently fail - telemetry should never break the main flow
  }
}

// Convenience functions
export function recordDetectRun(platform: string, shell: string, fileCount: number, findingCount: number, durationMs: number): void {
  recordEvent({
    event: TelemetryEventType.DETECT_RUN,
    platform,
    shell,
    fileCount,
    findingCount,
    durationMs,
  });
}

export function recordCritiqueRun(target: string, findingCount: number, durationMs: number): void {
  recordEvent({
    event: TelemetryEventType.CRITIQUE_RUN,
    command: 'critique',
    findingCount,
    durationMs,
  });
}

export function recordAuditRun(target: string, findingCount: number, durationMs: number): void {
  recordEvent({
    event: TelemetryEventType.AUDIT_RUN,
    command: 'audit',
    findingCount,
    durationMs,
  });
}

export function recordInitRun(platform: string, shell: string): void {
  recordEvent({
    event: TelemetryEventType.INIT_RUN,
    platform,
    shell,
  });
}

export function recordPlatformDetected(platform: string): void {
  recordEvent({
    event: TelemetryEventType.PLATFORM_DETECTED,
    platform,
  });
}

export function recordShellDetected(shell: string): void {
  recordEvent({
    event: TelemetryEventType.SHELL_DETECTED,
    shell,
  });
}

export function recordFindingReported(findingId: string, severity: string): void {
  recordEvent({
    event: TelemetryEventType.FINDING_REPORTED,
    findingId,
    // severity not in type but could be added
  });
}

export function recordRuleIgnored(ruleId: string): void {
  recordEvent({
    event: TelemetryEventType.RULE_IGNORED,
    ruleId,
  });
}

export function recordFileIgnored(pattern: string): void {
  recordEvent({
    event: TelemetryEventType.FILE_IGNORED,
    ruleId: pattern,
  });
}

export function recordError(error: Error, context?: string): void {
  recordEvent({
    event: TelemetryEventType.ERROR_OCCURRED,
    error: `${error.name}: ${error.message}${context ? ` (${context})` : ''}`,
  });
}

export function recordCommandRun(command: string, durationMs: number, success: boolean): void {
  recordEvent({
    event: TelemetryEventType.COMMAND_RUN,
    command,
    durationMs,
    // success not in type but could be added
  });
}

// Export telemetry data for user inspection
export function exportTelemetry(): string {
  if (!fs.existsSync(TELEMETRY_FILE)) return '[]';
  return fs.readFileSync(TELEMETRY_FILE, 'utf8');
}

// Clear telemetry data
export function clearTelemetry(): void {
  if (fs.existsSync(TELEMETRY_FILE)) {
    fs.unlinkSync(TELEMETRY_FILE);
  }
}

// CLI handler
const TELEMETRY_HELP = `
Usage: telemetry.mjs <command> [options]

Commands:
  status          Show telemetry consent status
  enable          Enable telemetry (opt-in)
  disable         Disable telemetry
  export          Export telemetry data as JSON
  clear           Clear all telemetry data
  help            Show this help

Telemetry is opt-in only. No data is collected without explicit consent.
Data is stored locally in .perfectable/telemetry/ and never sent externally.
`;

const [cmd, ...rest] = process.argv.slice(2);

if (!cmd || cmd === 'help' || cmd === '--help' || cmd === '-h') {
  process.stdout.write(TELEMETRY_HELP + '\n');
  process.exit(0);
}

import { getConsent, setConsent, exportTelemetry, clearTelemetry } from './telemetry.mjs';

if (cmd === 'status') {
  const consent = getConsent();
  process.stdout.write(`Telemetry: ${consent ? 'ENABLED' : 'DISABLED'}\n`);
  process.exit(0);
} else if (cmd === 'enable') {
  setConsent(true);
  process.stdout.write('Telemetry enabled. Thank you for helping improve Workbench!\n');
  process.exit(0);
} else if (cmd === 'disable') {
  setConsent(false);
  process.stdout.write('Telemetry disabled.\n');
  process.exit(0);
} else if (cmd === 'export') {
  const data = exportTelemetry();
  process.stdout.write(data + '\n');
  process.exit(0);
} else if (cmd === 'clear') {
  clearTelemetry();
  process.stdout.write('Telemetry data cleared.\n');
  process.exit(0);
} else {
  process.stderr.write(`Unknown command: ${cmd}\n\n${TELEMETRY_HELP}\n`);
  process.exit(1);
}