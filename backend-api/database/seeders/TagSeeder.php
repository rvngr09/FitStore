<?php

namespace Database\Seeders;

use App\Models\Tag;
use Illuminate\Database\Seeder;

class TagSeeder extends Seeder
{
    public function run(): void
    {
        $tags = [
            ['name' => 'New Arrival', 'slug' => 'new-arrival'],
            ['name' => 'Best Seller', 'slug' => 'best-seller'],
            ['name' => 'Sale', 'slug' => 'sale'],
            ['name' => 'Beginner Friendly', 'slug' => 'beginner-friendly'],
            ['name' => 'Pro Grade', 'slug' => 'pro-grade'],
            ['name' => 'Bundle Deal', 'slug' => 'bundle-deal'],
            ['name' => 'Limited Edition', 'slug' => 'limited-edition'],
        ];

        foreach ($tags as $tag) {
            Tag::create($tag);
        }
    }
}
