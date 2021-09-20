# Projeto SmartSilo

# Resumo do projeto: 
Na agroindústria o processo de armazenamento de grãos é um dos mais importantes, 
afinal se o armazenamento para feito de forma errada pode resultar em grandes danos aos grãos, 
tendo em vista que todo grão é um ser vivo e requer de cuidados para não ser estragado e perder sua qualidade, 
além do prejuízo que pode ser transmitido ao produtor quando se tem um mal manejo com os grãos. 
A partir dessa problemática a presente pesquisa tem como objetivo trazer inovação e automação no processo de armazenamento de grãos, em um contexto Iot, ajudar a otimizar e diminuir a perda de grãos nos silos, 
utilizando como hardware o esp32 e softwares que a tecnologia atual nos oferece.

# Materiais e Metódos: 
Durante a pesquisa foram feitos uso de alguns materiais que serão listados aqui:
- Arduino
- Bancada PP32 de Secagem de Grãos
- ESP32
- Termistores
- Potenciômetros
- LED
- Para o desenvolvimento do software foram utilizados as seguintes ferramentas:
- Node.js
- Express
- Vue.js
- Electron
- Socket.io
- Firmata.js
- Node-pid-controller

# Plataforma :

<center> <a href="https://imgur.com/TWrZbz4"><img src="https://i.imgur.com/TWrZbz4.gif" title="source: imgur.com" /></a> </center> <br/>
by: Yure Matias

# Diagrama de Funcionamento: 

<center> <a href="https://imgur.com/0jKsQM9"><img src="https://i.imgur.com/0jKsQM9.png" title="source: imgur.com" /></a> </center> <br/>
by: Yure Matias

# Pendencias para trabalhos futuros:

- correção do bug de escolha de modo (PID, ON/OFF, Open loop), este bug consiste em que uma vez selecionado um modo a escolha de outro só pode ser feita reiniciando a aplicação.
- Implementar a interface web com todas as funcionalidades.
- Implementar o controle pela massa e umidade.

# Como clonar o repositório e dar continuidade ao projeto

A clonagem pode ser feita via link ou donwload do arquivo .zip <br/>
Com o projeto no computador, é necessário entrar em cada uma das pastas (Desktop app e Server) e dar um yarn para que as depedências sejam baixadas. <br/>
Com as dependências baixadas é necessário configurar o servidor para sua máquina local, esse processo é feito no arquivo package.json dentro da pasta DesktopApp <br/>

<center> <a href="https://imgur.com/y2hEjv0"><img src="https://i.imgur.com/y2hEjv0.png" title="source: imgur.com" /></a> </center> <br/>
O ip da sua máquina pode ser obtido pelo ipconfig do prompt do windows.

Para quaisquer outras dúvidas sobre o projeto, o bolsista anterior Yure Matias preparou um site que explica detalhadamente sobre alguns frameworks utilizados e como executar alguns testes, link do site: https://smartsilo.netlify.app/html/dashboard.html#Introdução  <br/>

Com tudo configurado, o arquivo main.ino localizado na pasta Firmware deverá ser carregado para a placa (Esp32) e para que isso possa ser feito é necessário que a biblioteca configurable firmata, também encontrada na pasta firmware, esteja alocada em libraries da IDE Arduino. <br/>
Após tudo configurado e com as dependências baixadas, pela sua IDE vc acessa a pasta de server a pasta src dentro de server e coloca no terminal da sua IDE o comando "node server.js" , este comando só será executado se o arquivo package.json estiver configurado com o ip da sua maquina, apóes esse comando é necessário entrar na pasta desktopApp e colocar o comando "yarn start" no terminal, este comando fará com que a interface do electron inicie.


# Bancada PP32  e Esp32 


<center> <a href="https://imgur.com/RfWL2FD"><img src="https://i.imgur.com/RfWL2FD.jpg" title="source: imgur.com" /></a> </center> <br/>

<br/>

<center> <a href="https://imgur.com/qZZpJVx"><img src="https://i.imgur.com/qZZpJVx.jpg" title="source: imgur.com" /></a> </center> <br/>

