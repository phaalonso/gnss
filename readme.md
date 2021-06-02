# Ferramenta de monitoramento GNSS

Está é uma ferramenta a qual está sendo desenvolvida em um trabalho de Iniciação Científica, assim como em um Trabalho de Conclusão de Curso.

## Como executar

A ferramenta é dívidida em diferentes partes, portanto cada uma possui requerimentos diferentes. Entretanto existe alguns passos comuns entre elas

1. Acessar o diretório do módulo desejado
2. Instalar pacotes com `yarn`
3. Iniciar o módulo desejado com `yarn start`

### Clientes

- Sqlite
	- No sqlite, os dados serão armazenados no arquivo `dados.db` presente no diretório do projeto
	- Executar com `ts-node ./src/sqliteClient.ts`
- MongoDB
	- É necessário possuir a variável de ambiente `MONGOURI` presente no arquivo `.env` seguindo o exemplo mostrado no arquivo `.env.example`
	- Executar com `ts-node ./src/mongoClient.ts`

### Data Provider

Para executar o data provider é necessário:
- Possuir o módulo conectado
- Executar com `yarn start`

### Backend
TODO

