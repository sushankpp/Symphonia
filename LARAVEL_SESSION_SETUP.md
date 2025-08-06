# Laravel Session-Based Authentication Setup

## 1. Update CORS Configuration

In your Laravel application, update `config/cors.php`:

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
    'supports_credentials' => true, // CRUCIAL for session cookies
];
```

## 2. Update Session Configuration

In `config/session.php`:

```php
'driver' => env('SESSION_DRIVER', 'database'),
'lifetime' => env('SESSION_LIFETIME', 120), // 2 hours
'expire_on_close' => false,
'encrypt' => false,
'files' => storage_path('framework/sessions'),
'connection' => env('SESSION_CONNECTION'),
'table' => 'sessions',
'store' => env('SESSION_STORE'),
'lottery' => [2, 100],
'cookie' => env(
    'SESSION_COOKIE',
    Str::slug(env('APP_NAME', 'laravel'), '_').'_session'
),
'path' => '/',
'domain' => null, // or your domain
'secure' => false, // set to true in production with HTTPS
'http_only' => true,
'same_site' => 'lax', // or 'none' if needed for cross-origin
```

## 3. Update Sanctum Configuration

In `config/sanctum.php`:

```php
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
    '%s%s',
    'localhost,localhost:3000,localhost:5173,127.0.0.1,127.0.0.1:8000,::1',
    env('APP_URL') ? ','.parse_url(env('APP_URL'), PHP_URL_HOST) : ''
))),
```

## 4. Environment Variables

Add to your `.env` file:

```env
SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_DOMAIN=localhost
SANCTUM_STATEFUL_DOMAINS=localhost:5173
```

## 5. Create Session Routes

In `routes/api.php`, add these session-based authentication routes:

```php
<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\SessionController;
use App\Http\Controllers\Auth\GoogleController;

// CSRF token route
Route::get('/sanctum/csrf-cookie', function () {
    return response()->json(['message' => 'CSRF cookie set']);
});

// Session-based authentication routes
Route::prefix('auth/session')->group(function () {
    Route::post('/login', [SessionController::class, 'login']);
    Route::post('/logout', [SessionController::class, 'logout']);
    Route::get('/check', [SessionController::class, 'check']);
    Route::get('/user', [SessionController::class, 'user']);
});

// Google OAuth routes
Route::prefix('auth')->group(function () {
    Route::get('/google', [GoogleController::class, 'redirect']);
    Route::get('/google/callback', [GoogleController::class, 'callback']);
});
```

## 6. Create Session Controller

Create `app/Http/Controllers/Auth/SessionController.php`:

```php
<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class SessionController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $credentials = $request->only('email', 'password');

        if (Auth::attempt($credentials, true)) {
            $user = Auth::user();
            
            // Generate access token for API calls
            $token = $user->createToken('auth-token')->plainTextToken;
            
            return response()->json([
                'user' => $user,
                'access_token' => $token,
                'message' => 'Login successful'
            ]);
        }

        return response()->json([
            'message' => 'Invalid credentials'
        ], 401);
    }

    public function logout(Request $request)
    {
        // Revoke token if present
        if ($request->bearerToken()) {
            $request->user()->currentAccessToken()->delete();
        }
        
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }

    public function check(Request $request)
    {
        $user = null;
        $authenticated = false;
        $accessToken = null;

        // Check if user is authenticated via session
        if (Auth::check()) {
            $user = Auth::user();
            $authenticated = true;
            
            // Generate new access token if needed
            $accessToken = $user->createToken('auth-token')->plainTextToken;
        }

        return response()->json([
            'authenticated' => $authenticated,
            'user' => $user,
            'access_token' => $accessToken
        ]);
    }

    public function user(Request $request)
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        return response()->json(Auth::user());
    }
}
```

## 7. Create Google OAuth Controller

Create `app/Http/Controllers/Auth/GoogleController.php`:

```php
<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class GoogleController extends Controller
{
    public function redirect(Request $request)
    {
        $redirectUri = $request->get('redirect_uri', config('app.url') . '/auth/callback');
        
        return Socialite::driver('google')
            ->redirectUrl($redirectUri)
            ->redirect();
    }

    public function callback(Request $request)
    {
        try {
            $redirectUri = $request->get('redirect_uri', config('app.url') . '/auth/callback');
            
            $googleUser = Socialite::driver('google')
                ->redirectUrl($redirectUri)
                ->user();

            // Find or create user
            $user = User::updateOrCreate([
                'email' => $googleUser->email,
            ], [
                'name' => $googleUser->name,
                'email' => $googleUser->email,
                'password' => Hash::make(Str::random(24)),
                'profile_picture' => $googleUser->avatar,
                'is_email_verified' => true,
                'role' => 'user',
                'status' => 'active',
            ]);

            // Log in the user
            Auth::login($user, true);

            // Generate access token
            $token = $user->createToken('auth-token')->plainTextToken;

            // Redirect back to frontend with token
            $frontendUrl = config('app.frontend_url', 'http://localhost:5173');
            $redirectUrl = $frontendUrl . '/auth/callback?access_token=' . $token;

            return redirect($redirectUrl);

        } catch (\Exception $e) {
            $frontendUrl = config('app.frontend_url', 'http://localhost:5173');
            $redirectUrl = $frontendUrl . '/auth/callback?error=' . urlencode($e->getMessage());
            
            return redirect($redirectUrl);
        }
    }
}
```

## 8. Update Middleware

In `bootstrap/app.php`:

```php
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

## 9. Update User Model

Ensure your `app/Models/User.php` has the necessary traits:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'profile_picture',
        'role',
        'is_email_verified',
        'gender',
        'dob',
        'phone',
        'bio',
        'address',
        'status',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'is_email_verified' => 'boolean',
    ];
}
```

## 10. Database Migrations

Create the sessions table migration:

```bash
php artisan session:table
php artisan migrate
```

## 11. Google OAuth Setup

1. Install Laravel Socialite:
```bash
composer require laravel/socialite
```

2. Add Google OAuth credentials to `.env`:
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback
```

3. Update `config/services.php`:
```php
'google' => [
    'client_id' => env('GOOGLE_CLIENT_ID'),
    'client_secret' => env('GOOGLE_CLIENT_SECRET'),
    'redirect' => env('GOOGLE_REDIRECT_URI'),
],
```

## 12. Testing the Setup

1. Start Laravel server: `php artisan serve`
2. Start frontend: `npm run dev`
3. Try logging in with Google OAuth
4. Check that sessions persist and access tokens are stored

## Key Points

- **Always use `credentials: 'include'`** in frontend requests
- **Session check returns 200 OK** for both logged in AND logged out users
- **Store access_token in localStorage** for API calls
- **Call checkAuthStatus() on app startup** to restore user session
- **Use session routes** (`/api/auth/session/*`) instead of token routes

## IMPORTANT: Session Check Response Format

The session check endpoint should return this format:

**For authenticated users:**
```json
{
  "authenticated": true,
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    // ... other user fields
  },
  "access_token": "1|abc123..."
}
```

**For unauthenticated users:**
```json
{
  "authenticated": false,
  "user": null,
  "access_token": null
}
```

This setup should resolve your Google OAuth session issues! 