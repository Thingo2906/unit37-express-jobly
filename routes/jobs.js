"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const Job = require("../models/job");

const jobNewSchema = require("../schemas/jobNew.json");
const jobSearchSchema = require("../schemas/jobSearch.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");
const db = require( "../db" );

const router = new express.Router();



/** POST / { job } =>  { job}
 *
 * company should be { title, salary, equity, company_handle }
 *
 * Returns { id, title, salary, equity, company_handle }
 *
 * Authorization required: admin
 */
router.post('/', ensureAdmin, async (req, res, next) => {
    try{
        const validator = jsonschema.validate(req.body, jobNewSchema);
        if(!validator.valid){
            let listOfErrors = validator.errors.map(error => error.stack);
            throw new BadRequestError(listOfErrors);
        }
        const job = await Job.createNewJob(req.body);
        return res.status(201).json({ job });
    }catch(err){
        return next(err);
    }
    
})

/** GET /  =>
 *   { jobs: [ { id, title, salary, equity, company_handle}, ...] }
 *
 * Can filter on provided search filters:
 * - minSalary
 * - hasEquity
 * - title (will find case-insensitive, partial matches)
 *
 * Authorization required: none
 */
router.get('/', async (req, res, next) => {
    //"+" syntax will convert string to numberic
    try{
        if(minSalary){
        req.query.minSalary = +req.query.minSalary;
        }
        const validator = jsonschema.validate(req.query, jobSearchSchema);
        if(!validator.valid){
        let listOfErrors = validator.errors.map((error) => error.stack);
        throw new BadRequestError(listOfErrors);
        }
        const jobs = await Job.getAllJob(req.query);
        return res.json({ jobs });
    }catch(err){
        return next(err);
    }
  
})

/** GET /[id]  =>  { job }
 *
 *  job is {id, title, salary, equity, company_handle}
 *
 * Authorization required: none
 */
router.get('/:id', async (req, res, next) => {
    try{
        const {id} = req.params;
        const job = await Job.get({id});
        return res.json({job});
    }catch(err){
        return next(err);
    }
})


/** PATCH /[id] { fld1, fld2, ... } => { job }
 *
 * Patches company data.
 *
 * fields can be: { title, salary, equity}
 * the title in schema is required
 * cannot change the id and company_handle
 * Returns {id, title, salary, equity, company_handle}
 *
 * Authorization required: admin
 */

router.patch('/:id', ensureAdmin, async (req, res, next) => {
    try{
        const validator = jsonschema.validate(req.body, jobUpdateSchema);
        if(!validator.valid){
            let listOfErrors = validator.errors.map((error) => error.stack);
            throw new BadRequestError(listOfErrors);
        }
        const job = await Job.update(req.params.id, req.body);
        return res.json({job});

    }catch(err){
        return next(err);
    }
})

//delete a job with its id
router.delete('/:id', ensureAdmin, async (req, res, next) => {
    try{
      await Job.remove(req.params.id);
      return res.json({ deleted: +req.params.id });
    }catch (err) {
      return next(err);
    }
})

module.exports = router;