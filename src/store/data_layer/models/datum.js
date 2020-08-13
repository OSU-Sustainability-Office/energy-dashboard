class Datum {
  // Parameters:
  //  datetime: an integer representing the linux epoch time corresponding to this datum
  //  meterId: an integer corresponding to a particular meter ID
  //  uom: A string representing the unit of measure
  //  value: a numerical value representing the data
  constructor (datetime, meterId, uom, value) {
    this.datetime = datetime
    this.value = value
  }
}
