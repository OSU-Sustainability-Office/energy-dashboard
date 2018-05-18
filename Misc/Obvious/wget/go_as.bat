rem  $Id: go_as.bat,v 1.1 2004/06/25 04:19:14 herzogs Exp $
rem
rem This batch file will download all data from an AcquiSuite and place it in a subdirectory.
rem
rem Note: the format is password:username (default username is admin)
rem

wget -x --cut-dirs=3 http://admin:admin@192.168.40.45/setup/logexport.cgi?MB=0 -d -r
