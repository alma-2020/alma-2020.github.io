import Head from 'next/head'
import Image from "next/image"
import ReactMarkdown from 'react-markdown'
import Lightbox from 'react-image-lightbox'
import 'react-image-lightbox/style.css'

import { Post, getAllPostIds, getPostData } from '../../lib/posts'
import Layout from '../components/layout'
import Date from '../components/date'
import utilStyles from '../styles/utils.module.css'
import { useEffect, useState } from 'react'

interface ChildProps {
    postData: Post;
}

interface Context {
    params: {
        id: string;
    }
}

interface StaticProps {
    props: ChildProps;
}

// an array containing the data of all the images in the post
//const [images, setImages] = useState< Array<string> >([]);
let images: Array<string> = [];
//const [imageCaptions, setImageCaptions] = useState< Array<string> >([]);
let imageCaptions: Array<string> = [];

export default function PostPage({ postData }: ChildProps) {
    // used to close and open photoswipe
    const [isImageOpen, setIsImageOpen] = useState<boolean>(false);
    // the index of the image that should be opened
    const [imageIndex, setImageIndex] = useState<number>(0);

    useEffect(() => {
        return () => {
            // this function will run just before this component unmounts
            images = [];
            imageCaptions = [];
        };
    }, []);

    function findIndex(imageUrl: string): number {
        let index = images.indexOf(imageUrl);
        if (index < 0) {
            // start from the first image if we don't find this one
            index = 0;
        }

        return index;
    }

    const PostImage = ({ image }) => {
        if (images.indexOf(image.url) === -1) {
            // add data to our arrays
            const caption = image.alt ? image.alt : '';
            images.push(image.url);
            imageCaptions.push(caption)
        }

        return (
            <div className={utilStyles.pageImageContainer}>
                <Image 
                    onClick={e => {

                        if (images.length > 0) {
                            const index = findIndex(image.url);
                            setImageIndex(index);
                            setIsImageOpen(true);   

                            // block scroll while modal is open
                            document.body.style.overflow = 'hidden';
                        }  
                    }}
                    src={image.url} 
                    alt={image.alt} 
                    unsized
                    unoptimized
                    className={utilStyles.pageImage}
                    // @ts-ignore
                    layout="fixed"
                />
            </div>
        )
    };

    const markdownRenderers = {
        image: (image) => {
            return <PostImage image={image}/>;
        },
        paragraph: (paragraph) => {
            const { node } = paragraph;
            if (node.children[0].type === "image") {
                const image = node.children[0];
                return <PostImage image={image}/>;
            }
        
            return <p>{paragraph.children}</p>;
        },
    }

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
                {/* Render our markdown content as HTML */} 
                <ReactMarkdown 
                    children={postData.markdown}
                    renderers={markdownRenderers} 
                    allowDangerousHtml={true}
                />
            </article>
            {isImageOpen && (
                <Lightbox
                    mainSrc={images[imageIndex]}
                    nextSrc={images[(imageIndex + 1) % images.length]}
                    prevSrc={
                        images[(imageIndex + images.length - 1) % images.length]
                    }
                    mainSrcThumbnail={images[imageIndex]}
                    nextSrcThumbnail={images[(imageIndex + 1) % images.length]}
                    prevSrcThumbnail={
                        images[(imageIndex + images.length - 1) % images.length]
                    }
                    onCloseRequest={() => {
                        setIsImageOpen(false);

                        // re-enable the scroll
                        document.body.style.overflow = 'unset';
                    }}
                    onMovePrevRequest={() => {
                        setImageIndex((imageIndex + images.length - 1) % images.length)
                    }}
                    onMoveNextRequest={() => {
                        setImageIndex((imageIndex + 1) % images.length)
                    }}
                    onImageLoadError={() => {
                        console.error('Image load error');
                        setIsImageOpen(false);
                    }}
                    imageCaption={imageCaptions[imageIndex]}
                    reactModalProps={{ shouldReturnFocusAfterClose: false }}
                />
            )}
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