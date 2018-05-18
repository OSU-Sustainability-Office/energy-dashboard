<?php  
/* -------------------------------------------------------------------------------------------------------------------*/
/*
    Copyright © 2001-2006, Obvius Holdings, LLC. All rights reserved.

    Redistribution and use in source and binary forms, with or without
    modification, are permitted provided that the following conditions
    are met:

   1. Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.

   2. Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

   3. Neither the name of Obvius Holdings nor the names of its contributors
      may be used to endorse or promote products derived from this software
      without specific prior written permission.

    THIS SOFTWARE PROGRAM IS PROVIDED BY OBVIUS HOLDINGS AND CONTRIBUTORS
    FREE OF CHARGE AND ACCORDINGLY IS LICENSED "AS IS" WITHOUT WARRANTY OF
    ANY KIND, AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
    TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
    PURPOSE, ARE DISCLAIMED. THE ENTIRE RISK AS TO THE QUALITY AND THE
    PERFORMANCE OF THE PROGRAM IS WITH YOU.

    IN NO EVENT, UNLESS REQUIRED BY APPLICABLE LAW OR AGREED TO IN WRITING,
    SHALL OBVIUS HOLDINGS OR CONTRIBUTORS WHO MAY MODIFY AND/OR REDISTRIBUTE
    THE PROGRAM BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, GENERAL,
    SPECIAL, EXEMPLARY, PUNITIVE, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
    NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
    LOSS OF DATA, DATA BEING RENDERED INACCURATE OR FAILURE OF THE PROGRAM
    TO RUN WITH ANY OTHER PROGRAMS, OR LOST PROFITS; OR BUSINESS INTERRUPTION)
    HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
    LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
    OUT OF THE USE OF THIS SOFTWARE PROGRAM, EVEN IF SUCH HOLDER OR OTHER PARTY
    HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
*/
/* -------------------------------------------------------------------------------------------------------------------*/
/*
    $Id: upload_sample_historical-only-do-not-use.php,v 1.28 2006/05/18 17:54:18 herzogs Exp $



    This script is provided as an example only, and should not be used in a production 
    environment.  

    This PHP script shows how the interface between the AcquiSuite and Database Server
    works. This file is intended as a sample, and requires modification to fit custom 
    envrionments.
        
        Note: When this document mentions "server" it referrs to the webserver with an SQL database 
        that will run this script.  The "client" or "AcquiSuite" referrs to the AcquiSuite that is 
        attempting to upload log data to the server.
        
        This script uses PHP to authenticate the http client with a basic password scheme. 
        In order to do this, PHP must be compiled into the apache webserver.  Otherwise, 
        the password is not passed to the PHP script.  Please read the related 
        documentation on the PHP website for more information on this topic.  Search for 
        password authentication, or read www.php.net/manual/en/features.http-auth.php
        
        The upload process has been designed to work with as many firewalls and web proxy servers
        as possible. As such, the AcquiSuite uses basic HTTP POST commands to exchange data with 
        the database server. To the firewall, or Proxy, this appears as a regular webbrowser 
        accessing a website.
        
        PHP note: if you wish to use this script, you must enable the "register globals" option in the php
        configuration file. Otherwise, the form variables won't work as written.  The PHP website has 
        further documentation on how this option works, and what alternatives are available.
        
        Overview:
        
        The AcquiSuite calls the server to upload data.  A session consists of the following:
        
        - The database server must listen for connections from the AcquiSuites, the specifc url may be specified on the AcquiSuite config page.
        - The AcquiSuite uses an HTTP Post command to the Database Webserver. 
        - The HTTP session includes the AcquiSuite Serial Number and upload password using basic authentication.
          The serial number is the AcquiSuite MAC address.
        - The database server must check the serial number and password. 
        - If the serial number and password do not match, the database server must return an "HTTP/1.0 401 Unauthorized" message
        - After sending the serial/password, the Acquisuite will send multiple form variables, detailed below.
        - the database server must check the validity of these variables before accepting the data.
        - the AcquiSuite includes the data as a FORM/POST File Attachment, in gzip format. (winzip will decompress, as will the PHP lib)
        - The database server will decompress the attached data file, and read one line at a time from it.  
                - Each line of the file contains one reading for all points on the corresponding modbus device.  
                - The format is: date/time, error, lowrange, highrange, point0, point1,...
                - All date/times are stored in UTC time. 
                - Errors: 0=no error, 1-0x80 = linux clib errno values, 0x81-0x8B modbus tcp error codes.
                - lowrange, highrange are bitmaps with a bit set corresponding to the data points, where the point was out of range.  
                  lowrange = 0x01 when point 0 is below the set low range value on the AcquiSuite, etc.
                - point0, point1, etc.  Refer to the data read from the modbus device. Points are in order as shown in the AcquiSuite configuration pages.
                - The date/time stamp should be a unique identifier, and should be used to verify and ignore duplicate data points. 
                - the log filename on the AcquiSuite should not be used when reading data that has been uploaded via HTTP/POST
                - the log filename on the AcquiSuite is mb-001.log for raw text files, and mb-001.01AB87D4.log.gz when compressed.  
                  The hex value in the filename is a unix timestamp when the file was compressed to allow multiple compressed log files on one AcquiSuite..             
    - when the end of the file is reached, the file is closed (and deleted by php when the script ends)
    - Any alarm processing should be completed by the database server. 
    - a response code is sent to the AcquiSuite to tell it if the upload was successful.
        - A response of "\nFAILURE: (reason)\n" in the html body will cause the AcquiSuite to retain the log file and try again later.
        - A response of "\nSUCCESS\n" will cause the AcquiSuite to remove the log file when the http session closes.
                - A success response should only be sent when data is imported into the database correctly.
                - If duplicate data points are detected, (and ignored) a failure message should not be sent, unless some other error ocurred.
                
        - This process will be repeated for each log file on the AcquiSuite system.
                
        IN THE FUTURE:
        
        - a similar upload procedure will be used to transfer the AcquiSuite configuration files 
          both to and from the database server.  Further documentation on this will be made available
          when remote administration features are inlcuded in the firmware.    
*/
/* -------------------------------------------------------------------------------------------------------------------*/
/* Original Author: Stephen Herzog for Obvis LLC,  Aug 26, 2001.

   $Id: upload_sample_historical-only-do-not-use.php,v 1.28 2006/05/18 17:54:18 herzogs Exp $

   $Log: upload_sample_historical-only-do-not-use.php,v $
   Revision 1.28  2006/05/18 17:54:18  herzogs
   Fixed typo in the config file name format

   Revision 1.27  2006/01/22 17:32:47  herzogs
   Updated sample script to include bsd style license.

   Revision 1.26  2005/07/19 15:32:00  herzogs
   Updated script to use PHP built in md5 sum function and removed busybox

   Revision 1.25  2005/07/19 15:27:11  herzogs
   Fixed formatting, replaced all tabs with spaces.

   Revision 1.24  2003/09/11 17:49:45  herzogs
   Updated AcquiLite column count.

   Revision 1.23  2003/08/18 12:50:48  herzogs
   Added Acquilite table structure.

   Revision 1.22  2003/07/23 21:41:39  herzogs
   added reference to register globals section, cleaned up a few missing bits.

   Revision 1.21  2003/07/16 20:47:59  herzogs
   added loopname to STATUS mode update.

   Revision 1.20  2003/07/16 20:47:14  herzogs
   Added section for STATUS mode update.

   Revision 1.19  2003/03/11 19:26:05  herzogs
   Added device data column count to the device class listing.

   Revision 1.18  2003/02/13 19:29:52  herzogs
   Added more notes about the file transfer for config files

   Revision 1.17  2003/02/11 15:18:16  herzogs
   clarified SENDDATADEBUG variable in the notes

   Revision 1.16  2003/02/04 14:19:52  herzogs
   Added additional device type numbers
   Added some notes to help with questions I have received.

   Revision 1.15  2002/02/20 21:17:00  herzogs
   Binary files associated with v01.01.0220
      
   Revision 1.14  2002/02/19 16:47:56 herzogs
   Added TEST mode to the script
   Changed ReportFailure to send 406-NotAcceptable error
   Added ReportAuthenticationFailure function to return 401-denied messages for serial/password problems
   Fixed GetFileChecksum function to check for file existance before running file checksum procedure.

   Revision 1.13  2002/01/24 19:58:12 herzogs
   no changes

   Revision 1.12  2002/01/02 23:12:57  herzogs
   Correctly handle 'NULL' data cells by NOT quoting the word NULL in the sql query.

   Revision 1.11  2001/10/26 14:59:28  herzogs
   Added code to clean and safety check log file variables prior to SQL usage.

   Revision 1.10  2001/10/24 16:56:48  herzogs
   Added support for sending configuration files (upon request) to remote AcquiSuite devices.

   Revision 1.9  2001/10/01 22:55:38  herzogs
   Added variables for Modbus Loop Name and AcquiSuite Firmware version to example in Manifest section

   Revision 1.8  2001/09/26 14:24:25  herzogs
   Added a few lines of code to show how config file uploads work.

   Revision 1.7  2001/09/25 16:12:49  herzogs
   Added ability to send the AcquiSuite a configuration file manifest with filename, time and checksum.

   Revision 1.6  2001/09/05 15:38:23  herzogs
   New version of sample script shows how to use MODE function from AcquiSuite
   Moved log data processing to sub function.
   variable reporting shows cgi variables with respect to MODE value.
   new variables for device type and class.

   Revision 1.5  2001/09/05 13:20:25  herzogs
   changed column name from devicetypenumber to deviceclass to avoid confusion with modbus id number.

   Revision 1.4  2001/09/05 00:20:24  herzogs
   New senddata update with modbus device type parameters. (not finished)
   upload.php has code to handle new parameters, including device type, name, type number and device class.

   Revision 1.3  2001/09/04 17:24:48  herzogs
   Changed ESERVERSERIAL to SERIALNUMBER.  Requires v1.19 of senddata or later (AcquiSuite firmware v1.00.0905)
   Update includes patch for backward compatibility.

   Revision 1.2  2001/08/30 14:14:59  herzogs
   Added comments and URL for the busybox software tool.

   Revision 1.1  2001/08/29 19:18:37  herzogs
   added upload_sample.php script to show how the data upload process works.
   
*/
/* -------------------------------------------------------------------------------------------------------------------*/
// Start the script here!
  
ob_start();    // cache header/body information, send nothing to the client yet.
               // we actually keep cacheing until the end of the script, if you have a large amount of data, 
               // Use ob_end_flush() to flush the output cache and send the headers, however "ReportFailure()"
               // won't work after ob_end_flush()                              
   
/* -------------------------------------------------------------------------------------------------------------------*/
/* reporting function be used to report and terminate.
*/
function ReportFailure($szReason, $RA, $SERIALNUMBER, $MBIP, $PORT, $MB)
{   Header("WWW-Authenticate: Basic realm=\"UploadRealm\"");                    // realm name is actually ignored by the AcquiSuite.
    Header("HTTP/1.0 406 Not Acceptable");
    $szNotes = sprintf("Rejected logfile upload from %s  Serial %s, modbus ip %s:%s, modbus device %s.", $RA, $SERIALNUMBER, $MBIP, $PORT, $MB);
    printf("FAILURE: $szReason\n");    // report failure to client.
    printf("NOTES:   $szNotes\n");
    ob_end_flush(); // send cached stuff, and stop caching. we've already kicked out the last header line.
    
    syslog(LOG_ERR, "$PHP_SELF: $szNotes   Reason: $szReason \n");
    exit;    
}
/* -------------------------------------------------------------------------------------------------------------------*/
/* reporting function be used to report and terminate.
*/
function ReportAuthorizationFailure($szReason, $RA, $SERIALNUMBER)
{   Header("WWW-Authenticate: Basic realm=\"UploadRealm\"");                    // realm name is actually ignored by the AcquiSuite.
    Header("HTTP/1.0 401 Unauthorized");
    $szNotes = sprintf("Rejected logfile upload from %s  Serial %s.", $RA, $SERIALNUMBER);
    printf("FAILURE: $szReason\n");    // report failure to client.
    printf("NOTES:   $szNotes\n");
    ob_end_flush(); // send cached stuff, and stop caching. we've already kicked out the last header line.
    
    syslog(LOG_ERR, "$PHP_SELF: $szNotes   Reason: $szReason \n");
    exit;    
}
/* -------------------------------------------------------------------------------------------------------------------*/
/*  calculate an MD5 checksum for the file that was uploaded. 
    On the AcquiSuite, the checksum form variable is calculated from the log file after the file has been gziped. 
    On the AcquiLite, the log file is not zipped, so the checksum is calculated on the raw log file.  
    In both cases, the checksum is that of the file that the DAS uploaded to your server.
*/
function GetFileChecksum($szFilename)
{
  $szChecksum = "[error]";          // provide some default value for this incase the following fails.
  if (file_exists($szFilename))     // make sure the file exists before we start.
  {   $szChecksum = md5_file($szFilename);   // built in php function that calculates the md5 checksum of a file.
  }
  return $szChecksum;
}
/* -------------------------------------------------------------------------------------------------------------------*/
/* -------------------------------------------------------------------------------------------------------------------*/
/* Function to  process the data file contents.

        This section processes the contents of the uploaded log file.  We open the logfile using gzopen()
        to uncompress the file while we read the contents.  For each line of the file, we create an sql
        statement that could be used to put the data into a database. 

*/
function ProcessLogFileUpload($REMOTE_ADDR, $SERIALNUMBER, $MODBUSIP, $MODBUSPORT, $MODBUSDEVICE, $LOGFILE, 
                                                        $MODBUSDEVICENAME, $MODBUSDEVICETYPE, $MODBUSDEVICETYPENUMBER, $MODBUSDEVICECLASS)
{
        // check here to verify the modbus device name, type, and class make sense 
        // locate the correct table name to store the data in the sql table
          
  $nSuccessCount = 0;           // set counters to zero.
  $nDuplicateCount = 0;
  $nRejectCount = 0;  
  
  $fd = gzopen($LOGFILE, "r");
  if (! $fd)
  {    ReportFailure("Can't open logfile. gzopen($LOGFILE) failed.", $REMOTE_ADDR, $SERIALNUMBER, $MODBUSIP, $MODBUSPORT, $MODBUSDEVICE);
       exit;
  }
  else
  {    while(!gzeof($fd))
       {    $szBuffer = gzgets($fd, 512);
            if (strlen($szBuffer) > 15) // 15 is kinda arbitrary, use enough space for date, err and alarms. 15 characters should be fine.
            {    // You must check for bad chars here, such as semicolon, depending on your flavor of SQL.  
                 // All data in the log file should be numeric, and may include symbols: minus, comma, space, or 'NULL' if the data point was not available.
                 // at some point in the future, Obvius will replace the word "NULL" with a blank column in the log data to save space.
                 // not checking for characters like semicolon poses a security risk to your SQL database
                 // as someone could insert a line "3,4,5,7');drop table password;('3,4,5" into the log file. (this would be very bad)                   
                 // replace "sometable" with the name of the table you wish to insert the data into.
                 
                 $tmpArray = split(",", $szBuffer);             // start check for bad chars here, like semicolon. first split a single log entry in to components.
                 $nCol = 0;
                 $query = "INSERT INTO sometable VALUES (";     // query prefix.  finished query string is:  insert into table values ('1','2','3')
                 foreach ($tmpArray as $value)                           // loop through each array element by calling it "value", (one per data column,) 
                 {   $value = str_replace("\"", "", $value);     // strip double quotes 
                     $value = str_replace("'", "", $value);  // strip single quotes           
                     $value = str_replace(";", "", $value);   // strip semicolon. (not needed if you use the following MySQL command)
                     $value = trim($value);                   // trim whitespace, tabs, etc, on the ENDS of the string.  
                     // $value = mysql_escape_string($value);   // MySQL has a special strip function just for this purpose, other SQL versions may vary.
                     switch($nCol)
                     {  case 0:  $query  = $query . sprintf("'%s'", $value); break; // quote data (utc date), first column has no leading comma
                        case 2: 
                        case 3:  $query  = $query . sprintf(",%s", $value); break;  // don't quote hex (alarm) data, column needs leading comma seperator.
                        default: 
                        {   if ($value == "NULL") $query  = $query . ",NULL" ;    // don't quote the word 'NULL'
                               else $query  = $query . sprintf(",'%s'",$value); // quote data, all other columns need leading comma seperator.
                        }
                     }
                     $nCol++;
                 }
                 $query = $query . ")"; // close last paren around VALUES section.
                 // finished building sql query string.
                                         
                 // ***** for purposes of this example, we are just going to display the SQL statement back to the caller. **** 
                 printf("SQL: %s \n", $query);
                 
                 // again, this query doesn't actually execute in the sample. Replace with a query apporpriate for your flavor of SQL
                 // $result = sql_query($query,  $SQL)                 
                 $result=1; // force success code here, REMOVE THIS LINE.
                 if (!  $result  )
                 {   // check error message from SQL query, ignore duplicate warnings.  
                        // $strErrorMessage =     sql_error($SQL);
                      if (stristr($strErrorMessage, "duplicate entry") != FALSE)
                      {   $nDuplicateCount +=1;                          
                      }
                      else
                      {   $nRejectCount +=1;
                      }
                      printf( "WARNING: line rejected, %s: DATA: %s\n", $strErrorMessage, $szBuffer);
                 }
                 else                 
                 {    $nSuccessCount += 1;
                 }
            }
            else
            {    printf( "WARNING: short line rejected. DATA: %s\n", $szBuffer);
                 $nRejectCount +=1;
            }
       }
       gzclose($fd);
       // PHP automatically removes temp files when the script exits.
  }
  
  
  // now that the data is in the database, check the most current data point, and calculate the alarm status.
  // query for last record in the database, get device status, 
  
  
  echo "REPORT: Uploaded data file contained $nSuccessCount vaild records, $nDuplicateCount duplicate records, and $nRejectCount rejected records.\n";

  // Finally, send the result code back to the AcquiSuite. Success cause the log file to be purged.
  
  $nRejectCount = 1;   // for this sample script, the nRejectCount is set to 1 to prevent the AcquiSuite from flushing the log file.  YOU SHOULD REMOVE THIS LINE.
  if ($nRejectCount != 0)
  {   ReportFailure( "An error occurred while importing data from the data file.\n", $REMOTE_ADDR, $SERIALNUMBER, $MODBUSIP, $MODBUSPORT, $MODBUSDEVICE);
  }
  else
  {   echo "SUCCESS\n";         
  }
} // ProcessLogFileUpload

/* -----------------------------------------------------------------------------------------------*/
/*  This function sends a list of all current configuration files on the server. 
    The format is as follows:
        
                CONFIGFILE,loggerconfig.ini,md5checksum,timestamp
                CONFIGFILE,modbus/mb-001.ini,md5checksum,timestamp
                CONFIGFILE,modbus/mb-007.ini,md5checksum,timestamp
                                
    the timestamp is in UTC time, SQL format, ie "YYYY-MM-DD HH:MM:SS" (use blank if not present/first-time)
    The md5checksum is the md5 checksum of the config file. (use blank if not present/first-time)
          
    Checksums and timestamps are stored in a database, file data can be stored in the same table as a blob record.
    When a config file is received from the AcquiSuite, the server should verify the checksum, save the config file
    and also save the timestamp and checksum for the file for future reference.  
          
    The AcquiSuite will process this response, and only exchange files listed in the manifest response.
          
    If the config file checksum sent in the response does not match the AcquiSuite config file checksum, the        
    AcquiSuite will process the exchange.  If "remote configuration" is enabled, the AcquiSuite will check the 
    timestamp to find if the server version of the config file is newer than the AcquiSuite version .if so the 
    AcquiSuite will request to download the configuration file from the server. 
          
    If the checksum values do not match and the AcquiSuite file timestamp is newer, or if the server timestamp is blank, 
    or if the "remote configuration" option is not enabled, the AcquiSuite will send the configuration file to 
    the server.
*/
function SendConfigFileManifest($REMOTE_ADDR, $SERIALNUMBER, $MODBUSIP, $MODBUSPORT)
{       
    // printf("CONFIGFILE,loggerconfig.ini,%s,%s\n", $szConfigurationChecksum, $szConfigurationChangeTime); 
        
    // for each modbus device on this acquisuite, process the following line:
    // printf("CONFIGFILE,modbus/mb-%03d.ini,%s,%s\n", $nModbusAddress, $szConfigurationChecksum, $szConfigurationChangeTime); 
}
/* -----------------------------------------------------------------------------------------------*/
/*  This function sends a specific configuration file to the acquisuite. 
    The script should finish the header, and then send the config file as the body to the http response.
    No other content should be included in the response body.
        
    The variables $SERIALNUMBER, $MODBUSIP, $MODBUSPORT and $MODBUSDEVICE are used to identify the config file.       
    THe variable $MODBUSDEVICECLASS is used to verify the device the configuration file is for is the same as
    the hardware detected on the AcquiSuite.          

    Special case: when MODBUSDEVICE and MODBUSDEVICECLASS are both 0, return the loggerconfig.ini file.
      
    The AcquiSuite will confirm the md5 checksum from the manifest with the checksum of the downloaded file for verification.
*/
function SendConfigFile($REMOTE_ADDR, $SERIALNUMBER, $MODBUSIP, $MODBUSPORT, $MODBUSDEVICE, $MODBUSDEVICECLASS)
{
}
/* ================================================================================================================== */
/* ================================================================================================================== */
/*
                BEGIN MAIN SCRIPT HERE !
                
         First check user authenticity.  The AcuqiSuite uses basic http authentication, the PHP scripting language 
         extracts the user/password and provides them in the variables PHP_AUTH_USER and PHP_AUTH_PW.  Different 
         scripting languages may have different methods of providing username/password paris for basic http authentication.
*/
  if ($SENDDATATRACE == "YES") printf("<pre>\n");// make the output more readable

  if(!isset($PHP_AUTH_USER))
  {   ReportAuthorizationFailure("A system serial number must be supplied to upload data\n", $REMOTE_ADDR, $PHP_AUTH_USER);
      exit;
      // if your server terminates here, please read PHP Authentication comments above.
  }
  
  if(!isset($PHP_AUTH_PW))
  {   ReportAuthorizationFailure("A system serial number and password must be supplied to upload data\n", $REMOTE_ADDR, $PHP_AUTH_USER);
      exit;
      // if your server terminates here, please read PHP Authentication comments above.
  }
     
  if ($SERIALNUMBER != $PHP_AUTH_USER)
  {   ReportAuthorizationFailure("SerialNumber and http authentication username do not match.", $REMOTE_ADDR, $PHP_AUTH_USER);
      exit;
  }
  
  // check the AcquiSuite list here, make sure the serial number provided by the acquisuite is
  // one that we know about, and have tables in the database for.
  
  // CHECK PASSWORD HERE. replace "password" with a stored password value for the spcific acquisuite
  // or use an SQL query to verify the password.
  
  if ($PHP_AUTH_PW != "password" )
  {   ReportAuthorizationFailure("The authentication serial number password do not match.", $REMOTE_ADDR, $PHP_AUTH_USER);
        printf("Hint: this sample script uses 'password' as the passowrd");
      exit;
  }
  
  // ok, we got this far, we must have had a valid serial number and password.
  // Now we need to validate the data that was sent.
  
/* --------- End of Authentication -----------------------------------------------------------------------------------*/
/* 
   The upload process supports several types of data exchanges for things like log and config files.  
   This sample only processes log files, however the code shows branches for other connection modes.
*/

  $szChecksum = "";                                                             // empty by default, get a file checksum if needed.
  if ($MODE == "LOGFILEUPLOAD") $szChecksum = GetFileChecksum($LOGFILE);        // calculate a checksum for the file.
  if ($MODE == "CONFIGFILEUPLOAD") $szChecksum = GetFileChecksum($CONFIGFILE);  // calculate a checksum for the file.
       
/* -------------------------------------------------------------------------------------------------------------------*/
/*  report the variables sent by the client if the client is requesting TRACE MODE.
    this must be done AFTER the checksum is calculated.
   
    In the file /etc/sysconfig/loggerconfig.ini on the acquisuite, two variables affect how the 
    upload log file is recorded.  Details on how to enable these variables are included in the
    file "AS_uploaddebug.txt".   If these are not enabled the form variable SENDDATATRACE is 
    not included in the form data post, and the server should assume the setting is NO for 
    both items.
   
                SENDDATADEBUG=YES/NO
                SENDDATATRACE=YES/NO
        
    When SENDDATATRACE is set to YES, the database server script should report progress with verbose messages
    if set to NO, the database server script should only report problems. Verbose messages include complete 
    HTTP exchange information including http response headers.
   
    SENDDATADEBUG=YES causes the AcquiSuite software to report progress while uploading the data. This will also
    cause the AcquiSuite to log all response text from the remote server to the uploadlog file on the AcquiSuite. 
    The remote server should send status information and error codes to the AcquiSuite when this form variable is
    set to YES to allow the user to see the upload progress and find where problems (if any) are happening.
   
   
    MODE specifies what type of transfer this is.
   
                LOGFILEUPLOAD            standard transfer to upload data file
                CONFIGFILEMANIFEST       request a list of config files stored by the sql server, and report date/time for each
                CONFIGFILEUPLOAD         send a config file to the sql server
                CONFIGFILEDOWNLOAD       download a config file from the sql server
                STATUS                   send operating info about the acquisuite, firmware version, uptime, dial attempts, etc.
                TEST                     used for the AcquiSuite connection test.  Verify user/password and then return a success message.
         
    The MODBUSDEVICECLASS is a unique id that allows the AcquiSuite to decide what class of device
    it is working with.  It is assumed that the number and type of points stored for a specific device type are the same.
    For example, the Veris 8036 power meter has several versions for 100, 300, 800Amp, however the list of points are the
    same for all devices.  The deviceclass will be the same for all flavors of Veris 8036 meters.
    More are listed in the table structures directory with the upload details document. 
        
        Currently, the deviceclass may be one of the following:
          MBCLASS_UNKNOWN     0
          MBCLASS_HXO         1           (3 data columns)
          MBCLASS_H8036       2           (26 data columns)
          MBCLASS_M4A4P       3           (8 data columns, A8923 basic io module)
          MBCLASS_H8035       4           (2 data columns)
          MBCLASS_H8163       5           (29 data columns)
          MBCLASS_H663        6           (42 data columns)
          MBCLASS_H8238       7           (28 data columns)
          MBCLASS_H8076       8           (28 data columns)
          MBCLASS_M4A4P2      9           (32 data columns, A8923 enhanced io module, A8811 built-in io module)
          MBCLASS_ION6200     10          (61 data columns)
          MBCLASS_ION7300     11          (64 data columns)
          MBCLASS_ION7500     12          (64 data columns)
          MBCLASS_ION7700     13          (64 data columns)
          MBCLASS_PROMON      14          (38 data columns)
          MBCLASS_ACQUILITE   15          (28 data columns)   
        
        More device types may be added as new devices are included in the supported hardware list. Note: the data column count is 
        in addition to the first 4 columns for time,error,low-alarm, and high-alarm.

*/

  if ($SENDDATATRACE == "YES")
  {    echo "Logfile upload from $REMOTE_ADDR \n" ;
       echo "Got SENDDATATRACE:          " . $SENDDATATRACE . " \n";                // set when the AcquiSuite requests full session debug messages
       echo "Got MODE:                   " . $MODE . "\n";                          // this shows what type of exchange we are processing. 
       echo "Got SERIALNUMBER :          " . $SERIALNUMBER . " \n" ;                // The acquisuite serial number
       
       if ($MODE == "LOGFILEUPLOAD")
       {   echo "Got LOGFILE_name:           " . $LOGFILE_name . " \n" ;            // This is original file name on the AcquiSuite flash disk.
           echo "Got LOGFILE:                " . $LOGFILE . " \n" ;                 // This is the PHP temp file name.
           echo "Got LOGFILE_size:           " . $LOGFILE_size . " \n" ;            // What PHP claims the file size is
           echo "calculated filesize:        " . filesize($LOGFILE) . "\n";         // what the actual file size is.
           echo "Got MD5CHECKSUM:            " . $MD5CHECKSUM . " \n" ;             // the MD5 checksum the AcquiSuite generated prior to upload
           echo "calculated checksum:        " . $szChecksum . " \n" ;              // the MD5 sum we calculated on the file we received.
           echo "Got LOOPNAME:               " . $LOOPNAME . " \n" ;                // The name of the AcquiSuite (modbus loop name)
           echo "Got MODBUSIP:               " . $MODBUSIP . " \n" ;                // Currently, always 127.0.0.1, may change in future products.
           echo "Got MODBUSPORT:             " . $MODBUSPORT . " \n" ;              // currently, always 502, may change in future products.
           echo "Got MODBUSDEVICE:           " . $MODBUSDEVICE . " \n" ;            // the modbus device address on the physical modbus loop. (set by dip switches)
           echo "Got MODBUSDEVICENAME:       " . $MODBUSDEVICENAME . " \n" ;        // the user specified device name. 
           echo "Got MODBUSDEVICETYPE:       " . $MODBUSDEVICETYPE . " \n" ;        // the identity string returned by the modbus device identify command 
           echo "Got MODBUSDEVICETYPENUMBER: " . $MODBUSDEVICETYPENUMBER . " \n" ;  // the identity number returned by the modbus device identify command 
           echo "Got MODBUSDEVICECLASS:      " . $MODBUSDEVICECLASS . " \n" ;       // a unique id number for the modbus device type.
           echo "Got FILETIME:               " . $FILETIME . " \n" ;                // the date and time the file was last modified. (in UTC time).
       }
       
       if ($MODE == "CONFIGFILEUPLOAD")
       {   echo "Got CONFIGFILE_name:        " . $CONFIGFILE_name . " \n" ;         // This is original file name on the AcquiSuite flash disk.
           echo "Got CONFIGFILE:             " . $CONFIGFILE . " \n" ;              // This is the PHP temp file name.
           echo "Got CONFIGFILE_size:        " . $CONFIGFILE_size . " \n" ;         // What PHP claims the file size is
           echo "Got MODBUSIP:               " . $MODBUSIP . " \n" ;                // Currently, always 127.0.0.1, may change in future products.
           echo "Got MODBUSPORT:             " . $MODBUSPORT . " \n" ;              // currently, always 502, may change in future products.
           echo "Got FILETIME:               " . $FILETIME . " \n" ;                // the date and time the file was last modified. (in UTC time).
           echo "calculated filesize:        " . filesize($CONFIGFILE) . "\n";      // what the actual file size is.
           echo "Got MD5CHECKSUM:            " . $MD5CHECKSUM . " \n" ;             // the MD5 checksum the AcquiSuite generated prior to upload
           echo "calculated checksum:        " . $szChecksum . " \n" ;              // the MD5 sum we calculated on the file we received.     
       } 
       
       if ($MODE == "CONFIGFILEMANIFEST")
       {   echo "Got LOOPNAME:               " . $LOOPNAME . " \n" ;                // The name of the AcquiSuite (modbus loop name)
       }
       
       if ($MODE == "CONFIGFILEDOWNLOAD")
       {   echo "Got MODBUSIP:               " . $MODBUSIP . " \n" ;                // Currently, always 127.0.0.1, may change in future products.
           echo "Got MODBUSPORT:             " . $MODBUSPORT . " \n" ;              // currently, always 502, may change in future products.
           echo "Got MODBUSDEVICE:           " . $MODBUSDEVICE . " \n" ;            // the modbus device address on the physical modbus loop. (set by dip switches)
           echo "Got MODBUSDEVICECLASS:      " . $MODBUSDEVICECLASS . " \n" ;       // a unique id number for the modbus device type.
       }

       if ($MODE == "STATUS")
       {   echo "Got UPTIME:                 " . $UPTIME . " \n" ;                  // number of seconds elapsed since the AcquiSuite booted.
           echo "Got LOOPNAME:               " . $LOOPNAME . " \n" ;                // The name of the AcquiSuite (modbus loop name)
           echo "Got PERCENTBLOCKSINUSE:     " . $PERCENTBLOCKSINUSE . " \n" ;      // percentage of disk space consumed (by blocks)
           echo "Got PERCENTINODESINUSE:     " . $PERCENTINODESINUSE . " \n" ;      // percentage of total log file entries used 
           echo "Got UPLOADATTEMPT:          " . $UPLOADATTEMPT . " \n" ;           // this is upload attempt X.  Use the loggerconfig.ini file to get the max upload attempts.
           echo "Got ACQUISUITEVERSION:      " . $ACQUISUITEVERSION . " \n" ;       // Firmware version - AcquiSuite component
           echo "Got USRVERSION:             " . $USRVERSION . " \n" ;              // Firmware version - USR files component
           echo "Got ROOTVERSION:            " . $ROOTVERSION . " \n" ;             // Firmware version - ROOT files component
           echo "Got KERNELVERSION:          " . $KERNELVERSION . " \n" ;           // Firmware version - Kernel component.
       }
           
       if ($MODE == "TEST")
       {   echo "Test mode - nothing to do.";                                                                           // Test mode.  We've verified authentication, do no processing
       }
             
  } // end if trace session reporting enabled.
  
/* -------------------------------------------------------------------------------------------------------------------*/
/* Decide what to do based on the MODE setting.
    Each of these subroutines must report to the client what the success/failure status is.
*/

  if ($MODE == "LOGFILEUPLOAD")
  {   if ($szChecksum != $MD5CHECKSUM)
      {  ReportFailure("Log file checksum does not match.", $REMOTE_ADDR, $SERIALNUMBER, $MODBUSIP, $MODBUSPORT, $MODBUSDEVICE);
         exit;
      }
      ProcessLogFileUpload($REMOTE_ADDR, $SERIALNUMBER, $MODBUSIP, $MODBUSPORT, $MODBUSDEVICE, $LOGFILE, 
                                                        $MODBUSDEVICENAME, $MODBUSDEVICETYPE, $MODBUSDEVICETYPENUMBER, $MODBUSDEVICECLASS);
  } // end LOGFILEUPLOAD processing
  
       
  if ($MODE == "CONFIGFILEUPLOAD")
  {   if ($szChecksum != $MD5CHECKSUM)
      {  ReportFailure("Configuration file checksum does not match.", $REMOTE_ADDR, $SERIALNUMBER, $MODBUSIP, $MODBUSPORT, $MODBUSDEVICE);
         exit;
      }
  }  // end CONFIGFILEUPLOAD processing
       
       
  if ($MODE == "CONFIGFILEMANIFEST")
  {   SendConfigFileManifest($REMOTE_ADDR, $SERIALNUMBER, $MODBUSIP, $MODBUSPORT);
  } // end CONFIGFILEMANIFEST processing
       
       
  if ($MODE == "CONFIGFILEDOWNLOAD")
  {   SendConfigFile($REMOTE_ADDR, $SERIALNUMBER, $MODBUSIP, $MODBUSPORT, $MODBUSDEVICE, $MODBUSDEVICECLASS);
  } // end CONFIGFILEDOWNLOAD processing
  
  
  // Trap all modes we don't know about, or if mode was not set.
  if ( ($MODE != "LOGFILEUPLOAD") && ($MODE != "CONFIGFILEUPLOAD") && ($MODE != "CONFIGFILEMANIFEST") && ($MODE != "CONFIGFILEDOWNLOAD") && ($MODE != "STATUS") )
  {   ReportFailure("Mode request MODE=$MODE is not supported.", $REMOTE_ADDR, $SERIALNUMBER, $MODBUSIP, $MODBUSPORT, $MODBUSDEVICE);
      exit;
  }
      
/* -------------------------------------------------------------------------------------------------------------------*/
/* Clean up and exit.
*/       

  ob_end_flush(); // send cached stuff, and stop caching. This may only be done after the last point where you call ReportFailure()

?>
