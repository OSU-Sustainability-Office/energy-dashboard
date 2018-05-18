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
    $Id: process_manifest.php,v 1.1 2006/05/18 17:55:13 herzogs Exp $


    This PHP script shows how the interface between the AcquiSuite and Database Server
    works. This file is intended as a sample, and requires modification to fit custom
    envrionments. This script is provided as an example only, and should not be
    used in a production environment.

    This scrip only demonstrates the MODE=CONFIGFILEMANIFEST method used to send
    a list of configuration files to the AcquiSuite or AcquiLite.
    Other methods are ignored.

*/
/* -------------------------------------------------------------------------------------------------------------------*/
/* Original Author: Stephen Herzog for Obvis LLC,  2001-2006.

   $Log: process_manifest.php,v $
   Revision 1.1  2006/05/18 17:55:13  herzogs
   Added sample PHP scripts to show a  manifest request and config file upload to the webserver.
   This script is the initial draft version, and has not yet been tested.

   

*/
/* -------------------------------------------------------------------------------------------------------------------*/
/* reporting function be used to report and terminate.
*/

function ReportFailure($szReason)
{   Header("WWW-Authenticate: Basic realm=\"UploadRealm\"");    // realm name is actually ignored by the AcquiSuite.
    Header("HTTP/1.0 406 Not Acceptable");                      // generate a 400 series http server error response.

    $szNotes = sprintf("Rejected manifest request"); // print out some information about what failed, for the benifit of the log file.
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

    if ($_REQUEST['MODE'] != "CONFIGFILEMANIFEST")
    {   ReportFailure("Mode type " . $_REQUEST['MODE'] . " not supported by this sample script\n");
    }

       
        // This function sends a list of all current configuration files on the server. 
        // The format is as follows:
        // 
        //            CONFIGFILE,loggerconfig.ini,md5checksum,timestamp
        //            CONFIGFILE,modbus/mb-001.ini,md5checksum,timestamp
        //            CONFIGFILE,modbus/mb-007.ini,md5checksum,timestamp
        //                          
        // the timestamp is in UTC time, SQL format, ie "YYYY-MM-DD HH:MM:SS" (use blank if not present/first-time)
        // The md5checksum is the md5 checksum of the config file. (use blank if not present/first-time)
        //     
        // Checksums and timestamps are stored in a database, file data can be stored in the same table as a blob record.
        // When a config file is received from the AcquiSuite, the server should verify the checksum, save the config file
        // and also save the timestamp and checksum for the file for future reference.  
        //      
        // The AcquiSuite will process this response, and only exchange files listed in the manifest response.
        //    
        // If the config file checksum sent in the response does not match the AcquiSuite config file checksum, the        
        // AcquiSuite will process the exchange.  If "remote configuration" is enabled, the AcquiSuite will check the 
        // timestamp to find if the server version of the config file is newer than the AcquiSuite version .if so the 
        // AcquiSuite will request to download the configuration file from the server. 
        //      
        // If the checksum values do not match and the AcquiSuite file timestamp is newer, or if the server timestamp is blank, 
        // or if the "remote configuration" option is not enabled, the AcquiSuite will send the configuration file to 
        // the server.
        //
        // Note, in the example below, the md5checksum is shown as "X" for simplicity, replace this with the actual checksum 

    printf("\n", );              

    printf("CONFIGFILE,loggerconfig.ini,X,0000-00-00 00:00:00\n", ); 
        
        // for each modbus device on this acquisuite, process the following line:
    
    printf("CONFIGFILE,modbus/mb-250.ini,X,0000-00-00 00:00:00\n", ); 

    printf("\n");   // blank line to make things look nice.

    ob_end_flush();   // send any cached stuff, and stop caching. This may only be done after the last point where you might call ReportFailure()

  
?>
