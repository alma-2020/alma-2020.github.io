import { parseISO, format } from 'date-fns'
import { FC } from 'react'

interface ChildProps {
    dateString: string;
}

const Date: FC<ChildProps> = ({ dateString }) => {
    const date = parseISO(dateString)
    return <time dateTime={dateString}>{format(date, 'dd/MM/yyyy')}</time>
}

export default Date;