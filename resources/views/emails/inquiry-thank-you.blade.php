<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Thank you — {{ $brand }}</title>
</head>
<body style="margin:0;padding:0;background:#eef2f7;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eef2f7;padding:32px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 18px 40px rgba(15,23,42,.08);">
                    <tr>
                        <td style="background:linear-gradient(135deg,#075fd8 0%,#0a3f8f 100%);padding:28px 32px;color:#fff;">
                            <div style="font-size:12px;letter-spacing:.18em;text-transform:uppercase;opacity:.85;font-weight:700;">{{ $brand }}</div>
                            <div style="margin-top:10px;font-size:26px;font-weight:800;line-height:1.25;">Thank you, {{ $inquiry->name }}.</div>
                            <div style="margin-top:8px;font-size:14px;opacity:.92;line-height:1.5;">We have received your request and our team will review it shortly.</div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:28px 32px 8px;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;">
                                <tr>
                                    <td style="padding:16px 18px;">
                                        <div style="font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#64748b;">Request reference</div>
                                        <div style="margin-top:6px;font-size:20px;font-weight:800;color:#075fd8;">{{ $inquiry->reference }}</div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:16px 32px 8px;font-size:15px;line-height:1.65;color:#334155;">
                            Your {{ $inquiry->type === 'quote' ? 'quotation request' : 'enquiry' }} is now with ViaTech. We typically respond with next steps, clarifications or a tailored proposal based on your site requirements.
                        </td>
                    </tr>
                    @if($inquiry->items->isNotEmpty())
                    <tr>
                        <td style="padding:12px 32px 8px;">
                            <div style="font-size:13px;font-weight:700;color:#0f172a;margin-bottom:10px;">Requested products</div>
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
                                @foreach($inquiry->items as $item)
                                <tr>
                                    <td style="padding:12px 14px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#1e293b;">{{ $item->description }}</td>
                                    <td style="padding:12px 14px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;text-align:right;white-space:nowrap;">Qty {{ $item->quantity }}</td>
                                </tr>
                                @endforeach
                            </table>
                        </td>
                    </tr>
                    @endif
                    <tr>
                        <td style="padding:18px 32px 8px;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc;border-radius:12px;">
                                <tr>
                                    <td style="padding:14px 16px;font-size:13px;line-height:1.6;color:#475569;">
                                        <strong style="color:#0f172a;">What happens next?</strong><br>
                                        1. Our specialists review your requirements<br>
                                        2. We may contact you on {{ $inquiry->phone }} for clarification<br>
                                        3. You receive a proposal or quotation from {{ $supportEmail }}
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:22px 32px 28px;">
                            <a href="mailto:{{ $supportEmail }}" style="display:inline-block;background:#075fd8;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 22px;border-radius:999px;">Email {{ $supportEmail }}</a>
                            <div style="margin-top:18px;font-size:12px;color:#94a3b8;line-height:1.5;">
                                Measure · Control · Solve<br>
                                This is an automated confirmation from {{ $brand }}.
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
