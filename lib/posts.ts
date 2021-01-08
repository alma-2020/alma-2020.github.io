import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import remark from 'remark'
import html from 'remark-html'
import { parse, parseISO } from 'date-fns'

export interface IPost {
    id: string;
    title: string;
    date: string;
    hour: string;
    contentHtml?: string;
}

const postsDirectory = path.join(process.cwd(), 'posts');

export function getSortedPostsData(): Array<IPost> {
    const fileNames = fs.readdirSync(postsDirectory);
    const allPostsData: IPost[] = fileNames.map(fileName => {
        // remove .md from the filename
        const id = fileName.replace(/\.md$/, '');

        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');

        // convert from markdown
        const matterResult = matter(fileContents);

        return {
            id,
            title: matterResult.data.titulo,
            date: matterResult.data.data,
            hour: matterResult.data.hora,
        };
    });
    
    // sort posts by date
    return allPostsData.sort((a: IPost, b: IPost): number => {
        const postDateA = parsePostDate(a.hour, a.date);
        const postDateB = parsePostDate(b.hour, b.date);

        if (postDateA < postDateB) {
            return 1;
        }
        else {
            return -1;
        }
    });
}

export function getAllPostIds() {
    const fileNames = fs.readdirSync(postsDirectory);
    return fileNames.map(fileName => {
        return {
            params: {
                id: fileName.replace(/\.md$/, ''),
            },
        };
    });
}

export async function getPostData(id: string): Promise<IPost> {
    const fullPath = path.join(postsDirectory, `${id}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const matterResult = matter(fileContents);

    // Use remark to convert markdown into HTML string
    const processedContent = await remark()
        .use(html)
        .process(matterResult.content);
    const contentHtml = processedContent.toString();

    return {
        id,
        contentHtml,
        title: matterResult.data.titulo,
        date: matterResult.data.data,
        hour: matterResult.data.hora,
    };
}

function parsePostDate(hour: string, date: string): Date {
    const postDate = parseISO(date);

    try {
        const postHour = parse(hour, 'HH:mm', new Date());
        postDate.setHours(postHour.getHours(), postHour.getMinutes());
    }
    catch(e) {
        // if any errors related to parsing the hour happen
        // we just log them and ignore them
        console.log(`Error: Could not read hour ${hour}\n${e}`);
    }

    return postDate;
}