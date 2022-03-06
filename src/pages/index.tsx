import { GetStaticProps } from 'next';

import { format } from 'date-fns';

import Prismic from '@prismicio/client';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({
  postsPagination: { results, next_page },
}: HomeProps) {
  return (
    <main className={`${commonStyles.container} ${styles.container}`}>
      <ul className={styles.postList}>
        {results.map(({ data, first_publication_date, uid }) => (
          <li className={styles.post} key={uid}>
            <a href="https://www.google.com" target="_blank" rel="noreferrer">
              <h2>{data.title}</h2>
              <h3>{data.subtitle}</h3>
            </a>
            <div className={styles.infoContainer}>
              <div className={styles.info}>
                <FiCalendar />
                <span>{first_publication_date}</span>
              </div>
              <div className={styles.info}>
                <FiUser />
                <span>{data.author}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
      {next_page && (
        <button type="button" className={styles.nextPageButton}>
          Carregar mais posts
        </button>
      )}
    </main>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    Prismic.Predicates.at('document.type', 'post'),
    {
      pageSize: 5,
    }
  );

  const { next_page, results } = postsResponse;

  const formatedResults = results.map(post => {
    const formatedDate = format(
      new Date(post.first_publication_date),
      'dd/MM/yyyy'
    );
    return {
      ...post,
      first_publication_date: formatedDate,
    };
  });

  return {
    props: {
      postsPagination: { next_page, results: formatedResults },
    },
  };
};
