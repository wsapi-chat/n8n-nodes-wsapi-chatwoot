import type {
	IWebhookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
} from 'n8n-workflow';

import { NodeConnectionType } from 'n8n-workflow';

export class WSAPIChatwootTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'WSAPI-Chatwoot Trigger',
		name: 'wsapiChatwootTrigger',
		icon: 'file:chatwoot.svg',
		group: ['trigger'],
		version: 1,
		description: 'Triggers on Chatwoot message_created events with outgoing message_type (agent → user messages)',
		defaults: { name: 'WSAPI-Chatwoot Trigger' },
		inputs: [],
		outputs: [NodeConnectionType.Main],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'chatwoot-bridge',
			},
		],
		properties: [
			{
				displayName: 'Require Secret Token',
				name: 'requireSecret',
				type: 'boolean',
				default: true,
				description: 'If enabled, the webhook requires a query param token that must match the Secret',
			},
			{
				displayName: 'Secret (Query Param)',
				name: 'secret',
				type: 'string',
				default: '',
				description: 'Chatwoot must call the webhook with ?token=THIS_VALUE',
				displayOptions: { show: { requireSecret: [true] } },
			},
		],
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const req = this.getRequestObject();
		const res = this.getResponseObject();

		const requireSecret = this.getNodeParameter('requireSecret', 0) as boolean;
		if (requireSecret) {
			const secret = (this.getNodeParameter('secret', 0) as string) || '';
			const token = (req.query.token as string) || '';
			if (!secret || token !== secret) {
				res.status(401).json({ error: 'invalid token' });
				return { noWebhookResponse: true };
			}
		}

		const body = this.getBodyData() as any;

		// Filter for specific events and conditions
		const event = body.event;
		const messageType = body.message_type;

		// Only process message_created events with outgoing message_type
		if (event === 'message_created' && messageType === 'outgoing') {
			// Emit the payload for matching events
			return {
				workflowData: [this.helpers.returnJsonArray([body])],
			};
		}

		// Return 200 OK for non-matching events without triggering workflow
		res.status(200).json({ message: 'Event received but not processed' });
		return { noWebhookResponse: true };
	}
}