<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Billet - {{ $event->title }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 12px;
            color: #333;
            padding: 20px;
        }
        .ticket {
            border: 2px solid #333;
            border-radius: 8px;
            overflow: hidden;
            max-width: 600px;
            margin: 0 auto;
        }
        .header {
            background: #6366f1;
            color: white;
            padding: 20px;
            text-align: center;
        }
        .header h1 {
            font-size: 24px;
            margin-bottom: 5px;
        }
        .header p {
            font-size: 14px;
            opacity: 0.9;
        }
        .content {
            padding: 20px;
        }
        .event-info {
            margin-bottom: 20px;
        }
        .event-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .event-details {
            color: #666;
            line-height: 1.6;
        }
        .qr-section {
            text-align: center;
            padding: 20px;
            border: 1px dashed #ccc;
            margin: 20px 0;
            background: #f9f9f9;
        }
        .qr-code {
            font-family: monospace;
            font-size: 10px;
            word-break: break-all;
            color: #666;
            margin-top: 10px;
        }
        .qr-label {
            font-weight: bold;
            margin-bottom: 10px;
            font-size: 14px;
        }
        .ticket-info {
            display: table;
            width: 100%;
            border-top: 1px solid #eee;
            padding-top: 15px;
        }
        .ticket-info-row {
            display: table-row;
        }
        .ticket-info-label {
            display: table-cell;
            color: #666;
            padding: 5px 0;
            width: 40%;
        }
        .ticket-info-value {
            display: table-cell;
            font-weight: bold;
            padding: 5px 0;
        }
        .footer {
            background: #f5f5f5;
            padding: 15px 20px;
            text-align: center;
            font-size: 10px;
            color: #666;
        }
        .status-valid {
            color: #16a34a;
            font-weight: bold;
        }
        .status-used {
            color: #6b7280;
            font-weight: bold;
        }
        .status-cancelled {
            color: #dc2626;
            font-weight: bold;
        }
        .important {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 10px 15px;
            margin-top: 20px;
            font-size: 11px;
        }
    </style>
</head>
<body>
    <div class="ticket">
        <div class="header">
            <h1>Event Cool</h1>
            <p>Billet d'entrée</p>
        </div>

        <div class="content">
            <div class="event-info">
                <div class="event-title">{{ $event->title }}</div>
                <div class="event-details">
                    <p>{{ \Carbon\Carbon::parse($event->starts_at)->locale('fr')->isoFormat('dddd D MMMM YYYY [à] HH:mm') }}</p>
                    <p>{{ $event->location }}, {{ $event->city }}</p>
                    @if($event->address)
                        <p>{{ $event->address }}</p>
                    @endif
                </div>
            </div>

            <div class="qr-section">
                <div class="qr-label">Code d'entrée</div>
                <div style="margin: 15px auto; padding: 15px; background: white; border: 2px solid #333; font-family: monospace; font-size: 16px; font-weight: bold; letter-spacing: 2px;">
                    {{ strtoupper(substr($ticket->uuid, 0, 8)) }}
                </div>
                <div class="qr-code">Code complet : {{ $ticket->qr_code }}</div>
                <p style="margin-top: 10px; font-size: 10px; color: #888;">
                    Pour le QR code, consultez votre billet en ligne sur eventcool.fr/tickets
                </p>
            </div>

            <div class="ticket-info">
                <div class="ticket-info-row">
                    <span class="ticket-info-label">Catégorie</span>
                    <span class="ticket-info-value">{{ $category->name }}</span>
                </div>
                <div class="ticket-info-row">
                    <span class="ticket-info-label">Référence billet</span>
                    <span class="ticket-info-value">{{ strtoupper(substr($ticket->uuid, 0, 8)) }}</span>
                </div>
                <div class="ticket-info-row">
                    <span class="ticket-info-label">Commande</span>
                    <span class="ticket-info-value">{{ $order->reference }}</span>
                </div>
                <div class="ticket-info-row">
                    <span class="ticket-info-label">Statut</span>
                    <span class="ticket-info-value status-{{ $ticket->status }}">
                        @switch($ticket->status)
                            @case('valid')
                                VALIDE
                                @break
                            @case('used')
                                UTILISÉ
                                @break
                            @case('cancelled')
                                ANNULÉ
                                @break
                            @default
                                {{ strtoupper($ticket->status) }}
                        @endswitch
                    </span>
                </div>
            </div>

            <div class="important">
                <strong>Important :</strong> Ce billet est personnel et ne peut être utilisé qu'une seule fois.
                Présentez-le à l'entrée de l'événement depuis votre téléphone ou imprimé.
            </div>
        </div>

        <div class="footer">
            <p>Généré le {{ now()->locale('fr')->isoFormat('D MMMM YYYY [à] HH:mm') }}</p>
            <p>Event Cool - www.eventcool.fr</p>
        </div>
    </div>
</body>
</html>
