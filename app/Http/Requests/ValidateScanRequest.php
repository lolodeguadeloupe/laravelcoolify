<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ValidateScanRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Check if user is organizer of the event
        $eventId = $this->input('event_id');

        return $this->user()->events()->where('id', $eventId)->exists();
    }

    public function rules(): array
    {
        return [
            'qr_code' => ['required', 'string'],
            'event_id' => ['required', 'integer', 'exists:events,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'qr_code.required' => 'Le QR code est requis.',
            'event_id.required' => 'Veuillez sélectionner un événement.',
            'event_id.exists' => 'L\'événement sélectionné n\'existe pas.',
        ];
    }
}
