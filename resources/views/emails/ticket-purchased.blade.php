<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vos billets pour {{ $event->title }}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 32px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 32px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #6366f1;
        }
        h1 {
            color: #1a1a1a;
            font-size: 24px;
            margin-bottom: 8px;
        }
        .event-info {
            background-color: #f8fafc;
            border-radius: 8px;
            padding: 20px;
            margin: 24px 0;
        }
        .event-title {
            font-size: 20px;
            font-weight: bold;
            color: #1a1a1a;
            margin-bottom: 12px;
        }
        .event-details {
            color: #64748b;
            font-size: 14px;
        }
        .event-details p {
            margin: 4px 0;
        }
        .tickets-section {
            margin: 24px 0;
        }
        .ticket {
            border: 2px dashed #e2e8f0;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 16px;
            background-color: #fafafa;
        }
        .ticket-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
        }
        .ticket-category {
            font-weight: bold;
            color: #1a1a1a;
        }
        .ticket-id {
            font-size: 12px;
            color: #94a3b8;
        }
        .qr-placeholder {
            text-align: center;
            padding: 20px;
            background-color: #fff;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
        }
        .qr-code {
            font-family: monospace;
            font-size: 12px;
            word-break: break-all;
            color: #64748b;
        }
        .summary {
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
            margin-top: 24px;
        }
        .summary-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 14px;
        }
        .summary-total {
            font-size: 18px;
            font-weight: bold;
            border-top: 1px solid #e2e8f0;
            padding-top: 12px;
            margin-top: 12px;
        }
        .footer {
            text-align: center;
            margin-top: 32px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            color: #94a3b8;
            font-size: 12px;
        }
        .btn {
            display: inline-block;
            background-color: #6366f1;
            color: #ffffff;
            padding: 12px 24px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 500;
            margin-top: 16px;
        }
        .important {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 12px 16px;
            margin: 24px 0;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">Event Cool</div>
        </div>

        <h1>Confirmation de commande</h1>
        <p>Commande #{{ $order->reference }}</p>

        <div class="event-info">
            <div class="event-title">{{ $event->title }}</div>
            <div class="event-details">
                <p>{{ \Carbon\Carbon::parse($event->starts_at)->locale('fr')->isoFormat('dddd D MMMM YYYY [à] HH:mm') }}</p>
                <p>{{ $event->location }}, {{ $event->city }}</p>
            </div>
        </div>

        <div class="tickets-section">
            <h2>Vos billets ({{ $tickets->count() }})</h2>

            @foreach($tickets as $ticket)
            <div class="ticket">
                <div class="ticket-header">
                    <span class="ticket-category">{{ $ticket->ticketCategory->name }}</span>
                    <span class="ticket-id">{{ strtoupper(substr($ticket->uuid, 0, 8)) }}</span>
                </div>
                <div class="qr-placeholder">
                    <p style="margin: 0 0 8px; font-weight: 500;">Code QR</p>
                    <p class="qr-code">{{ $ticket->qr_code }}</p>
                </div>
            </div>
            @endforeach
        </div>

        <div class="important">
            <strong>Important :</strong> Présentez ce code QR à l'entrée de l'événement.
            Chaque billet ne peut être utilisé qu'une seule fois.
        </div>

        <div class="summary">
            <div class="summary-row">
                <span>Sous-total</span>
                <span>{{ number_format($order->total / 100, 2, ',', ' ') }} €</span>
            </div>
            <div class="summary-row">
                <span>Frais de service</span>
                <span>{{ number_format($order->fees / 100, 2, ',', ' ') }} €</span>
            </div>
            <div class="summary-row summary-total">
                <span>Total payé</span>
                <span>{{ number_format(($order->total + $order->fees) / 100, 2, ',', ' ') }} €</span>
            </div>
        </div>

        <div style="text-align: center;">
            <a href="{{ url('/events/' . $event->slug) }}" class="btn">Voir l'événement</a>
        </div>

        <div class="footer">
            <p>Merci d'avoir choisi Event Cool !</p>
            <p>Si vous avez des questions, contactez-nous à support@eventcool.fr</p>
            <p>&copy; {{ date('Y') }} Event Cool. Tous droits réservés.</p>
        </div>
    </div>
</body>
</html>
