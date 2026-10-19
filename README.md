# JuriFlow Cadastro (Android)

App de campo para o mesmo cadastro de cliente do Juriflow. O formulário fica no aparelho e sobe pela fila quando há internet.

## Rodar

```bash
cd mobile
cp .env.example .env
npm start
```

No celular físico, `EXPO_PUBLIC_API_URL` precisa ser o IP do computador na rede, por exemplo `http://192.168.0.10:3001`. `localhost` só alcança o próprio aparelho.

O backend precisa da migration `clientRequestId` (`npx prisma migrate deploy` na pasta `back`). Esse id evita criar o mesmo cliente duas vezes se a resposta do envio se perder.

## Fila

Cada cadastro fica no SQLite do app, com status pendente, sincronizando, sincronizado ou com erro. Anexos ficam na pasta privada do app até o upload. A sincronização começa sozinha ao voltar a internet e também pelo botão Sincronizar. Um erro pode ser tentado de novo sem recriar o cliente.

O mesmo CPF não pode ser cadastrado outra vez neste aparelho. Um rascunho pendente ou com erro pode ser excluído da fila.

O token fica no armazenamento seguro do Android. A senha Gov.br fica só no banco local do app, na área privada do aplicativo.

## Versão e APK

O APK sai no GitHub Actions e fica na Release da tag. A versão é a de `app.json` (`expo.version`). Cada release também publica um `version.json`. O app instalado consulta o arquivo da última release e, se a versão for maior, pede para baixar o APK.

Para publicar, suba a tag igual à versão do app:

```bash
git tag v1.0.0
git push origin v1.0.0
```

Também dá para abrir a aba Actions, escolher Android APK e clicar em Run workflow. O resultado fica em Releases, no arquivo `juriflow-cadastro.apk`.

O repositório precisa ser público para o celular baixar o APK pelo link da release. Antes de distribuir para o campo, crie uma chave Android e salve estes secrets no repositório: `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS` e `ANDROID_KEY_PASSWORD`. Sem eles, o APK usa a chave de debug.

## Testes

```bash
npm test
npm run test:unit
npm run test:e2e
```

Os unitários cobrem máscara, validação, payload e versão. O e2e cobre a fila: offline, envio, resposta perdida, anexo pela metade e cadastro de outro usuário.
