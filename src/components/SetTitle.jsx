import Head from 'next/head';
import PropTypes from 'prop-types';

export default function SetTitle({ text }) {
    const defaultTitle = 'Track Drop';
    return (
        <Head>
            <title>{text ? `${text} - Track Drop` : defaultTitle}</title>
        </Head>
    );
}

SetTitle.propTypes = {
    text: PropTypes.string,
};