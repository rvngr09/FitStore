<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CartController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $cartItems = $this->getCart($request);
        return response()->json($cartItems);
    }

    public function store(Request $request): JsonResponse
    {
        $rules = [
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1|max:99',
        ];

        if (!$this->getUser()) {
            $rules['session_id'] = 'required|string';
        }

        $validated = $request->validate($rules);

        $product = Product::findOrFail($validated['product_id']);

        if ($product->stock < $validated['quantity']) {
            return response()->json(['message' => 'Not enough stock available'], 422);
        }

        $identifier = $this->getIdentifier($request);

        $existing = CartItem::where($identifier)
            ->where('product_id', $validated['product_id'])
            ->first();

        if ($existing) {
            $newQty = $existing->quantity + $validated['quantity'];
            if ($product->stock < $newQty) {
                return response()->json(['message' => 'Not enough stock available'], 422);
            }
            $existing->update(['quantity' => $newQty]);
            $item = $existing;
        } else {
            $item = CartItem::create(array_merge($identifier, [
                'product_id' => $validated['product_id'],
                'quantity' => $validated['quantity'],
            ]));
        }

        return response()->json($item->load('product'), 201);
    }

    public function update(Request $request, CartItem $cartItem): JsonResponse
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:0|max:99',
        ]);

        $this->authorizeCartItem($request, $cartItem);

        if ($validated['quantity'] === 0) {
            $cartItem->delete();
            return response()->json(['message' => 'Item removed']);
        }

        $product = $cartItem->product;
        if ($product->stock < $validated['quantity']) {
            return response()->json(['message' => 'Not enough stock available'], 422);
        }

        $cartItem->update(['quantity' => $validated['quantity']]);
        return response()->json($cartItem->load('product'));
    }

    public function destroy(Request $request, CartItem $cartItem): JsonResponse
    {
        $this->authorizeCartItem($request, $cartItem);
        $cartItem->delete();
        return response()->json(['message' => 'Item removed']);
    }

    public function merge(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'session_id' => 'required|string',
        ]);

        $user = $this->getUser();
        $guestItems = CartItem::where('session_id', $validated['session_id'])->get();

        foreach ($guestItems as $guestItem) {
            $existing = CartItem::where('user_id', $user->id)
                ->where('product_id', $guestItem->product_id)
                ->first();

            if ($existing) {
                $existing->update(['quantity' => $existing->quantity + $guestItem->quantity]);
                $guestItem->delete();
            } else {
                $guestItem->update(['user_id' => $user->id, 'session_id' => null]);
            }
        }

        return response()->json(['message' => 'Cart merged successfully']);
    }

    public function count(Request $request): JsonResponse
    {
        $items = $this->getCart($request);
        $count = $items->sum('quantity');
        return response()->json(['count' => $count]);
    }

    private function getUser()
    {
        return Auth::guard('sanctum')->user();
    }

    private function getCart(Request $request)
    {
        $user = $this->getUser();

        if ($user) {
            return CartItem::byUser($user->id)->with('product.category')->get();
        }

        $sessionId = $request->header('X-Session-Id');
        if ($sessionId) {
            return CartItem::bySession($sessionId)->with('product.category')->get();
        }

        return collect();
    }

    private function getIdentifier(Request $request): array
    {
        $user = $this->getUser();

        if ($user) {
            return ['user_id' => $user->id];
        }
        return ['session_id' => $request->input('session_id')];
    }

    private function authorizeCartItem(Request $request, CartItem $cartItem): void
    {
        $user = $this->getUser();

        if ($user) {
            abort_if($cartItem->user_id !== $user->id, 403);
        } else {
            $sessionId = $request->header('X-Session-Id');
            abort_if(!$sessionId || $cartItem->session_id !== $sessionId, 403);
        }
    }
}
