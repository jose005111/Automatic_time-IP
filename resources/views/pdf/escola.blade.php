<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <title>Ficha das Escolas</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 14px;
            color: #333;
        }

        .header {
            border-bottom: 3px solid #1e40af;
            padding-bottom: 10px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
        }

        .logo {
            width: 80px;
            height: 80px;
            object-fit: cover;
            margin-right: 15px;
        }

        .empresa h1 {
            margin: 0;
            font-size: 18px;
            color: #1e40af;
        }

        .empresa .data {
            font-size: 12px;
            color: #555;
        }

        .section-title {
            background-color: #1e40af;
            color: white;
            padding: 6px 10px;
            font-weight: bold;
            margin-top: 20px;
            margin-bottom: 10px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        table td {
            padding: 8px;
            border: 1px solid #ddd;
        }

        .label {
            font-weight: bold;
            background-color: #f3f4f6;
            width: 30%;
        }

        .page-break {
            page-break-after: always;
        }

        .footer {
            text-align: center;
            font-size: 12px;
            color: #777;
            margin-top: 20px;
        }
    </style>
</head>
<body>

@foreach($escolas as $index => $escola)
    <div class="header">
        @if($escola->logo)
           <img src="{{ 'file:///' . public_path('storage/' . $escola->logo) }}" alt="{{ $escola->nome }}" class="logo">

        @endif
        <div class="empresa">
            <h1>Ficha Institucional</h1>
            <div class="data">Data: {{ now()->format('d/m/Y') }}</div>
            <div class="data" style="margin-top:5px; font-weight:bold;">{{ $escola->nome }}</div>
        </div>
    </div>

    <div class="section-title">Dados da Escola</div>

    <table>
        <tr>
            <td class="label">Email</td>
            <td>{{ $escola->email ?? '—' }}</td>
        </tr>
        <tr>
            <td class="label">Tipo</td>
            <td>{{ ucfirst($escola->tipo->label()) }}</td>
        </tr>
        <tr>
            <td class="label">Localização</td>
            <td>{{ $escola->localizacao ?? '—' }}</td>
        </tr>
    </table>
     {{-- Quebra de página só se não for o último elemento --}}
    @if ($index < count($escolas) - 1)
        <div style="page-break-after: always;"></div>
    @endif
@endforeach
</body>
</html>
