<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\TagController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::get('products', [ProductController::class, 'index']);
Route::get('products/{slug}', [ProductController::class, 'show']);
Route::get('categories', [CategoryController::class, 'index']);
Route::get('categories/{slug}', [CategoryController::class, 'show']);
Route::get('tags', [TagController::class, 'index']);

/*
|--------------------------------------------------------------------------
| Cart Routes (guest + auth)
|--------------------------------------------------------------------------
*/
Route::get('cart', [CartController::class, 'index']);
Route::post('cart', [CartController::class, 'store']);
Route::put('cart/{cartItem}', [CartController::class, 'update']);
Route::delete('cart/{cartItem}', [CartController::class, 'destroy']);
Route::get('cart/count', [CartController::class, 'count']);

/*
|--------------------------------------------------------------------------
| Guest Order (COD checkout)
|--------------------------------------------------------------------------
*/
Route::post('orders', [OrderController::class, 'store']);

/*
|--------------------------------------------------------------------------
| Auth Routes
|--------------------------------------------------------------------------
*/
Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('user', [AuthController::class, 'user']);
    Route::post('logout', [AuthController::class, 'logout']);
    Route::post('cart/merge', [CartController::class, 'merge']);
    Route::get('orders', [OrderController::class, 'index']);
    Route::get('orders/{order}', [OrderController::class, 'show']);
});

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
    Route::get('dashboard', [AdminController::class, 'dashboard']);

    Route::get('products', [AdminController::class, 'products']);
    Route::post('products', [AdminController::class, 'storeProduct']);
    Route::put('products/{product}', [AdminController::class, 'updateProduct']);
    Route::delete('products/{product}', [AdminController::class, 'destroyProduct']);

    Route::get('categories', [AdminController::class, 'categories']);
    Route::post('categories', [AdminController::class, 'storeCategory']);
    Route::put('categories/{category}', [AdminController::class, 'updateCategory']);
    Route::delete('categories/{category}', [AdminController::class, 'destroyCategory']);

    Route::get('tags', [AdminController::class, 'tags']);
    Route::post('tags', [AdminController::class, 'storeTag']);
    Route::put('tags/{tag}', [AdminController::class, 'updateTag']);
    Route::delete('tags/{tag}', [AdminController::class, 'destroyTag']);

    Route::get('orders', [AdminController::class, 'orders']);
    Route::get('orders/{order}', [AdminController::class, 'showOrder']);
    Route::put('orders/{order}/status', [AdminController::class, 'updateOrderStatus']);
});
