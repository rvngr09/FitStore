<?php

namespace App\Filament\Widgets;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class StatsOverviewWidget extends BaseWidget
{
    protected function getStats(): array
    {
        return [
            Stat::make('Total Products', Product::count())
                ->icon('heroicon-o-cube')
                ->description('Active: ' . Product::where('is_active', true)->count())
                ->descriptionIcon('heroicon-o-check-circle')
                ->color('success'),
            Stat::make('Total Orders', Order::count())
                ->icon('heroicon-o-shopping-bag')
                ->description('Revenue: $' . number_format(Order::whereIn('status', ['delivered', 'shipped', 'processing'])->sum('total'), 2))
                ->descriptionIcon('heroicon-o-currency-dollar')
                ->color('warning'),
            Stat::make('Total Users', User::count())
                ->icon('heroicon-o-users')
                ->description('Registered customers')
                ->descriptionIcon('heroicon-o-user-group')
                ->color('info'),
            Stat::make('Pending Orders', Order::where('status', 'pending')->count())
                ->icon('heroicon-o-clock')
                ->description('Awaiting confirmation')
                ->descriptionIcon('heroicon-o-exclamation-circle')
                ->color('danger'),
        ];
    }
}
