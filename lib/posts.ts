import fs from 'fs'
import path from 'path'
import { promisify } from 'util'
import matter from 'gray-matter'
import { parse, parseISO } from 'date-fns'

const readFile = promisify(fs.readFile);
const readdir = promisify(fs.readdir);

export interface Post {
    id: string;
    title: string;
    date: string;
    hour: string;
    markdown?: string;
}

interface PostPagePath {
    params: {
        id: string;
    };
}

const postsDirectory = path.join(process.cwd(), 'posts');

export async function getSortedPostsData(): Promise<Post[]> {
    const fileNames = await readdir(postsDirectory);
    const allPostsData: Post[] = fileNames.map(fileName => {
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
    return allPostsData.sort((a: Post, b: Post): number => {
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

export async function getAllPostIds(): Promise<PostPagePath[]> {
    const fileNames = await readdir(postsDirectory);
    return fileNames.map(fileName => {
        return {
            params: {
                id: fileName.replace(/\.md$/, ''),
            },
        };
    });
}

export async function getPostData(id: string): Promise<Post> {
    const fullPath = path.join(postsDirectory, `${id}.md`);
    const fileContents = await readFile(fullPath, 'utf8');
    const matterResult = matter(fileContents);

    return {
        id,
        markdown: matterResult.content,
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