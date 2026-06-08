<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::factory(10)->create();

        $products = Product::all();

        foreach ($users as $user) {
            $orderCount = rand(1, 3);

            for ($i = 0; $i < $orderCount; $i++) {
                $itemsCount = rand(1, 4);
                $selectedProducts = $products->random($itemsCount);
                $subtotal = 0;
                $orderItems = [];

                foreach ($selectedProducts as $product) {
                    $quantity = rand(1, 3);
                    $itemSubtotal = $product->price * $quantity;
                    $subtotal += $itemSubtotal;

                    $orderItems[] = [
                        'product_id' => $product->id,
                        'product_name' => $product->name,
                        'product_price' => $product->price,
                        'quantity' => $quantity,
                        'subtotal' => $itemSubtotal,
                    ];
                }

                $statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
                $order = Order::create([
                    'order_number' => Order::generateOrderNumber(),
                    'user_id' => $user->id,
                    'customer_name' => $user->name,
                    'customer_phone' => '0' . rand(700000000, 799999999),
                    'customer_email' => $user->email,
                    'shipping_address' => fake()->address(),
                    'notes' => rand(0, 1) ? null : fake()->sentence(),
                    'subtotal' => $subtotal,
                    'total' => $subtotal,
                    'status' => $statuses[array_rand($statuses)],
                ]);

                foreach ($orderItems as $item) {
                    $order->items()->create($item);
                }
            }
        }
    }
}
