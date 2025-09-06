import type {
	IExecuteFunctions,
	IHookFunctions,
	IWebhookFunctions,
	IHttpRequestOptions,
	IHttpRequestMethods,
} from 'n8n-workflow';

type ThisCtx = IExecuteFunctions | IHookFunctions | IWebhookFunctions;

export async function chatwootRequest(
	this: ThisCtx,
	method: IHttpRequestMethods,
	endpoint: string,
	body: any = {},
	qs: Record<string, any> = {},
	options: Partial<IHttpRequestOptions> = {},
) {
	const credentials = await this.getCredentials('chatwootApi');
	const requestOptions: IHttpRequestOptions = {
		method,
		url: endpoint,
		baseURL: (credentials as any).baseUrl as string,
		json: true,
		qs,
		body,
		...options,
	};

	return this.helpers.httpRequestWithAuthentication.call(this, 'chatwootApi', requestOptions);
}

export async function wsapiRequest(
	this: ThisCtx,
	method: IHttpRequestMethods,
	endpoint: string,
	body: any = {},
	qs: Record<string, any> = {},
	options: Partial<IHttpRequestOptions> = {},
) {
	const credentials = await this.getCredentials('WSApiApi');
	const requestOptions: IHttpRequestOptions = {
		method,
		url: endpoint,
		baseURL: (credentials as any).baseUrl as string,
		json: true,
		qs,
		body,
		...options,
	};

	return this.helpers.httpRequestWithAuthentication.call(this, 'WSApiApi', requestOptions);
}

export function normalizePhone(phone: string): string {
	// Remove all non-digits
	let normalized = phone.replace(/\D/g, '');
	
	// If it doesn't start with +, assume it needs country code
	if (!phone.startsWith('+')) {
		// If it starts with 54 (Argentina) but doesn't have the full prefix
		if (normalized.startsWith('54') && normalized.length === 12) {
			normalized = '+' + normalized;
		} else if (normalized.length === 10 && !normalized.startsWith('54')) {
			// Assume Argentina for 10-digit numbers
			normalized = '+54' + normalized;
		} else if (!normalized.startsWith('54')) {
			// Add + for international format
			normalized = '+' + normalized;
		} else {
			normalized = '+' + normalized;
		}
	} else {
		normalized = phone; // Already has +
	}
	
	return normalized;
}
