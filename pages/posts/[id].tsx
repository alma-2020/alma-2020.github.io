import Head from 'next/head'

import { IPost, getAllPostIds, getPostData } from '../../lib/posts'
import Layout from '../components/layout'
import Date from '../components/date'
import utilStyles from '../styles/utils.module.css'

interface ChildProps {
    postData: IPost;
}

interface Context {
    params: {
        id: string;
    }
}

interface StaticProps {
    props: ChildProps;
}

export default function Post({ postData }: ChildProps) {
    return (
        <Layout>
            <Head>
                <title>A COOL BLOG - {postData.title}</title>
            </Head>
            <article>
                <h1 className={utilStyles.headingXl}>{postData.title}</h1>
                <div className={utilStyles.lightText}>
                <Date dateString={postData.date} />
                </div>
                <div dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
            </article>
        </Layout>
    );
}

export async function getStaticPaths() {
    // Return a list of possible id values
    const paths = getAllPostIds();
    
    return {
        paths,
        fallback: false,
    };
}

export async function getStaticProps(
    { params }: Context
): Promise<StaticProps> {
    // Fetch necessary data for the blog post using params.id
    const postData = await getPostData(params.id);
    return {
        props: {
            postData,
        },
    };
}