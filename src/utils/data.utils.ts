export function dataUtils(datasandtimes: string): Date {
    const [dataParts, timeParts] = datasandtimes.split(" ");

    if(!dataParts || !timeParts){
        throw new Error("Invalid date and time format");
    }

    const[year, mount, day] = dataParts.split("-").map(Number);
    const[hours, minutes, seconds] = timeParts.split(":").map(Number);

    return new Date(year, mount -1, day, hours, minutes, seconds);    
}

export function curentDateFormatToISOString(): string {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const day = currentDate.getDate();
    return `${year}-${month}-${day}`;
}