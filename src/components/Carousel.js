// could just swap this all out with some plugin and adjust as needed instead of using all this manual code

import React, { useState, useEffect, useRef } from 'react';
import { useStaticQuery, graphql, Link } from 'gatsby';
import { GatsbyImage } from 'gatsby-plugin-image';
import styled from 'styled-components';

export const Carousel = ({ type, duration, transition }) => {

    const data = useStaticQuery(graphql`
        query {
            home: contentfulLayout(contentful_id: {eq: "1mbJR12XDGubPzpJKUxRHZ"}) {
                mainContent {
                    ... on ContentfulImageCarousel {
                        images {
                            altTag
                            title
                            image {
                                gatsbyImageData(width: 626, height: 396, placeholder: BLURRED)
                            }
                        }
                    }
                }
                secondaryContent {
                    ... on ContentfulTestimonials {
                        testimonials {
                            author
                            snippet
                        }
                    }
                }
            }
        }
    `);

    const { images } = data?.home?.mainContent[0];
    const { testimonials: quotes } = data?.home?.secondaryContent[0];
    
    // -------------------------------------------
    
    const [fadeOut, setFadeOut] = useState(false);

    const [index, setIndex] = useState(0);

    const [isHovering, setIsHovering] = useState(false);

    const timer = useRef();
    const timer2 = useRef();

    useEffect(() => {

        setFadeOut(false); // fades in

        // variable to stop/kickstart timeouts again after mouseover - mouseleave
        if (!isHovering) {

            // while in faded-in (visible) state, wait for given duration
            timer.current = setTimeout(() => { // captures current timer id for cleanup
                setFadeOut(true); // fades out

                // wait the time it takes to fade out, then swap
                timer2.current = setTimeout(() => {

                    // while faded out (invisible), updates the index
                    // in turn calling useEffect and repeating the cycle
                    if ((type === "img" && index !== images.length - 1) 
                    || (type === "text" && index !== quotes.length - 1)) { 
                        setIndex(index + 1);
                    } else { setIndex(0); };
                    
                }, transition);

            }, duration);

        } else {
            clearTimeout(timer.current);
            clearTimeout(timer2.current);
        };

        return () => {
            clearTimeout(timer.current);
            clearTimeout(timer2.current);
        };

    }, [isHovering, index, type, transition, duration, images.length, quotes.length]);

    if (images && type === "img") {
        return (
            <ImageContainer 
                fade={fadeOut ? true : false} 
                onMouseEnter={() => setIsHovering(true)} 
                onMouseLeave={() => setIsHovering(false)}
            >
                <Image
                    id="slide-img" 
                    image={images[index]?.image?.gatsbyImageData} 
                    title={images[index]?.title} 
                    alt={images[index]?.altTag} 
                    loading="eager"
                />
            </ImageContainer>
        );
    } else if (quotes && type === "text") {
        return (
            <QuoteContainer>
                <StyledLink to="/about#testimonials">
                    <Blockquote id="slide-text" fade={fadeOut ? true : false}>
                        <Paragraph>
                            <Span>“ </Span>{quotes[index]?.snippet}<Span> ”</Span>
                        </Paragraph> 
                        <Cite>{quotes[index]?.author}</Cite>
                    </Blockquote>
                </StyledLink>
            </QuoteContainer>
        );
    } else return null;
};

const ImageContainer = styled.div`
    opacity: ${props => props.fade ? "0" : "1"};
    transition: opacity 0.5s;

    @media only screen and (max-width: 1000px) {
        width: 100%;
    };
`;

const Image = styled(GatsbyImage)`
    pointer-events: none;
    width: 95%;

    @media only screen and (max-width: 1000px) {
        width: 100%;
    };
`;

const QuoteContainer = styled.div`
    min-width: 33%;
    font-size: larger;
    margin-right: 1.3em;
`;

const Blockquote = styled.blockquote`
    margin: 0.65em;
    text-align: center;
    opacity: ${props => props.fade ? "0" : "1"};
    transition: opacity 0.5s;
`;

const Paragraph = styled.p`
    margin-top: 0;
    font-family: 'Bebas Neue', sans-serif;
    font-weight: normal;
    font-size: larger;
    letter-spacing: 0.1em;
    line-height: 100%;
    color: #3a3a87;
`;

const Cite = styled.cite`
    margin-top: 0;
    font-family: 'Bebas Neue', sans-serif;
    font-weight: normal;
    letter-spacing: 0.1em;
    line-height: 100%;
    color: black;
    font-size: large;
    font-style: normal;
`;

const Span = styled.span`
    font-family: 'Times New Roman';
    color: #A496FF;

    &:first-child {
        font-size: 4em;
        position: relative;
        top: 0.3em;
    };

    &:last-child {
        font-size: 6em;
        opacity: 0.4;
        vertical-align: middle;
        float: right;
        padding-top: 0.4em;
    };
`;

const StyledLink = styled(Link)`
    text-decoration: none;

    &:active {
        color: black;
    };
`;