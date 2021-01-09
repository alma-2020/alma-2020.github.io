import Head from 'next/head'
import ReactMarkdown from 'react-markdown'
import Lightbox from 'react-image-lightbox'
import 'react-image-lightbox/style.css'
import React, { 
    Dispatch, 
    SetStateAction, 
    useEffect, 
    useState,
} from 'react'

import Layout from '../components/layout'
import Date from '../components/date'
import utilStyles from '../styles/utils.module.css'
import { Post, getAllPostIds, getPostData } from '../../lib/posts'
import { Image, ImageContainer } from '../../styles/postStyles'

interface Props {
    postData: Post;
}

interface Context {
    params: {
        id: string;
    }
}

interface StaticProps {
    props: Props;
}

/** An array containing the URLs of all the images in the post */
let images: Array<string> = [];
let imageCaptions: Array<string> = [];

export default function PostPage({ postData }: Props) {
    /** used to close and open the image modal */
    const [isImageOpen, setIsImageOpen] = useState<boolean>(false);
    /** The index of the image that should be opened */
    const [imageIndex, setImageIndex] = useState<number>(0);

    useEffect(() => {
        return () => {
            // this function will run just before this component unmounts
            images = [];
            imageCaptions = [];
        };
    }, []);

    const markdownRenderers = {
        image: (image) => {
            return (
                <PostImage 
                    image={image} 
                    pageState={{
                        setImageIndex,
                        setIsImageOpen,
                    }}
                />
            );
        },
        link: (link) => {
            return <PostLink link={link}/>;
        },
        paragraph: (paragraph) => {
            const { node } = paragraph;
            if (node.children[0].type === 'image') {
                const image = node.children[0];
                return (
                    <PostImage 
                        image={image} 
                        pageState={{
                            setImageIndex,
                            setIsImageOpen,
                        }}
                    />
                );
            }
            if (node.children[0].type === 'a') {
                const link = node.children[0];
                return <PostLink link={link}/>;
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

                        // re-enable the page scroll
                        Object.assign(document.body.style, {
                            overflowY: 'unset',
                            marginRight: '0px',
                        });
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

interface PostImageProps {
    image: {
        url: string;
        alt: string;
    };
    pageState: {
        setIsImageOpen: Dispatch< SetStateAction<boolean> >;
        setImageIndex: Dispatch< SetStateAction<number> >;
    };
}

function PostImage({ image, pageState }: PostImageProps) {
    if (images.indexOf(image.url) === -1) {
        // add the data to our arrays
        const caption = image.alt ? image.alt : '';
        images.push(image.url);
        imageCaptions.push(caption)
    }

    function findImageIndex(imageUrl: string): number {
        let index = images.indexOf(imageUrl);
        if (index < 0) {
            // start from the first image if we don't find this one
            index = 0;
        }

        return index;
    }

    function handleClick(): void {
        if (images.length > 0) {
            const { setImageIndex, setIsImageOpen } = pageState;

            // set the index of the image we want to open 
            const index = findImageIndex(image.url);
            setImageIndex(index);
       
            // open the modal
            setIsImageOpen(true);   

            // block scroll while the modal is open and set a margin on the 
            // page with the same width as the scrollbar so that the content 
            // doesn't jump around when the scrollbar appears/disappears 

            let marginRightPx = 0;
            if(window.getComputedStyle) {
                let bodyStyle = window.getComputedStyle(document.body);
                if(bodyStyle) {
                    marginRightPx = parseInt(bodyStyle.marginRight, 10);
                }
            }

            let scrollbarWidthPx = window.innerWidth - document.body.clientWidth;
            Object.assign(document.body.style, {
                overflowY: 'hidden',
                marginRight: `${marginRightPx + scrollbarWidthPx}px`,
            });
        }
    }

    return (
        <ImageContainer>
            <Image 
                src={image.url} 
                alt={image.alt} 
                onClick={handleClick}
            />
        </ImageContainer>
    )
};

function PostLink({ link }) {
    return (
        <a 
            href={link.href} 
            target="_blank"
            rel="noreferrer noopener"
        >
            {link.children}
        </a>
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