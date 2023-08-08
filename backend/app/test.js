/*
 * @Author: Brogan
 * @Date:   Thursday September 5th 2019
 * @Last Modified By:  Brogan
 * @Last Modified Time:  Thursday September 5th 2019
 * @Copyright:  (c) Your Company 2019
 */
exports.test = async (event, context) => {
  return {
    headers: {},
    statusCode: 200,
    body: "hello world, dynamic",
  };
};
