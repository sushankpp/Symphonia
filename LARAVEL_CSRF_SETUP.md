# Laravel CSRF Configuration for Frontend

## 1. Update CORS Configuration

In your Laravel application, update the CORS configuration in `config/cors.php`:

```php
<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['http://localhost:5173'], // Your frontend URL
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true, // This is crucial for CSRF tokens
];
```

## 2. Update Session Configuration

In `config/session.php`, ensure your session configuration allows cross-origin requests:

```php
'domain' => null, // or your domain
'secure' => false, // set to true in production with HTTPS
'same_site' => 'lax', // or 'none' if needed for cross-origin
```

## 3. Update Sanctum Configuration

In `config/sanctum.php`, ensure the stateful domains include your frontend:

```php
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
    '%s%s',
    'localhost,localhost:3000,127.0.0.1,127.0.0.1:8000,::1',
    env('APP_URL') ? ','.parse_url(env('APP_URL'), PHP_URL_HOST) : ''
))),
```

## 4. Add Sanctum Routes

Make sure your `routes/api.php` includes the Sanctum CSRF route:

```php
// Add this at the top of your api.php file
Route::get('/sanctum/csrf-cookie', function () {
    return response()->json(['message' => 'CSRF cookie set']);
});
```

## 5. Update Middleware

In your `bootstrap/app.php` or `app/Http/Kernel.php`, ensure the web middleware group includes session handling:

```php
// In bootstrap/app.php
->withMiddleware(function (Middleware $middleware) {
    $middleware->web(append: [
        \Illuminate\Http\Middleware\HandleCors::class,
        \Illuminate\Session\Middleware\StartSession::class,
        \Illuminate\View\Middleware\ShareErrorsFromSession::class,
        \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
    ]);
    
    $middleware->api(append: [
        \Illuminate\Http\Middleware\HandleCors::class,
        \Illuminate\Session\Middleware\StartSession::class,
    ]);
})
```

## 6. Environment Variables

Add these to your `.env` file:

```env
SESSION_DRIVER=cookie
SESSION_LIFETIME=120
SESSION_DOMAIN=localhost
SANCTUM_STATEFUL_DOMAINS=localhost:5173
```

## 7. Test the Setup

1. Start your Laravel server: `php artisan serve`
2. Start your frontend: `npm run dev`
3. Try logging in - the CSRF token should now be properly handled

## Troubleshooting

If you still get CSRF errors:

1. Check browser developer tools -> Network tab to see if the `/sanctum/csrf-cookie` request is successful
2. Check browser developer tools -> Application tab -> Cookies to see if the `XSRF-TOKEN` cookie is set
3. Ensure your frontend is making requests to the correct Laravel URL
4. Verify that `credentials: 'include'` is set on all requests

## Common Issues

1. **CORS errors**: Make sure `supports_credentials` is `true` in CORS config
2. **Session not persisting**: Check session configuration and domain settings
3. **CSRF token not found**: Ensure the `/sanctum/csrf-cookie` endpoint is accessible 