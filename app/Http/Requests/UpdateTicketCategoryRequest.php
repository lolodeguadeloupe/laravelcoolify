<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTicketCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->id === $this->route('event')->user_id;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'integer', 'min:0'],
            'quantity' => ['required', 'integer', 'min:'.$this->route('ticket_category')->quantity_sold],
            'max_per_order' => ['required', 'integer', 'min:1', 'max:100'],
            'sales_start_at' => ['nullable', 'date'],
            'sales_end_at' => ['nullable', 'date', 'after:sales_start_at'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Le nom est obligatoire.',
            'price.required' => 'Le prix est obligatoire.',
            'price.min' => 'Le prix ne peut pas être négatif.',
            'quantity.required' => 'La quantité est obligatoire.',
            'quantity.min' => 'La quantité ne peut pas être inférieure aux billets déjà vendus.',
            'max_per_order.required' => 'Le maximum par commande est obligatoire.',
            'sales_end_at.after' => 'La date de fin doit être après la date de début.',
        ];
    }
}
