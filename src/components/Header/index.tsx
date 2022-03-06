import Image from 'next/image';

import commomStyles from '../../styles/common.module.scss';
import styles from './header.module.scss';

export function Header() {
  return (
    <header className={`${commomStyles.container} ${styles.headerContainer}`}>
      <Image src="/logo.svg" width={220} height={25} />
    </header>
  );
}
