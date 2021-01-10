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
import { 
    Image, 
    ImageAndCaptionContainer, 
    ImageContainer,
} from '../../styles/postStyles'

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

            // enable the page scroll (just in case the user presses 
            // the back button while the modal is open)
            Object.assign(document.body.style, {
                overflowY: 'unset',
                marginRight: '0px',
            });
        };
    }, []);

    function handleImageClick(
        e: React.MouseEvent<HTMLImageElement, MouseEvent>
    ): void {
        if (images.length > 0) {
            // get the image we clicked
            const image = e.target as HTMLImageElement;

            // set the index of the image we want to open 
            const index = findImageIndex(image.src);
            setImageIndex(index);
       
            // open the modal
            setIsImageOpen(true);   

            // block scroll while the modal is open and set a margin on the 
            // page with the same width as the scrollbar so that the content 
            // doesn't jump around when the scrollbar appears/disappears 

            let marginRightPx = 0;
            if (window.getComputedStyle) {
                const bodyStyle = window.getComputedStyle(document.body);
                if (bodyStyle) {
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

    const markdownRenderers = {
        image: (image) => {
            return (
                <PostImage 
                    image={image} 
                    onClick={handleImageClick}
                />
            );
        },
        link: (link) => {
            return <PostLink link={link}/>;
        },
        paragraph: (paragraph) => {
            const { node } = paragraph;
            const type = node.children[0].type;

            if (type === 'image') {
                const image = node.children[0];
                return markdownRenderers.image(image);
            }
            if (type === 'a') {
                const link = node.children[0];
                return markdownRenderers.link(link);
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
    onClick: (
        event?: React.MouseEvent<HTMLImageElement, MouseEvent>
    ) => void;
}

function PostImage({ image, onClick }: PostImageProps) {
    const caption = image.alt ? image.alt : '';
    
    if (images.indexOf(image.url) === -1) {
        // add the data to our arrays
        images.push(image.url);
        imageCaptions.push(caption)
    }

    return (
        <ImageAndCaptionContainer>
            <ImageContainer>
                <Image 
                    src={image.url} 
                    alt={image.alt} 
                    onClick={onClick}
                />
            </ImageContainer>
            {(image.alt.trim().length > 0) && (
                <small>
                    <p>{image.alt}</p>
                </small>
            )}
        </ImageAndCaptionContainer>
    );
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

function findImageIndex(imageUrl: string): number {
    let index = images.indexOf(imageUrl);
    if (index < 0) {
        // start from the first image if we don't find this one
        index = 0;
    }

    return index;
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