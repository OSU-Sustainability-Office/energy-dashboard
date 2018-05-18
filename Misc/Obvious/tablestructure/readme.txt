Readme.txt: description of the AcquiSuite device class parameters.

$Id: readme.txt,v 1.12 2009/09/04 19:35:59 herzogs Exp $

In the process of sending data to the database/webserver, the 
AcquiSuite will send a log file and a number of form variables 
in the HTTP/POST session to identify the source of the log 
data.  One form variable is the MODBUSDEVICECLASS 

The MODBUSDEVICECLASS is a unique id that allows the AcquiSuite 
to decide what class of device it is working with.  It is assumed 
that the number and type of points stored for a specific device 
type are the same.

For example, the Veris H8036 power meter has several versions 
for 100, 300, 800Amp, however the list of points are the same 
for all devices.  The deviceclass will be the same for all 
flavors of Veris 8036 meters.

Note: types are defined as follows:

          int:     32bit
          bigint:  64bit
          float:   32bit
          double:  64bit (ieee float)

All consumption data points (kwh, gallons, etc) should be stored in 
64bit float "double" values.  This allows the calculation of demand
values from the difference in two log entries.  Using a 32bit float
causes rounding at 6 digits.  This rounding will cause inacurate demand
calculations if the kwh value is over 1Mw.

The alarm flag points are stored in 32bit or 64bit entries in the 
database.  Each bit represents one data point alarm status.  Any 
device with more than 32 data columns should use a 64bit bigint 
to store this flag value.  One problem in the data tables described
are present in the PM710 and GEKV2 meters.  These report more than 
64 data columns.  In using a bigint to store the alarm flag, the 
data columns past 64 are not represented in the alarm flag bitmaps
in the database.  The AcquiSuite will properly generate alarm flag
values (in hex 0x00 format) for all data columns including those 
beyond the first 64 columns.

It is also important to note that in PHP (v4) that integer values 
are limited to 32 bits.  Thus processing the 64bit alarm flag 
requires special handling.  


Currently, the deviceclass may be one of the following:
          MBCLASS_UNKNOWN     0
          MBCLASS_HXO         1     (3 data columns)
          MBCLASS_H8036       2     (26 data columns)
          MBCLASS_M4A4P       3     (8 data columns, A8923 basic io module)
          MBCLASS_H8035       4     (2 data columns)
          MBCLASS_H8163       5     (29 data columns)
          MBCLASS_H663        6     (42 data columns)
          MBCLASS_H8238       7     (28 data columns)
          MBCLASS_H8076       8     (28 data columns)
          MBCLASS_M4A4P2      9     (32 data columns, A8923 enhanced io module, A8811 built-in io module)
          MBCLASS_ION6200     10    (61 data columns)
          MBCLASS_ION7300     11    (64 data columns)
          MBCLASS_ION7500     12    (64 data columns)
          MBCLASS_ION7700     13    (64 data columns)
          MBCLASS_PROMON      14    (38 data columns)
          MBCLASS_ACQUILITE   15    (28 data columns)
          MBCLASS_PM710       16    (102 data columns)
          MBCLASS_R9120       17    (10 data columns) 
          MBCLASS_GEKV2       18    (97 data columns)
          MBCLASS_A902MB      19    (12 data columns)
          MBCLASS_ADAM4068    20    (8 data columns)
          MBCLASS_H8437       21    (50 data columns)
          MBCLASS_H8436       22    (24 data columns)
          MBCLASS_ADAM4051    23    (16 data columns)
          MBCLASS_PDIBCMS     24    (84 data columns)
          MBCLASS_ION6300     25    (31 data columns)
          MBCLASS_H8936       26    (0 data columns)
          MBCLASS_A8812IO     27    (42 data columns)    // onboard io inputs on A8812 platform
          MBCLASS_PDIBCMS2    28    (84 data columns)
          MBCLASS_PDIBCMS2P   29    (bcms2 plus)         // PDI bcms2 plus
          MBCLASS_PDIBCMS2SUB 30    (bcms2 sub-panel)    // PDI bcms2 sub-panel
          MBCLASS_PM800       31    (81 data columns)    // Schneider PM810, PM820, PM850
          MBCLASS_DI340MB     32    (7 data columns)     // Data Industrial 340MB modbus btu meter. 
          MBCLASS_A8911       33                         // Obvius A8911-23 high density pulse counter.
          MBCLASS_A89DC08     34    (24 data columns)    // Obvius A89DC-08 DC solar monitor.
          MBCLASS_SHARK100    35    (116 data columns)   // Electro-industries shark 100
          MBCLASS_DTS305      36    (90 data columns)    // Measurelogic DTS305
          MBCLASS_ADAM4019    37    (8 data columns)     // Advantec ADAM 4017+, 4018+, 4019+ modules.
          MBCLASS_RIO9F       38    (14 data columns)    // Coyote Radio RIO-9F radio/pulse/analog input module.
          MBCLASS_E30A        39    (374 data columns)   // Veris E30A BCM. Full data set.          
          MBCLASS_SHARK200    40                         // Electro-industries Shark 200
          MBCLASS_PVPINVERTER 41    (16 data columns)    // PV Powered's commercial DC inverters
          MBCLASS_E30B        42                         // Veris E30B BCM. Limited data set.
          MBCLASS_E30C        43                         // Veris E30C BCM. current only data set.



Point six devices via sensor network data logger have the following tables:

        1001    Badger RTR (2 points)
        1010    Point Six Temp/Humidity (2 points)
        1011    Point six Thermistor (1 points)
        1012    Point six pulse counter (2 points)
        1013    Point six analog (1 point)
        1014    Point Six dual analog (2 points)
