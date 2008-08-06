# Process this file with autoconf to produce a configure script.
#
# Make sure we use autoconf 2.60 to generate the "configure" script,
# in case we want to commit it. Other than that, version 2.59 is
# perfectly fine for our purposes, so people who want to modify
# this file just have to remember to set the AC_PREREQ argument
# to something that suits their needs.

AC_PREREQ(2.59)

m4_define([PBX_VERSION],
          m4_bpatsubst(m4_esyscmd([build_tools/make_version .]),
                       [\([0-9.]*\)\(\w\|\W\)*],
                       [\1]))
AC_INIT(asterisk-gui, PBX_VERSION, www.asterisk.org)

# cross-compile macros
AC_CANONICAL_BUILD
AC_CANONICAL_HOST

# check existence of the package
AC_CONFIG_SRCDIR([config/index.html])

AC_COPYRIGHT("Asterisk-gui")
AC_REVISION($Revision: 48191 $)

case "${host_os}" in
     freebsd*)
     ac_default_prefix=/usr/local
     CPPFLAGS=-I/usr/local/include
     LDFLAGS=-L/usr/local/lib
     ;;
     *)
     ac_default_prefix=/usr
     if test ${sysconfdir} = '${prefix}/etc'; then
        sysconfdir=/etc
     fi
     if test ${mandir} = '${prefix}/man'; then
        mandir=/usr/share/man
     fi
     ;;
esac

if test ${localstatedir} = '${prefix}/var'; then
     localstatedir=/var
fi

BUILD_PLATFORM=${build}
BUILD_CPU=${build_cpu}
BUILD_VENDOR=${build_vendor}
BUILD_OS=${build_os}

AC_SUBST(BUILD_PLATFORM)
AC_SUBST(BUILD_CPU)
AC_SUBST(BUILD_VENDOR)
AC_SUBST(BUILD_OS)

HOST_PLATFORM=${host}
HOST_CPU=${host_cpu}
HOST_VENDOR=${host_vendor}
HOST_OS=${host_os}

AC_SUBST(HOST_PLATFORM)
AC_SUBST(HOST_CPU)
AC_SUBST(HOST_VENDOR)
AC_SUBST(HOST_OS)

case "${host_os}" in
     freebsd*)
     OSARCH=FreeBSD
     ;;
     netbsd*)
     OSARCH=NetBSD
     ;;
     openbsd*)
     OSARCH=OpenBSD
     ;;
     solaris*)
     OSARCH=SunOS
     ;;
     *)
     OSARCH=${HOST_OS}
     ;;
esac

AC_SUBST(OSARCH)

#  check for uname
AC_PATH_TOOL([UNAME], [uname], No)
if test ! x"${UNAME}" = xNo; then
   PBX_OSREV=$(${UNAME} -r)
fi
AC_SUBST(PBX_OSREV)

# This needs to be before any macros that use the C compiler
AC_GNU_SOURCE

# cross-compile checks
if test "${cross_compiling}" = "yes"; 
then
   AC_CHECK_TOOL(CC, gcc, :)
   AC_CHECK_TOOL(CXX, g++, :)
   AC_CHECK_TOOL(LD, ld, :)
   AC_CHECK_TOOL(RANLIB, ranlib, :)
   AC_CHECK_TOOL(AR, ar, :)
fi

# Checks for programs.
AC_PROG_CC
AC_PROG_CPP
AC_PROG_INSTALL
AST_CHECK_GNU_MAKE

AC_PATH_PROG([BASENAME], [basename], :)

AC_CONFIG_FILES([makeopts])

AC_LANG(C)

AST_EXT_LIB_SETUP([ZAPTEL], [Zaptel], [zaptel])

AST_C_DEFINE_CHECK([ZAPTEL], [ZT_TONE_DTMF_BASE], [zaptel/zaptel.h], [140])

if test "${USE_ZAPTEL}" != "no"; then
   if test "${PBX_ZAPTEL}" != "1"; then
      AC_MSG_CHECKING(for ZT_DIAL_OP_CANCEL in zaptel.h)
      saved_cppflags="${CPPFLAGS}"
      if test "x${ZAPTEL_DIR}" != "x"; then
	 CPPFLAGS="${CPPFLAGS} -I${ZAPTEL_DIR}/include"
      fi
      AC_COMPILE_IFELSE(
	[
	AC_LANG_PROGRAM(
	[#include <zaptel.h>],
	[int foo = ZT_DIAL_OP_CANCEL;])
	],
	[	AC_MSG_RESULT(yes) 
		ac_cv_zaptel_h="yes" 
	],
	[	AC_MSG_RESULT(no) 
		ac_cv_zaptel_h="no" 
	]
	)
      CPPFLAGS="${saved_cppflags}"
      if test "${ac_cv_zaptel_h}" = "yes"; then
         AC_MSG_NOTICE(***)
	 AC_MSG_NOTICE(*** The Zaptel installation on this system is too old)
	 AC_MSG_NOTICE(*** to be useable with this version of the Asterisk-gui.)
	 AC_MSG_NOTICE(*** Either upgrade your Zaptel installation, or run configure)
	 AC_MSG_NOTICE(*** including --without-zaptel.)
	 exit 1
      fi
   fi
fi

AST_CHECK_MANDATORY

AC_OUTPUT

if test "x${silent}" != "xyes" ; then
echo
echo "               .\$\$\$\$\$\$\$\$\$\$\$\$\$\$\$=..      "
echo "            .\$7\$7..          .7\$\$7:.    "
echo "          .\$\$:.                 ,\$7.7   "
echo "        .\$7.     7\$\$\$\$           .\$\$77  "
echo "     ..\$\$.       \$\$\$\$\$            .\$\$\$7 "
echo "    ..7\$   .?.   \$\$\$\$\$   .?.       7\$\$\$."
echo "   \$.\$.   .\$\$\$7. \$\$\$\$7 .7\$\$\$.      .\$\$\$."
echo " .777.   .\$\$\$\$\$\$77\$\$\$77\$\$\$\$\$7.      \$\$\$,"
echo " \$\$\$~      .7\$\$\$\$\$\$\$\$\$\$\$\$\$7.       .\$\$\$."
echo ".\$\$7          .7\$\$\$\$\$\$\$7:          ?\$\$\$."
echo "\$\$\$          ?7\$\$\$\$\$\$\$\$\$\$I        .\$\$\$7 "
echo "\$\$\$       .7\$\$\$\$\$\$\$\$\$\$\$\$\$\$\$\$      :\$\$\$. "
echo "\$\$\$       \$\$\$\$\$\$7\$\$\$\$\$\$\$\$\$\$\$\$    .\$\$\$.  "
echo "\$\$\$        \$\$\$   7\$\$\$7  .\$\$\$    .\$\$\$.   "
echo "\$\$\$\$             \$\$\$\$7         .\$\$\$.    "
echo "7\$\$\$7            7\$\$\$\$        7\$\$\$      "
echo " \$\$\$\$\$                        \$\$\$       "
echo "  \$\$\$\$7.                       \$\$  (TM)     "
echo "   \$\$\$\$\$\$\$.           .7\$\$\$\$\$\$  \$\$      "
echo "     \$\$\$\$\$\$\$\$\$\$\$\$7\$\$\$\$\$\$\$\$\$.\$\$\$\$\$\$      "
echo "       \$\$\$\$\$\$\$\$\$\$\$\$\$\$\$\$.                "
echo
fi

AC_MSG_NOTICE(Package configured for: )
AC_MSG_NOTICE( OS type  : $host_os)
AC_MSG_NOTICE( Host CPU : $host_cpu)
if test "${cross_compiling}" = "yes"; then
   AC_MSG_NOTICE( Cross Compilation = YES)
fi
