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
    $Id: process_status.php,v 1.2 2009/05/25 20:19:40 herzogs Exp $


    This PHP script shows how the interface between the AcquiSuite and Database Server
    works. This file is intended as a sample, and requires modification to fit custom
    envrionments. This script is provided as an example only, and should not be
    used in a production environment.

    This scrip only demonstrates the MODE=STATUS method used to send
    a status information from the AcquiSuite or AcquiLite to the webserver.
    Other methods are ignored.

*/
/* -------------------------------------------------------------------------------------------------------------------*/
/* Original Author: Stephen Herzog for Obvis LLC,  2001-2006.

   $Log: process_status.php,v $
   Revision 1.2  2009/05/25 20:19:40  herzogs
   Added notes about GSM signal strength in status upload php script.

   Revision 1.1  2006/01/22 17:23:39  herzogs
   Added first draft of the mode=status example php script.



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

        // Review the MODE variable.  This sample script only handles a mode type of STATUS
        // Any other mode variable causes the script to terminate.
        // The upload process supports several types of data exchanges for things like log and config files.
        // This sample only processes log files, however the code shows branches for other connection modes.

    if ($_REQUEST['MODE'] != "STATUS")
    {   ReportFailure("Mode type " . $_REQUEST['MODE'] . " not supported by this sample script\n");
    }

        // This section prints all the expected form variables.  This serves no real purpose other
        // than to demonstrate the variables.  Enable debugging on the AcquiSuite or AcquiLite to
        // allow these to show up in the log file for your review.


    printf("Status information from ip  %s \n", $_SERVER['REMOTE_ADDR'] );                // print the IP address of the DAS client.

    printf("Got SENDDATATRACE:          %s \n", $_REQUEST['SENDDATATRACE'] );             // set when the A.S. or A.L. requests full session debug messages
    printf("Got MODE:                   %s \n", $_REQUEST['MODE'] );                      // this shows what type of exchange we are processing.
    printf("Got SERIALNUMBER:           %s \n", $_REQUEST['SERIALNUMBER'] );              // The acquisuite serial number
    printf("Got PASSWORD:               %s \n", $_REQUEST['PASSWORD'] );                  // The acquisuite password
    printf("Got LOOPNAME:               %s \n", $_REQUEST['LOOPNAME']  ) ;                // The name of the AcquiSuite (modbus loop name)
    printf("Got UPTIME:                 %s \n", $_REQUEST['UPTIME']  ) ;                  // The number of seconds the DAS has been running

    printf("Got PERCENTBLOCKSINUSE:     %s \n", $_REQUEST['PERCENTBLOCKSINUSE']  ) ;      // the amount of memory in use for storing log file data
    printf("Got PERCENTINODESINUSE:     %s \n", $_REQUEST['PERCENTINODESINUSE']  ) ;      // the amount of memory in use for storing log file data
    printf("Got UPLOADATTEMPT:          %s \n", $_REQUEST['UPLOADATTEMPT']  ) ;           // first attempt, second attempt, etc.

    printf("Got ACQUISUITEVERSION:      %s \n", $_REQUEST['ACQUISUITEVERSION']  ) ;       // A.S. only, firmware version for as.cramfs.
    printf("Got USRVERSION:             %s \n", $_REQUEST['USRVERSION']  ) ;              // A.S. only, firmware version for usr.cramfs
    printf("Got ROOTVERSION:            %s \n", $_REQUEST['ROOTVERSION']  ) ;             // A.S. only, firmware version for root
    printf("Got KERNELVERSION:          %s \n", $_REQUEST['KERNELVERSION']  ) ;           // A.S. shows linux kernel version.  A.L. shows ucII version
    printf("Got FIRMWAREVERSION:        %s \n", $_REQUEST['FIRMWAREVERSION']  ) ;         // A.L. only, shows firmware version

    printf("Got BOOTCOUNT:              %s \n", $_REQUEST['BOOTCOUNT']  ) ;               // A.L. only, shows number of system startups.
    printf("Got BATTERYGOOD:            %s \n", $_REQUEST['BATTERYGOOD']  ) ;             // A.L. only, shows onboard battery status (YES/NO).

    printf("Got GSMSIGNAL:              %s \n", $_REQUEST['GSMSIGNAL']  ) ;               // GSM enabled AcquiSuite only, shows signal strenght/quality prior to gsm outbound call.  return value is "RSSI,BER"


    printf("\n");   // blank line to make things look nice.

    ob_end_flush();   // send any cached stuff, and stop caching. This may only be done after the last point where you might call ReportFailure()

    printf("\nSUCCESS\n");   // this line is what the AcquiSuite/AcquiLite searches for in the response to
                             // tell it that the data was received and the original log file may be deleted.

    printf("</pre>\n");  // end of the script
?>
