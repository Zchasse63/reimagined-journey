import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

interface LeadData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company_name: string;
  business_type: string;
  location_count?: number;
  primary_interest?: string[];
  purchase_timeline?: string;
  source_city?: string;
  source_state?: string;
  lead_score?: number;
  created_at: string;
}

interface WebhookPayload {
  type: 'INSERT';
  table: 'leads';
  record: LeadData;
  schema: 'public';
}

const businessTypeLabels: Record<string, string> = {
  restaurant: 'Restaurant',
  food_truck: 'Food Truck',
  caterer: 'Caterer',
  institution: 'Institution',
  grocery: 'Grocery/Retail',
  ghost_kitchen: 'Ghost Kitchen',
  other: 'Other',
};

const timelineLabels: Record<string, string> = {
  immediate: 'Immediate (within 30 days)',
  '1-3mo': '1-3 Months',
  '3-6mo': '3-6 Months',
  exploring: 'Just Exploring',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload: WebhookPayload = await req.json();
    const lead = payload.record;

    // Skip if not an insert
    if (payload.type !== 'INSERT') {
      return new Response(JSON.stringify({ message: 'Ignored non-insert event' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const slackWebhook = Deno.env.get('SLACK_WEBHOOK_URL');
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const notificationEmail = Deno.env.get('NOTIFICATION_EMAIL') || 'leads@valuesource.com';

    const results: { slack?: boolean; email?: boolean } = {};

    // Send Slack notification
    if (slackWebhook) {
      const slackMessage = {
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: '🎯 New Lead Received!',
              emoji: true,
            },
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*Name:*\n${lead.first_name} ${lead.last_name}`,
              },
              {
                type: 'mrkdwn',
                text: `*Company:*\n${lead.company_name}`,
              },
              {
                type: 'mrkdwn',
                text: `*Business Type:*\n${businessTypeLabels[lead.business_type] || lead.business_type}`,
              },
              {
                type: 'mrkdwn',
                text: `*Locations:*\n${lead.location_count || 1}`,
              },
            ],
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*Email:*\n<mailto:${lead.email}|${lead.email}>`,
              },
              {
                type: 'mrkdwn',
                text: `*Phone:*\n${lead.phone || 'Not provided'}`,
              },
            ],
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*Timeline:*\n${timelineLabels[lead.purchase_timeline || ''] || 'Not specified'}`,
              },
              {
                type: 'mrkdwn',
                text: `*Lead Score:*\n${lead.lead_score || 0}/100`,
              },
            ],
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Interests:*\n${lead.primary_interest?.join(', ') || 'Not specified'}`,
            },
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: `📍 Source: ${lead.source_city ? `${lead.source_city}, ${lead.source_state}` : 'Homepage'} | ⏰ ${new Date(lead.created_at).toLocaleString('en-US', { timeZone: 'America/New_York' })} ET`,
              },
            ],
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'View in Supabase',
                  emoji: true,
                },
                url: `https://supabase.com/dashboard/project/vpgavbsmspcqhzkdbyly/editor/leads?filter=id:eq:${lead.id}`,
                action_id: 'view_lead',
              },
            ],
          },
        ],
      };

      const slackResponse = await fetch(slackWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slackMessage),
      });

      results.slack = slackResponse.ok;
    }

    // Send email notification via Resend
    if (resendApiKey) {
      const emailHtml = `
        <h2>New Lead from Value Source Website</h2>
        <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Name</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${lead.first_name} ${lead.last_name}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Company</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${lead.company_name}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Email</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;"><a href="mailto:${lead.email}">${lead.email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Phone</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${lead.phone || 'Not provided'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Business Type</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${businessTypeLabels[lead.business_type] || lead.business_type}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Locations</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${lead.location_count || 1}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Timeline</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${timelineLabels[lead.purchase_timeline || ''] || 'Not specified'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Interests</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${lead.primary_interest?.join(', ') || 'Not specified'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Source</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${lead.source_city ? `${lead.source_city}, ${lead.source_state}` : 'Homepage'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Lead Score</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${lead.lead_score || 0}/100</td>
          </tr>
        </table>
        <p style="margin-top: 20px;">
          <a href="https://supabase.com/dashboard/project/vpgavbsmspcqhzkdbyly/editor/leads?filter=id:eq:${lead.id}"
             style="background-color: #22c55e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
            View Lead in Dashboard
          </a>
        </p>
      `;

      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: 'Value Source <notifications@valuesource.com>',
          to: [notificationEmail],
          subject: `New Lead: ${lead.company_name} (${businessTypeLabels[lead.business_type] || lead.business_type})`,
          html: emailHtml,
        }),
      });

      results.email = emailResponse.ok;
    }

    return new Response(
      JSON.stringify({
        success: true,
        lead_id: lead.id,
        notifications: results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error processing lead notification:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to process notification' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
