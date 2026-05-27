import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const SUPABASE_URL     = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req: Request) => {
  // SendGrid Inbound Parse sends POST with multipart/form-data
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const formData = await req.formData();

    const to       = (formData.get('to') as string) ?? '';
    const from     = (formData.get('from') as string) ?? '';
    const subject  = (formData.get('subject') as string) ?? '';
    const text     = (formData.get('text') as string) ?? '';
    const html     = (formData.get('html') as string) ?? '';
    const envelope = (formData.get('envelope') as string) ?? '';
    const headers  = (formData.get('headers') as string) ?? '';

    // Extract inbound key from the "to" address
    // Format: key@inbound.bookablecrm.com or "Name <key@inbound.bookablecrm.com>"
    const toMatch = to.match(/([a-zA-Z0-9]+)@inbound\.bookablecrm\.com/i);
    if (!toMatch) {
      console.error('No inbound key found in to address:', to);
      return new Response('OK', { status: 200 }); // Don't retry
    }
    const inboundKey = toMatch[1];

    // Look up tenant by inbound_email_key
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const { data: tenantRow } = await supabase
      .from('tenants')
      .select('id')
      .eq('settings->>inbound_email_key', inboundKey)
      .maybeSingle();

    if (!tenantRow) {
      console.error('No tenant found for inbound key:', inboundKey);
      return new Response('OK', { status: 200 });
    }

    const tenantId = tenantRow.id;

    // Parse sender email from "from" field
    // Formats: "Name <email@example.com>" or "email@example.com"
    const emailMatch = from.match(/<([^>]+)>/) ?? from.match(/([^\s<]+@[^\s>]+)/);
    const senderEmail = emailMatch ? emailMatch[1].toLowerCase() : from.toLowerCase();
    const nameMatch = from.match(/^"?([^"<]+)"?\s*</);
    const senderName = nameMatch ? nameMatch[1].trim() : null;

    // Match sender to a contact
    const { data: contact } = await supabase
      .from('contacts')
      .select('id')
      .eq('tenant_id', tenantId)
      .ilike('email', senderEmail)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Extract Message-ID and In-Reply-To from email headers
    const messageIdMatch = headers.match(/^Message-ID:\s*(.+)$/mi);
    const inReplyToMatch = headers.match(/^In-Reply-To:\s*(.+)$/mi);
    const messageId  = messageIdMatch ? messageIdMatch[1].trim() : null;
    const inReplyTo  = inReplyToMatch ? inReplyToMatch[1].trim() : null;

    // Store the email
    const { data: emailRow } = await supabase
      .from('emails')
      .insert({
        tenant_id:   tenantId,
        contact_id:  contact?.id ?? null,
        direction:   'inbound',
        from_email:  senderEmail,
        from_name:   senderName,
        to_email:    to,
        to_name:     null,
        subject:     subject || null,
        body_text:   text || null,
        body_html:   html || null,
        message_id:  messageId,
        in_reply_to: inReplyTo,
        metadata:    { raw_from: from, envelope },
      })
      .select('id')
      .single();

    // Log activity if matched to a contact
    if (contact && emailRow) {
      await supabase.from('activities').insert({
        tenant_id:  tenantId,
        contact_id: contact.id,
        type:       'email',
        body:       `Email received: "${subject || '(no subject)'}"`,
        metadata:   { email_id: emailRow.id, direction: 'inbound' },
      });
    }

    return new Response('OK', { status: 200 });

  } catch (err) {
    console.error('inbound-email error:', err);
    return new Response('OK', { status: 200 }); // Always 200 to prevent SendGrid retries
  }
});
