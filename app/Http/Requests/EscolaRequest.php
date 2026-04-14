<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EscolaRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'nome' => 'required|string|max:255',
            'email' => 'required|email|unique:escolas,email',
            'tipo' => 'required|integer',
            'localizacao' => 'required|string|max:255',
            'logo' => 'nullable|image|max:2048',
        ];
    }
}
