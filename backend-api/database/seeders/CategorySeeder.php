<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Supplements', 'slug' => 'supplements', 'description' => 'Protein, creatine, pre-workout, and more', 'sort_order' => 1],
            ['name' => 'Apparel', 'slug' => 'apparel', 'description' => 'Gym clothing and activewear', 'sort_order' => 2],
            ['name' => 'Equipment', 'slug' => 'equipment', 'description' => 'Dumbbells, bands, mats, and training gear', 'sort_order' => 3],
            ['name' => 'Accessories', 'slug' => 'accessories', 'description' => 'Gym bags, gloves, shakers, and more', 'sort_order' => 4],
            ['name' => 'Recovery', 'slug' => 'recovery', 'description' => 'Foam rollers, massage guns, stretching aids', 'sort_order' => 5],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
