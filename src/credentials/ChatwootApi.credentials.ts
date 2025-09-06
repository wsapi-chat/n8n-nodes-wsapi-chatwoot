import {
	ICredentialType,
	INodeProperties,
	IAuthenticateGeneric,
	ICredentialTestRequest,
} from 'n8n-workflow';

export class ChatwootApi implements ICredentialType {
	name = 'chatwootApi';
	displayName = 'Chatwoot API';
	documentationUrl = 'https://www.chatwoot.com/docs';

	properties: INodeProperties[] = [
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://app.chatwoot.com',
			required: true,
			placeholder: 'https://app.chatwoot.com',
			description: 'Your Chatwoot instance base URL',
		},
		{
			displayName: 'API Access Token',
			name: 'apiAccessToken',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Chatwoot personal API access token (header: api_access_token)',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'api_access_token': '={{$credentials.apiAccessToken}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/api/v1/profile',
		},
	};
}
