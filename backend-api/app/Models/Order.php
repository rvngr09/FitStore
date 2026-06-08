<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Order extends Model
{
    protected $fillable = [
        'order_number', 'user_id', 'customer_name', 'customer_phone',
        'customer_email', 'shipping_address', 'notes', 'subtotal',
        'total', 'status'
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public static function generateOrderNumber(): string
    {
        $prefix = 'FT';
        $date = now()->format('Ymd');
        $last = self::whereDate('created_at', today())->count();
        return $prefix . $date . str_pad($last + 1, 4, '0', STR_PAD_LEFT);
    }
}
