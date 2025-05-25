/* Filename: dependencies/nodejs/meter_classes.js
  * Description: Defines a mapping of meter class IDs to their respective data fields.
*/
export default {
  48: {
    // Veris Industries E51C2 Power Meter , Bi-dir, Full Data Set
    4: 'accumulated_real',
    22: 'real_power',
    23: 'reactive_power',
    24: 'apparent_power',
    55: 'real_a',
    56: 'real_b',
    57: 'real_c',
    58: 'reactive_a',
    59: 'reactive_b',
    60: 'reactive_c',
    61: 'apparent_a',
    62: 'apparent_b',
    63: 'apparent_c',
    64: 'pf_a',
    65: 'pf_b',
    66: 'pf_c',
    67: 'vphase_ab',
    68: 'vphase_bc',
    69: 'vphase_ac',
    70: 'vphase_an',
    71: 'vphase_bn',
    72: 'vphase_cn',
    73: 'cphase_a',
    74: 'cphase_b',
    75: 'cphase_c'
  },
  27: {
    // Obvius, A8812 Internal I/O
    // This device is unused but when it sends data a success should be returned
  },
  17: {
    // Obvius, ModHopper, R9120-5
    4: 'cubic_feet',
    5: 'rate',
    6: 'instant',
    7: 'minimum',
    8: 'maximum'
  },
  5: {
    // Veris Full-Data Energy Meter H8163-CB
    4: 'accumulated_real',
    5: 'real_power',
    6: 'reactive_power',
    7: 'apparent_power',
    12: 'real_a',
    13: 'real_b',
    14: 'real_c',
    15: 'pf_a',
    16: 'pf_b',
    17: 'pf_c',
    18: 'vphase_ab',
    19: 'vphase_bc',
    20: 'vphase_ac',
    21: 'vphase_an',
    22: 'vphase_bn',
    23: 'vphase_cn',
    24: 'cphase_a',
    25: 'cphase_b',
    26: 'cphase_c'
  },
  2: {
    // Veris H8036-1600-4, Full-Data, Modbus, 1600 Amp
    4: 'accumulated_real',
    5: 'real_power',
    6: 'reactive_power',
    7: 'apparent_power',
    12: 'real_a',
    13: 'real_b',
    14: 'real_c',
    15: 'pf_a',
    16: 'pf_b',
    17: 'pf_c',
    18: 'vphase_ab',
    19: 'vphase_bc',
    20: 'vphase_ac',
    21: 'vphase_an',
    22: 'vphase_bn',
    23: 'vphase_cn',
    24: 'cphase_a',
    25: 'cphase_b',
    26: 'cphase_c'
  },
  4444: {
    // Red Lion PAXCDC Test
    4: 'input',
    5: 'total',
    6: 'minimum',
    7: 'maximum'
  },
  4025: {
    // Schneider_PM210
    9: 'accumulated_real',
    8: 'real_power',
    13: 'vphase_ab',
    14: 'vphase_bc',
    15: 'vphase_ac',
    16: 'vphase_an',
    17: 'vphase_bn',
    18: 'vphase_cn',
    4: 'cphase_a',
    5: 'cphase_b',
    6: 'cphase_c'
  },
  82: {
    // Siemens Sentron PAC3200 Power Meter
    4: 'accumulated_real',
    46: 'real_power',
    47: 'reactive_power',
    45: 'apparent_power',
    26: 'real_a',
    27: 'real_b',
    28: 'real_c',
    29: 'reactive_a',
    30: 'reactive_b',
    31: 'reactive_c',
    23: 'apparent_a',
    24: 'apparent_b',
    25: 'apparent_c',
    32: 'pf_a',
    33: 'pf_b',
    34: 'pf_c',
    14: 'vphase_an',
    15: 'vphase_bn',
    16: 'vphase_cn',
    17: 'vphase_ab',
    18: 'vphase_bc',
    19: 'vphase_ac',
    20: 'cphase_a',
    21: 'cphase_b',
    22: 'cphase_c'
  },
  4045: {
    // Square D PM620
    15: 'accumulated_real',
    14: 'real_power',
    8: 'vphase_ab',
    9: 'vphase_an',
    10: 'vphase_bc',
    11: 'vphase_bn',
    12: 'vphase_ac',
    13: 'vphase_cn',
    4: 'cphase_a',
    5: 'cphase_b',
    6: 'cphase_c'
  },
  9990001: {
    // Solar Panels (SEC, OSU Operations, deprecated Tesla panels)
    2: 'periodic_real_out'
  },
  9990002: {
    // Pacific Power Meters
    4: 'periodic_real_in'
  }
}
