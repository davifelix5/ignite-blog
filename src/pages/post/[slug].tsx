import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';

import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import ReactHTMLParser from 'react-html-parser';
import { format } from 'date-fns';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const { isFallback } = useRouter();

  if (isFallback) {
    return (
      <>
        <Head>
          <title>Carregando... | Ignite blog</title>
        </Head>
        <main className={commonStyles.container}>
          <p>Carregando...</p>
        </main>
      </>
    );
  }

  const { data, first_publication_date } = post;

  const formatedDate = format(
    new Date(first_publication_date),
    'dd MMM yyyy'
  ).toLowerCase();

  const content = data.content.map(({ heading, body }) => {
    return {
      heading,
      body: RichText.asHtml(body),
    };
  });

  return (
    <>
      <Head>
        <title>{data.title} | Ignite blog</title>
      </Head>
      <main>
        <div className={styles.banner}>
          <img src={data.banner.url} alt="Post Banner" />
        </div>
        <article className={`${styles.post} ${commonStyles.container}`}>
          <div className={styles.header}>
            <h1>{data.title}</h1>
            <div className={styles.infoContainer}>
              <div className={styles.info}>
                <FiCalendar />
                <span>{formatedDate}</span>
              </div>
              <div className={styles.info}>
                <FiUser />
                <span>{data.author}</span>
              </div>
              <div className={styles.info}>
                <FiClock />
                <span>4 min</span>
              </div>
            </div>
          </div>
          {content.map(postSection => (
            <section key={postSection.heading}>
              <h2>{postSection.heading}</h2>
              {ReactHTMLParser(postSection.body)}
            </section>
          ))}
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    Prismic.Predicates.at('document.type', 'post'),
    {
      orderings: '[document.first_publication_date desc]',
      pageSize: 5,
    }
  );

  const paths = posts.results.map(post => {
    return { params: { slug: post.uid } };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient();
  const slug = params.slug as string;
  const post = await prismic.getByUID('post', slug, {});

  return {
    props: {
      post,
    },
  };
};
