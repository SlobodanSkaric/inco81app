export function generateRandomDocName(id: number, createDate: any, min: number, max: number): any {
    console.log(createDate);
    return id + "-" + createDate + "-" + Math.floor(Math.random() * (max - min + 1)) + min;
}