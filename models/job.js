"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");
/** Related functions for companies. */
class Job {
  /** Create a job(from data), update db, return new job data.
   *
   * data should be {title, salary, equity, company_handle}
   *
   *
   * Returns {id, title, salary, equity, company_handle}
   *
   * Throws BadRequestError if company already in database.
   * */
  //create a new job
  static async createNewJob({ title, salary, equity, company_handle }) {
    const duplicateCheck = await db.query(
      `SELECT id FROM jobs WHERE title = $1 AND company_handle = $2`,
      [title, company_handle]
    );
    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate job: ${title}`);
    }
    const result = await db.query(
      `INSERT INTO jobs (title, salary, equity, company_handle) 
                                 VALUES ($1, $2, $3, $4) 
                                 RETURNING id, title, salary, equity, company`,
      [title, salary, equity, company_handle]
    );
    const job = result.rows[0];
    return job;
  }

  /** Find all jobs.
   * searchFilters (all optional):
   * - minSalary
   * - hasEquity (true returns only jobs with equity > 0, other values ignored)
   * - title (will find case-insensitive, partial matches)
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   * */
  static async getAllJob(title, minSalary, hasEquity) {
    const query = await db.query(`SELECT id, title, salary, equity, company_handle FROM jobs`);
    const queryValues= [];
    const conditions =[]; 
    if(title){
      conditions.push(`title ILIKE $${queryValues.length +1}`);
      queryValues.push(`%${title}%`);
    }
    if(minSalary){
      conditions.push(`salary >=  $${queryValues.length + 1}`);
      queryValues.push(parseInt(minSalary));
    }
    if(hasEquity===true){
      conditions.push('equity > 0');
    }
    if (conditions.length > 0) {
      query += `WHERE ${conditions.join(" AND ")}`;
     }
     const result = await db.query(query, queryValues);
     const jobs = result.rows;
     return jobs;
    

    
  }
  //get job by id
  static async get(id) {
    const result = await db.query(
      `SELECT id, title, salary, equity, comapany_handle WHERE id = $1`,
      [id]
    );
    const job = result.rows[0];
    if (!job) {
      throw new NotFoundError(`No job: ${id}`);
    }
    return job;
  }

  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include: { title, salary, equity }
   * when we update a job, cannot change the id and company_handle
   *
   * Returns { id, title, salary, equity, companyHandle }
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    //jsToSql object can be empty, because no column pass into
    //the body need to be generated to remove "-".
    const { setcols, values } = sqlForPartialUpdate(data, {});
    const idVarIdx = "$" + (values.length + 1);
    //[...values], we use spread operator for this array
    const result = await db.query(
      `UPDATE jobs SET ${setcols} WHERE id = ${idVarIdx}
                                   RETURNING id, title, salary, equity, company_handle`,
      [...values, id]
    );
    const job = result.rows[0];
    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  //delete a job
  static async remove(id) {
    const result = await db.query(
      `DELETE
           FROM jobs
           WHERE id = $1
           RETURNING id`,
      [id]
    );
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);
  }
}
module.exports = Job;