// Card 0: Serviço para integração com webhook n8n
const WEBHOOK_URL = 'https://marylee-slippery-chana.ngrok-free.dev/webhook/a199d56d-ec2e-445d-a942-94b61a09e437';

export interface WebhookPayload {
  action: 'enviar_mensagem' | 'assumir_chamado' | 'transferir_chamado';
  payload: Record<string, any>;
}

export const webhookService = {
  async sendRequest(payload: WebhookPayload) {
    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Webhook error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao chamar webhook:', error);
      throw error;
    }
  },

  async enviarMensagem(params: {
    conversation_id?: number;
    remetente_id: string;
    tipo_remetente: 'usuario' | 'tecnico';
    texto_mensagem: string;
  }) {
    return this.sendRequest({
      action: 'enviar_mensagem',
      payload: params,
    });
  },

  async assumirChamado(params: {
    conversation_id: number;
    tecnico_id: string;
  }) {
    return this.sendRequest({
      action: 'assumir_chamado',
      payload: params,
    });
  },

  async transferirChamado(params: {
    conversation_id: number;
    novo_tecnico_id: string;
  }) {
    return this.sendRequest({
      action: 'transferir_chamado',
      payload: params,
    });
  },
};
