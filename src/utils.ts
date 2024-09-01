import type { RESTPostAPIWebhookWithTokenJSONBody } from 'discord-api-types/v10';

export async function sendMessageToDiscord(
  webhookUrl: string,
  content: RESTPostAPIWebhookWithTokenJSONBody
): Promise<void> {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...content,
      }),
    });

    if (!response.ok) {
      console.error('Failed to send message to discord:', response.statusText);
    }
  } catch (error) {
    console.error('Error on request:', error);
  }
}
