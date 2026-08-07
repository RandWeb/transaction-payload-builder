# قرارداد API مقصد

## Endpoint

- Method: `POST`
- URL: `${VITE_API_BASE_URL}${VITE_TRANSACTION_ENDPOINT}`
- مقدار پیش‌فرض نمونه: `http://ip/transaction`

## Headerها

```http
Content-Type: application/json
X-Request-Id: <uuid>
Authorization: Bearer <VITE_API_TOKEN>
```

`Authorization` فقط وقتی ارسال می‌شود که `VITE_API_TOKEN` مقدار داشته باشد.

## Body

Body همان Payload کددار است:

```json
{
  "mainTransaction": {
    "fraudMessageId": "FR1404021408102892052133",
    "sysName": "CORE",
    "businessId": "PASSARGAD",
    "attrsList": [
      {
        "951": "5",
        "952": "ATM",
        "996": "11000",
        "997": "31462543204"
      }
    ]
  }
}
```

## کدهای HTTP

- `200`: ارسال موفق
- `400`: خطای اعتبارسنجی ورودی
- `404`: مسیر یا منبع پیدا نشد
- `500`: خطای سرور

## پاسخ

فعلاً ساختار پاسخ قطعی اعلام نشده است؛ کلاینت پاسخ JSON را به‌صورت `unknown` نگه می‌دارد و با Zod/Result در مرز API مدیریت می‌کند.

## Timeout و Retry

- Timeout از `VITE_REQUEST_TIMEOUT_MS` خوانده می‌شود.
- Retry فقط برای خطای شبکه و پاسخ‌های `5xx` و حداکثر یک‌بار انجام می‌شود.
- خطاهای `4xx` retry نمی‌شوند.
