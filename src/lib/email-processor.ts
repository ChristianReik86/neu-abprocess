import { ImapFlow } from "imapflow";

export interface ParsedOrderConfirmation {
  subject: string;
  senderName: string;
  senderEmail: string;
  receivedAt: Date;
  orderNumber: string | null;
  amount: number | null;
  currency: string | null;
  rawContent: string;
  attachments: Array<{
    filename: string;
    contentType: string;
    size: number;
    data: Buffer;
  }>;
}

export async function fetchEmailsFromImap(config: {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  folder: string;
  since?: Date;
}): Promise<ParsedOrderConfirmation[]> {
  const client = new ImapFlow({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.username,
      pass: config.password,
    },
    logger: false,
  });

  const results: ParsedOrderConfirmation[] = [];

  await client.connect();

  const lock = await client.getMailboxLock(config.folder);
  try {
    const since = config.since || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const uids: number[] = (await client.search({ since } as any)) || [];

    if (uids.length > 0) {
      for await (const message of client.fetch(uids, {
        envelope: true,
        bodyStructure: true,
        source: true,
      })) {
        const parsed = parseEmailMessage(message);
        if (parsed) results.push(parsed);
      }
    }
  } finally {
    lock.release();
  }

  await client.logout();
  return results;
}

function parseEmailMessage(message: any): ParsedOrderConfirmation | null {
  try {
    const envelope = message.envelope;
    const subject = envelope.subject || "";
    const from = envelope.from?.[0];

    const orderNumberMatch = subject.match(
      /(?:AB|Auftragsbestätigung|Order Confirmation|Bestellung|Order)[:\s#-]*([A-Z0-9-/]+)/i
    );
    const orderNumber = orderNumberMatch?.[1] || null;

    const rawContent = message.source?.toString() || "";
    const amountMatch = rawContent.match(
      /(?:Gesamtbetrag|Gesamtsumme|Total|Betrag)[:\s]*([0-9.,]+)\s*(EUR|€|USD|\$)?/i
    );
    const amount = amountMatch ? parseFloat(amountMatch[1].replace(",", ".")) : null;
    const currency = amountMatch?.[2]?.replace("€", "EUR").replace("$", "USD") || "EUR";

    return {
      subject,
      senderName: from?.name || from?.address || "",
      senderEmail: from?.address || "",
      receivedAt: envelope.date || new Date(),
      orderNumber,
      amount,
      currency,
      rawContent,
      attachments: [],
    };
  } catch {
    return null;
  }
}
