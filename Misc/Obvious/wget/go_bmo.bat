rem  $Id: go_bmo.bat,v 1.1 2004/06/25 04:19:14 herzogs Exp $
rem
rem This batch file will download data from the BMO website
rem
rem note, the syntax is password:username

wget http://guest:guest@www.obvius.com/members/mbdev_export.php?DB=dbObvius&AS=444D5000060A&MB=250&mnuStartMonth=6&mnuStartDay=1&mnuStartYear=2004&mnuStartTime=10:00&mnuEndMonth=6&mnuEndDay=8&mnuEndYear=2004&mnuEndTime=10:00&DELIMITER=COMMA&COLNAMES=ON&EXPORTTIMEZONE=US/Pacific&DOWNLOAD=YES --output-document=mb-250.log

