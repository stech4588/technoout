<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>New inquiry — {{ $brand }}</title>
</head>
<body style="margin:0;padding:0;background:#eef2f7;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eef2f7;padding:28px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
                    <tr>
                        <td style="background:#0f172a;padding:22px 26px;color:#fff;">
                            <div style="font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#38bdf8;font-weight:700;">New website request</div>
                            <div style="margin-top:8px;font-size:22px;font-weight:800;">{{ $inquiry->reference }}</div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:22px 26px;font-size:14px;line-height:1.6;color:#334155;">
                            <p style="margin:0 0 10px;"><strong>Type:</strong> {{ ucfirst($inquiry->type) }}</p>
                            <p style="margin:0 0 10px;"><strong>Customer:</strong> {{ $inquiry->is_returning ? 'Returning customer' : 'New customer' }}@if($inquiry->customer_id) · #{{ $inquiry->customer_id }}@endif</p>
                            <p style="margin:0 0 10px;"><strong>Name:</strong> {{ $inquiry->name }}</p>
                            @if($inquiry->company)<p style="margin:0 0 10px;"><strong>Company:</strong> {{ $inquiry->company }}</p>@endif
                            <p style="margin:0 0 10px;"><strong>Email:</strong> {{ $inquiry->email }}</p>
                            <p style="margin:0 0 10px;"><strong>Phone:</strong> {{ $inquiry->phone }}</p>
                            @if($inquiry->city)<p style="margin:0 0 10px;"><strong>City:</strong> {{ $inquiry->city }}</p>@endif
                            @if($inquiry->subject)<p style="margin:0 0 10px;"><strong>Subject:</strong> {{ $inquiry->subject }}</p>@endif
                            <p style="margin:14px 0 6px;"><strong>Message</strong></p>
                            <div style="white-space:pre-line;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:12px 14px;">{{ $inquiry->message }}</div>
                            @if($inquiry->items->isNotEmpty())
                            <p style="margin:16px 0 8px;"><strong>Products</strong></p>
                            <ul style="margin:0;padding-left:18px;">
                                @foreach($inquiry->items as $item)
                                    <li>{{ $item->description }} × {{ $item->quantity }}</li>
                                @endforeach
                            </ul>
                            @endif
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
