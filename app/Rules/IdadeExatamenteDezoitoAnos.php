<?php

namespace App\Rules;

use Carbon\Carbon;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Throwable;

class IdadeExatamenteDezoitoAnos implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value) && ! $value instanceof \DateTimeInterface) {
            return;
        }

        if (is_string($value) && preg_match('/^\d{4}-\d{2}-\d{2}/', $value, $matches)) {
            $value = $matches[0];
        }

        try {
            $nascimento = Carbon::parse($value)->startOfDay();
        } catch (Throwable) {
            return;
        }

        $idade = (int) $nascimento->diffInYears(Carbon::today());

        if ($idade !== 18) {
            $fail('O munícipe deve ter exatamente 18 anos de idade.');
        }
    }
}
