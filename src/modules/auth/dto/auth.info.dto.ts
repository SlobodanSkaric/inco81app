export class AuthInfoDto{
    id: number;
    email: string;
    phonenumber: string;
    dateExp: number;
    ip: string;
    ua: string;
    role:string;
    premissions: string[]

    constructor(id: number, email: string, phonenumber: string, dataExp: number, ip: string, ua: string, role: string, premissions: string[]){
        this.id = id;
        this.email = email;
        this.phonenumber = phonenumber;
        this.dateExp = dataExp;
        this.ip = ip;
        this.ua = ua;
        this.role = role;
        this.premissions = premissions;
    }
    

    getPlainObject(){
        return {
            id: this.id,
            email: this.email,
            phonenumber:this.phonenumber,
            dateExp: this.dateExp,
            ip: this.ip,
            ua: this.ua,
            role: this.role,
            premissions: this.premissions
        }
    }
}