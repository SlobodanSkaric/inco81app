export function dataUtils(datasandtimes: string): Date {
    const [dataParts, timeParts] = datasandtimes.split(" ");

    if(!dataParts || !timeParts){
        throw new Error("Invalid date and time format");
    }

    const[year, mount, day] = dataParts.split("-").map(Number);
    const[hours, minutes, seconds] = timeParts.split(":").map(Number);

    return new Date(year, mount -1, day, hours, minutes, seconds);    
}