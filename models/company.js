"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */

class Company {
  /** Create a company (from data), update db, return new company data.
   *
   * data should be { handle, name, description, numEmployees, logoUrl }
   *
   * Returns { handle, name, description, numEmployees, logoUrl }
   *
   * Throws BadRequestError if company already in database.
   * */

  static async create({ handle, name, description, numEmployees, logoUrl }) {
    const duplicateCheck = await db.query(
      `SELECT handle
           FROM companies
           WHERE handle = $1`,
      [handle]
    );

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate company: ${handle}`);

    const result = await db.query(
      `INSERT INTO companies
           (handle, name, description, num_employees, logo_url)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`,
      [handle, name, description, numEmployees, logoUrl]
    );
    console.log(result);
    debugger;
    const company = result.rows[0];

    return company;
  }

  /** Find all companies.
   * searchFilters (all optional):
   * - minEmployees
   * - maxEmployees
   * - name (will find case-insensitive, partial matches)
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   * */

  // static async findAll() {
  //   const companiesRes = await db.query(
  //     `SELECT handle,
  //                 name,
  //                 description,
  //                 num_employees AS "numEmployees",
  //                 logo_url AS "logoUrl"
  //          FROM companies
  //          ORDER BY name`
  //   );
  //   return companiesRes.rows;
  // }

  static async findAll(name, minEmployees, maxEmployees) {
    // Check if minEmployees is greater than maxEmployees
    if (
      minEmployees &&
      maxEmployees &&
      parseInt(minEmployees) > parseInt(maxEmployees)
    ) {
      throw new BadRequestError(
        "minEmployees cannot be greater than maxEmployees"
      );
    }

    // Construct the SQL query dynamically based on the provided filters
    let query = `SELECT handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl" FROM companies`;

    const conditions = [];
    const queryParams = [];

    if (name) {
      conditions.push(`name ILIKE $${queryParams.length + 1}`);
      queryParams.push(`%${name}%`);
    }

    if (minEmployees) {
      conditions.push(`num_employees >= $${queryParams.length + 1}`);
      queryParams.push(parseInt(minEmployees));
    }

    if (maxEmployees) {
      conditions.push(`num_employees <= $${queryParams.length + 1}`);
      queryParams.push(parseInt(maxEmployees));
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    // Execute the SQL query using your database connection and retrieve the results
    const result = await db.query(query, queryParams);
    const companies = result.rows;

    return companies;
  }

  /** Given a company handle, return data about company.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(handle) {
    const companyRes = await db.query(
      `SELECT handle,
                  name,
                  description,
                  num_employees AS "numEmployees",
                  logo_url AS "logoUrl"
           FROM companies
           WHERE handle = $1`,
      [handle]
    );
    const jobs = await db.query(
      `SELECT id, title, salary, equity
       FROM jobs WHERE company_handle = $1`,
      [handle]
    );

    const company = companyRes.rows[0];
    if (!company) throw new NotFoundError(`No company: ${handle}`);
    company.jobs = jobs.rows;
    return company;
  }

  /** Update company data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  static async update(handle, data) {
    // check sql.js to understand this code
    const { setCols, values } = sqlForPartialUpdate(data, {
      numEmployees: "num_employees",
      logoUrl: "logo_url",
    });
    // the values is an array values of data object
    // if the data only has 2 properties, the values.lenghth = 2
    const handleVarIdx = "$" + (values.length + 1);
    // It means SET num_employee = $1, logo_url = $2 WHERE handle = $3
    const querySql = `UPDATE companies 
                      SET ${setCols} 
                      WHERE handle = ${handleVarIdx} 
                      RETURNING handle, 
                                name, 
                                description, 
                                num_employees AS "numEmployees", 
                                logo_url AS "logoUrl"`;
    const result = await db.query(querySql, [...values, handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(handle) {
    const result = await db.query(
      `DELETE
           FROM companies
           WHERE handle = $1
           RETURNING handle`,
      [handle]
    );
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);
  }
}

module.exports = Company;
