# قرارداد HTTP API

منبع این سند [endpointهای `Program.cs`](../server/Program.cs)، [مدل‌ها](../server/Models.cs) و [کلاینت فرانت‌اند](../src/lib/api.ts) است. مسیرهای API با `/api` شروع می‌شوند، بدنه و پاسخ معمولی JSON با نام فیلدهای `camelCase` هستند و همهٔ درخواست‌های UI به همان مبدأ صفحه فرستاده می‌شوند. نسخه‌بندی URL و مستندات Swagger/OpenAPI در پیاده‌سازی فعلی وجود ندارد.

## قواعد مشترک

| مورد                                   | رفتار                                                                                                         |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| احراز هویت پنل                         | cookie با نام `sera_admin`؛ پس از ورود درست صادر می‌شود                                                       |
| cookie                                 | `HttpOnly`، `SameSite=Strict`، عمر ۸ ساعت، `Secure` متناسب با HTTPS درخواست                                   |
| درخواست‌های تغییردهندهٔ `/api/admin/*` | هدر `X-Sera-Request: dashboard` لازم است؛ اگر هدر `Origin` ارسال شود، باید مبدأ آن با host درخواست برابر باشد |
| درخواست عمومی                          | بدون cookie و بدون هدر ادمین                                                                                  |
| `Content-Type` برای JSON               | `application/json`                                                                                            |
| آپلود                                  | `multipart/form-data` با فیلد `file`؛ `Content-Type` را client/browser همراه boundary می‌سازد                 |
| خطاهای سادهٔ اعتبارسنجی                | JSON با فیلد `error`                                                                                          |
| خطاهای دیگر                            | ممکن است بدنهٔ `ProblemDetails` یا بدنهٔ خالی داشته باشند                                                     |

قانون هدر سفارشی برای همهٔ متدهای غیر از `GET`، `HEAD` و `OPTIONS` زیر `/api/admin` اعمال می‌شود؛ **ورود** نیز شامل آن است. `src/lib/api.ts` این هدر را برای درخواست‌های تغییردهنده به‌صورت خودکار اضافه می‌کند. `POST /api/admin/logout` هم به cookie و هم به هدر نیاز دارد. درخواست‌هایی که هدر لازم یا `Origin` معتبر ندارند، `403` می‌گیرند. ورود ناموفق `401` است؛ اگر رمز ادمین تنظیم نشده یا کوتاه‌تر از ۱۲ کاراکتر باشد، ورود `503` می‌گیرد.

> نمونه‌های زیر با فرض HTTPS، دامنهٔ `menu.example.com` و cookie ذخیره‌شده در `cookies.txt` نوشته شده‌اند. مقدارهای نمونه را با دادهٔ خود عوض کنید. رمز و cookie را در مخزن یا خروجی عمومی قرار ندهید.

## فهرست کامل endpointها

| متد و مسیر                        | دسترسی       | کاربرد                               | پاسخ موفق                                                  |
| --------------------------------- | ------------ | ------------------------------------ | ---------------------------------------------------------- |
| `GET /health`                     | عمومی        | اعلام شروع و پاسخ‌دهی برنامه         | `200`، `{"status":"ok"}`                                   |
| `GET /api/templates`              | عمومی        | کلید پنج قالب مجاز                   | `200`، آرایهٔ رشته                                         |
| `GET /api/venues`                 | عمومی        | مکان‌های منتشرشده، مرتب بر اساس `id` | `200`، `Venue[]`                                           |
| `GET /api/menu/{venueId}`         | عمومی        | مکان منتشرشده و آیتم‌هایش            | `200`، `MenuResponse`؛ `404` برای شناسهٔ ناموجود/منتشرنشده |
| `GET /uploads/{file}`             | عمومی        | خواندن تصویر آپلودشده                | `200`، فایل؛ `404` اگر نام/فایل معتبر نباشد                |
| `POST /api/admin/login`           | هدر سفارشی   | ورود با رمز مدیر و صدور cookie       | `200`، `{"authenticated":true}`                            |
| `POST /api/admin/logout`          | cookie + هدر | پایان نشست و حذف cookie              | `204`                                                      |
| `GET /api/admin/session`          | cookie       | بررسی نشست                           | `200`، `{"authenticated":true}`؛ بدون نشست `401`           |
| `GET /api/admin/venues`           | cookie       | همهٔ مکان‌ها، شامل منتشرنشده‌ها      | `200`، `Venue[]`                                           |
| `GET /api/admin/menu/{venueId}`   | cookie       | مکان و آیتم‌ها برای مدیریت/پیش‌نمایش | `200`، `MenuResponse`؛ `404` اگر مکان نباشد                |
| `POST /api/admin/venues`          | cookie + هدر | ساخت مکان                            | `201`، `Venue` و `Location`                                |
| `PUT /api/admin/venues/{venueId}` | cookie + هدر | ذخیرهٔ مکان با ID ثابت               | `200`، `Venue`                                             |
| `POST /api/admin/items`           | cookie + هدر | افزودن آیتم؛ سرور UUID جدید می‌سازد  | `201`، `MenuItem` و `Location`                             |
| `PUT /api/admin/items/{id}`       | cookie + هدر | ذخیرهٔ آیتم با UUID ثابت             | `200`، `MenuItem`                                          |
| `DELETE /api/admin/items/{id}`    | cookie + هدر | حذف آیتم                             | `204`؛ شناسهٔ ناموجود `404`                                |
| `POST /api/admin/upload`          | cookie + هدر | آپلود عکس و گرفتن URL                | `200`، `{"url":"/uploads/..."}`                            |

فایل‌های `/images/...`، `/assets/...`، `/favicon.svg` و صفحات SPA نیز از `wwwroot` سرو می‌شوند؛ این‌ها endpoint داده‌ای API نیستند.

## مدل‌های JSON

### `Venue`

```json
{
  "id": "forno",
  "name": "FORNO",
  "tagline": "A little Naples, wherever you are.",
  "description": "Slow-fermented dough.",
  "location": "Napoli · Italy",
  "hours": "12:00 — 23:00",
  "currency": "EUR",
  "template": "pizzeria",
  "heroImage": "/images/pizza-margherita.webp",
  "published": true
}
```

`id` کلید مکان و بخش URL `/menu/{id}` است. مقدار `template` فقط یکی از `pizzeria`، `traditional`، `fastfood`، `cafe` و `gelato` است. `currency` یک کد سه‌حرفی بزرگ است که مرورگر برای قالب‌بندی قیمت با `Intl.NumberFormat` استفاده می‌کند. `heroImage` می‌تواند آدرس یکی از فایل‌های `/images/` یا `/uploads/` باشد.

### `MenuItem` و `Variant`

```json
{
  "id": "00000000-0000-0000-0000-000000000000",
  "venueId": "forno",
  "slug": "margherita",
  "category": "Classics",
  "name": "Margherita",
  "subtitle": "The original, beautifully simple",
  "description": "Tomato, cheese and fresh basil.",
  "image": "/images/pizza-margherita.webp",
  "ingredients": ["Tomato", "Fior di latte", "Basil"],
  "allergens": ["Wheat", "Milk"],
  "tags": ["Vegetarian", "Signature"],
  "variants": [
    { "label": "12 inch", "price": 14 },
    { "label": "16 inch", "price": 20 }
  ],
  "featured": true,
  "available": true,
  "sortOrder": 0
}
```

در `POST /api/admin/items` مقدار `id` ارسالی نادیده گرفته می‌شود و UUID جدید ساخته می‌شود؛ شیء همچنان باید مطابق record ورودی باشد. در `PUT`، UUID مسیر و بدنه باید یکسان باشند. `venueId` شناسهٔ مکان والد است، `slug` بخش URL `/dish/{venueId}/{slug}`، و `sortOrder` ترتیب نمایش داخل مکان را مشخص می‌کند. `available=false` آیتم را با برچسب «ناموجود» نگه می‌دارد؛ از منوی عمومی حذفش نمی‌کند.

### `MenuResponse`

```json
{
  "venue": { "id": "forno", "name": "FORNO", "...": "..." },
  "items": [{ "id": "...", "slug": "margherita", "...": "..." }]
}
```

دو نمونهٔ بالا شکل پاسخ را نشان می‌دهند؛ `"..."` و UUID صفر فقط جای‌نگهدارند و درخواست معتبر واقعی محسوب نمی‌شوند. فهرست دقیق فیلدها در `Models.cs` و `src/types/platform.ts` موجود است.

## عملیات عمومی

### `GET /api/templates`

آرایهٔ `['pizzeria','traditional','fastfood','cafe','gelato']` را در قالب JSON برمی‌گرداند. این فهرست در API ثابت است و با ساختن رکورد جدید در دیتابیس افزایش نمی‌یابد.

### `GET /api/venues`

تنها رکوردهای `published=true` را بر اساس `id` مرتب می‌کند. صفحهٔ مجموعه از همین endpoint استفاده می‌کند. UI بار دیگر بر اساس `published` فیلتر می‌کند، ولی منبع اصلی فیلتر سمت سرور است.

### `GET /api/menu/{venueId}`

اگر مکان منتشر شده باشد، `venue` و `items` آن بر اساس `sortOrder` و سپس `name` بازمی‌گردند. `available=false` هنوز در آرایه است. مکان ناموجود یا `published=false` پاسخ `404` می‌دهد. مثال:

```bash
curl -fsS https://menu.example.com/api/menu/forno
```

### `GET /uploads/{file}`

فقط نام‌هایی به شکل UUID بدون خط تیره (۳۲ نویسهٔ hex کوچک) با پسوند `webp`، `png` یا `jpg` پذیرفته می‌شوند. فایل موجود با MIME متناسب و پشتیبانی از Range برمی‌گردد. تصاویر نسخه‌بندی‌شدهٔ `/images/...` از همین endpoint نمی‌گذرند.

## ورود، نشست و خروج

ورود فقط رمز واحد `SERA_ADMIN_PASSWORD` را بررسی می‌کند. برای درخواست‌های دستی، هدر سفارشی الزامی است:

```bash
curl -i -c cookies.txt \
  -H 'Content-Type: application/json' \
  -H 'X-Sera-Request: dashboard' \
  -d '{"password":"YOUR_ADMIN_PASSWORD"}' \
  https://menu.example.com/api/admin/login

curl -b cookies.txt https://menu.example.com/api/admin/session

curl -i -b cookies.txt -H 'X-Sera-Request: dashboard' \
  -X POST https://menu.example.com/api/admin/logout
```

ورود با محدودکنندهٔ پنجرهٔ ثابت: حداکثر ۵ درخواست در هر دقیقه و صف صفر. بعد از ورود، مرورگر cookie را خودکار در درخواست‌های هم‌مبدأ می‌فرستد. API نقش یا نام کاربری مستقل ندارد؛ هر نشست موفق دسترسی مدیریت همهٔ مکان‌ها را می‌دهد.

رمز ادمین از متغیر محیطی خوانده می‌شود و در دیتابیس ذخیره نمی‌شود. بک‌اند برای مقایسه، SHA-256 رمز دریافتی و مقدار تنظیم‌شده را محاسبه و digestها را با مقایسهٔ زمان ثابت بررسی می‌کند. این سازوکار جایگزین مدیریت حساب‌های کاربری مستقل نیست.

## مدیریت مکان‌ها

- `GET /api/admin/venues` همهٔ مکان‌ها را نشان می‌دهد، حتی اگر منتشر نشده باشند.
- `GET /api/admin/menu/{venueId}` برای پنل و پیش‌نمایش است؛ منتشر نبودن مکان مانع آن نیست.
- `POST /api/admin/venues` بدنهٔ کامل `Venue` می‌خواهد. اگر `id` تکراری باشد `409` با `error` می‌دهد؛ در موفقیت `201` و header مکان منبع `/api/admin/menu/{id}` را برمی‌گرداند.
- `PUT /api/admin/venues/{venueId}` بدنهٔ کامل می‌خواهد و باید `venueId` مسیر با `id` بدنه برابر باشد؛ در غیر این صورت `400`. ذخیره‌سازی در لایهٔ داده `INSERT ... ON CONFLICT UPDATE` است؛ این route لزوماً وجود قبلی ID را بررسی نمی‌کند. تغییر `id` از پنل ممکن نیست.

نمونهٔ ساخت مکان:

```bash
curl -i -b cookies.txt \
  -H 'Content-Type: application/json' \
  -H 'X-Sera-Request: dashboard' \
  -d '{"id":"new-cafe","name":"New Cafe","tagline":"Fresh daily","description":"Coffee and bakery","location":"Tehran","hours":"08:00-22:00","currency":"EUR","template":"cafe","heroImage":"/images/cafe-cappuccino.webp","published":false}' \
  https://menu.example.com/api/admin/venues
```

## مدیریت آیتم‌ها

- `POST /api/admin/items`: بدنهٔ کامل `MenuItem`. مکان والد باید وجود داشته باشد؛ اگر نباشد `404`. آیتم با UUID جدید ذخیره و `201` برگردانده می‌شود. ترکیب تکراری `(venueId, slug)` نتیجهٔ `409` دارد.
- `PUT /api/admin/items/{id}`: UUID مسیر و بدنه باید یکی باشند (`400` در صورت اختلاف). کد ذخیره‌سازی از upsert استفاده می‌کند و در عمل برای UUID جدید نیز می‌تواند رکورد بسازد؛ از آن به‌عنوان «فقط ویرایش» با تضمین `404` استفاده نکنید. `slug` تکراری `409` می‌دهد.
- `DELETE /api/admin/items/{id}`: حذف مستقیم آیتم. اگر UUID یافت نشود `404` است. حذف فایل عکس مربوط به آیتم انجام نمی‌شود.

در پنل، آرایه‌های `ingredients`، `allergens` و `tags` با ورودی‌های جداشده با ویرگول و `variants` با ردیف‌های «برچسب + قیمت» ساخته می‌شوند.

یک نمونهٔ کامل برای ساخت آیتم در Bash:

```bash
cat > item.json <<'JSON'
{
  "id": "00000000-0000-0000-0000-000000000000",
  "venueId": "forno",
  "slug": "test-pizza",
  "category": "Seasonal",
  "name": "Test Pizza",
  "subtitle": "A temporary menu item",
  "description": "Example item for API integration.",
  "image": "/images/pizza-margherita.webp",
  "ingredients": ["Tomato", "Basil"],
  "allergens": ["Wheat"],
  "tags": ["Seasonal"],
  "variants": [{ "label": "Regular", "price": 14.5 }],
  "featured": false,
  "available": true,
  "sortOrder": 99
}
JSON

curl -i -b cookies.txt \
  -H 'Content-Type: application/json' \
  -H 'X-Sera-Request: dashboard' \
  --data @item.json \
  https://menu.example.com/api/admin/items
```

در پاسخ `201`، مقدار `id` ساخته‌شده توسط سرور را بردارید. برای ویرایش، همان شیء کامل را با `id` واقعی و تغییرات مدنظر با `PUT /api/admin/items/{id}` بفرستید. برای حذف:

```bash
curl -i -b cookies.txt -H 'X-Sera-Request: dashboard' \
  -X DELETE https://menu.example.com/api/admin/items/REAL_ITEM_UUID
```

برای ویرایش مکان، بدنهٔ کامل `Venue` را با `PUT /api/admin/venues/{venueId}` بفرستید و `id` بدنه را با بخش انتهایی URL یکسان نگه دارید. `POST` و `PUT` جایگزین‌کردن جزئی یک فیلد (PATCH) نیستند.

## آپلود تصویر

```bash
curl -i -b cookies.txt \
  -H 'X-Sera-Request: dashboard' \
  -F 'file=@menu-photo.webp' \
  https://menu.example.com/api/admin/upload
```

فایل باید بیش از صفر و حداکثر **۱۰٬۰۰۰٬۰۰۰ بایت** باشد. بک‌اند با امضای ابتدایی فایل، WebP، PNG یا JPEG را می‌پذیرد؛ نام client را ذخیره نمی‌کند و نام تصادفی به فایل می‌دهد. پاسخ نمونه `{"url":"/uploads/abcdef...webp"}` است. درخواست بیش از سقف کلی Kestrel (۱۲ MiB) ممکن است پیش از رسیدن به اعتبارسنجی endpoint رد شود. volume `/app/uploads` را پایدار نگه دارید. endpoint حذف فایل آپلودی وجود ندارد.

## اعتبارسنجی و وضعیت‌های مهم

| ورودی                                               | قاعدهٔ اصلی                                               |
| --------------------------------------------------- | --------------------------------------------------------- |
| `Venue.id`                                          | حروف کوچک انگلیسی، رقم یا `-`؛ طول ۲ تا ۵۰                |
| `Venue.name`                                        | طول ۱ تا ۱۰۰                                              |
| `Venue.tagline`, `description`, `location`, `hours` | به‌ترتیب حداکثر ۲۰۰، ۲۰۰۰، ۲۰۰ و ۱۰۰                      |
| `Venue.currency`                                    | دقیقاً سه حرف بزرگ انگلیسی                                |
| `Venue.template`                                    | یکی از پنج کلید ثابت                                      |
| `Venue.heroImage`                                   | حداکثر ۵۰۰ نویسه؛ سمت سرور محدود به دامنهٔ خاصی نشده است  |
| `MenuItem.slug`                                     | حروف کوچک انگلیسی، رقم یا `-`؛ طول ۲ تا ۸۰                |
| `MenuItem.venueId`                                  | همان الگوی ID مکان، طول ۲ تا ۵۰                           |
| `MenuItem.name`, `category`                         | به‌ترتیب طول ۱ تا ۱۲۰ و ۱ تا ۸۰                           |
| `subtitle`, `description`, `image`                  | به‌ترتیب حداکثر ۲۰۰، ۲۰۰۰ و ۵۰۰                           |
| `ingredients`, `allergens`, `tags`                  | حداکثر ۳۰، ۲۰ و ۲۰ عضو؛ هر عضو ۱ تا ۱۰۰ نویسه             |
| `variants`                                          | ۱ تا ۱۰ عضو؛ برچسب ۱ تا ۵۰ نویسه و قیمت بین ۰ و ۱٬۰۰۰٬۰۰۰ |

اعتبارسنجی اصلی در `Validation` انتهای `Program.cs` است. نوع‌ها و قیدهای دیتابیس نیز جداگانه اعمال می‌شوند. برای ورودی نامعتبر `400` همراه `error`، برای cookie نامعتبر `401`، برای هدر/Origin نامعتبر `403`، برای منبع ناموجود `404` و برای تعارض slug/ID طبق موارد بالا `409` دریافت می‌شود. همهٔ خطاهای دیتابیس به پاسخ کاربردی اختصاصی تبدیل نشده‌اند؛ لاگ سرور را برای خطاهای داخلی بررسی کنید.
