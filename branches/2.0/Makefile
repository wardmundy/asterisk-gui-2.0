#
# Asterisk -- A telephony toolkit for Linux.
#
# Top level Makefile
#
# Copyright (C) 1999-2006, Digium, Inc.
#
# Mark Spencer <markster@digium.com>
#
# This program is free software, distributed under the terms of
# the GNU General Public License
#

# even though we could use '-include makeopts' here, use a wildcard
# lookup anyway, so that make won't try to build makeopts if it doesn't
# exist (other rules will force it to be built if needed)
ifneq ($(wildcard makeopts),)
  include makeopts
endif

export CC
export CPP
export INSTALL
export DESTDIR
export BASENAME
export PBX_ZAPTEL
export ZAPTEL_INCLUDE
export ASTSBINDIR
export ASTCFLAGS
export ASTLDFLAGS
export ASTDOCDIR

ifneq ($(findstring BSD,$(OSARCH)),)
  ASTCFLAGS+=-I/usr/local/include
  ASTLDFLAGS+=-L/usr/local/lib
endif

# Staging directory
# Files are copied here temporarily during the install process
# For example, make DESTDIR=/tmp/asterisk-gui would put things in
# /tmp/asterisk/etc/asterisk
# !!! Watch out, put no spaces or comments after the value !!!
#DESTDIR?=/tmp/asterisk-gui

ifeq ($(OSARCH),SunOS)
  ASTETCDIR:=$(DESTDIR)/var/etc/asterisk
else
  ASTETCDIR:=$(DESTDIR)$(sysconfdir)/asterisk
endif
ASTETCDIR:=$(shell cat $(ASTETCDIR)  2>/dev/null | grep -v ^\; | grep astetcdir | cut -f 3 -d ' ')
ifeq ($(ASTETCDIR),)
  ifeq ($(OSARCH),SunOS)
    ASTETCDIR:=$(DESTDIR)/var/etc/asterisk
  else
    ASTETCDIR:=$(DESTDIR)$(sysconfdir)/asterisk
  endif
endif

ASTVARLIBDIR?=$(shell cat $(ASTETCDIR)  2>/dev/null | grep -v ^\; | grep astvarlibdir | cut -f 3 -d ' ')
ifeq ($(ASTVARLIBDIR),)
  ifeq ($(OSARCH),SunOS)
    ASTVARLIBDIR:=$(DESTDIR)/var/opt/asterisk
  else
    ifeq ($(OSARCH),FreeBSD)
      ASTVARLIBDIR:=$(DESTDIR)$(prefix)/share/asterisk
    else
      ASTVARLIBDIR:=$(DESTDIR)$(localstatedir)/lib/asterisk
    endif
  endif
endif


ASTSBINDIR?=$(shell cat $(ASTETCDIR)  2>/dev/null | grep -v ^\; | grep astsbindir | cut -f 3 -d ' ')
ifeq ($(ASTSBINDIR),)
  ifeq ($(OSARCH),SunOS)
    ASTSBINDIR:=$(DESTDIR)/opt/asterisk/sbin
  else
    ASTSBINDIR:=$(DESTDIR)$(sbindir)
  endif
endif

ASTDOCDIR:=$(DESTDIR)$(datarootdir)/doc/asterisk-gui

HTTPDIR:=$(ASTVARLIBDIR)/static-http
CONFIGDIR:=$(ASTVARLIBDIR)/static-http/config


HTTPHOST?=$(shell hostname)
HTTPBINDPORT?=$(shell cat $(ASTETCDIR)/http.conf  2>/dev/null | grep -v ^\; | grep bindport | cut -f 2 -d '=' | sed 's/ //g')
ifeq ($(HTTPBINDPORT),)
  HTTPBINDPORT:=8088
endif
HTTPPREFIXBASE?=$(shell cat $(ASTETCDIR)/http.conf  2>/dev/null | grep -v ^\; | grep prefix | sed 's/ //g')
HTTPPREFIX?=$(shell echo $(HTTPPREFIXBASE) | cut -f 2 -d '=')
ifeq ($(HTTPPREFIXBASE),)
  HTTPPREFIX:=asterisk
endif
HTTPURL:=http://$(HTTPHOST):$(HTTPBINDPORT)/$(HTTPPREFIX)/static/config/index.html
HTTPLOCALURL:=http://localhost:$(HTTPBINDPORT)/$(HTTPPREFIX)/static/config/index.html
	
#SUBDIRS:=tools
SUBDIRS_CLEAN:=$(SUBDIRS:%=%-clean)
SUBDIRS_INSTALL:=$(SUBDIRS:%=%-install)

all: _all
	@echo " +------- Asterisk-GUI Build Complete -------+"
	@echo " + Asterisk-GUI has successfully been built, +"
	@echo " + and can be installed by running:          +"
	@echo " +                                           +"
	@echo " +               $(MAKE) install                +"
	@echo " +-------------------------------------------+"

_all: makeopts $(SUBDIRS)

$(SUBDIRS):
	@$(MAKE) -C $@

config:
	@cp init.d/rc.asterisk-gui $(DESTDIR)/etc/rc.d/init.d/asterisk-gui
	@chmod 755 $(DESTDIR)/etc/rc.d/init.d/asterisk-gui
	@if [ -z "$(DESTDIR)" ]; then chkconfig --add asterisk-gui; fi
	@echo " +-------- Asterisk-GUI Config Complete -------+"
	@echo " + The Asterisk-GUI has been added to your     +"
	@echo " + services:                                   +"
	@echo " + service <asterisk-gui> {start|stop|restart} +"
	@echo " +---------------------------------------------+"

checkconfig:
	@echo " --- Checking Asterisk configuration to see if it will support the GUI ---"
	@echo -n "* Checking for http.conf: "
	@if [ -f $(ASTETCDIR)/http.conf ]; then \
		echo "OK" ; \
	else \
		echo "FAILED"; \
		echo " -- Please run 'make samples' in *Asterisk* or " ; \
		echo " -- create your own $(ASTETCDIR)/http.conf" ; \
		exit 1; \
	fi
	@echo -n "* Checking for manager.conf: "
	@if [ -f $(ASTETCDIR)/manager.conf ]; then \
		echo "OK" ; \
	else \
		echo "FAILED"; \
		echo " -- Please run 'make samples' in *Asterisk* or " ; \
		echo " -- create your own $(ASTETCDIR)/manager.conf" ; \
		exit 1; \
	fi
	@echo -n "* Checking if HTTP is enabled: "
	@if grep -v ^\; $(ASTETCDIR)/http.conf | grep enabled | grep -q yes 2>/dev/null; then \
		echo "OK" ; \
	else \
		echo "FAILED"; \
		echo " -- Please be sure you have 'enabled = yes'" ; \
		echo " -- in $(ASTETCDIR)/http.conf" ; \
		exit 1; \
	fi
	@echo -n "* Checking if HTTP static support is enabled: "
	@if grep -v ^\; $(ASTETCDIR)/http.conf | grep enablestatic | grep -q yes 2>/dev/null; then \
		echo "OK" ; \
	else \
		echo "FAILED"; \
		echo " -- Please be sure you have 'enablestatic = yes'" ; \
		echo " -- in $(ASTETCDIR)/http.conf" ; \
		exit 1; \
	fi
	@echo -n "* Checking if manager is enabled: "
	@if grep -v ^\; $(ASTETCDIR)/manager.conf | grep ^enabled | grep -q yes 2>/dev/null; then \
		echo "OK" ; \
	else \
		echo "FAILED"; \
		echo " -- Please be sure you have 'enabled = yes'" ; \
		echo " -- in $(ASTETCDIR)/manager.conf" ; \
		exit 1; \
	fi
	@echo -n "* Checking if manager over HTTP is enabled: "
	@if grep -v ^\; $(ASTETCDIR)/manager.conf | grep webenabled | grep -q yes 2>/dev/null; then \
		echo "OK" ; \
	else \
		echo "FAILED"; \
		echo " -- Please be sure you have 'webenabled = yes'" ; \
		echo " -- in $(ASTETCDIR)/manager.conf" ; \
		exit 1; \
	fi

	@echo " --- Everything looks good ---	"
	@echo " * GUI should be available at $(HTTPURL) "
	@echo "" 
	@echo " * Note: If you have bindaddr=127.0.0.1 in $(ASTETCDIR)/http.conf " 
	@echo "   you will only be able to visit it from the local machine. " 
	@echo "" 
	@echo "   Example: $(HTTPLOCALURL)" 
	@echo "" 
	@echo " * The login and password should be an entry from $(ASTETCDIR)/manager.conf"
	@echo "   which has 'config' permission in read and write.  For example:"
	@echo ""
	@echo "    [admin]"
	@echo "    secret = mysecret$$$$"
	@echo "    read = system,call,log,verbose,command,agent,config"
	@echo "    write = system,call,log,verbose,command,agent,config"
	@echo ""
	@echo " --- Good luck! ---	"

$(SUBDIRS_INSTALL):
	@ASTSBINDIR="$(ASTSBINDIR)" $(MAKE) -C $(@:-install=) install

_install: _all $(SUBDIRS_INSTALL)
	mkdir -p $(ASTETCDIR)
	@echo "Installing into $(HTTPDIR)"
	mkdir -p $(CONFIGDIR)
	mkdir -p $(CONFIGDIR)/images
	mkdir -p $(CONFIGDIR)/js
	mkdir -p $(CONFIGDIR)/private/bkps
	mkdir -p $(CONFIGDIR)/stylesheets
	mkdir -p $(ASTVARLIBDIR)/scripts
	mkdir -p $(ASTVARLIBDIR)/gui_backups
	@build_tools/make_version > $(CONFIGDIR)/js/guiversion.js
	@for x in config/images/*; do \
		echo "$$x  -->  $(CONFIGDIR)/images/" ; \
		$(INSTALL) -m 644 $$x $(CONFIGDIR)/images/ ; \
	done
	@for x in config/js/*; do \
		echo "$$x  -->  $(CONFIGDIR)/js/" ; \
		$(INSTALL) -m 644 $$x $(CONFIGDIR)/js/ ; \
	done
	@for x in config/stylesheets/*; do \
		echo "$$x  -->  $(CONFIGDIR)/stylesheets/" ; \
		$(INSTALL) -m 644 $$x $(CONFIGDIR)/stylesheets/ ; \
	done
	@for x in config/*.html; do \
		if [ "$$x" = "config/index_redirect.html" ]; then \
			continue ; \
		fi ; \
		echo "$$x  -->  $(CONFIGDIR)" ; \
		$(INSTALL) -m 644 $$x $(CONFIGDIR)/ ; \
	done
	@for x in config/index_redirect.html; do \
		echo "$$x  --> $(HTTPDIR)/index.html" ; \
		$(INSTALL) -m 644 $$x $(HTTPDIR)/index.html ; \
	done
	@for x in scripts/*; do \
		echo "$$x  -->  $(ASTVARLIBDIR)/scripts/" ; \
		$(INSTALL) -m 755 $$x $(ASTVARLIBDIR)/scripts/ ; \
	done
	@if [ -x /usr/sbin/asterisk-gui-post-install ]; then \
		/usr/sbin/asterisk-gui-post-install $(DESTDIR) . ; \
	fi

install: _install
	@echo "                                              "
	@echo " +---- Asterisk GUI Installation Complete ---+"
	@echo " +                                           +"
	@echo " +    YOU MUST READ THE SECURITY DOCUMENT    +"
	@echo " +                                           +"
	@echo " + Asterisk-GUI has successfully been        +"
	@echo " + installed.				     +"
	@echo " +                                           +"
	@echo " +-------------------------------------------+"
	@echo " +                                           +"
	@echo " +          BEFORE THE GUI WILL WORK         +"
	@echo " +                                           +"
	@echo " + Before the GUI will run, you must perform +"
	@echo " + some modifications to the Asterisk        +"
	@echo " + configuration files in accordance with    +"
	@echo " + the README file.  When done, you can      +"
	@echo " + check your changes by doing:              +"
	@echo " +                                           +"
	@echo " +               $(MAKE) checkconfig            +"
	@echo " +                                           +"
	@echo " +-------------------------------------------+"

$(SUBDIRS_CLEAN):
	@$(MAKE) -C $(@:-clean=) clean

clean: $(SUBDIRS_CLEAN)

distclean: clean
	rm -f makeopts autom4te.cache

update: 
	@if [ -d .svn ]; then \
		echo "Updating from Subversion..." ; \
		svn update | tee update.out; \
		rm -f .version; \
		if [ `grep -c ^C update.out` -gt 0 ]; then \
			echo ; echo "The following files have conflicts:" ; \
			grep ^C update.out | cut -b4- ; \
		fi ; \
		rm -f update.out; \
	else \
		echo "Not under version control";  \
	fi

makeopts: configure
	@echo "****"
	@echo "**** The configure script must be executed before running '$(MAKE)'."
	@echo "****"
	@exit 1

.PHONY: config clean all install _all _install checkconfig distclean $(SUBDIRS_CLEAN) $(SUBDIRS_INSTALL) $(SUBDIRS)
