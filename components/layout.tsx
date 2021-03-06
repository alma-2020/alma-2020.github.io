import Link from 'next/link';
import Head from 'next/head';

import styles from './layout.module.css';
import utilStyles from '../pages/styles/utils.module.css'
import { FC } from 'react';

const name = "A COOL BLOG";
export const siteTitle = 'A COOL BLOG';

interface Props {
    children: JSX.Element[]|JSX.Element;
    home?: boolean;
}

const Layout: FC<Props> = ({ 
    children, 
    home,
}) => {
    return (
        <div className={styles.container}>
            <Head>
                <link rel="icon" href="/favicon.ico" />
                <meta
                name="description"
                content="A cool blog"
                />
                {/*
                <meta
                property="og:image"
                content={`https://og-image.now.sh/${encodeURI(
                    siteTitle
                )}.png?theme=light&md=0&fontSize=75px&images=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fnextjs-black-logo.svg`}
                />
                <meta name="og:title" content={siteTitle} />
                <meta name="twitter:card" content="summary_large_image" />
                */}
                <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            </Head>
            <header className={styles.header}>
                {home ? (
                <>
                    <img
                        src="/images/profile.jpg"
                        className={`${styles.headerHomeImage} ${utilStyles.borderCircle}`}
                        alt={name}
                    />
                    <h1 className={utilStyles.heading2Xl}>{name}</h1>
                </>
                ) : (
                <>
                    <Link href="/">
                        <a>
                            <img
                                src="/images/profile.jpg"
                                className={`${styles.headerImage} ${utilStyles.borderCircle}`}
                                alt={name}
                            />
                        </a>
                    </Link>
                    <h2 className={utilStyles.headingLg}>
                    <Link href="/">
                        <a className={utilStyles.colorInherit}>{name}</a>
                    </Link>
                    </h2>
                </>
                )}
            </header>
            <main>{children}</main>
            {!home && (
                <div className={styles.backToHome}>
                <Link href="/">
                    <a>← Back to home</a>
                </Link>
                </div>
            )}
        </div>
    );
}

export default Layout;