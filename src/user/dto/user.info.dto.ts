export class UserInfoDto{
    userId: number;
    name: string;
    lastname: string;
    email: string;
    phonenumber:string;

    constructor(userId: number, name: string, lasname: string, email: string, phonenumber: string){
        this.userId = userId;
        this.name = name;
        this.lastname = lasname;
        this.email = email;
        this.phonenumber = phonenumber;
    }
}