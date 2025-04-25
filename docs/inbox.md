# /api/inbox

Request must contain `Authorization` header set with a valid & signed `LogToken`.

```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJnYXgtZGNzOmxvZ0lEIjoiMjExNjUzNDktZTBiNy00NjYxLWFmYWYtNGE5ZWJmZGMwZGViIiwiZ2F4LWRjczpkYXRhVHJhbnNhY3Rpb25JRCI6IjEyMyIsImdheC1kY3M6Y29udHJhY3RJRCI6Imh0dHA6Ly9leGFtcGxlLm9yZy9kYXRhLWFzc2V0LTEiLCJpc3MiOiIoTG9nZ2luZyBzZXJ2aWNlIElEKSIsInN1YiI6IihQYXJ0aWNpcGFudCBJRCkiLCJhdWQiOiIoR1gtREVMUyBpZGVudGlmaWVyKSIsImV4cCI6MTY2MTI1NjQxMiwiaWF0IjoxNjYwODI0NDEyfQ.VkIlBY0Q2ArrR565PIR-u60XhRanUorN1ZYU9KDZQLE
```

## Post Notification

Body must be a [Verifiable Credential](https://www.w3.org/TR/vc-data-model/)

### Example

```
{
    "@context": [
        "https://www.w3.org/2018/credentials/v1",
        {
            "@id": "https://gaia-dataexchange-notification.com/",
            "@context": {
                "@version": 1.1,
                "id": "@id",
                "type": "@type",
                "sender": {
                    "@id": "https://gaia-dataexchange-notification.com/vc#sender"
                },
                "receiver": {
                    "@id": "https://gaia-dataexchange-notification.com/vc#receiver"
                },
                "description": {
                    "@id": "https://gaia-dataexchange-notification.com/vc#description"
                },
                "contract": {
                    "@id": "https://gaia-dataexchange-notification.com/vc#contract"
                }
            }
        }
    ],
    "type": [
        "VerifiableCredential"
    ],
    "credentialSubject": {
        "sender": "did:provider:123",
        "receiver": "did:consumer:123",
        "description": "this is a demo description.",
        "contract": "http://example.org/data-asset-1",
        "type": "SendDataNotification"
    },
    "issuanceDate": "2021-01-23T12:21:23.876Z",
    "issuer": "did:provider:controller",
    "proof": {
        "type": "Ed25519Signature2018",
        "created": "2022-09-01T11:11:52Z",
        "verificationMethod": "did:provider:key:123",
        "proofPurpose": "assertionMethod",
        "jws": "eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..fVZNKzUmoyzoXEDGzmVdHs9wHFPXRov3nqu_5VEXw0xXwR6-jefhUVCC4ckZoXFLsysLvEwLlj7XFG84S55LBw"
    }
}
```

### List Notifications

Method: 'GET'

Supports paginators query params:

```
  page?: number;
  pageSize?: number;
  orderBy?: keyof E;
  orderDirection?: 'ASC' | 'DESC';
```

Returns list of notifications ids.
