#!/bin/bash

####################################################################
####	Author Brandon Kruse <bkruse@digium.com> 		####
####	Copyright (c) 2007-2008 Digium				####
####################################################################

# Quick script for applying zaptel settings from the GUI.

ZAPCONF="/etc/zaptel.conf"
FILENAME="/etc/asterisk/applyzap.conf"
grep -v '\;' ${FILENAME} | sed 's/\[general\]//g' > ${ZAPCONF}

