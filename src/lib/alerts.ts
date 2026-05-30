import nodemailer from 'nodemailer';
import prisma from './prisma';

export interface AlertPayload {
  type: 'DOWN' | 'DEGRADED' | 'CRON_MISSED' | 'RESOLVED';
  title: string;
  description: string;
  fields?: { name: string; value: string; inline?: boolean }[];
}

// 1. Send Discord Embedded Alert
export async function sendDiscordAlert(webhookUrl: string, payload: AlertPayload) {
  try {
    const color = payload.type === 'DOWN' || payload.type === 'CRON_MISSED'
      ? 0xFF0000 // Red
      : payload.type === 'RESOLVED'
      ? 0x00FF00 // Green
      : 0xFFAA00; // Orange for DEGRADED

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          title: payload.title,
          description: payload.description,
          color,
          fields: payload.fields || [],
          timestamp: new Date().toISOString(),
          footer: { text: 'Observo — Always Watching' }
        }]
      })
    });

    if (!res.ok) {
      console.error(`Discord Alert Webhook returned status ${res.status}`);
    }
  } catch (error) {
    console.error('Failed to send Discord alert:', error);
  }
}

// 2. Send Slack Block Alert
export async function sendSlackAlert(webhookUrl: string, payload: AlertPayload) {
  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: payload.title,
        blocks: [
          {
            type: 'header',
            text: { type: 'plain_text', text: payload.title }
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `${payload.description}\n\n${(payload.fields || [])
                .map((f) => `*${f.name}*: ${f.value}`)
                .join('\n')}`
            }
          }
        ]
      })
    });

    if (!res.ok) {
      console.error(`Slack Alert Webhook returned status ${res.status}`);
    }
  } catch (error) {
    console.error('Failed to send Slack alert:', error);
  }
}

// 3. Send Email Alert using Nodemailer SMTP
export async function sendEmailAlert(toEmail: string, payload: AlertPayload) {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT || '587';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || 'alerts@observo.dev';

  if (!host || !user || !pass) {
    console.warn('Skipping email alert: Nodemailer SMTP environment variables are not fully configured.');
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port: parseInt(port),
      secure: port === '465',
      auth: { user, pass },
    });

    const isError = payload.type === 'DOWN' || payload.type === 'CRON_MISSED' || payload.type === 'DEGRADED';
    const accentColor = isError ? '#FF6B6B' : '#4ADE80';

    const htmlContent = `
      <div style="font-family: monospace; border: 3px solid #000000; padding: 24px; max-width: 600px; background-color: #FFFFFF; box-shadow: 6px 6px 0px 0px rgba(0,0,0,1);">
        <div style="background-color: ${accentColor}; border-bottom: 3px solid #000000; padding: 12px; margin: -24px -24px 20px -24px; font-weight: bold; font-size: 16px; text-transform: uppercase;">
          ${payload.title}
        </div>
        <p style="font-size: 14px; line-height: 1.5; color: #000000;">
          ${payload.description}
        </p>
        ${
          payload.fields && payload.fields.length > 0
            ? `<div style="background-color: #F8FAFC; border: 2px solid #000000; padding: 12px; margin: 16px 0;">
                ${payload.fields
                  .map(
                    (f) => `
                  <div style="margin-bottom: 8px;">
                    <strong style="text-transform: uppercase; font-size: 11px; color: #64748B;">${f.name}</strong><br/>
                    <span style="font-size: 13px;">${f.value}</span>
                  </div>
                `
                  )
                  .join('')}
               </div>`
            : ''
        }
        <div style="font-size: 10px; color: #64748B; margin-top: 24px; text-align: center; border-t: 1px solid #E2E8F0; padding-top: 12px;">
          OBSERVO — ALWAYS WATCHING.
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"Observo Alerts" <${from}>`,
      to: toEmail,
      subject: `[${payload.type}] ${payload.title}`,
      html: htmlContent,
    });
  } catch (error) {
    console.error('Failed to send SMTP email alert:', error);
  }
}

// 4. Dispatch Alerts to all active alert channels for a user
export async function dispatchUserAlerts(userId: string, payload: AlertPayload) {
  try {
    const activeChannels = await prisma.alertChannel.findMany({
      where: { userId, isActive: true },
    });

    const tasks = activeChannels.map((channel) => {
      const config = channel.config as any;
      if (!config) return Promise.resolve();

      switch (channel.type) {
        case 'DISCORD':
          if (config.webhookUrl) {
            return sendDiscordAlert(config.webhookUrl, payload);
          }
          break;
        case 'SLACK':
          if (config.webhookUrl) {
            return sendSlackAlert(config.webhookUrl, payload);
          }
          break;
        case 'EMAIL':
          if (config.email) {
            return sendEmailAlert(config.email, payload);
          }
          break;
      }
      return Promise.resolve();
    });

    await Promise.all(tasks);
  } catch (error) {
    console.error(`Failed to dispatch alert notifications for user ${userId}:`, error);
  }
}
