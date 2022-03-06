import { GetStaticProps } from 'next';
import Link from 'next/link';

import { format } from 'date-fns';

import Prismic from '@prismicio/client';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { useState } from 'react';
import { toast } from 'react-toastify';
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

function formatPosts(post: Post) {
  const formatedDate = format(
    new Date(post.first_publication_date),
    'dd MMM yyyy'
  );
  return {
    ...post,
    first_publication_date: formatedDate,
  };
}

export default function Home({
  postsPagination: { results, next_page },
}: HomeProps) {
  const [loading, setLoading] = useState(false);
  const [nextPage, setNextPage] = useState(next_page);
  const [posts, setPosts] = useState(results.map(formatPosts));

  async function handleLoadMorePosts() {
    setLoading(true);
    try {
      const data = await fetch(next_page).then(res => res.json());
      const newPosts = data.results.map(formatPosts);
      setPosts(prevPosts => [...prevPosts, ...newPosts]);
      setNextPage(data.next_page);
    } catch {
      toast.error('Erro no carregamento dos posts');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={`${commonStyles.container} ${styles.container}`}>
      <ul className={styles.postList}>
        {posts.map(({ data, first_publication_date, uid }) => (
          <li className={styles.post} key={uid}>
            <Link href={`/post/${uid}`}>
              <a>
                <h2>{data.title}</h2>
                <h3>{data.subtitle}</h3>
              </a>
            </Link>
            <div className={styles.infoContainer}>
              <div className={styles.info}>
                <FiCalendar />
                <span>{first_publication_date.toLowerCase()}</span>
              </div>
              <div className={styles.info}>
                <FiUser />
                <span>{data.author}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className={styles.bottomContainer}>
        {nextPage &&
          (loading ? (
            <div className={styles.loader} />
          ) : (
            <button
              onClick={handleLoadMorePosts}
              type="button"
              className={styles.nextPageButton}
            >
              Carregar mais posts
            </button>
          ))}
      </div>
    </main>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    Prismic.Predicates.at('document.type', 'post'),
    {
      orderings: '[document.first_publication_date desc]',
      pageSize: 5,
    }
  );

  const { next_page, results } = postsResponse;

  return {
    props: {
      postsPagination: { next_page, results },
    },
  };
};
