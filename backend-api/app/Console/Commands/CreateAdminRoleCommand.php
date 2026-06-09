<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

class CreateAdminRoleCommand extends Command
{
    protected $signature = 'admin:setup {--email=admin@example.com} {--password=password}';

    protected $description = 'Create admin role and assign to a user';

    public function handle(): int
    {
        $role = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);

        $email = $this->option('email');
        $password = $this->option('password');

        $user = User::firstOrCreate(
            ['email' => $email],
            [
                'uuid' => (string) Str::uuid(),
                'name' => 'Admin',
                'password' => bcrypt($password),
                'email_verified_at' => now(),
            ]
        );

        $user->assignRole('admin');

        $this->info("Admin role created and assigned to {$user->email}");

        return self::SUCCESS;
    }
}
