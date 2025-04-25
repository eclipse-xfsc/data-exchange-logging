# /api/callback

The DELS must send logging confirmation to the registered
callback to notify the Provider that the Consumer logged the
transaction.

Request must contain `Authorization` header set with a valid & signed `LogToken`.

```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJnYXgtZGNzOmxvZ0lEIjoiMjExNjUzNDktZTBiNy00NjYxLWFmYWYtNGE5ZWJmZGMwZGViIiwiZ2F4LWRjczpkYXRhVHJhbnNhY3Rpb25JRCI6IjEyMyIsImdheC1kY3M6Y29udHJhY3RJRCI6Imh0dHA6Ly9leGFtcGxlLm9yZy9kYXRhLWFzc2V0LTEiLCJpc3MiOiIoTG9nZ2luZyBzZXJ2aWNlIElEKSIsInN1YiI6IihQYXJ0aWNpcGFudCBJRCkiLCJhdWQiOiIoR1gtREVMUyBpZGVudGlmaWVyKSIsImV4cCI6MTY2MTI1NjQxMiwiaWF0IjoxNjYwODI0NDEyfQ.VkIlBY0Q2ArrR565PIR-u60XhRanUorN1ZYU9KDZQLE
```

## Create Callback

Method: POST

### Example

```
{
    "url":"https://webhook.site/2d6baba2-15e5-4114-8a3c-8e46dcd2e997",
    "method":"POST",
    "header":{
        "Authorization": "Bearer token"
    }
}
```

Response:

```
{
    "url": "https://webhook.site/2d6baba2-15e5-4114-8a3c-8e46dcd2e997",
    "method": "POST",
    "header": {
        "Authorization": "Bearer token"
    },
    "participantId": "did:provider:123",
    "contractId": "http://example.org/data-asset-1",
    "status": "ACTIVE",
    "headers": null,
    "id": "42d7aea4-db83-469d-8369-eeab94792153",
    "updatedAt": "2022-09-09T09:32:04.659Z",
    "createdAt": "2022-09-09T09:32:04.659Z"
}
```

## Disable callback

To disable a callback make a `DELETE` request to `https://{{host}}/api/callback/{{webhookId}}`

### Other methods

This endpoint support listing all registered callbacks aswell as retrieving single callbacks entities by making calls to `https://{{host}}/api/callback/` and `https://{{host}}/api/callback/{{webhookId}}` respectively.
