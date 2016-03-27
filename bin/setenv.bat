set JAVA_OPTS=%JAVA_OPTS% -Xms256m -Xmx512m -XX:MaxPermSize=256m 

rem Checks if the JAVA_HOME has a space in it (can cause issues)
SET _marker=%JAVA_HOME: =%
IF NOT "%_marker%" == "%JAVA_HOME%" ECHO JAVA_HOME "%JAVA_HOME%" contains spaces. Please change to a location without spaces if this causes problems.

echo If you encounter issues starting up Confluence Standalone, please see the Installation guide at http://confluence.atlassian.com/display/DOC/Confluence+Installation+Guide
