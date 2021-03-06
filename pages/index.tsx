import Head from 'next/head'
import Link from 'next/link'

import { Post, getSortedPostsData } from '../lib/posts'
import Layout, {siteTitle} from "../components/layout"
import Date from '../components/date'
import utilStyles from './styles/utils.module.css'
import { FC } from 'react'

interface Props {
  allPostsData: Array<Post>;
}

const Home: FC<Props> = ({ allPostsData }) => {
  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>

      <section className={utilStyles.headingMd}>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit
        </p>
      </section>
      
      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        <h2 className={utilStyles.headingLg}>Blog</h2>
      
        <ul className={utilStyles.list}>
          {allPostsData.map(post => (
            <li className={utilStyles.listItem} key={post.id}>
                <Link href={`/posts/${post.id}`}>
                    <a>{post.title}</a>
                </Link>
                
                <br />
                <small className={utilStyles.lightText}>
                    <Date dateString={post.date} />
                </small>
            </li>
          ))}
        </ul>
      </section>
    </Layout>
  );
};

export const getStaticProps = async () => {
  const allPostsData = await getSortedPostsData();

  return {
    props: {
      allPostsData
    }
  };
}

export default Home;