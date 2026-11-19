<?php

namespace App\Http\Requests;

use App\Rules\IdadeExatamenteDezoitoAnos;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'role' => ['required', Rule::in(['admin', 'custom', 'municipe'])],
            'data_nascimento' => ['required_if:role,municipe', 'date', 'before:today', new IdadeExatamenteDezoitoAnos],
            'sexo' => ['required_if:role,municipe', 'in:M,F'],
        ];
    }

    public function messages(): array
    {
        return [
            'password.confirmed' => 'A confirmação da palavra-passe não coincide.',
            'email.unique' => 'Este email já está em uso no sistema.',
            'data_nascimento.required_if' => 'A data de nascimento é obrigatória para munícipes.',
            'sexo.required_if' => 'O sexo é obrigatório para munícipes.',
        ];
    }
}
