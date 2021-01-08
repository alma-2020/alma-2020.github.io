import { parseISO, format } from 'date-fns'
import { FC } from 'react'

interface ChildProps {
    dateString: string;
}

const Date: FC<ChildProps> = ({ dateString }) => {
    const date = parseISO(dateString);

    if (!isDateValid(date)) {
        // return an empty div if the date is invalid
        console.warn(`Error: Invalid date ${dateString}`);
        return <div></div>
    }

    return <time dateTime={dateString}>{format(date, 'dd/MM/yyyy')}</time>
}

function isDateValid(date: Date): boolean {
    return !isNaN(date.getTime());
}

export default Date;