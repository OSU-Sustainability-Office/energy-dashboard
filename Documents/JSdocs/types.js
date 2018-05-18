/**
 * @typedef String
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String
 */

/**
 * @typedef Boolean
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean
 */

/**
 * @typedef Object
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object
 */

/**
 * @typedef Array
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
 */

/**
 * @typedef {String|Number} Number
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String
 */

/**
 * @typedef null
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/null
 */

/**
 * A 24-character hash string that references objects in a database. Assigned to each object entered into the database.
 * @typedef {String} ObjectId
 * @see http://docs.mongodb.org/manual/reference/object-id/
 * @example
 * var id = user._id;
 *
 * var id = new ObjectID(); // => such as '51b96d2a845cca7213000002'
 */

 /**
  * An object that contains the properties of Chart.js
  * @typedef {Object} Chart
  * @see https://www.chartjs.org/docs/latest/
  */

/**
 * An Object that contains the formatted AcquiSuite POST data.
 * @typedef  {Object} Point
 * @property {Number} number    - Contains the index of itself in the containing array.
 * @property {String} name      - Contains the name of the value being measured.
 * @property {String} units     - Contains the units of the value being measured.
 * @property {Number} value     - Contains the consumption value.
 */

/**
 * An Object that contains details about a User's Google account
 * @typedef  {Object} Google
 * @property {String} id        - Contains the id of the Google acocunt.
 * @property {String} token     - Contains the auth token of the Google account.
 * @property {String} email     - Contains the email address of the Google account.
 * @property {String} name      - Contains the name of the user as it appears in their Google acocunt.
 */

/**
 * An object which holds customized combinations of Building as set by the User. Can be set to display on the public Dashboards or not.
 * @typedef  {Object} Block
 * @property {String} name                  - The name of the Block as set by the User when created.
 * @property {ObjectId} created_by          - The ObjectId of the User responsible for creating the Block.
 * @property {Array<ObjectId>} building     - The array of ObjectId references to Building that the Block contains.
 * @property {String} chart                 - The type of chart used by this Block.
 * @property {Boolean} is_public            - The flag to determine if the Block should appear in the public Dashboard interface.
 * @property {String} variable              - The string to determine unit being measured (e.g. Killowatts/Hr).
 */

/**
 * An object which aggregates DataEntry as gathered by Meter
 * @typedef  {Object} Building
 * @property {String} name                    - The name of the Building as set by the User when created.
 * @property {String} building_type           - The type of Building as set by the User when created.
 * @property {Array<ObjectId>} meters         - The array of ObjectId references to Meter that are connected to the Building.
 * @property {Array<ObjectId>} data_entries   - The array of ObjectId references to DataEntry that are connected to the Building.
 */

/**
 * An object which contains Blocks and all the aggregated data of each, as set by User.
 * @typedef  {Object} Dashboard
 * @property {String} name              - The name of the Dashboard as set by the User when created.
 * @property {String} description       - The brief description of the Dashboard pertaining to what is contained as set by the User when created.
 * @property {Boolean} is_public        - The flag to determine if the Dashboard should appear in the public Dashboard interface.
 * @property {ObjectId} created_by      - The ObjectId of the User responsible for creating the Dashboard.
 * @property {Array<ObjectId>} blocks   - The array of ObjectId references to Block as set by the User when created.
 */

/**
 * An object which contains all the AcquiSuite POST data as well as relevant relationships.
 * @typedef  {Object} DataEntry
 * @property {ObjectId} building    - The ObjectId reference to Building that contains this DataEntry.
 * @property {ObjectId} meter_id    - The ObjectId reference to Meter that reported this DataEntry.
 * @property {String} timestamp     - The timestamp of the AcquiSuite POST data when it was collected.
 * @property {Array<Point>} point   - The array of Point as reported by the AcquiSuite POST data.
 */

 /**
 * An object which assists in determining where each DataEntry should go.
 * @typedef  {Object} Meter
 * @property {String} name          - The name of the Meter. Typically contains an easily readable English string.
 * @property {String} meter_id      - The serial of the AcquiSuite with the address of the meter concatenated at the end.
 * @property {ObjectId} building    - The ObjectId reference to Building that the Meter connected to.
 */

/**
 * An object which contains Blocks as and all the aggregated data of each.
 * @typedef  {Object} Story
 * @property {String} name                  - The name of the Story as set by the User when created.
 * @property {Boolean} is_public            - The flag to determine if the Story should appear in the public Story interface.
 * @property {ObjectId} created_by          - The ObjectId of the User responsible for creating the Story.
 * @property {Array<ObjectId>} dashboards   - The array of ObjectId references to Dashboard as set by the User when created.
 */

/**
 * An object which contains the login token and customizable settings of any given person using the interface.
 * @typedef  {Object} User
 * @property {Google} google                    - The token and email information of the User's Google account.
 * @property {Array<ObjectId>} blocks           - The array of ObjectId references to Block that belong to this User.
 * @property {Array<ObjectId>} dashboards       - The array of ObjectId references to Dashboard that belong to this User.
 * @property {Array<ObjectId>} stories          - The array of ObjectId references to Story that belong to this User.
 * @property {String} accountAccess             - The permission level of this account.
 */
