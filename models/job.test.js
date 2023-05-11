"use strict";
process.env.NODE_ENV === "test";
const db = require("../db.js");
const { NotFoundError } = require("../expressError");
const Job = require("./company.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  jobIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);
describe("CreateNewJob", function () {
  const newJob = {
    title: "New",
    salary: "New Description",
    equity: 0.09,
    companyHandle: "C1",
  };
  test("create a new job", async function () {
    const job = await Job.createNewJob(newJob);
    expect(job).toEqual({
      id: expect.any(Number),
      title: "New",
      salary: "New Description",
      equity: 0.09,
      companyHandle: "C1",
    });
  });
});
describe("Find all jobs", function () {
  test("List all jobs without condition", async function () {
    const jobs = await Job.getAllJob();
    expect(jobs).toEqual([
      {
        id: jobIds[0],
        title: "G1",
        salary: 70000,
        equity: 0.06,
        companyHandle: "c1",
      },
      {
        id: jobIds[1],
        title: "G2",
        salary: 90000,
        equity: 0.05,
        companyHandle: "c2",
      },
    ]);
  });
  test("List all job with 1 condition", async function () {
    const jobs = await Job.getAllJob({ title: "G1" });
    expect(jobs).toEqual([
      {
        id: jobIds[0],
        title: "G1",
        salary: 70000,
        equity: 0.06,
        companyHandle: "c1",
      },
    ]);
  });
  test("List all jobs with 2 condition", async function () {
    const jobs = await Job.getAllJob({ minSalary: 70000, hasEquity: true });
    expect(jobs).toEqual([
      {
        id: jobIds[0],
        title: "G1",
        salary: 70000,
        equity: 0.06,
        companyHandle: "c1",
      },
      {
        id: jobIds[1],
        title: "G2",
        salary: 90000,
        equity: 0.05,
        companyHandle: "c2",
      },
    ]);
  });
});
describe("get", function () {
  test("get job by id", async function () {
    const job = await Job.get(jobIds[0]);
    expect(job).toEqual({
      id: jobIds[0],
      title: "G1",
      salary: 70000,
      equity: 0.06,
      companyHandle: "c1",
    });
  });
});
describe("update", function () {
  test("update a job", async function () {
    const job = await Job.update(jobIds[0], { title: "M1", salary: 60000 });
    expect(job).toEqual({
      id: jobIds[0],
      title: "M1",
      salary: 60000,
      equity: 0.06,
      companyHandle: "c1",
    });
  });
  test("not found if no such job", async function () {
      try {
        await Job.update(0, {
          title: "test",
        });
        fail();
      } catch (err) {
        expect(err instanceof NotFoundError).toBeTruthy();
      }
  });
});
describe("remove", function(){
    test("delete a job", async function(){
        await Job.remove(jobIds[0]);
        const res = await db.query("SELECT id FROM jobs WHERE id=$1", [
          jobIds[0],
        ]);
        expect(res.rows.length).toEqual(0);
    })
})

