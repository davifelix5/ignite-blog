import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

import { RichText } from 'prismic-dom';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import ReactHTMLParser from 'react-html-parser';
import { format } from 'date-fns';
import { createClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
  href: string;
  uid: string;
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
  previousPost: Post;
  post: Post;
  nextPost: Post;
  preview: boolean;
}

export default function Post({
  previousPost,
  post,
  nextPost,
  preview,
}: PostProps) {
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

  if (!post) {
    return (
      <>
        <Head>
          <title>Carregando... | Ignite blog</title>
        </Head>
        <main className={commonStyles.container}>
          <p>Post not found</p>
        </main>
      </>
    );
  }

  if (!post) {
    return (
      <>
        <Head>
          <title>Not found | Ignite blog</title>
        </Head>
        <main className={commonStyles.container}>
          <p>Post not found</p>
        </main>
      </>
    );
  }

  const { data, first_publication_date, last_publication_date } = post;

  const formatedInitialDate = format(
    new Date(first_publication_date),
    'dd MMM yyyy'
  ).toLowerCase();

  const formatedLastDate = format(
    new Date(last_publication_date),
    `dd MMM yyyy 'às' H:ss`
  );

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
                <span>{formatedInitialDate}</span>
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
            {last_publication_date && (
              <p className={styles.edited}>* editado em {formatedLastDate}</p>
            )}
          </div>
          {content.map(postSection => (
            <section key={postSection.heading}>
              <h2>{postSection.heading}</h2>
              {ReactHTMLParser(postSection.body)}
            </section>
          ))}
        </article>
        <div className={`${commonStyles.container} ${styles.navigation}`}>
          <div>
            {previousPost && (
              <>
                <p>{previousPost.data.title}</p>
                <Link href={`/post/${previousPost.uid}`}>
                  <a>Post anterior</a>
                </Link>
              </>
            )}
          </div>
          <div>
            {nextPost && (
              <>
                <p>{nextPost.data.title}</p>
                <Link href={`/post/${nextPost.uid}`}>
                  <a>Próximo post</a>
                </Link>
              </>
            )}
          </div>
        </div>
        {preview && (
          <aside className={`${commonStyles.container} ${styles.asideContent}`}>
            <Link href="/api/exit-preview">
              <a>Sair do modo preview</a>
            </Link>
          </aside>
        )}
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const client = createClient();

  const posts = await client.getAllByType('post', {
    orderings: {
      field: 'document.first_publication_date',
      direction: 'desc',
    },
  });

  const paths = posts.map(post => {
    return { params: { slug: post.uid } };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
  previewData,
}) => {
  try {
    const client = createClient({ previewData });

    const slug = params.slug as string;

    const post = await client.getByUID('post', slug);

    const { last_publication_date, first_publication_date } = post;
    const editionDate =
      last_publication_date === first_publication_date
        ? null
        : last_publication_date;

    const nextPosts = await client.getByType('post', {
      orderings: {
        field: 'document.first_publication_date',
        direction: 'desc',
      },
      after: post.id,
      pageSize: 1,
    });

    const previousPosts = await client.getByType('post', {
      orderings: {
        field: 'document.first_publication_date',
        direction: 'asc',
      },
      after: post.id,
      pageSize: 1,
    });

    return {
      props: {
        post: {
          ...post,
          last_publication_date: editionDate,
        },
        previousPost: previousPosts.results[0] || null,
        nextPost: nextPosts.results[0] || null,
        preview,
      },
      revalidate: 30 * 60, // 30 minutes
    };
  } catch (err) {
    return {
      props: {
        post: false,
      },
    };
  }
};
