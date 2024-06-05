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
        return req.json({'invoices': result.rows});
    } catch(e){
        return next (e)
    }
})

// GET /[id]  get the details of the invoice

router.get('/:id', async function (req, res, next){
    try{
        let id= req.params.id;

        const result = await db.query(`
        SELECT i.id, i.comp_code, i.amt,i.paid, i.add_date, i.paid_date, c.name, c.description
        FROM invoices AS i INNER JOIN companies AS c on (i.comp_code = c.code) WHERE id = $1`, [id]);

        if (result.rowCount.length ===0{
            throw new ExpressError(`Not a valid invoice; ${id}`, 404);
        }
        const data = result.rows[0];
        const invoice = {
          id: data.id,
          company: {
            code: data.comp_code,
            name: data.name,
            description: data.description,
          },
          amt: data.amt,
          paid: data.paid,
          add_date: data.add_date,
          paid_date: data.paid_date,
        };
    
        return res.json({"invoice": invoice});
    }catch (e){
        return next(e);
    }
});

// POST new invoice

router.post('/', async function (req,res, next){
    try{
        let { comp_code, amt } = req.body;

        const result = await db.query(`
        INSERT INTO invoices (comp_code, amt) 
        VALUES ($1, $2)
        RETURNING id, comp_code, amt, paid, add_date, paid_date`, [comp_code, amt]);

        return res.json({'invoices': result.row[0]});

    }catch(e){
        return next(e)
    }
})

// PUT /[code] update invoice

router.put('/:id', async function (req,res,next){
    try{
        let { amt, paid } = req.body;
        let id = req.params.id;
        let paidDate = null;

        const currRes= await db.query(`SELECT paid FROM invoices WHERE id = $1`, [id]);

        if (currRes.row.length ===0){
            throw new ExpressError(`Not a valide invoice: ${id}`, 404)
        }
        const currPaidDate = currRes.rows[0].paid_date;

        if (!currPaidDate && paid) {
            paidDate = new Date();
        }else if (!paid){
            paidDate = null
        } else {
            paidDate = currPaidDate;
        }
        const result = await db.query(
            `UPDATE invoices
             SET amt=$1, paid=$2, paid_date=$3
             WHERE id=$4
             RETURNING id, comp_code, amt, paid, add_date, paid_date`,
          [amt, paid, paidDate, id]);
  
      return res.json({"invoice": result.rows[0]});

    }catch(e){
        return next(e)
    }
})

// DELETE /[code] to delete invoice

router.delete('/:id', async function (req, res, next){
    try{
        let id = req. params.id;

        const result = await db.query(`
        DELETE FROM invoices WHERE id = $1 RETURNING id`, [id]);

        if (result.rows.length === 0){
            throw new ExpressError(`Not a valid invoice: ${id}`, 404)
        }
        return res.json({"status": "deleted"});
    } catch (e){
        return next(e)
    }
})

module.exports= router