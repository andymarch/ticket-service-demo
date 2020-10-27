const express = require('express')
const router = express.Router()
var cache = require('memory-cache');
const uudiv1 = require('uuid/v1');
const TicketModel = require('../models/ticketModel')

module.exports = function (){

router.get("/", async function(req,res) {
    try{
        var tickets = cache.get(req.customer_number)
        res.status(200).json(tickets)
    } catch(error){
        console.log(error)
        res.status(500).send("An error occurred")
    }
})

//body must contain comment
router.post("/", async function (req,res){
    try{
        var ticket = new TicketModel()
        ticket.id = uudiv1()
        ticket.status = "new"
        ticket.comments = [req.body.comment]

        var tickets = cache.get(req.customer_number)
        if(tickets == null){
            tickets = []
        }
        tickets.push(ticket)
        cache.put(req.customer_number, tickets,900000,function(key,value){
            console.log("Session "+key+ " expired for "+value)
        })
        res.status(200).json({id:ticket.id})
    } catch(error){
        console.log(error)
        res.status(500).send("An error occurred")
    }
})

router.post("/:id", async function(req,res) {
    try{
        var tickets = cache.get(req.customer_number)
        if(tickets == null){
            res.status(400).json({error: "No such ticket"})
        }
        else{
            var updated
            for (let index = 0; index < tickets.length; index++) {
                if(tickets[index].id == req.params.id){
                    var comment
                    if(req.on_behalf) {
                        comment = req.sub + "(on behalf of " + req.on_behalf_sub + "): " + req.body.comment
                    }
                    else {
                        comment = req.sub + ": "+req.body.comment
                    }

                    tickets[index].status = "comments"
                    tickets[index].comments.push(comment)
                    cache.put(req.customer_number, tickets,900000,function(key,value){
                        console.log("Session "+key+ " expired for "+value)
                    })
                    updated = true
                    break;
                }
                
            }
            if(updated){
                res.status(200).send()    
            }
            else {
                res.status(400).json({error: "No such ticket"})
            }
        
        }

    } catch(error){
        console.log(error)
        res.status(500).send("An error occurred")
    }
})

return router
}
