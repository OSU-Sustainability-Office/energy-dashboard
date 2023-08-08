/*
 * @Author: Brogan
 * @Date:   Tuesday May 14th 2019
 * @Last Modified By:  Brogan
 * @Last Modified Time:  Tuesday May 14th 2019
 * @Copyright:  (c) Oregon State University 2019
 */

const Building = require("/opt/nodejs/models/building.js");
const Response = require("/opt/nodejs/response.js");
const User = require("/opt/nodejs/user.js");
const Compress = require("/opt/nodejs/models/compress.js");

exports.all = async (event, context) => {
  let response = new Response(event);
  response.body = JSON.stringify((await Building.all()).map((o) => o.data));
  response.headers["Content-Type"] = "application/json";
  return response; //Compress(event, response)
};

exports.get = async (event, context) => {
  let response = new Response(event);
  response.body = JSON.stringify(
    (await new Building(event.queryStringParameters["id"]).get()).data,
  );
  return response;
};

exports.put = async (event, context) => {
  let response = new Response(event);
  let user = new User(event, response);
  await user.resolved;
  try {
    let building = await new Building(event.body.id).update(
      event.body.name,
      event.body.mapId,
      event.body.image,
      event.body.group,
      event.body.meters,
      user,
    );
    response.body = building.data;
  } catch (error) {
    response.body = error.message;
    response.status = 400;
  }
  return response;
};

exports.post = async (event, context) => {
  let response = new Response(event);
  let user = new User(event, response);
  await user.resolved;
  try {
    response.body = JSON.stringify(
      (
        await Building.create(
          event.body.name,
          event.body.mapId,
          event.body.image,
          event.body.group,
          event.body.meters,
          user,
        )
      ).data,
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
  try {
    await new Building(event.body.id).delete(user);
  } catch (error) {
    response.body = error.message;
    response.status = 400;
  }
  return response;
};
