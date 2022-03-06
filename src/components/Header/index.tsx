import Link from 'next/link';

import commomStyles from '../../styles/common.module.scss';
import styles from './header.module.scss';

export default function Header() {
  return (
    <header className={`${commomStyles.container} ${styles.headerContainer}`}>
      <Link href="/">
        <a>
          <img src="/logo.svg" width={220} height={25} alt="logo" />
        </a>
      </Link>
    </header>
  );
}
