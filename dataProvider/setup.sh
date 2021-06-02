#!/usr/bin/sh

if ! [ "$(id -u)" = 0 ]; then
  echo "Esse comando precisa ser executado como root." >&2
  exit 1
fi

directory="/dev/ttyUSB0"
frequency=115200

#if [ -f "$directory" ]
#then
  # Fornece permissão de leitura e escrita para todos os usuários
  chmod 666 $directory
  # Configura a frequência da entrada tty para a utilizada
  stty -F $directory $frequency
  echo "Configurações realizadas."

  echo "Iniciando aplicação"
  yarn start
#else
  #echo "Não encontrei o dispositivo"
  #echo "Verifique se ele está conectado, ou está em outra entrada tty."
#fi
