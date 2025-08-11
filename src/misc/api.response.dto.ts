export class ApiResponse{
    status: string;
    code: number;
    messages: string;

    constructor(status: string, code: number, messages: string){
        this.status = status;
        this.code = code;
        this.messages = messages;
    }
}