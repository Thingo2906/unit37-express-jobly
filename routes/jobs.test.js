"use strict";
process.env.NODE_ENV === "test";
const request = require("supertest");

//const db = require("../db.js");
const app = require("../app.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  ids,
  adminToken,
} = require("./_testCommon.js");
beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);
describe("POST/jobs", function () {
  const newJob = {
    id: 1,
    title: "tester",
    salary: 80000,
    equity: 0.07,
    company_handle: "c2",
  };
  test("create a new job", async function () {
    const res = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ newJob });
  });
  test("respond 400 if missing data", async function () {
    const res = await request(app)
      .post("/jobs")
      .send({})
      .set("authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(400);
  });
  test("respond 401 for authorized", async function () {
    const res = await request(app).post("/jobs").send(newJob);
    expect(res.statusCode).toBe(401);
  });
});
describe("GET/jobs", function () {
  test("get a list of jobs", async function () {
    const res = await request(app).get("/jobs");
    expect(res.body).toEqual([
      {
        id: expect.any(Number),
        title: "accounting",
        salary: 80000,
        equity: 0.05,
        companyHandle: "c1",
      },
      {
        id: expect.any(Number),
        title: "J2",
        salary: 2,
        equity: 0.08,
        companyHandle: "c1",
      },
      {
        id: expect.any(Number),
        title: "J3",
        salary: 3,
        equity: null,
        companyHandle: "c1",
      },
    ]);
  });
  test("filtering with  1 condition", async function () {
    const res = await request(app).get("/jobs").query({ hasEquity: true });
    expect(res.body).toEqual([
      {
        id: expect.any(Number),
        title: "accounting",
        salary: 80000,
        equity: 0.05,
        companyHandle: "c1",
      },
      {
        id: expect.any(Number),
        title: "J2",
        salary: 2,
        equity: 0.08,
        companyHandle: "c1",
      },
    ]);
  });
  test("filtering with 2 conditions", async function () {
    const res = await request(app)
      .get("/jobs")
      .query({ hasEquity: true, minSalary: 80000 });
    expect(res.body).toEqual([
      {
        id: expect.any(Number),
        title: "accounting",
        salary: 80000,
        equity: 0.05,
        companyHandle: "c1",
      },
    ]);
  });
});
describe("GET/jobs/:id", function () {
  test("get a job by its id", async function () {
    const res = await request(app).get(`/jobs/${ids[0]}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      id: ids[0],
      title: "accounting",
      salary: 80000,
      equity: 0.05,
      companyHandle: "c1",
    });
  });
  test("Respond 404 for no job can be found", async function () {
    const res = await request(app).get(`/jobs/0`);
    expect(res.statusCode).toEqual(404);
  });
});
describe("PATCH/jobs/:id", function () {
  test("update a job", async function () {
    const res = await request(app)
      .patch(`/jobs/i${ds[1]}`)
      .send({ title: "tester" })
      .set("authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      id: ids[1],
      title: "tester",
      salary: 100000,
      equity: 0.08,
      company_handle: "c2",
    });
  });
});
describe("DELETE/jobs/:id", function () {
  test("Delete a job", async function () {
    const res =await request(app)
      .delete(`/jobs/${ids[0]}`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200); 
    expect(resp.body).toEqual({ deleted: ids[0] });
  });
});
