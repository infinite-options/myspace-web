export function isValidDate(dateString){
    if(dateString == null || dateString === ""){
        return false
    }    
    const dateParts = dateString.split("-");
    const month = parseInt(dateParts[0]);
    const day = parseInt(dateParts[1]);
    const year = parseInt(dateParts[2]);

    const date = new Date(year, month - 1, day);

    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day && dateParts[0].length === 2 && dateParts[1].length === 2 && dateParts[2].length === 4;

}

export const getDateAdornmentString = (d) => {
    if (d === null || d === 0) return "";
    if (d > 3 && d < 21) return "th";
    switch (d % 10) {
        case 1:
        return "st";
        case 2:
        return "nd";
        case 3:
        return "rd";
        default:
        return "th";
    }
};