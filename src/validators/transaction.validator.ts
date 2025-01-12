const requiredFields = ["Date","Description","Amount","Currency"];

export const validateTransaction = (transaction : any): string|null =>{
    for(const field of requiredFields){
        if(!transaction[field]){
            return `Missing required field:${field}`;
        }
    }

    const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
    if(!dateRegex.test(transaction.Date)){
        return "Invalid date format. Expected format: dd-mm-yyyy";
    }

    if(isNaN(parseFloat(transaction.Amount))){
        return "Invalid amount format";
    }
    return null;
};