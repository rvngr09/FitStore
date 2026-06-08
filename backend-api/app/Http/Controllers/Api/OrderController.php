<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    private function getUser()
    {
        return Auth::guard('sanctum')->user();
    }

    public function store(Request $request): JsonResponse
    {
        $rules = [
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'required|string|max:20',
            'customer_email' => 'nullable|email|max:255',
            'shipping_address' => 'required|string',
            'notes' => 'nullable|string|max:500',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ];

        if (!$this->getUser()) {
            $rules['session_id'] = 'required|string';
        }

        $validated = $request->validate($rules);

        return DB::transaction(function () use ($request, $validated) {
            $user = $this->getUser();
            $orderItems = [];
            $subtotal = 0;

            foreach ($validated['items'] as $item) {
                $product = Product::lockForUpdate()->findOrFail($item['product_id']);

                if ($product->stock < $item['quantity']) {
                    return response()->json([
                        'message' => "Insufficient stock for {$product->name}. Available: {$product->stock}",
                    ], 422);
                }

                $subtotalItem = $product->price * $item['quantity'];
                $subtotal += $subtotalItem;

                $orderItems[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'product_price' => $product->price,
                    'quantity' => $item['quantity'],
                    'subtotal' => $subtotalItem,
                ];

                $product->decrement('stock', $item['quantity']);
            }

            $order = Order::create([
                'order_number' => Order::generateOrderNumber(),
                'user_id' => $user?->id,
                'customer_name' => $validated['customer_name'],
                'customer_phone' => $validated['customer_phone'],
                'customer_email' => $validated['customer_email'],
                'shipping_address' => $validated['shipping_address'],
                'notes' => $validated['notes'],
                'subtotal' => $subtotal,
                'total' => $subtotal,
                'status' => 'pending',
            ]);

            $order->items()->createMany($orderItems);

            // Clear cart
            if ($user) {
                CartItem::byUser($user->id)->delete();
            } elseif ($validated['session_id'] ?? null) {
                CartItem::bySession($validated['session_id'])->delete();
            }

            return response()->json($order->load('items'), 201);
        });
    }

    public function index(Request $request): JsonResponse
    {
        $user = $this->getUser();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $orders = $user
            ->orders()
            ->with('items')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json($orders);
    }

    public function show(Request $request, Order $order): JsonResponse
    {
        $user = $this->getUser();

        if ($order->user_id !== $user?->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json($order->load('items'));
    }
}
