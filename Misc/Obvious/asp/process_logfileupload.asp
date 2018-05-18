<% @ CodePage = 1252 %>
<%
' The Codepage 1252 is included so that the clsUpload.asp file correctly loads,  
' without it there would be an error returned such as a Midb type error.
' This must be at the beginning of the ASP file.
'
'-------------------------------------------------------------------------------------------
'
'    Copyright © 2006, Obvius Holdings, LLC. All rights reserved.
'
'    Redistribution and use in source and binary forms, with or without
'    modification, are permitted provided that the following conditions
'    are met:
'
'   1. Redistributions of source code must retain the above copyright
'      notice, this list of conditions and the following disclaimer.
'
'   2. Redistributions in binary form must reproduce the above copyright
'      notice, this list of conditions and the following disclaimer in the
'      documentation and/or other materials provided with the distribution.
'
'   3. Neither the name of Obvius Holdings nor the names of its contributors
'      may be used to endorse or promote products derived from this software
'      without specific prior written permission.
'
'    THIS SOFTWARE PROGRAM IS PROVIDED BY OBVIUS HOLDINGS AND CONTRIBUTORS
'    FREE OF CHARGE AND ACCORDINGLY IS LICENSED "AS IS" WITHOUT WARRANTY OF
'    ANY KIND, AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
'    TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
'    PURPOSE, ARE DISCLAIMED. THE ENTIRE RISK AS TO THE QUALITY AND THE
'    PERFORMANCE OF THE PROGRAM IS WITH YOU.
'
'    IN NO EVENT, UNLESS REQUIRED BY APPLICABLE LAW OR AGREED TO IN WRITING,
'    SHALL OBVIUS HOLDINGS OR CONTRIBUTORS WHO MAY MODIFY AND/OR REDISTRIBUTE
'    THE PROGRAM BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, GENERAL,
'    SPECIAL, EXEMPLARY, PUNITIVE, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
'    NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
'    LOSS OF DATA, DATA BEING RENDERED INACCURATE OR FAILURE OF THE PROGRAM
'    TO RUN WITH ANY OTHER PROGRAMS, OR LOST PROFITS; OR BUSINESS INTERRUPTION)
'    HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
'    LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
'    OUT OF THE USE OF THIS SOFTWARE PROGRAM, EVEN IF SUCH HOLDER OR OTHER PARTY
'    HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
'
'---------------------------------------------------------------------------------------
'
'    $Id: process_logfileupload.asp,v 1.5 2010/05/26 23:56:08 herzogs Exp $
'   
'    Original Author: Brett Westin for Obvius Holdings LLC,  2006. 
'    
'    This ASP script shows how the interface between the AcquiSuite and Database Server
'    works. This file is intended as a sample, and requires modification to fit custom
'    envrionments.
'
'    This scrip only demonstrates the MODE=LOGFILEUPLOAD method used to send
'    a log file from the AcquiSuite or AcquiLite to the webserver.   Other
'    methods are ignored.
'
'    Make certain to properly configure IIS to allow use of the ASP 
'    scripts and that it has been enabled to allow VBScript to run, 
'    almost certainly this will have already been done, make sure the proper
'    permissons have been granted, see your IT administrator to verify 
'    they have been.
'
'    In addition, this script writes the log files to a directory C:\asdata\  
'    In order for this to work, you must enable write permissions to this
'    directory. 
'
'---------------------------------------------------------------------------------------
' set Response.Buffer=false to allow the webserver to send output as soon 
' as it is generated.  This prevents caching and will make any error message
' come out *after* any previously output data.  This makes debugging from the
' acquisuite or acquilite much easier. 
Response.Buffer = false

%>

<html>
<body>
<pre>

<!--#INCLUDE FILE="clsUpload.asp"-->
'<!--#INCLUDE FILE="md5block.asp"-->

<%

Dim objUpload
Dim strFileName
Dim strPath
Dim sDigest

' Instantiate Upload Class
Set objUpload = New clsUpload


Response.Write "MODE=" & objUpload.Fields("MODE").value & vbnewline

if objUpload.Fields("MODE").value = "LOGFILEUPLOAD" then

'    sDigest = md5(objUpload("LOGFILE").BinaryData, objUpload("LOGFILE").Length )

else
    Response.Write "Note: This script only supports MODE=LOGFILEUPLOAD" & vbnewline
    Response.Write "Upload exchanges of MODE=" & objUpload.Fields("MODE").value & " are ignored in this example code " & vbnewline
    Response.Write vbnewline &  "SUCCESS" & vbnewline
    sDigest = "[none]"
    Response.Write "</pre></body></html>" & vbnewline
    return true
end if


Response.Write "SERIALNUMBER=" & objUpload.Fields("SERIALNUMBER").value & vbnewline

Response.Write "PASSWORD=" & objUpload.Fields("PASSWORD").value & vbnewline

Response.Write "MODBUSIP=" & objUpload.Fields("MODBUSIP").value & vbnewline

Response.Write "LOOPNAME=" & objUpload.Fields("LOOPNAME").value & vbnewline

Response.Write "MODBUSDEVICE=" & objUpload.Fields("MODBUSDEVICE").value & vbnewline

Response.Write "MODBUSDEVICENAME=" & objUpload.Fields("MODBUSDEVICENAME").value & vbnewline

Response.Write "MODBUSDEVICETYPE=" & objUpload.Fields("MODBUSDEVICETYPE").value & vbnewline

Response.Write "MODBUSDEVICECLASS=" & objUpload.Fields("MODBUSDEVICECLASS").value & vbnewline

Response.Write "FILETIME=" & objUpload.Fields("FILETIME").value & vbnewline

Response.Write "FILESIZE=" & objUpload.Fields("FILESIZE").value & vbnewline

Response.Write "MD5CHECKSUM=" & objUpload.Fields("MD5CHECKSUM").value & vbnewline

'Response.Write "VALIDATEDCHECKSUM= " & sDigest & vbnewline

Response.Write "LOGFILE.name=" & objUpload("LOGFILE").name & vbnewline
 
Response.Write "LOGFILE.FilePath=" & objUpload("LOGFILE").FilePath & vbnewline
 
Response.Write "LOGFILE.ContentType=" & objUpload("LOGFILE").ContentType  & vbnewline
 
Response.Write "LOGFILE.Length=" & objUpload("LOGFILE").Length  & vbnewline

%>

<%

'if objUpload.Fields("MD5CHECKSUM").value = sDigest  then

    ' Compile path to save file to
    strPath = "c:\asdata\" & objUpload.Fields("SERIALNUMBER").value 
  
    Set fs=CreateObject("Scripting.FileSystemObject")

    If fs.FolderExists(strPath) Then
       Response.Write "Directory Exists" & vbnewline
    Else
       Response.Write "Creating directory " & strPath & vbnewline
       fs.CreateFolder(strPath )
    End If

    ' Create the file name  mb-xxx.yyyy.log where xxx is the modbus address number and yyyy is a timestamp

    strFileName = strPath & "\mb-" & objUpload.Fields("MODBUSDEVICE").value
    strTime = Year(Date) & Month(Date) & Day(Date) & Timer
    strFileName = strFileName & "." & strTime & ".log"

    ' next add a .gz extension to indicate gzip format if the original filname had .gz in it.
    ' the AcquiSuite log files are compressed with gzip and end in .gz.  
    ' the AcquiLite log files are not compressed and should end in .log
    if InStr(objUpload("LOGFILE").FilePath, ".gz") > 1 then strFileName = strFileName & ".gz"

    Response.Write "Saving data file in " & strFileName & vbnewline

    ' Save the binary data to the file system
    objUpload("LOGFILE").SaveAs strFileName 

    ' tell the client that the data arrived ok.
    Response.Write "SUCCESS" & vbnewline
'else
'    Response.Write "FAILURE: Checksum of file does not match MD5CHECKSUM sent by remote system. " & vbnewline
'end if


' Release upload object from memory
Set objUpload = Nothing

Response.Write "Script completed at " & Date & vbnewline

%>

</pre>
</body>
</html>

