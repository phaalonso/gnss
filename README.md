# Ferramenta de monitoramento GNSS

Está é uma ferramenta a qual está sendo desenvolvida em um trabalho de Iniciação Científica, assim como em um Trabalho de Conclusão de Curso.

O sistema é dividio entre vários módulos. Os quais podem ser observados na imagem abaixo.

![Diagrama do sistema](./diagram.png)

[Repositório do projeto](https://github.com/phaalonso/gnss)

Email de contato: phaalonso@gmail.com

## Configurações

O sistema onde este projeto for executado deve possuir [Node.js](https://nodejs.org/en/) instalado, assim como o gerenciador de pacotes [yarn](https://yarnpkg.com/).

> Durante o desenvolvimento do sistema, foi utilizado a versão `v15.14.0` do Node e `v1.22.5` do yarn. Note que sempre deve dar prioridade a utilização das versões LTS (Long Term Support).

### DataProvider

A primeira configuração que precisa ser realizada no DataProvider, é habilitar o recebimento de informações via o módulo GNSS. Para isso devemos utilizar um comando com a antena conectada ao dispositivo, nesse comando deve ser passado [o arquivo o representa](https://youtu.be/b58CnY7qxpk).

```bash
$ sudo chmod 666 /dev/ttyUSB0 # Permitir que outros usuários além do `sudo` acesse o arquivo
$ sudo stty -F /dev/ttyUSB0 115200 # Abre o dispostivo e seta a velocidade de transmissão
```

É possível utilizar o comando `cat /dev/ttyUSB0` para identificar se o comando foi executado corretamente, o output do `cat` deve ser parecido com o seguinte exemplo:

```nmea
$GPGGA,153718.900,2152.0707,S,05150.3215,W,1,10,0.78,400.3,M,-2.1,M,,*74
$GPGSA,A,3,03,04,22,07,14,16,30,06,02,09,,,1.53,0.78,1.32*06
$GPGSV,3,1,11,07,65,237,35.0,09,50,171,51.9,30,37,289,31.5,04,37,122,45.6*7C
$GPGSV,3,2,11,03,36,037,28.3,06,26,270,35.8,16,16,134,47.3,22,10,035,24.4*79
$GPGSV,3,3,11,14,09,343,26.1,02,09,242,29.8,08,04,064,28.6*54
$GPRMC,153718.900,A,2152.0707,S,05150.3215,W,0.01,341.19,150621,,,A*6F
$GPVTG,341.19,T,,M,0.01,N,0.03,K,A*31
```

A partir do momento em que confirmar os dados recebidos via satélite, pode ser realizado a execução do DataProvider. Para realziar realizar isso, basta entrar na pasta `dataProvider` e o executá-lo com o comando `yarn start`.

> *Obs: em casos de primeira execução do serviço, ou alteração de dependencias, é necessário utilizar o comando `yarn` para que estas sejam baixadas para o dispositivo.*

> *Este serviço carrega suas configurações a partir do arquivo config.json, inicialmente buscava a possibilidade de permitir mudar dinamicamente a configuração, para que as estações pudessem ser configuradas remotamente sem a necessidade de que cada módulo utilizasse um banco de dados. Entretanto, este se tornou um item que não foi implementado devido a restrições de tempo, sendo assim o serviço pode ser alterado para carregar as configurações do arquivo `.env`*

## Client
Serviço o qual irá consumir o websocket fornecido pelo DataProvider, armazenando e processando as informações coletadas em intervalos de tempo regulares.

> *Obs: note que para o client ser capaz de consumir as informações, ele deve possuir apontamento correto para a porta.*
> 
> *Obs2: caso deseje consumir de um websocket a partir de uma máquina externa, é necessário que a porta dele esteja exposto. Isso pode ser realizaado de duas maneiras, simplesmente expondo a porta, ou através de uma proxy reversa (como o Nginx)*

O serviço também deve ser inicializado através do comando `yarn start`. Sendo que, caso não exista o arquivo `node_modules` (primeira execução), ou tenha ocorrido uma alteração deste, deve ser executado o comando `yarn` antes do `yarn start`.

> *Obs: o código deste serviço, ainda conta com partes legadas referentes a utilização de MongoDB, e a dependencia SQLite (a foi substituida pelo BetterSQlite, devido a este contar com ganhos de performance)*

#### **Exposição de stream TCP pelo Nginx**

A exposição de uma stream TCP através do Web-server Nginx pode ser realizada através da utilização da seguinte configuração ao arquivo `/etc/nginx/nginx.conf`.

```nginx
stream {
        server {
                listen 3000; # Porta que será exposta
                proxy_pass 127.0.0.1:2108; # Endereço local do serviço
        }
}
```

## Backend

O Backend é o serviço responsável por fornecer uma API REST para que dispositivos presentes na Web consigam executar querys dos dados.

> Devido a decisão de utilizar apenas um único banco de dados SQLite (dois serviços lendo e escrevendo nele), em casos onde ele é recriado é necessário executar o comando `npx prisma push` para subir o schema do prisma para ele.
> 
> Também foi criado um [arquivo](./TABLES.sql), o qual contem todas as alterações a serem realizadas no banco de dados, é ideal que futuramente os serviços executem ele no lugar de cada um criar suas tabelas.

Assim como os outros serviços, o backend pode ser executado através do comando `yarn start`.

Porta padrão: 3333

## Frontend

Como interface a API desenvolvida, foi criada uma aplicação com [React.js](https://pt-br.reactjs.org/), esta aplicação pode ser compilada e fornecida pelo servidor web nginx (coloando os arquivos compilados na pasta `/var/www/html`) ou utilizando a pasta publica do Backend. Note que é necesário fazer os devidos ajustes relacionados a URL's utilizadas para consultar o serviço.

---

Note-que todos estes serviços, menos o client e backed, podem ser desacoplados dos Raspberry Pi, e executados em outros dispositivos. Todos os serviços deverm funcionar, desde-que eles consigam acessar uns aos outros através da configuração de URL/IP de acesso e portas de rede. (Também pode ser necesário configurar firewall)

---

Comandos utils:

```bash
$ sudo nginx -t # verifica se a sintaxe de configuração está correta
$ stty --help # Obtem mais informações sobre o stty
$ curl cheat.sh/stty # Cheatsheet sobre o comando ssty (pode alterar o nome após a barra para ver outros moandos ex: curl cheat.sh/nginx)
```

> OBS: sempre apague os diretórios `node_modules` antes de realizar o compartilhamento dos arquivos, ele armazena apenas dependencias as quais são baixadas/instaladas ao executar o comando `yarn`. (Também é essencial que os adicione ao `.gitignore` para evitar que elas sejam gerenciadas pelo git)
