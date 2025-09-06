import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IHttpRequestOptions,
} from 'n8n-workflow';

import { NodeConnectionType } from 'n8n-workflow';

import { chatwootRequest, normalizePhone } from './GenericFunctions';

export class WSAPIChatwoot implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'WSAPI-Chatwoot',
		name: 'wsapiChatwoot',
		icon: 'file:chatwoot.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
		description: 'Connect WSAPI with Chatwoot to create Bot Agents and much more',
		defaults: {
			name: 'WSAPI-Chatwoot',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{ name: 'chatwootApi', required: true },
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Messages',
						value: 'messages',
						description: 'Operations on messages',
					},
					{
						name: 'Conversations',
						value: 'conversations',
						description: 'Operations on conversations',
					},
				],
				default: 'messages',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['messages'],
					},
				},
				options: [
					{
						name: 'Insert Message',
						value: 'insertMessage',
						description: 'Create or reuse contact & conversation in Chatwoot and post a message',
					},
				],
				default: 'insertMessage',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['conversations'],
					},
				},
				options: [
					{
						name: 'Update Attributes',
						value: 'updateAttributes',
						description: 'Update custom attributes for a conversation',
					},
					{
						name: 'Update Label',
						value: 'updateLabel',
						description: 'Update labels for a conversation',
					},
				],
				default: 'updateAttributes',
			},
			{
				displayName: 'Chatwoot Inbox Identifier',
				name: 'inboxIdentifier',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['messages'],
						operation: ['insertMessage'],
					},
				},
				description: 'The API Channel inbox identifier from Chatwoot (not the numeric inbox ID)',
			},
			{
				displayName: 'Account ID',
				name: 'accountId',
				type: 'string',
				default: '1',
				required: true,
				displayOptions: {
					show: {
						resource: ['messages'],
						operation: ['insertMessage'],
					},
				},
				description: 'The Chatwoot account ID',
			},
			{
				displayName: 'Conversation Handling',
				name: 'conversationHandling',
				type: 'options',
				options: [
					{
						name: 'Smart Conversation Handling',
						value: 'smart',
						description: 'Use latest open conversation, or create new if none exists',
					},
					{
						name: 'Always Use Latest Conversation',
						value: 'latest',
						description: 'Always append to latest conversation regardless of status',
					},
				],
				default: 'smart',
				displayOptions: {
					show: {
						resource: ['messages'],
						operation: ['insertMessage'],
					},
				},
				description: 'How to handle conversations when inserting messages',
			},
			{
				displayName: 'Contact Name',
				name: 'contactName',
				type: 'string',
				default: '={{$json.sender.user}}',
				displayOptions: {
					show: {
						resource: ['messages'],
						operation: ['insertMessage'],
					},
				},
				description: 'Name to use for the contact in Chatwoot. Defaults to phone number from WSAPI payload.',
			},
			{
				displayName: 'Message Text',
				name: 'messageText',
				type: 'string',
				default: '={{$json.text}}',
				displayOptions: {
					show: {
						resource: ['messages'],
						operation: ['insertMessage'],
					},
				},
				description: 'Message text content. Defaults to text from WSAPI payload.',
			},
			{
				displayName: 'Phone Number',
				name: 'phoneNumber',
				type: 'string',
				default: '={{$json.sender.user}}',
				displayOptions: {
					show: {
						resource: ['messages'],
						operation: ['insertMessage'],
					},
				},
				description: 'Phone number to use as contact phone. Defaults to sender.user from WSAPI payload.',
			},
			{
				displayName: 'Chat ID',
				name: 'chatId',
				type: 'string',
				default: '={{$json.chatId}}',
				displayOptions: {
					show: {
						resource: ['messages'],
						operation: ['insertMessage'],
					},
				},
				description: 'Chat ID to use as contact identifier in Chatwoot. Defaults to chatId from WSAPI payload.',
			},
			{
				displayName: 'Message ID',
				name: 'messageId',
				type: 'string',
				default: '={{$json.id}}',
				displayOptions: {
					show: {
						resource: ['messages'],
						operation: ['insertMessage'],
					},
				},
				description: 'Message ID to use as echo_id for idempotency. Defaults to id from WSAPI payload.',
			},
			{
				displayName: 'Account ID',
				name: 'accountId',
				type: 'string',
				default: '1',
				required: true,
				displayOptions: {
					show: {
						resource: ['conversations'],
						operation: ['updateAttributes'],
					},
				},
				description: 'The Chatwoot account ID',
			},
			{
				displayName: 'Conversation ID',
				name: 'conversationId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['conversations'],
						operation: ['updateAttributes'],
					},
				},
				description: 'The ID of the conversation to update attributes for',
			},
			{
				displayName: 'Custom Attributes',
				name: 'customAttributes',
				type: 'json',
				default: '{}',
				required: true,
				displayOptions: {
					show: {
						resource: ['conversations'],
						operation: ['updateAttributes'],
					},
				},
				description: 'JSON object with custom attributes to set on the conversation. Example: {"order_id": "12345", "previous_conversation": "67890"}',
			},
			{
				displayName: 'Account ID',
				name: 'accountId',
				type: 'string',
				default: '1',
				required: true,
				displayOptions: {
					show: {
						resource: ['conversations'],
						operation: ['updateLabel'],
					},
				},
				description: 'The Chatwoot account ID',
			},
			{
				displayName: 'Conversation ID',
				name: 'conversationId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['conversations'],
						operation: ['updateLabel'],
					},
				},
				description: 'The ID of the conversation to update labels for',
			},
			{
				displayName: 'Labels',
				name: 'labels',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['conversations'],
						operation: ['updateLabel'],
					},
				},
				description: 'Comma-separated list of labels to update for the conversation. Example: "support,billing,urgent"',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		if (resource === 'messages' && operation === 'insertMessage') {
			const inboxIdentifier = this.getNodeParameter('inboxIdentifier', 0) as string;
			const accountId = this.getNodeParameter('accountId', 0) as string;
			const conversationHandling = this.getNodeParameter('conversationHandling', 0) as string;

			for (let i = 0; i < items.length; i++) {
				const item = items[i];
				const wsapiPayload = item.json;

				// Get parameters for this item
				const contactName = this.getNodeParameter('contactName', i) as string;
				const messageText = this.getNodeParameter('messageText', i) as string;
				const rawPhone = this.getNodeParameter('phoneNumber', i) as string;
				const chatId = this.getNodeParameter('chatId', i) as string;
				const messageId = this.getNodeParameter('messageId', i) as string;

				// Normalize phone (still used for contact phone_number field)
				const normalizedPhone = normalizePhone(rawPhone);

				// 1) Check if contact exists using Application API
				let contact;
				try {
					// Search for existing contact by chatId as identifier using Application API
					const searchResult = await chatwootRequest.call(this, 'GET', `/api/v1/accounts/${accountId}/contacts/search`, {}, { q: chatId });
					contact = searchResult?.payload?.find((c: any) => c.identifier === chatId);
				} catch (error) {
					// Contact doesn't exist, will create below
				}

				let conversationId: number;
				let conversationDetails: any = null;

				if (!contact) {
					// Contact doesn't exist - create contact and new conversation
					contact = await chatwootRequest.call(this, 'POST', `/public/api/v1/inboxes/${inboxIdentifier}/contacts`, {
						identifier: chatId,
						name: contactName,
						phone_number: normalizedPhone,
						custom_attributes: {},
					});

					const contactSourceId = contact?.source_id as string;
					if (!contactSourceId) {
						throw new Error('Failed to create contact in Chatwoot');
					}

					// Create new conversation for new contact using source_id
					const newConv = await chatwootRequest.call(this, 'POST', `/public/api/v1/inboxes/${inboxIdentifier}/contacts/${contactSourceId}/conversations`, {
						custom_attributes: {
							chat_id: chatId,
						},
					});
					conversationId = newConv?.id as number;
				} else {
					// Contact exists - get conversations using Application API
					const conversations = await chatwootRequest.call(this, 'GET', `/api/v1/accounts/${accountId}/contacts/${contact.id}/conversations`);

					// Access conversations.payload directly
					const conversationsList = conversations?.payload;

					if (!conversationsList || conversationsList.length === 0) {
						// No conversations exist - create new one
						const contactSourceId = contact.contact_inboxes?.[0]?.source_id;

						if (!contactSourceId) {
							throw new Error('Contact source_id not found');
						}

						const newConv = await chatwootRequest.call(this, 'POST', `/public/api/v1/inboxes/${inboxIdentifier}/contacts/${contactSourceId}/conversations`, {
							custom_attributes: {
								chat_id: chatId,
							},
						});
						conversationId = newConv?.id as number;
					} else {
						// Conversations exist - apply conversation handling logic
						if (conversationHandling === 'smart') {
							// Find latest open conversation, or create new if none open
							const openConversation = conversationsList.find((conv: any) => conv.status === 'open');

							if (openConversation) {
								conversationId = openConversation.id;
								conversationDetails = openConversation;
							} else {
								// No open conversations - create new one
								const contactSourceId = contact.contact_inboxes?.[0]?.source_id;

								if (!contactSourceId) {
									throw new Error('Contact source_id not found');
								}

								const newConv = await chatwootRequest.call(this, 'POST', `/public/api/v1/inboxes/${inboxIdentifier}/contacts/${contactSourceId}/conversations`, {
									custom_attributes: {
										chat_id: chatId,
									},
								});
								conversationId = newConv?.id as number;
							}
						} else {
							// Always use latest conversation (regardless of status)
							const latestConversation = conversationsList.sort((a: any, b: any) =>
								new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
							)[0];
							conversationId = latestConversation.id;
							conversationDetails = latestConversation;
						}
					}
				}

				// 2) Create message in conversation using Application API
				await chatwootRequest.call(this, 'POST', `/api/v1/accounts/${accountId}/conversations/${conversationId}/messages`, {
					content: messageText,
					echo_id: messageId,
					message_type: 'incoming',
				});

				// 3) If we don't have conversation details yet (new conversation created), fetch them
				if (!conversationDetails) {
					const convResponse = await chatwootRequest.call(this, 'GET', `/api/v1/accounts/${accountId}/conversations/${conversationId}`);
					conversationDetails = convResponse;
				}

				returnData.push({
					json: {
						accountId,
						contactId: contact?.id,
						conversationId,
						chatId,
						phone: normalizedPhone,
						contactName,
						messageText,
						messageId,
						message: 'processed',
						conversation: conversationDetails,
					},
				});
			}

			return [returnData];
		}

		if (resource === 'conversations' && operation === 'updateAttributes') {
			const accountId = this.getNodeParameter('accountId', 0) as string;

			for (let i = 0; i < items.length; i++) {
				const conversationId = this.getNodeParameter('conversationId', i) as string;
				const customAttributes = this.getNodeParameter('customAttributes', i) as string;

				// Parse the JSON string
				let parsedAttributes;
				try {
					parsedAttributes = JSON.parse(customAttributes);
				} catch (error) {
					throw new Error(`Invalid JSON in custom attributes: ${(error as Error).message}`);
				}

				// Update conversation custom attributes
				await chatwootRequest.call(this, 'POST', `/api/v1/accounts/${accountId}/conversations/${conversationId}/custom_attributes`, {
					custom_attributes: parsedAttributes,
				});

				returnData.push({
					json: {
						accountId,
						conversationId,
						customAttributes: parsedAttributes,
						message: 'attributes updated',
					},
				});
			}

			return [returnData];
		}

		if (resource === 'conversations' && operation === 'updateLabel') {
			const accountId = this.getNodeParameter('accountId', 0) as string;

			for (let i = 0; i < items.length; i++) {
				const conversationId = this.getNodeParameter('conversationId', i) as string;
				const labelsString = this.getNodeParameter('labels', i) as string;

				// Parse comma-separated labels into array
				const labelsArray = labelsString.split(',').map(label => label.trim()).filter(label => label);

				if (labelsArray.length === 0) {
					throw new Error('At least one label must be provided');
				}

				// Update labels to conversation
				await chatwootRequest.call(this, 'POST', `/api/v1/accounts/${accountId}/conversations/${conversationId}/labels`, {
					labels: labelsArray,
				});

				returnData.push({
					json: {
						accountId,
						conversationId,
						labels: labelsArray,
						message: 'labels updated',
					},
				});
			}

			return [returnData];
		}

		throw new Error(`The resource "${resource}" with operation "${operation}" is not supported!`);
	}
}