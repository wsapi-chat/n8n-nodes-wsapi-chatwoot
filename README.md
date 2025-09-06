# n8n Nodes - WSAPI - Chatwoot integration

> Community nodes that bridge **Chatwoot** API channels with your WSAPI messaging instance.  
> Includes two nodes:
>
> 1. **WSAPI-Chatwoot** — Action node with operations for messages and conversations in Chatwoot
> 2. **WSAPI-Chatwoot Trigger** — Webhook trigger for receiving agent messages from Chatwoot

## Prerequisites

This integration requires the WSAPI n8n node package to be installed first, as it depends on the WSAPI API credentials defined in that package.

## Install (self-hosted n8n)

1. Ensure community nodes are allowed: set env `N8N_ENABLE_COMMUNITY_NODES=true`.
2. Publish this package to npm (or install from a local build). Typical flow:
   ```bash
   npm version patch
   npm publish --access public   # requires npm account
   ```
3. In n8n UI → **Settings → Community Nodes → Install**, search `@wsapichat/n8n-nodes-wsapi-chatwoot` and install.

### Local dev without publishing
- Build the package: `npm i && npm run build`
- Copy the folder into your host and point n8n to it with `N8N_CUSTOM_EXTENSIONS=/data/custom`
- Place the compiled `dist/` there with `package.json` and restart n8n.

## Credentials
Create **Chatwoot API** credentials with:
- **Base URL**: e.g. `https://app.chatwoot.com` (or your self-hosted URL)
- **API Access Token**: Your personal API access token (Profile → Access Token)

## Node: WSAPI-Chatwoot

Action node with resource-based operations for managing Chatwoot messages and conversations.

### Messages Resource

#### Insert Message
Creates or reuses a contact and conversation in Chatwoot and posts a message.

**Parameters**:
- **Inbox Identifier**: API Channel's `inbox_identifier` (not numeric inbox ID)
- **Account ID**: Chatwoot account ID (default: "1")
- **Conversation Handling**: 
  - `Smart`: Use latest open conversation, or create new if none exists
  - `Latest`: Always use most recent conversation regardless of status
- **Contact Name**: Contact name (defaults to WSAPI sender.user)
- **Message Text**: Message content (defaults to WSAPI text)
- **Phone Number**: Contact phone (defaults to WSAPI sender.user)
- **Chat ID**: Contact identifier (defaults to WSAPI chatId)
- **Message ID**: Message ID for idempotency (defaults to WSAPI id)

**Output**: Account ID, contact ID, conversation ID, chat ID, phone, contact name, message text, message ID, and full conversation details.

### Conversations Resource

#### Update Attributes
Updates custom attributes for an existing conversation.

**Parameters**:
- **Account ID**: Chatwoot account ID
- **Conversation ID**: Conversation ID to update
- **Custom Attributes**: JSON object (e.g., `{"order_id": "12345"}`)

#### Update Label
Updates labels for an existing conversation.

**Parameters**:
- **Account ID**: Chatwoot account ID
- **Conversation ID**: Conversation ID to update
- **Labels**: Comma-separated labels (e.g., "support,billing,urgent")

## Node: WSAPI-Chatwoot Trigger

Webhook trigger that receives agent messages from Chatwoot API Channel callbacks. Only processes `message_created` events with `outgoing` message type (agent → user messages).

**Setup**:
1. Add this node and copy the webhook URL from n8n
2. In Chatwoot → API Inbox Settings → set **Callback URL** to the webhook URL
3. Configure optional **Secret Token** for security (webhook called with `?token=YOUR_SECRET`)

**Output**: Emits Chatwoot message payload when agent sends outgoing messages. Non-matching events return 200 OK without triggering workflow.

## Example Workflows

**Outbound (WSAPI → Chatwoot)**:
```
Webhook → WSAPI-Chatwoot (Insert Message) → Optional data storage
```

**Inbound (Chatwoot → WSAPI)**:
```
WSAPI-Chatwoot Trigger → HTTP Request (POST to WSAPI /messages/send)
```

## License
MIT
