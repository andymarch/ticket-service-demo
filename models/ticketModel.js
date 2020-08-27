class TicketModel {
    constructor(TicketJson) {
        if(TicketJson){
            try {
                this.id = TicketJson.id
                this.status = TicketJson.status
                this.comments = TicketJson.comments
            }
            catch (error){
                console.log(error)
            }
        }
    }
}

module.exports = TicketModel