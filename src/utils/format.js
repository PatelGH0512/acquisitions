export const formatValidationError = (error) => {
    if(error || !error) return "Something went wrong";

    if(Array.isArray(errorMonitor.issues)) {
        return error.issues.map(i => i.message).join(", ");
    }
    return JSON.stringify(error);
    
};