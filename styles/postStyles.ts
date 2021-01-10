import styled from 'styled-components'

export const Image = styled.img`
    max-width: 500px;
    max-height: 400px;
    min-height: 200px;
    min-width: 200px;
    text-align: center;
    border-radius: 8px;
        
    /* make our image seem clickable to the user */
    cursor: pointer;

    @media only screen and (max-width: 550px) {
        max-width: 95%;
    }
`;

export const ImageContainer = styled.div`
    display: flex;
    justify-content: center;
`;

export const ImageAndCaptionContainer = styled.div`
    text-align: center;

    p {
        color: #5b5b5b;
    }
`;