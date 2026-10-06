# راهنمای توسعه و تغییرات

## اجرای بررسی‌های موجود

در ریشهٔ پروژه:

```bash
npm ci
npm run typecheck
npm run build
npm run format:check
dotnet build server/Sera.Api.csproj -c Release
```

`npm run build` ابتدا TypeScript را بررسی و سپس خروجی تولید Vite را در `dist/` می‌سازد. `dotnet build` پروژهٔ ASP.NET Core را کامپایل می‌کند. `format:check` فقط فایل‌های `src` را با Prettier بررسی می‌کند؛ مستندات Markdown و کد C# را فرمت نمی‌کند. CI فعلی ایمیج Docker را می‌سازد و منتشر می‌کند؛ مجموعهٔ تست خودکار واحد/یکپارچهٔ مستقل در مخزن تعریف نشده است.

برای بررسی Compose با مقادیر محیطی واقعی یا آزمایشی، بدون راه‌اندازی کانتینر:

```bash
docker compose -f docker-compose.yml config --quiet
docker compose -f docker-compose.yml config --services
docker compose -f docker-compose.prod.yml config --quiet
docker compose -f docker-compose.prod.yml config --services
```

هر دو فهرست سرویس باید فقط `app` را نشان دهند. برای بررسی عملی، کانتینر را در شبکهٔ آزمایشی با PostgreSQL مجزا اجرا و `/health`، `/api/venues` و `/api/menu/forno` را بررسی کنید؛ تست روی دیتابیس تولیدی، به‌دلیل ساخت schema و seed خودکار، مناسب نیست.

## اضافه کردن endpoint

1. قرارداد ورودی/خروجی را در `server/Models.cs` تعریف یا اصلاح کنید.
2. دسترسی داده را در `server/MenuStore.cs` با SQL پارامتری اضافه کنید.
3. route را در `server/Program.cs` ثبت کنید؛ برای عملیات مدیر، احراز هویت و هدر نوشتن موجود را رعایت کنید.
4. متد مربوط را در `src/lib/api.ts` و نوع آن را در `src/types/platform.ts` همگام کنید.
5. endpoint، نمونهٔ payload، وضعیت‌های خطا و نیاز احراز هویت را در [قرارداد API](api.md) ثبت کنید.

در endpointهای فعلی، C# JSON را با تنظیمات web و نام‌های camelCase مبادله می‌کند. آرایه‌های JSONB در `MenuStore` با `JsonDefaults.Options` سریال/دیسریال می‌شوند. SQL را با پارامتر بنویسید و مقدار کاربر را در رشتهٔ SQL نچسبانید.

## اضافه کردن فیلد به مکان یا آیتم

تغییر یک فیلد معمولاً چند نقطه را درگیر می‌کند: `schema.sql`، recordهای `Models.cs`، SQL و نگاشت reader در `MenuStore.cs`، اعتبارسنجی `Program.cs`، نوع‌های `src/types/platform.ts`، فرم پنل، نمایش عمومی و دادهٔ `seed.json`/تولیدکنندهٔ آن. چون `schema.sql` migration نسخه‌دار نیست، برای دیتابیس موجود migration جداگانه لازم است؛ فقط تغییر `CREATE TABLE IF NOT EXISTS` ستون موجود را اضافه نمی‌کند. سازگاری نسخهٔ جدید API با دادهٔ قدیمی را پیش از انتشار بررسی کنید.

## افزودن قالب ششم

قالب‌ها فعلاً مجموعه‌ای ثابت‌اند. این نقاط باید با هم تغییر کنند:

1. union نوع `Template` و `templateNames` در `src/types/platform.ts`.
2. آرایهٔ `/api/templates` و `Validation.Templates` در `server/Program.cs`.
3. قید `CHECK (template IN (...))` در `server/schema.sql` **به‌همراه migration برای دیتابیس موجود**.
4. selectorهای `theme-*`، رنگ‌ها، رسانه‌های واکنش‌گرا و در صورت نیاز اجزای UI در `src/platform.css` و صفحات.
5. نمونهٔ مکان، آیتم و تصاویر در `server/generate_seed.py`، `seed.json` و `public/images/` در صورت نیاز.
6. این مستندات و کنترل دستی صفحات مجموعه، منو، جزئیات و پنل.

انتخاب قالب در پنل فقط `venue.template` را ذخیره می‌کند. بنابراین پس از افزودن یک قالب، دادهٔ منو به‌خودی‌خود تغییر نمی‌کند. اگر قالب جدید ساختار دادهٔ متفاوتی بخواهد، مدل و API نیز باید توسعه یابند.

## تغییر دادهٔ نمونه

دادهٔ منبع در `server/generate_seed.py` نگه‌داری می‌شود. برای بازسازی JSON:

```bash
python server/generate_seed.py
```

خروجی باید پنج مکان و ۲۴ آیتم در وضعیت فعلی داشته باشد. تغییر `seed.json` فقط در دیتابیس **خالی** اثر می‌کند؛ روی دیتابیس دارای مکان import مجدد انجام نمی‌شود. برای منوی واقعی از پنل استفاده کنید و قیمت‌ها/آلرژن‌ها را جداگانه تأیید کنید. عکس‌ها باید در `public/images` وجود داشته باشند یا از پنل آپلود شوند.

## قرارداد فرانت‌اند

- درخواست‌ها از تابع `request` در `src/lib/api.ts` عبور می‌کنند؛ این تابع cookie هم‌مبدأ، JSON، هدر مدیریتی و تبدیل خطا به `Error` را مدیریت می‌کند.
- مسیرهای صفحه را `useRoute` و `RouteLink` مدیریت می‌کنند. اگر مسیر جدید می‌افزایید، رفتار refresh مستقیم را با SPA fallback تست کنید.
- `Venue` و `MenuItem` در `src/types/platform.ts` باید با JSON بک‌اند هماهنگ باشند.
- فیلتر دسته و متن فعلاً در `ExperiencePage` و سمت کلاینت است؛ برای حجم بالای داده به endpoint مناسب و صفحه‌بندی فکر کنید.
- CSS عمومی در `styles.css` و اجزای صفحه/قالب در `platform.css` است. حرکت تزئینی باید با `prefers-reduced-motion` سازگار بماند.

## چک‌لیست پیش از انتشار

- TypeScript و .NET بدون خطای build کامپایل شوند.
- `docker compose ... config --services` فقط `app` را نشان دهد؛ هیچ کانتینر دیتابیس تازه‌ای تعریف نشده باشد.
- اتصال به دیتابیس آزمایشی، schema و seed را بدون خطا انجام دهد.
- `/health`، مجموعه، منوی عمومی، پیش‌نمایش خصوصی و پنل بررسی شوند.
- ساخت/ویرایش مکان و آیتم، آپلود و خواندن عکس، ورود/خروج و وضعیت `published` بررسی شوند.
- برای تغییر schema، migration و برنامهٔ پشتیبان‌گیری آماده باشد.
- پس از انتشار GHCR، استقرار سرور واقعاً ایمیج جدید را pull کرده و کانتینر قدیمی کنار گذاشته شده باشد.
