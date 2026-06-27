# Regras do Meli Hub

- **Sempre incremente a versão após atualizar qualquer plugin**: A versão deve ser atualizada tanto dentro do arquivo de código do plugin (geralmente num comentário de cabeçalho, ex: `// Versão: v1.1.0`) quanto no arquivo `manifest.json`.
- **Atualização do Hub**: Sempre que alterar ou atualizar o arquivo `meli_hub.user.js`, certifique-se de incrementar a constante `HUB_VERSION` no código, a propriedade `hub_version` no arquivo `manifest.json` E a tag de versão (`// @version`) no cabeçalho do Tampermonkey do arquivo `meli_hub.user.js`.
- **Padrão de Versionamento**: O versionamento de TODOS os itens (hub e plugins) deve seguir estritamente o padrão mundial Semantic Versioning (SemVer) (ex: MAJOR.MINOR.PATCH).
