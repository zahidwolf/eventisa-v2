# Payment architecture

## Provider pattern

```
paymentProviderFactory("sslcommerz" | "bkash" | "nagad" | "mock")
        ↓
IPaymentProvider
  ├── initializePayment()
  ├── verifyPayment()
  ├── refundPayment()
  ├── cancelPayment()
  └── queryPayment()
```

## Modes

| `PAYMENT_MODE` | Behavior |
|----------------|----------|
| `mock` | All charges route through `MockPaymentProvider` |
| `live` | Uses provider mapped to selected payment method |

## Feature flags

| Env | Effect |
|-----|--------|
| `ENABLE_SSL=true` | Card / SSLCommerz / banking methods enabled in UI |
| `ENABLE_BKASH=true` | bKash enabled |
| `ENABLE_NAGAD=true` | Nagad enabled |

## Adding SSLCommerz later

1. Set `SSLCOMMERZ_STORE_ID` and `SSLCOMMERZ_STORE_PASSWORD`
2. Implement API calls in `sslcommerz.provider.ts` (marked TODO)
3. Implement `POST /api/payments/webhook/sslcommerz`
4. Set `ENABLE_SSL=true` and `PAYMENT_MODE=live`

## Adding bKash later

1. Set `BKASH_APP_KEY`, `BKASH_SECRET`
2. Implement token + create + execute in `bkash.provider.ts`
3. Wire `POST /api/payments/webhook/bkash`
4. Set `ENABLE_BKASH=true`

## Mock flow (development)

1. `POST /api/payments/initialize` with `method: "mock"`
2. Wait 2s (frontend)
3. `POST /api/payments/mock/simulate` with `outcome: success`

No credentials required.
