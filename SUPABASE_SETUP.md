# Configuração do Supabase

## URL já configurada
A URL do Supabase já foi configurada no arquivo `src/lib/supabaseClient.ts`:
- **URL**: `https://itdplsvmsqognexmassy.supabase.co`

## Próximos passos

1. **Criar arquivo `.env.local`** na raiz do projeto (`ranking-app/.env.local`) com:
```bash
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
```

2. **Obter a chave anônima**:
   - Acesse o [dashboard do Supabase](https://supabase.com/dashboard)
   - Selecione seu projeto `itdplsvmsqognexmassy`
   - Vá em Settings > API
   - Copie a "anon public" key

3. **Substituir `sua_chave_anonima_aqui`** pela chave real no arquivo `.env.local`

## Estrutura final
```
ranking-app/
├── .env.local (criar este arquivo)
├── src/
│   └── lib/
│       └── supabaseClient.ts (já configurado)
└── ...
```

## Importante
- O arquivo `.env.local` não será commitado no git (está no .gitignore)
- A URL do Supabase já está configurada no código
- Você só precisa configurar a chave anônima

