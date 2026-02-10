import cron from 'node-cron';
import { lte, eq, and, isNotNull } from 'drizzle-orm';
import { db } from './db/index.js';
import { tasks } from './db/schema.js';

async function sendSlackNotification(task: typeof tasks.$inferSelect) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log(`[cron] SLACK_WEBHOOK_URL not set, skipping notification for task "${task.title}"`);
    return;
  }

  const dueStr = task.due_date ? ` (due: ${task.due_date.toISOString()})` : '';
  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: `🔔 Task reminder: *${task.title}*${dueStr}${task.description ? `\n${task.description}` : ''}`,
    }),
  });
}

async function checkReminders() {
  const now = new Date();
  const dueTasks = await db
    .select()
    .from(tasks)
    .where(
      and(
        eq(tasks.status, 'pending'),
        isNotNull(tasks.remind_at),
        lte(tasks.remind_at, now),
      )
    );

  if (dueTasks.length === 0) return;

  console.log(`[cron] ${dueTasks.length} task reminder(s) to send`);

  for (const task of dueTasks) {
    try {
      await sendSlackNotification(task);
      // Clear remind_at to avoid re-sending
      await db.update(tasks).set({ remind_at: null }).where(eq(tasks.id, task.id));
      console.log(`[cron] Sent reminder for task "${task.title}"`);
    } catch (err) {
      console.error(`[cron] Failed to send reminder for task "${task.title}":`, err);
    }
  }
}

export function startCron() {
  // Every 5 minutes
  cron.schedule('*/5 * * * *', () => {
    checkReminders().catch((err) => console.error('[cron] Error:', err));
  });
  console.log('[cron] Task reminder scheduler started (every 5 min)');
}
