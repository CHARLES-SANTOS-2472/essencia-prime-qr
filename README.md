# Essencia Prime — Gerador de QR-Code

PWA Essencia Prime em português para celular que cria, diretamente no navegador:

- no modo Pix, somente um QR de cobrança estática para pagamento;
- no modo informativo, um único QR Code com nome, cidade e descrição, sem exigir uma chave Pix;
- no modo Wi-Fi, um QR de conexão com SSID, tipo de segurança, senha e opção para rede oculta;
- um cartão PNG com a foto do titular e o(s) QR Code(s) do modo escolhido.

O logotipo, o nome **Essencia Prime** e a identificação **Beleza, Cosméticos e Cuidados Pessoais.** aparecem na página e no cartão baixado.

Os QR Codes são dimensionados automaticamente conforme o conteúdo, incluindo texto com acentos e informações adicionais.

A foto é apenas exibida no cartão. Ela não é inserida nos QR Codes, enviada a um servidor ou salva no navegador. O modo Pix gera somente o QR de pagamento; o modo informativo gera separadamente o QR com nome, cidade e descrição. No modo Wi-Fi, a senha faz parte do próprio QR. Compartilhe os códigos somente com quem deve ter acesso às informações.

## Executar localmente

É necessário Python 3 para iniciar um servidor local:

```powershell
py -3 -m http.server 8000 --bind 127.0.0.1 --directory "Gerador QR Pix PWA"
```

Abra `http://localhost:8000`. Se estiver executando o servidor a partir de uma cópia do repositório que já contém diretamente `index.html`, use `--directory .` no lugar de `--directory "Gerador QR Pix PWA"`.

## Publicar no GitHub Pages

O workflow em `.github/workflows/pages.yml` publica automaticamente esta PWA quando há um push para a branch `main`.

1. Use o repositório dedicado `CHARLES-SANTOS-2472/essencia-prime-qr`. Não inclua os demais arquivos do diretório de estudos.
2. O conteúdo desta pasta deve ficar na raiz do repositório, incluindo a pasta `.github/workflows`, na branch `main`.
3. Nas configurações do repositório, acesse **Pages** e escolha **GitHub Actions** como fonte de publicação.
4. Aguarde a execução do workflow **Publish Essencia Prime PWA** na aba **Actions**. O endereço será `https://SEU-USUARIO.github.io/essencia-prime-qr/` (substitua pelo usuário e nome do repositório).
5. Abra esse endereço no navegador do celular pelo menos uma vez enquanto estiver conectado à internet.

No Android, abra o menu do Chrome e toque em **Instalar app** ou **Adicionar à tela inicial**. No iPhone, abra o endereço no Safari, toque em **Compartilhar** e depois em **Adicionar à Tela de Início**. O primeiro carregamento instala os arquivos necessários; depois disso, a PWA pode abrir offline.

O repositório contém apenas os arquivos do aplicativo, do logotipo e da biblioteca de QR local. Os dados informados no app não são incluídos no repositório, enviados ao GitHub Pages nem armazenados pelo app.

## Verificações e limites

- O app verifica o formato da chave (incluindo os dígitos verificadores de CPF/CNPJ), mas não consulta o DICT nem confirma que a chave está ativa ou pertence à pessoa. Faça um teste no banco e confira o nome do recebedor.
- O QR Pix é uma cobrança estática. O valor é opcional; quando omitido, o pagador informa o valor no banco.
- No modo Pix, é gerado somente o QR de pagamento. No modo informativo, é gerado somente um QR geral e não é preciso informar uma chave Pix.
- No modo Wi-Fi, o QR segue o formato de conexão `WIFI:` usado por leitores compatíveis. Muitos celulares oferecem conectar após escanear, mas podem pedir confirmação. Quem puder escanear o código terá acesso à senha.
- Senhas de redes WPA devem ter de 8 a 63 caracteres ASCII; senhas WEP devem ter 5 ou 13 caracteres, ou 10 ou 26 dígitos hexadecimais. Redes abertas não usam senha.
- O app não salva nem transmite os dados preenchidos. Para reabrir ou gerar novos QRs, preencha novamente o formulário.
