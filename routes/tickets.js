const express = require('express')
const router = express.Router()
var cache = require('memory-cache');
const uudiv1 = require('uuid/v1');

module.exports = function (){

router.get("/", async function(req,res) {
    try{
        var tickets = cache.get(req.userContext)
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

        var tickets = cache.get(req.userContext)
        if(ticket == null){
            tickets = []
        }
        tickets.push(ticket)
        cache.put(req.userContext, tickets,900000,function(key,value){
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
        var tickets = cache.get(req.userContext)
        if(tickets == null){
            res.status(400).json({error: "No such ticket"})
        }
        else{
            var updated
            for (let index = 0; index < tickets.length; index++) {
                if(tickets[index].id == req.params.id){
                    tickets[index.id].status = "comments"
                    tickets[index.id].comments.push(req.body.comment)
                    cache.put(req.userContext, tickets,900000,function(key,value){
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
