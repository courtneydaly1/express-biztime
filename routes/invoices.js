const express = require('express');
const ExpressError = require('../expressError');
const db = require("../db");

let router = new expressRouter();

// GET a list of invoices in format {invoices: [{id, comp_code}, ...]}

router.get('/', async function (req, res, next){
    try{
        const result = await db.query(`
        SELECT id, comp_code
        FROM invoices
        ORDER by id`);
        return req.json({'invoices': result.rows})
    } catch(e){
        return next (e)
    }
})