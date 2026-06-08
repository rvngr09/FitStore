<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            CategorySeeder::class,
            TagSeeder::class,
            ProductSeeder::class,
            UserSeeder::class,
        ]);

        $admin = User::create([
            'name' => 'Admin',
            'email' => 'admin@fitnesstemplate.com',
            'password' => bcrypt('admin2026'),
            'uuid' => (string) \Illuminate\Support\Str::uuid(),
        ]);
        $admin->assignRole('admin');
    }
}
