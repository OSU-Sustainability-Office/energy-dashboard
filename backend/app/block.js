/*
 * @Author: Brogan
 * @Date:   Saturday July 13th 2019
 * @Last Modified By:  Brogan
 * @Last Modified Time:  Saturday July 13th 2019
 * @Copyright:  Oregon State University 2019
 */

const Block = require("/opt/nodejs/models/block.js");
const Response = require("/opt/nodejs/response.js");
const User = require("/opt/nodejs/user.js");

exports.get = async (event, context) => {
  let response = new Response(event);
  response.body = JSON.stringify(
    (await new Block(event.queryStringParameters["id"]).get()).data,
  );
  return response;
};

exports.post = async (event, context) => {
  let response = new Response(event);
  let user = new User(event, response);
  await user.resolved;
  try {
    response.body = JSON.stringify(
      (
        await Block.create(
          event.body.dateStart,
          event.body.dateEnd,
          event.body.graphType,
          event.body.name,
          event.body.dateInterval,
          event.body.intervalUnit,
          event.body.storyId,
          user,
        )
      ).data,
    );
  } catch (err) {
    response.body = err.message;
    response.status = 400;
  }
  return response;
};

exports.put = async (event, context) => {
  let response = new Response(event);
  let user = new User(event, response);
  await user.resolved;
  try {
    await new Block(event.body.id).update(
      event.body.dateStart,
      event.body.dateEnd,
      event.body.graphType,
      event.body.name,
      event.body.dateInterval,
      event.body.intervalUnit,
      user,
    );
  } catch (error) {
    response.body = error.message;
    response.status = 400;
  }
  return response;
};

exports.delete = async (event, context) => {
  let response = new Response(event);
  let user = new User(event, response);
  await user.resolved;
  try {
    await new Block(event.body.id).delete(user);
  } catch (error) {
    response.body = error.message;
    response.status = 400;
  }
  return response;
};
