class ApiResponse{
    constructor(statuscode, data, message="success"){
        this.data = data;
        this.statuscode = statuscode;
        this.message = message;
        this.success = statuscode < 400
    }
}

export {ApiResponse}