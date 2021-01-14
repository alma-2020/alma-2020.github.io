import { parseISO, format } from 'date-fns'
import { FC } from 'react'

interface Props {
    dateString: string;
}

const Date: FC<Props> = ({ dateString }) => {
    const date = parseISO(dateString);

    if (!isDateValid(date)) {
        // return an empty div if the date is invalid
        console.warn(`Error: Invalid date ${dateString}`);
        return <div></div>
    }

    return (
        <time dateTime={dateString}>
            {format(date, 'dd/MM/yyyy')}
        </time>
    );
}

const isDateValid = (date: Date): boolean => {
    return !isNaN(date.getTime());
}

export default Date;