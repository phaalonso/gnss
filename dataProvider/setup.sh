#!/usr/bin/sh

# if ! [ "$(id -u)" = 0 ]; then
#   echo "Esse comando precisa ser executado como root." >&2
#   exit 1
# fi

directory="/dev/ttyUSB0"
frequency=115200

sudo chmod 666 $directory
sudo stty -F $directory $frequency
echo "Configurações realizadas."
