#!/bin/sh

# dot-command script to allow Confluence to be launched in a terminal window from a double-click in the finder

export JAVA_HOME=/Library/Java/Home

 `dirname "$0"`/catalina.sh run