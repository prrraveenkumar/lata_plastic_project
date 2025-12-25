class ApiError extends Error{
    constructor(
        statuscode,
        message = "Something went wrong",
        error=[],
        stack=""
    ){
        super(message);
        this.statuscode = statuscode;
        this.data = null;
        this.error = error;
        this.success = false;
        this.message = message

        if(stack){
            this.stack = stack
        }else{
            Error.captureStackTrace(this, this.constructor)
        }
    }
  
}

export{ApiError}