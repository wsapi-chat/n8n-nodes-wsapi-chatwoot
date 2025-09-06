import { INodeType, INodeTypeData } from 'n8n-workflow';

import { WSAPIChatwoot } from './nodes/ChatwootBridge/WSAPIChatwoot.node';
import { WSAPIChatwootTrigger } from './nodes/ChatwootBridge/WSAPIChatwootTrigger.node';

export const nodes: INodeTypeData = {
	'@wsapi/wsapiChatwoot': {
		type: new WSAPIChatwoot(),
		sourcePath: '',
	},
	'@wsapi/wsapiChatwootTrigger': {
		type: new WSAPIChatwootTrigger(),
		sourcePath: '',
	},
};
