const express  = require('express');
const ExpressError = require('../expressError')
const slugify = require('slugify');
const db = require('../db');

let router = new express.Router();

// GET list of companies in format {companies: [{code, name, desc}, {code, name, desc}, ...]}

router.get('/', async function(req, res, next){
    try{
        const result = await db.query(`SELECT code, name FROM companies ORDER BY name`);
        return res.json({'companies': result.rows});
    } catch(e){
        return next(e);
    }
});

// GET /[code] => details on companies

router.get('/:code', async function(req, res, next){
    try{
        let code = req.params.code;

        const compRes = await db.query(`SELECT code, name, description 
            FROM companies WHERE code = $1`, [code]);
        if (compRes.rows.length === 0){
            throw new ExpressError(`Company does not exist: ${code}`, 404)
        }
        const company = compRes.rows[0];

        return res.json({'company': company});
    } catch(e){
        return next(e)
    }
});

// POST => add new company in format {company: {code, name, desc}}

router.post('/', async function (req, res, next){
    try{
        let {name, description} = req.body
        let code = slugify(name, {lower: true});

        const result = await.query(
            `INSERT INTO companies (code, name, description) 
            VALUES ($1, $2, $3) RETURNING code, name, description`,
            [code, name, description]
        );
        return res.status(201).json({'company': resourceLimits.rows[0]});
    } catch(e){
        return next(e)
    };
})

// PUT /[code] used to update company

router.put('/:code', async function (req, res, next){
    try{
        let {name, description} = req.body;
        let code = req.params.code;

        const reult = await db.query(` UPDATE companies SET name= $1, 
            description = $2 WHERE code = $3
            RETURNING code, name, description`,
            [name, description, code]);
        if (res.rows.length===0){
            throw new ExpressError(`Company does not exist: ${code}`, 404)
        }else {
            return res.json({'company': result.rows[0]});
        }

    } catch (e){
        return next(e)
    }
})

//  DELETE /[code] will delete the company

router.delete('/:code', async function (req,res,next){
    try{
        let code = req.params.code;
        
        const result= await db.query (
            `DELETE FROM companies WHERE code=$1 RETURNING code`,[code]
        );

        if (result.rows.length == 0){
            throw new ExpressError(`Company does not exist: ${code}, 404`)
        } else {
            return res.json({'status': "deleted"})
        }
    } catch(e) {
        return next(e)
    }
});



module.exports = router;