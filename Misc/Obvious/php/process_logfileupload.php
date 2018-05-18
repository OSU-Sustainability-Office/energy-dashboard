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
    $Id: process_logfileupload.php,v 1.4 2009/02/09 14:46:13 herzogs Exp $
    
    
    This PHP script shows how the interface between the AcquiSuite and Database Server
    works. This file is intended as a sample, and requires modification to fit custom
    envrionments.

    This scrip only demonstrates the MODE=LOGFILEUPLOAD method used to send
    a log file from the AcquiSuite or AcquiLite to the webserver.   Other
    methods are ignored.
*/
/* -------------------------------------------------------------------------------------------------------------------*/
/* Original Author: Stephen Herzog for Obvis LLC,  2001-2006.

   $Log: process_logfileupload.php,v $
   Revision 1.4  2009/02/09 14:46:13  herzogs
   Updated script to handle blank lines.

   Revision 1.3  2006/01/22 17:26:48  herzogs
   Updated sample script to include bsd style license
   Cleaned up some tab/space formatting issues.

   Revision 1.2  2006/01/19 01:28:09  herzogs
   Updated sample script to use proper $_REQUEST notation for form variables.
   Fixed up filename and directory handling.
   Script tested and works.

   Revision 1.1  2006/01/18 19:54:09  herzogs
   Added a new sample script that provides only the basics of receiving
   an uploaded log file, and writes the file to a storage directory on the server.
   The new brief script should help show the concept of receiving a file a
   bit easier, and can be used to build a system that batch processes log files
   after they are received and stored on the server.


*/
/* -------------------------------------------------------------------------------------------------------------------*/
/* reporting function be used to report and terminate.
*/

function ReportFailure($szReason)
{   Header("WWW-Authenticate: Basic realm=\"UploadRealm\"");    // realm name is actually ignored by the AcquiSuite.
    Header("HTTP/1.0 406 Not Acceptable");                      // generate a 400 series http server error response.

    $szNotes = sprintf("Rejected logfile upload"); // print out some information about what failed, for the benifit of the log file.
    printf("FAILURE: $szReason\n");                // report failure to client.
    printf("NOTES:   $szNotes\n");

    ob_end_flush(); // send cached stuff, and stop caching. we've already kicked out the last header line.

    exit;
}

/* ================================================================================================================== */
/*
    BEGIN MAIN SCRIPT HERE !
*/


    ob_start();    // cache header/body information, send nothing to the client yet.
                   // we actually keep cacheing until the end of the script, if you have a large amount of data,
                   // Use ob_end_flush() to flush the output cache and send the headers, however "ReportFailure()"
                   // won't work after ob_end_flush()

    printf("<pre>\n");    // make the output more readable if being viewed by a web browser (msie/firefox).

        // First check the acquisuite/acquilite credentials.  The AcuqiSuite uses basic http
        // authentication, the PHP scripting language extracts the user/password and provides them
        // in the variables PHP_AUTH_USER and PHP_AUTH_PW.  Different scripting languages may have
        // different methods of providing username/password paris for basic http authentication.
        // check these vaules here and proceed/terminate if credentials are good.
        // for simplicity of this script, no serialnumber/password check is performed in this example.

    // AUTHENTICATION GOES HERE

        // Review the MODE variable.  This sample script only handles a mode type of LOGFILEUPLOAD.
        // Any other mode variable causes the script to terminate.
        // The upload process supports several types of data exchanges for things like log and config files.
        // This sample only processes log files, however the code shows branches for other connection modes.

    if ($_REQUEST['MODE'] != "LOGFILEUPLOAD")
    {   ReportFailure("Mode type " . $_REQUEST['MODE'] . " not supported by this sample script\n");
    }

        // calculate an MD5 checksum for the file that was uploaded.
        // On the AcquiSuite, the checksum form variable is calculated from the log file after the file has been gziped.
        // On the AcquiLite, the log file is not zipped, so the checksum is calculated on the raw log file.
        // In both cases, the checksum is that of the file that the DAS uploaded to your server.
        // the md5_file() function calculates the md5 checksum of the temp file that PHP stored the log data in when
        // it was decoded from the HTTP/POST.


    $szChecksum = "[error]";                           // provide some default value for this in case the following fails.
    if (file_exists($_FILES['LOGFILE']['tmp_name']))              // make sure the file exists before we start.
    {   $szChecksum = md5_file($_FILES['LOGFILE']['tmp_name']);   // built in php function that calculates the md5 checksum of a file.
    }


        // This section prints all the expected form variables.  This serves no real purpose other
        // than to demonstrate the variables.  Enable debugging on the AcquiSuite or AcquiLite to
        // allow these to show up in the log file for your review.

    printf("Logfile upload from ip      %s \n", $_SERVER['REMOTE_ADDR'] );               // print the IP address of the DAS client.
    printf("Got SENDDATATRACE:          %s \n", $_REQUEST['SENDDATATRACE'] );             // set when the AcquiSuite requests full session debug messages
    printf("Got MODE:                   %s \n", $_REQUEST['MODE'] );                      // this shows what type of exchange we are processing.
    printf("Got SERIALNUMBER:           %s \n", $_REQUEST['SERIALNUMBER'] );              // The acquisuite serial number
    printf("Got PASSWORD:               %s \n", $_REQUEST['PASSWORD'] );                  // The acquisuite password
    printf("Got LOOPNAME:               %s \n", $_REQUEST['LOOPNAME']  ) ;                // The name of the AcquiSuite (modbus loop name)
    printf("Got MODBUSIP:               %s \n", $_REQUEST['MODBUSIP'] );                  // Currently, always 127.0.0.1, may change in future products.
    printf("Got MODBUSPORT:             %s \n", $_REQUEST['MODBUSPORT']  ) ;              // currently, always 502, may change in future products.
    printf("Got MODBUSDEVICE:           %s \n", $_REQUEST['MODBUSDEVICE']  ) ;            // the modbus device address on the physical modbus loop. (set by dip switches)
    printf("Got MODBUSDEVICENAME:       %s \n", $_REQUEST['MODBUSDEVICENAME']  ) ;        // the user specified device name.
    printf("Got MODBUSDEVICETYPE:       %s \n", $_REQUEST['MODBUSDEVICETYPE'] ) ;         // the identity string returned by the modbus device identify command
    printf("Got MODBUSDEVICETYPENUMBER: %s \n", $_REQUEST['MODBUSDEVICETYPENUMBER']  ) ;  // the identity number returned by the modbus device identify command
    printf("Got MODBUSDEVICECLASS:      %s \n", $_REQUEST['MODBUSDEVICECLASS'] ) ;        // a unique id number for the modbus device type.
    printf("Got MD5CHECKSUM:            %s \n", $_REQUEST['MD5CHECKSUM']  );              // the MD5 checksum the AcquiSuite generated prior to upload
    printf("calculated checksum:        %s \n", $szChecksum ) ;                           // the MD5 sum we calculated on the file we received.
    printf("Got FILETIME:               %s \n", $_REQUEST['FILETIME']  ) ;                // the date and time the file was last modified. (in UTC time).
    printf("Got FILESIZE:               %s \n", $_REQUEST['FILESIZE'] ) ;                 // the original size of the log file on the AcquiSuite flash disk prior to upload
    printf("calculated filesize:        %s \n", filesize($_FILES['LOGFILE']['tmp_name'])); // the calculated file size of the file we received..
    printf("Got LOGFILE orig name:      %s \n", $_FILES['LOGFILE']['name'] );             // This is original file name on the AcquiSuite flash disk.
    printf("Got LOGFILE tmp name:       %s \n", $_FILES['LOGFILE']['tmp_name'] );         // This is the PHP temp file name where PHP stored the file contents.
    printf("Got LOGFILE size:           %s \n", $_FILES['LOGFILE']['size']  );            // What PHP claims the temp file size is
    printf("\n");


        // now we should check the log file checksum to verify it is correct.
        // if not, something got corrupted.  refuse the file and the DAS will upload it again later.

    if ($szChecksum != $_REQUEST['MD5CHECKSUM'])
    {   ReportFailure("The checksum of received file does not match the checksum form variable sent by the DAS.\n");
        exit;
    }

        // The MODBUSDEVICECLASS is a unique id that allows the AcquiSuite to decide what class of device
        // it is working with.  It is assumed that the number and type of points stored for a specific
        // device type are the same.  For example, the Veris 8036 power meter has several versions
        // for 100, 300, 800Amp, however the list of points are the same for all devices.  The deviceclass
        // will be the same for all flavors of Veris 8036 meters.
        // A complete list of deviceclass values are listed in the pushupload/tablestructures directory
        // in the readme.txt file of this zip archive.   Also provided is the table structure for
        // each listed device class.
        // For example, the deviceclass may be one of the following:
        //       MBCLASS_UNKNOWN     0
        //       MBCLASS_H8036       2           (26 data columns)
        //       MBCLASS_M4A4P2      9           (32 data columns, A8923 enhanced io module, A8811 built-in io module)
        // check here to verify the modbus device name, type, and class make sense based on previous uploads.
        // You should use this information to ensure the data is stored in a table with the correct number of columns.


        // Next open the file handle to the uploaded data file that came from the DAS.
        // the bulk of the work here is the PHP function $_FILES which provides an array of all files embedded in the
        // mime data sent to the server in the HTTP/POST.  You may read from any one file by requesting the file by name
        // in the index.  ie, a file attached as "LOGFILE" is referred to by the array element $_FILES['LOGFILE'].
        // the element is actually a second array with elements for "name", "tmp_name" and "size".  The tmp_name element
        // provides the file name that the PHP engine used to store the contents of the file.  To access the file data,
        // simply open the file with the name provided by the tmp_name element, and read the data.
        // note: gzopen() will read both compressed log files (AcquiSuite) and uncompressed text log files (AcquiLite).

    $fd = gzopen($_FILES['LOGFILE']['tmp_name'], "r");
    if (! $fd)
    {   ReportFailure("gzopen failed to open logfile " . ($_FILES['LOGFILE']['tmp_name']));
        exit;
    }

        // create a log file on the server.  for ease of permissions sake, we create this in the /tmp directory.
        // note that the file is created with the permissions of the webserver.
        // the file is in /tmp/xxxx/mb-yyy.zzzzzzzz.log
        // where xxx is the serial number of the AcquiSuite or AcquiLite
        // and yyy is the modbus address number of the device, and zzzzzzzz is the unique datestamp when the file was received.
        // DANGER!.  it is a really bad idea to create a file with unfiltered input from a webserver post.
        // this is why we generate a file name based on some other parameters.
        // this function is only safe if you validate the SERIALNUMBER field with known valid values from your database.
        // the modbus device is relatively safe as it is reformated as a number


    $szTargetDirectory = sprintf("/tmp/%s", $_REQUEST['SERIALNUMBER']);   // FIX THIS (clean up serial number, or validate it)

    $szTargetFilename  = sprintf("%s/mb-%03d.%08X.log", $szTargetDirectory, $_REQUEST['MODBUSDEVICE'], time() );


    if (! file_exists($szTargetDirectory ))            // if the directory does not exist, create it.
    {
        $nResult = mkdir($szTargetDirectory, 0700);    // create directory (unix permissions 0700 are for directory owner access only)
        if (! $nResult)                                // trap directory create errors.
        {   ReportFailure("Error creating directory " . $szTargetDirectory);
            exit;
        }
    }

        // very basic test here to make sure we don't overwrite previous log data.  if a file exists, abandon
        // the upload, and let the DAS try to upload this log file later.  this should only happen if the DAS
        // tries to upload 2 log files within 1 second such that the timestamp doesn't change.  This would almost
        // never happen, so the harsh handling (refusal) shouldn't be much of a problem.

    if (file_exists($szTargetFilename ))
    {   ReportFailure("target file already exits, try again later " . $szTargetFilename);
        exit;
    }

    $fOut = fopen($szTargetFilename, w);           // create/open target file for writing
    if (! $fOut)                                   // trap file create errors.
    {   ReportFailure("Error creating file " . $szTargetFilename);
        exit;
    }

    printf("saving data to file %s\n", $szTargetFilename);  // be nice and print out the target file location.


    while(!gzeof($fd))                             // loop through the source file until we reach the end of the file.
    {   $szBuffer = gzgets($fd, 512);              // read lines from the log file.  make sure lines don't exceed 512 bytes
        if (strlen($szBuffer) > 0)                 // verify the line is not blank.
        {   $nResult = fputs($fOut, $szBuffer);    // write data to the log file.
            if (! $nResult)                        // trap file write errors.
            {   ReportFailure("Error writing to output file " . $szTargetFilename );
                exit;
            }
        }
    }
    fclose($fOut);  // close the target file
    gzclose($fd);   // close the source uploaded file
                    // PHP automatically removes temp files when the script exits.


    ob_end_flush();   // send any cached stuff, and stop caching. This may only be done after the last point where you might call ReportFailure()

    printf("\nSUCCESS\n");   // this line is what the AcquiSuite/AcquiLite searches for in the response to
                             // tell it that the data was received and the original log file may be deleted.

    printf("</pre>\n");  // end of the script
?>
