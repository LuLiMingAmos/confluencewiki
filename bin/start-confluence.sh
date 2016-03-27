#!/bin/bash

# resolve links - $0 may be a softlink - stolen from catalina.sh
PRG="$0"
while [ -h "$PRG" ]; do
  ls=`ls -ld "$PRG"`
  link=`expr "$ls" : '.*-> \(.*\)$'`
  if expr "$link" : '/.*' > /dev/null; then
    PRG="$link"
  else
    PRG=`dirname "$PRG"`/"$link"
  fi
done
PRGDIR=`dirname "$PRG"`

PRGRUNMODE=false
if [ "$1" = "-fg" ] || [ "$1" = "run" ]  ; then
	shift
	PRGRUNMODE=true
else
	echo ""
	echo "To run Confluence in the foreground, start the server with start-confluence.sh -fg"
fi

. `dirname $0`/user.sh #readin the username

if [ -z "$CONF_USER" ] || [ $(id -un) == "$CONF_USER" ]; then

    echo executing as current user
    if [ "$PRGRUNMODE" == "true" ] ; then
        exec $PRGDIR/catalina.sh run $@
    else
        exec $PRGDIR/startup.sh $@
    fi

elif [ $UID -ne 0 ]; then

    echo Confluence has been installed to run as $CONF_USER so please sudo run this to enable switching to that user
    exit 1

else

    echo executing using dedicated user: $CONF_USER
    if [ -x "/sbin/runuser" ]; then
        sucmd="/sbin/runuser"
    else
        sucmd="su"
    fi

    if [ "$PRGRUNMODE" == "true" ] ; then
        $sucmd -m $CONF_USER -c "$PRGDIR/catalina.sh run $@"
    else
        $sucmd -m $CONF_USER -c "$PRGDIR/startup.sh $@"
    fi

fi

